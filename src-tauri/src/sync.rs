use std::fs;
use std::io::Read;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, State, Manager};
use tiny_http::{Header, Response, Server};

pub struct SyncState {
    pub server: Arc<Mutex<Option<Arc<Server>>>>,
}

impl Default for SyncState {
    fn default() -> Self {
        Self {
            server: Arc::new(Mutex::new(None)),
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

    Ok(addr)
}

#[tauri::command]
pub fn stop_sync_server(state: State<'_, SyncState>) -> Result<(), String> {
    let mut server_guard = state.server.lock().unwrap();
    if let Some(server) = server_guard.take() {
        server.unblock();
    }
    Ok(())
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
    
    // Backup existing DB
    if db_path.exists() {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        let backup_path = db_path.with_file_name(format!("mainframe_backup_{}.db", timestamp));
        fs::copy(&db_path, &backup_path).map_err(|e| format!("Failed to backup DB: {}", e))?;
    }

    // Overwrite DB
    fs::write(&db_path, new_db_data).map_err(|e| format!("Failed to write new DB: {}", e))?;

    Ok(())
}
