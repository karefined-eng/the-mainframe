use std::fs;
use std::io::Read;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use std::net::UdpSocket;
use std::time::{SystemTime, UNIX_EPOCH};
use rand::Rng;
use tauri::{AppHandle, Emitter, State, Manager};
use tiny_http::{Header, Response, Server};

pub struct SyncState {
    pub server: Arc<Mutex<Option<Arc<Server>>>>,
    pub is_broadcasting: Arc<AtomicBool>,
    pub pin: Arc<Mutex<Option<String>>>,
}

impl Default for SyncState {
    fn default() -> Self {
        Self {
            server: Arc::new(Mutex::new(None)),
            is_broadcasting: Arc::new(AtomicBool::new(false)),
            pin: Arc::new(Mutex::new(None)),
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
    let addr = format!("{}:9377", local_ip);
    let server = Server::http(&addr).map_err(|e| e.to_string())?;
    let server_arc = Arc::new(server);
    *server_guard = Some(server_arc.clone());

    // Generate a fresh one-time PIN
    let pin = generate_pin();
    *state.pin.lock().unwrap() = Some(pin.clone());
    let pin_state = state.pin.clone();

    let db_path = get_db_path(&app)?;

    let server_arc_clone = server_arc.clone();
    thread::spawn(move || {
        for request in server_arc_clone.incoming_requests() {
            let url = request.url().to_string();

            // Extract ?pin= query param
            let provided_pin = url
                .split('?')
                .nth(1)
                .and_then(|q| {
                    q.split('&')
                        .find(|p| p.starts_with("pin="))
                        .map(|p| p.trim_start_matches("pin=").to_string())
                });

            // --- /info endpoint (no auth needed — used for discovery ping) ---
            if url.starts_with("/info") {
                let _ = request.respond(Response::from_string("mainframe_sync_active"));
                continue;
            }

            // --- Auth check for all other endpoints ---
            let expected_pin = pin_state.lock().unwrap().clone();
            let authed = match (&provided_pin, &expected_pin) {
                (Some(p), Some(e)) => p == e,
                _ => false,
            };

            if !authed {
                let _ = request.respond(
                    Response::from_string("Unauthorized: invalid or missing PIN")
                        .with_status_code(401),
                );
                continue;
            }

            // --- /db endpoint ---
            if url.starts_with("/db") {
                if let Ok(mut file) = fs::File::open(&db_path) {
                    let mut data = Vec::new();
                    if file.read_to_end(&mut data).is_ok() {
                        // Rotate PIN after one successful download (single-use)
                        *pin_state.lock().unwrap() = Some(generate_pin());

                        let response = Response::from_data(data).with_header(
                            Header::from_bytes(&b"Content-Type"[..], &b"application/octet-stream"[..]).unwrap(),
                        );
                        let _ = request.respond(response);
                        continue;
                    }
                }
                let _ = request.respond(
                    Response::from_string("Error reading DB").with_status_code(500),
                );
            } else {
                let _ = request.respond(Response::from_string("Not Found").with_status_code(404));
            }
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

            let msg = format!("mainframe:v1:{}:9377:{}", broadcast_ip, hostname);

            while is_broadcasting.load(Ordering::SeqCst) {
                let _ = socket.send_to(msg.as_bytes(), "255.255.255.255:9378");
                thread::sleep(std::time::Duration::from_secs(2));
            }
        }
    });

    Ok(ServeInfo { addr, pin })
}

#[tauri::command]
pub fn stop_sync_server(state: State<'_, SyncState>) -> Result<(), String> {
    state.is_broadcasting.store(false, Ordering::SeqCst);
    *state.pin.lock().unwrap() = None;
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
    let socket = UdpSocket::bind("0.0.0.0:9378").map_err(|e| format!("Bind error: {}", e))?;
    socket
        .set_read_timeout(Some(std::time::Duration::from_secs(3)))
        .map_err(|e| e.to_string())?;

    let mut buf = [0; 1024];
    let mut devices = std::collections::HashMap::new();

    let start_time = std::time::Instant::now();
    while start_time.elapsed().as_secs() < 3 {
        if let Ok((amt, _src)) = socket.recv_from(&mut buf) {
            if let Ok(text) = std::str::from_utf8(&buf[..amt]) {
                let parts: Vec<&str> = text.split(':').collect();
                if parts.len() >= 5 && parts[0] == "mainframe" && parts[1] == "v1" {
                    let ip = format!("{}:{}", parts[2], parts[3]);
                    let name = parts[4..].join(":");
                    devices.insert(ip.clone(), DiscoveredDevice { ip, name });
                }
            }
        }
    }

    Ok(devices.into_values().collect())
}

#[tauri::command]
pub async fn pull_from_device(app: AppHandle, ip_port: String, pin: String) -> Result<(), String> {
    // Strip formatting dashes from display PIN (e.g. "482-391" -> "482391")
    let pin_raw = pin.replace('-', "");
    let url = format!("http://{}/db?pin={}", ip_port, pin_raw);

    let response = ureq::get(&url)
        .timeout(std::time::Duration::from_secs(10))
        .call()
        .map_err(|e| {
            let msg = e.to_string();
            if msg.contains("refused") || msg.contains("timed out") {
                "Connection refused or timed out. Ensure the source device is broadcasting.".to_string()
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

    let mut new_db_data = Vec::new();
    response
        .into_reader()
        .read_to_end(&mut new_db_data)
        .map_err(|e| format!("Failed to read DB data: {}", e))?;

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
        let conn = rusqlite::Connection::open(&tmp_path)
            .map_err(|_| {
                let _ = fs::remove_file(&tmp_path);
                "Incoming database file is corrupt. Sync aborted — your data is safe.".to_string()
            })?;

        let result: String = conn
            .query_row("PRAGMA integrity_check", [], |row| row.get(0))
            .map_err(|_| {
                let _ = fs::remove_file(&tmp_path);
                "Incoming database failed integrity check. Sync aborted — your data is safe.".to_string()
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
        let backup_path =
            db_path.with_file_name(format!("mainframe_backup_{}.db", timestamp));
        fs::copy(&db_path, &backup_path)
            .map_err(|e| format!("Failed to backup existing DB: {}", e))?;
    }

    // Atomic rename — replaces the live DB only after validation passes
    fs::rename(&tmp_path, &db_path)
        .map_err(|e| format!("Failed to finalize DB swap: {}", e))?;

    // Signal frontend to reload (replaces the old 2s setTimeout)
    let _ = app.emit("db_swap_complete", ());

    Ok(())
}
