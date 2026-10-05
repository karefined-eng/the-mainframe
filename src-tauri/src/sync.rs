use rand::Rng;
use std::fs;
use std::io::Read;
use std::net::{IpAddr, SocketAddr, UdpSocket};
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Emitter, Manager, State};
use tiny_http::{Header, Method, Response, Server};

const SYNC_PORT: u16 = 9377;
const DISCOVERY_PORT: u16 = 9378;
const MAX_DATABASE_BYTES: usize = 64 * 1024 * 1024;
const PIN_TTL: Duration = Duration::from_secs(10 * 60);

pub struct SyncState {
    pub server: Arc<Mutex<Option<Arc<Server>>>>,
    pub is_broadcasting: Arc<AtomicBool>,
    pub pin: Arc<Mutex<Option<String>>>,
    pub pin_expires_at: Arc<Mutex<Option<Instant>>>,
}

impl Default for SyncState {
    fn default() -> Self {
        Self {
            server: Arc::new(Mutex::new(None)),
            is_broadcasting: Arc::new(AtomicBool::new(false)),
            pin: Arc::new(Mutex::new(None)),
            pin_expires_at: Arc::new(Mutex::new(None)),
        }
    }
}

fn get_db_path(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map(|mut path| {
            path.push("mainframe.db");
            path
        })
        .map_err(|e| e.to_string())
}

fn generate_pin() -> String {
    let n: u32 = rand::thread_rng().gen_range(100_000..=999_999);
    format!("{}-{}", &n.to_string()[..3], &n.to_string()[3..])
}

fn is_local_peer(local_ip: IpAddr, peer_ip: IpAddr) -> bool {
    match (local_ip, peer_ip) {
        (IpAddr::V4(local), IpAddr::V4(peer)) => {
            is_local_target(IpAddr::V4(peer))
                && (peer.is_loopback()
                    || peer.is_link_local()
                    || local.octets()[..3] == peer.octets()[..3])
        }
        (IpAddr::V6(local), IpAddr::V6(peer)) => {
            is_local_target(IpAddr::V6(peer))
                && (peer.is_loopback()
                    || peer.is_unicast_link_local()
                    || local.segments()[..4] == peer.segments()[..4])
        }
        _ => false,
    }
}

fn is_local_target(ip: IpAddr) -> bool {
    match ip {
        IpAddr::V4(ip) => ip.is_private() || ip.is_loopback() || ip.is_link_local(),
        IpAddr::V6(ip) => ip.is_loopback() || ip.is_unique_local() || ip.is_unicast_link_local(),
    }
}

fn request_header<'a>(request: &'a tiny_http::Request, name: &'static str) -> Option<&'a str> {
    request
        .headers()
        .iter()
        .find(|header| header.field.equiv(name))
        .map(|header| header.value.as_str())
}

fn unauthorized() -> Response<std::io::Cursor<Vec<u8>>> {
    Response::from_string("Unauthorized")
        .with_status_code(401)
        .with_header(Header::from_bytes(&b"Cache-Control"[..], &b"no-store"[..]).unwrap())
}

#[derive(serde::Serialize)]
pub struct ServeInfo {
    pub addr: String,
    pub pin: String,
}

#[tauri::command]
pub fn start_sync_server(app: AppHandle, state: State<'_, SyncState>) -> Result<ServeInfo, String> {
    let mut server_guard = state.server.lock().unwrap();
    if server_guard.is_some() {
        return Err("Server already running".to_string());
    }

    let local_ip = local_ip_address::local_ip().map_err(|e| e.to_string())?;
    let advertised_addr = format!("{}:{}", local_ip, SYNC_PORT);
    // Bind all interfaces so Android can accept connections through the active
    // Wi-Fi or hotspot interface. The advertised address remains the selected
    // local interface address shown to the peer.
    let server = Server::http(format!("0.0.0.0:{}", SYNC_PORT)).map_err(|e| e.to_string())?;
    let server_arc = Arc::new(server);
    *server_guard = Some(server_arc.clone());

    // Generate a fresh one-time PIN
    let pin = generate_pin();
    *state.pin.lock().unwrap() = Some(pin.clone());
    *state.pin_expires_at.lock().unwrap() = Some(Instant::now() + PIN_TTL);
    let pin_state = state.pin.clone();
    let pin_expires_at = state.pin_expires_at.clone();
    let local_ip_for_requests = local_ip;

    let db_path = get_db_path(&app)?;

    let server_arc_clone = server_arc.clone();
    thread::spawn(move || {
        for request in server_arc_clone.incoming_requests() {
            let path = request.url().split('?').next().unwrap_or_default();
            let peer_ip = request.remote_addr().map(SocketAddr::ip);

            if request.method() != &Method::Get || path != "/db" {
                let _ = request.respond(Response::from_string("Not Found").with_status_code(404));
                continue;
            }

            let peer_is_local = peer_ip
                .map(|ip| is_local_peer(local_ip_for_requests, ip))
                .unwrap_or(false);
            let provided_pin = request_header(&request, "Authorization")
                .and_then(|value| value.strip_prefix("Bearer "))
                .map(str::trim);
            let expected_pin = pin_state.lock().unwrap().clone();
            let pin_valid = pin_expires_at
                .lock()
                .unwrap()
                .map(|expires| Instant::now() < expires)
                .unwrap_or(false);
            let authed = peer_is_local
                && pin_valid
                && provided_pin
                    .zip(expected_pin.as_deref())
                    .map(|(provided, expected)| provided == expected)
                    .unwrap_or(false);

            if !authed {
                let _ = request.respond(unauthorized());
                continue;
            }

            let metadata = match fs::metadata(&db_path) {
                Ok(metadata) if metadata.len() <= MAX_DATABASE_BYTES as u64 => metadata,
                Ok(_) => {
                    let _ = request
                        .respond(Response::from_string("Database too large").with_status_code(413));
                    continue;
                }
                Err(_) => {
                    let _ = request
                        .respond(Response::from_string("Error reading DB").with_status_code(500));
                    continue;
                }
            };

            let mut file = match fs::File::open(&db_path) {
                Ok(file) => file,
                Err(_) => {
                    let _ = request
                        .respond(Response::from_string("Error reading DB").with_status_code(500));
                    continue;
                }
            };
            let mut data = Vec::with_capacity(metadata.len() as usize);
            if file.read_to_end(&mut data).is_err() || data.len() > MAX_DATABASE_BYTES {
                let _ = request
                    .respond(Response::from_string("Error reading DB").with_status_code(500));
                continue;
            }

            // Consume the pairing token only after a bounded, successful read.
            *pin_state.lock().unwrap() = None;
            *pin_expires_at.lock().unwrap() = None;
            let response = Response::from_data(data).with_header(
                Header::from_bytes(&b"Content-Type"[..], &b"application/octet-stream"[..]).unwrap(),
            );
            let _ = request.respond(response);
        }
    });

    // Start UDP Broadcast Beacon
    let is_broadcasting = state.is_broadcasting.clone();
    is_broadcasting.store(true, Ordering::SeqCst);
    let broadcast_ip = local_ip.to_string();

    thread::spawn(move || {
        if let Ok(socket) = UdpSocket::bind("0.0.0.0:0") {
            let _ = socket.set_broadcast(true);
            let hostname = std::env::var("COMPUTERNAME")
                .or_else(|_| std::env::var("USER"))
                .unwrap_or_else(|_| "Mainframe".to_string());

            let msg = format!("mainframe:v1:{}:{}:{}", broadcast_ip, SYNC_PORT, hostname);

            while is_broadcasting.load(Ordering::SeqCst) {
                let _ = socket.send_to(
                    msg.as_bytes(),
                    format!("255.255.255.255:{}", DISCOVERY_PORT),
                );
                thread::sleep(std::time::Duration::from_secs(2));
            }
        }
    });

    Ok(ServeInfo {
        addr: advertised_addr,
        pin,
    })
}

#[tauri::command]
pub fn stop_sync_server(state: State<'_, SyncState>) -> Result<(), String> {
    state.is_broadcasting.store(false, Ordering::SeqCst);
    *state.pin.lock().unwrap() = None;
    *state.pin_expires_at.lock().unwrap() = None;
    let mut server_guard = state.server.lock().unwrap();
    if let Some(server) = server_guard.take() {
        server.unblock();
    }
    Ok(())
}

#[derive(serde::Serialize)]
pub struct DiscoveredDevice {
    pub ip: String,
    pub name: String,
}

#[tauri::command]
pub async fn discover_devices() -> Result<Vec<DiscoveredDevice>, String> {
    let socket = UdpSocket::bind(format!("0.0.0.0:{}", DISCOVERY_PORT))
        .map_err(|e| format!("Bind error: {}", e))?;
    socket
        .set_read_timeout(Some(std::time::Duration::from_secs(3)))
        .map_err(|e| e.to_string())?;

    let mut buf = [0; 1024];
    let mut devices = std::collections::HashMap::new();

    let start_time = std::time::Instant::now();
    while start_time.elapsed().as_secs() < 3 {
        if let Ok((amt, src)) = socket.recv_from(&mut buf) {
            if let Ok(text) = std::str::from_utf8(&buf[..amt]) {
                let parts: Vec<&str> = text.splitn(5, ':').collect();
                if parts.len() == 5
                    && parts[0] == "mainframe"
                    && parts[1] == "v1"
                    && parts[2].parse::<IpAddr>().ok() == Some(src.ip())
                    && parts[3].parse::<u16>().ok() == Some(SYNC_PORT)
                    && is_local_target(src.ip())
                {
                    let ip = format!("{}:{}", parts[2], SYNC_PORT);
                    let name = parts[4].chars().take(64).collect();
                    devices.insert(ip.clone(), DiscoveredDevice { ip, name });
                }
            }
        }
    }

    Ok(devices.into_values().collect())
}

#[tauri::command]
pub async fn pull_from_device(app: AppHandle, ip_port: String, pin: String) -> Result<(), String> {
    let target = ip_port
        .trim()
        .parse::<SocketAddr>()
        .map_err(|_| "Enter a numeric local IP address and port.".to_string())?;
    if target.port() != SYNC_PORT || !target.ip().is_ipv4() {
        return Err(format!(
            "Sync only supports local IPv4 addresses on port {}.",
            SYNC_PORT
        ));
    }
    if !is_local_target(target.ip()) {
        return Err("Sync targets must be on a private or local network.".to_string());
    }
    // Strip formatting dashes from display PIN (e.g. "482-391" -> "482391").
    let pin_raw = pin.replace('-', "");
    if pin_raw.len() != 6 || !pin_raw.chars().all(|ch| ch.is_ascii_digit()) {
        return Err("PIN must contain six digits.".to_string());
    }
    let url = format!("http://{}/db", target);

    let response = ureq::get(&url)
        .set("Authorization", &format!("Bearer {}", pin_raw))
        .timeout(std::time::Duration::from_secs(10))
        .call()
        .map_err(|e| {
            let msg = e.to_string();
            if msg.contains("refused") || msg.contains("timed out") {
                "Connection refused or timed out. Ensure the source device is broadcasting."
                    .to_string()
            } else if msg.contains("401") || msg.contains("Unauthorized") {
                "Invalid PIN. Please check the code shown on the source device.".to_string()
            } else {
                format!("Failed to connect: {}", msg)
            }
        })?;

    if response.status() == 401 {
        return Err("Invalid PIN. Please check the code shown on the source device.".to_string());
    }
    if response.status() != 200 {
        return Err(format!("Server returned status: {}", response.status()));
    }

    if response
        .header("Content-Length")
        .and_then(|value| value.parse::<usize>().ok())
        .map(|size| size > MAX_DATABASE_BYTES)
        .unwrap_or(false)
    {
        return Err("Incoming database is too large.".to_string());
    }
    let mut new_db_data = Vec::new();
    response
        .into_reader()
        .take((MAX_DATABASE_BYTES + 1) as u64)
        .read_to_end(&mut new_db_data)
        .map_err(|e| format!("Failed to read DB data: {}", e))?;
    if new_db_data.len() > MAX_DATABASE_BYTES {
        return Err("Incoming database is too large.".to_string());
    }

    let db_path = get_db_path(&app)?;

    // --- Atomic swap: write to .tmp, validate, rename ---
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs();
    let tmp_path = db_path.with_file_name(format!("mainframe_incoming_{}.db.tmp", timestamp));

    fs::write(&tmp_path, &new_db_data)
        .map_err(|e| format!("Failed to write incoming DB: {}", e))?;

    // Validate the incoming file is a real, uncorrupted SQLite database
    {
        let conn = rusqlite::Connection::open(&tmp_path).map_err(|_| {
            let _ = fs::remove_file(&tmp_path);
            "Incoming database file is corrupt. Sync aborted — your data is safe.".to_string()
        })?;

        let result: String = conn
            .query_row("PRAGMA integrity_check", [], |row| row.get(0))
            .map_err(|_| {
                let _ = fs::remove_file(&tmp_path);
                "Incoming database failed integrity check. Sync aborted — your data is safe."
                    .to_string()
            })?;

        if result != "ok" {
            let _ = fs::remove_file(&tmp_path);
            return Err(format!(
                "Incoming database integrity check returned: {}. Sync aborted.",
                result
            ));
        }
    } // conn is dropped here, releasing the file lock before rename

    // Backup existing DB before overwriting
    if db_path.exists() {
        let backup_path = db_path.with_file_name(format!("mainframe_backup_{}.db", timestamp));
        fs::copy(&db_path, &backup_path)
            .map_err(|e| format!("Failed to backup existing DB: {}", e))?;
    }

    // Atomic rename — replaces the live DB only after validation passes
    fs::rename(&tmp_path, &db_path).map_err(|e| format!("Failed to finalize DB swap: {}", e))?;

    // Signal frontend to reload (replaces the old 2s setTimeout)
    let _ = app.emit("db_swap_complete", ());

    Ok(())
}
