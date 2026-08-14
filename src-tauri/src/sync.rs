use std::fs;
use std::io::Read;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use std::net::UdpSocket;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, State, Manager};
use tiny_http::{Header, Response, Server};

pub struct SyncState {
    pub server: Arc<Mutex<Option<Arc<Server>>>>,
    pub is_broadcasting: Arc<AtomicBool>,
}

impl Default for SyncState {
    fn default() -> Self {
        Self {
            server: Arc::new(Mutex::new(None)),
            is_broadcasting: Arc::new(AtomicBool::new(false)),
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

#[tauri::command]
pub fn start_sync_server(app: AppHandle, state: State<'_, SyncState>) -> Result<String, String> {
    let mut server_guard = state.server.lock().unwrap();
    if server_guard.is_some() {
        return Err("Server already running".to_string());
    }

    let local_ip = local_ip_address::local_ip().map_err(|e| e.to_string())?;
    let addr = format!("{}:9377", local_ip);
    let server = Server::http(&addr).map_err(|e| e.to_string())?;
    let server_arc = Arc::new(server);
    *server_guard = Some(server_arc.clone());

    let db_path = get_db_path(&app)?;

    let server_arc_clone = server_arc.clone();
    thread::spawn(move || {
        for request in server_arc_clone.incoming_requests() {
            if request.url() == "/db" {
                if let Ok(mut file) = fs::File::open(&db_path) {
                    let mut data = Vec::new();
                    if file.read_to_end(&mut data).is_ok() {
                        let response = Response::from_data(data)
                            .with_header(Header::from_bytes(&b"Content-Type"[..], &b"application/octet-stream"[..]).unwrap());
                        let _ = request.respond(response);
                        continue;
                    }
                }
                let _ = request.respond(Response::from_string("Error reading DB").with_status_code(500));
            } else if request.url() == "/info" {
                let _ = request.respond(Response::from_string("mainframe_sync_active"));
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

    Ok(addr)
}

#[tauri::command]
pub fn stop_sync_server(state: State<'_, SyncState>) -> Result<(), String> {
    state.is_broadcasting.store(false, Ordering::SeqCst);
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
    // Bind to the broadcast listening port
    let socket = UdpSocket::bind("0.0.0.0:9378").map_err(|e| format!("Bind error: {}", e))?;
    socket.set_read_timeout(Some(std::time::Duration::from_secs(3))).map_err(|e| e.to_string())?;
    
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
pub async fn pull_from_device(app: AppHandle, ip_port: String) -> Result<(), String> {
    let url = format!("http://{}/db", ip_port);
    let response = ureq::get(&url)
        .timeout(std::time::Duration::from_secs(10))
        .call()
        .map_err(|e| format!("Failed to connect: {}", e))?;

    if response.status() != 200 {
        return Err(format!("Server returned status: {}", response.status()));
    }

    let mut new_db_data = Vec::new();
    response.into_reader()
        .read_to_end(&mut new_db_data)
        .map_err(|e| format!("Failed to read DB data: {}", e))?;

    let db_path = get_db_path(&app)?;
    
    if db_path.exists() {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        let backup_path = db_path.with_file_name(format!("mainframe_backup_{}.db", timestamp));
        fs::copy(&db_path, &backup_path).map_err(|e| format!("Failed to backup DB: {}", e))?;
    }

    fs::write(&db_path, new_db_data).map_err(|e| format!("Failed to write new DB: {}", e))?;

    Ok(())
}
