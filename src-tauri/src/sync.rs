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
    /// When the server was last stopped; start_sync_server waits briefly for
    /// the OS to release the port (tiny_http closes the listener lazily).
    pub stopped_at: Arc<Mutex<Option<Instant>>>,
    /// Set by stop_sync_server; the request loop checks it every iteration so
    /// the thread (and the listener socket it keeps alive) exits promptly.
    pub is_stopped: Arc<AtomicBool>,
}

impl Default for SyncState {
    fn default() -> Self {
        Self {
            server: Arc::new(Mutex::new(None)),
            is_broadcasting: Arc::new(AtomicBool::new(false)),
            pin: Arc::new(Mutex::new(None)),
            pin_expires_at: Arc::new(Mutex::new(None)),
            stopped_at: Arc::new(Mutex::new(None)),
            is_stopped: Arc::new(AtomicBool::new(true)),
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
/// Flush WAL content into the main DB file before it is copied for a sync.
///
/// The SQL plugin keeps the database in WAL journal mode; recent writes live in
/// `mainframe.db-wal` until a checkpoint. Copying only `mainframe.db` would
/// broadcast a stale snapshot (integrity_check still passes, so the receiver
/// cannot tell). A TRUNCATE checkpoint folds the WAL back into the main file,
/// so the file copy is complete.
fn checkpoint_wal(db_path: &PathBuf) -> Result<(), String> {
    let conn = rusqlite::Connection::open(db_path)
        .map_err(|e| format!("Failed to open database for checkpoint: {}", e))?;
    let busy: i64 = conn
        .query_row("PRAGMA wal_checkpoint(TRUNCATE);", [], |row| row.get(0))
        .map_err(|e| format!("WAL checkpoint failed: {}", e))?;
    // Column 0 = busy flag (0 = fully checkpointed). Non-zero means some frames
    // remain in the WAL because other connections hold read locks; serving a
    // snapshot then risks the stale-data bug, so refuse loudly instead.
    if busy != 0 {
        return Err("Database is busy; close other views and try serving again.".to_string());
    }
    Ok(())
}

/// Choose the IP address to advertise in the QR code and UDP beacon.
///
/// `local_ip_address::local_ip()` can pick a non-Wi-Fi interface on Android
/// (e.g. cellular) or a virtual adapter on desktop, which makes the advertised
/// address unreachable for the peer. Instead, open a UDP socket toward a
/// private-network target and read the local endpoint the OS actually routes
/// through - no packets are sent. Enumerate all interfaces as a fallback and
/// prefer private IPv4 addresses (sync is private-network only by design).
fn pick_advertised_ip() -> Result<IpAddr, String> {
    // 1) Routing probe: the OS picks the interface that would reach the
    //    private target; this mirrors what the peer connection will use.
    if let Ok(sock) = UdpSocket::bind("0.0.0.0:0") {
        if sock.connect("192.168.255.255:9378").is_ok() {
            if let Ok(addr) = sock.local_addr() {
                if is_local_target(addr.ip()) && !addr.ip().is_loopback() {
                    return Ok(addr.ip());
                }
            }
        }
    }

    // 2) Fallback: first private IPv4 from the routing tables via std (no
    //    extra crates); connect probes for a couple of common subnets.
    for target in ["192.168.0.1:9378", "10.0.0.1:9378", "172.16.0.1:9378"] {
        if let Ok(sock) = UdpSocket::bind("0.0.0.0:0") {
            if sock.connect(target).is_ok() {
                if let Ok(addr) = sock.local_addr() {
                    let ip = addr.ip();
                    if matches!(ip, IpAddr::V4(_)) && is_local_target(ip) && !ip.is_loopback() {
                        return Ok(ip);
                    }
                }
            }
        }
    }

    // 3) Last resort: previous behavior.
    local_ip_address::local_ip()
        .map_err(|e| format!("Could not determine a local network address: {}", e))
}
fn generate_pin() -> String {
    let n: u32 = rand::thread_rng().gen_range(100_000..=999_999);
    format!("{}-{}", &n.to_string()[..3], &n.to_string()[3..])
}

fn is_local_peer(peer_ip: IpAddr) -> bool {
    // Only accept connections from private, loopback, or link-local addresses.
    // We intentionally avoid checking matching /24 prefixes, because mobile hotspot,
    // Wi-Fi, and USB tethering frequently route across distinct RFC1918 subnets
    // (e.g., 10.50.x.x vs 10.34.x.x).
    is_local_target(peer_ip)
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

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug, Default)]
pub struct SyncExchangePayload {
    pub device_name: String,
    pub timestamp: u64,
    pub domains: std::collections::HashMap<String, Vec<serde_json::Map<String, serde_json::Value>>>,
    pub cards: Vec<CardSyncRecord>,
    pub item_updates: Vec<ItemUpdateSyncRecord>,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct CardSyncRecord {
    pub domain: String,
    pub item_title: String,
    pub title: String,
    pub draft_content: Option<String>,
    pub order_index: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct ItemUpdateSyncRecord {
    pub domain: String,
    pub item_title: String,
    pub content: String,
    pub created_at: String,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug, Default)]
pub struct SyncMergeStats {
    pub inserted: usize,
    pub updated: usize,
    pub remote_inserted: usize,
    pub remote_updated: usize,
}

const DOMAIN_TABLES: &[&str] = &[
    "certifications",
    "acquisitions",
    "goals",
    "build_ideas",
    "ventures",
    "writing",
    "skills",
    "experiences",
];

fn table_exists(conn: &rusqlite::Connection, table: &str) -> bool {
    conn.query_row(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name = ?",
        [table],
        |_| Ok(()),
    )
    .is_ok()
}

fn get_table_columns(conn: &rusqlite::Connection, table: &str) -> Result<Vec<String>, String> {
    let mut stmt = conn
        .prepare(&format!("PRAGMA table_info({})", table))
        .map_err(|e| e.to_string())?;
    let cols = stmt
        .query_map([], |row| row.get::<_, String>(1))
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .filter(|c| c != "id")
        .collect();
    Ok(cols)
}

fn json_to_sqlite(val: &serde_json::Value) -> rusqlite::types::Value {
    match val {
        serde_json::Value::Null => rusqlite::types::Value::Null,
        serde_json::Value::Bool(b) => rusqlite::types::Value::Integer(if *b { 1 } else { 0 }),
        serde_json::Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                rusqlite::types::Value::Integer(i)
            } else if let Some(f) = n.as_f64() {
                rusqlite::types::Value::Real(f)
            } else {
                rusqlite::types::Value::Null
            }
        }
        serde_json::Value::String(s) => rusqlite::types::Value::Text(s.clone()),
        _ => rusqlite::types::Value::Text(val.to_string()),
    }
}

pub fn export_database_to_payload(db_path: &PathBuf) -> Result<SyncExchangePayload, String> {
    let conn = rusqlite::Connection::open(db_path)
        .map_err(|e| format!("Failed to open DB for export: {}", e))?;
    let _ = conn.busy_timeout(Duration::from_secs(5));

    let mut domains = std::collections::HashMap::new();

    for table in DOMAIN_TABLES {
        if !table_exists(&conn, table) {
            continue;
        }

        let mut stmt = conn
            .prepare(&format!("SELECT * FROM {}", table))
            .map_err(|e| format!("Failed to prepare select on {}: {}", table, e))?;

        let col_names: Vec<String> = stmt
            .column_names()
            .into_iter()
            .map(|s| s.to_string())
            .collect();

        let rows_iter = stmt
            .query_map([], |row| {
                let mut map = serde_json::Map::new();
                for (idx, name) in col_names.iter().enumerate() {
                    let val_ref = row.get_ref(idx)?;
                    let json_val = match val_ref {
                        rusqlite::types::ValueRef::Null => serde_json::Value::Null,
                        rusqlite::types::ValueRef::Integer(v) => serde_json::Value::from(v),
                        rusqlite::types::ValueRef::Real(v) => serde_json::Number::from_f64(v)
                            .map(serde_json::Value::Number)
                            .unwrap_or(serde_json::Value::Null),
                        rusqlite::types::ValueRef::Text(v) => {
                            serde_json::Value::String(String::from_utf8_lossy(v).into_owned())
                        }
                        rusqlite::types::ValueRef::Blob(_) => serde_json::Value::Null,
                    };
                    map.insert(name.clone(), json_val);
                }
                Ok(map)
            })
            .map_err(|e| format!("Query error on {}: {}", table, e))?;

        let mut rows = Vec::new();
        for r in rows_iter {
            if let Ok(row_map) = r {
                rows.push(row_map);
            }
        }
        domains.insert(table.to_string(), rows);
    }

    // Export cards with parent item titles
    let mut cards = Vec::new();
    if table_exists(&conn, "cards") {
        for domain in DOMAIN_TABLES {
            if !table_exists(&conn, domain) {
                continue;
            }
            let sql = format!(
                "SELECT c.title, c.draft_content, c.order_index, c.created_at, c.updated_at, d.title as item_title \
                 FROM cards c JOIN {} d ON c.row_id = d.id WHERE c.domain = ?",
                domain
            );
            if let Ok(mut stmt) = conn.prepare(&sql) {
                if let Ok(rows) = stmt.query_map([*domain], |row| {
                    Ok(CardSyncRecord {
                        domain: domain.to_string(),
                        item_title: row.get(5)?,
                        title: row.get(0)?,
                        draft_content: row.get(1)?,
                        order_index: row.get(2)?,
                        created_at: row.get(3)?,
                        updated_at: row.get(4)?,
                    })
                }) {
                    for card in rows.flatten() {
                        cards.push(card);
                    }
                }
            }
        }
    }

    // Export item_updates with parent item titles
    let mut item_updates = Vec::new();
    if table_exists(&conn, "item_updates") {
        for domain in DOMAIN_TABLES {
            if !table_exists(&conn, domain) {
                continue;
            }
            let sql = format!(
                "SELECT u.content, u.created_at, d.title as item_title \
                 FROM item_updates u JOIN {} d ON u.row_id = d.id WHERE u.domain = ?",
                domain
            );
            if let Ok(mut stmt) = conn.prepare(&sql) {
                if let Ok(rows) = stmt.query_map([*domain], |row| {
                    Ok(ItemUpdateSyncRecord {
                        domain: domain.to_string(),
                        item_title: row.get(2)?,
                        content: row.get(0)?,
                        created_at: row.get(1)?,
                    })
                }) {
                    for update in rows.flatten() {
                        item_updates.push(update);
                    }
                }
            }
        }
    }

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    let hostname = std::env::var("COMPUTERNAME")
        .or_else(|_| std::env::var("USER"))
        .unwrap_or_else(|_| "Mainframe".to_string());

    Ok(SyncExchangePayload {
        device_name: hostname,
        timestamp,
        domains,
        cards,
        item_updates,
    })
}

pub fn merge_payload_into_db(
    db_path: &PathBuf,
    payload: &SyncExchangePayload,
) -> Result<(usize, usize), String> {
    let mut conn = rusqlite::Connection::open(db_path)
        .map_err(|e| format!("Failed to open DB for merge: {}", e))?;
    let _ = conn.busy_timeout(Duration::from_secs(5));

    let tx = conn
        .transaction()
        .map_err(|e| format!("Failed to start merge transaction: {}", e))?;

    let mut total_inserted = 0;
    let mut total_updated = 0;

    for (table, rows) in &payload.domains {
        if !table_exists(&tx, table) {
            continue;
        }

        let local_cols = match get_table_columns(&tx, table) {
            Ok(cols) => cols,
            Err(_) => continue,
        };

        for row in rows {
            let title = match row.get("title").and_then(|v| v.as_str()) {
                Some(t) if !t.trim().is_empty() => t.trim(),
                _ => continue,
            };

            let existing: Option<String> = tx
                .query_row(
                    &format!("SELECT updated_at FROM {} WHERE title = ?", table),
                    [title],
                    |r| r.get(0),
                )
                .ok();

            match existing {
                None => {
                    // Item does not exist locally -> INSERT
                    let mut cols_to_insert = Vec::new();
                    let mut values = Vec::new();

                    for col in &local_cols {
                        if let Some(val) = row.get(col) {
                            cols_to_insert.push(col.as_str());
                            values.push(json_to_sqlite(val));
                        }
                    }

                    if cols_to_insert.is_empty() {
                        continue;
                    }

                    let placeholders = vec!["?"; cols_to_insert.len()].join(", ");
                    let sql = format!(
                        "INSERT INTO {} ({}) VALUES ({})",
                        table,
                        cols_to_insert.join(", "),
                        placeholders
                    );

                    if tx
                        .execute(&sql, rusqlite::params_from_iter(values.iter()))
                        .is_ok()
                    {
                        total_inserted += 1;
                    }
                }
                Some(existing_updated_at) => {
                    // Item exists -> compare timestamps
                    let incoming_updated_at = row
                        .get("updated_at")
                        .and_then(|v| v.as_str())
                        .unwrap_or("");

                    if incoming_updated_at > existing_updated_at.as_str() {
                        let mut set_clauses = Vec::new();
                        let mut values = Vec::new();

                        for col in &local_cols {
                            if col == "title" || col == "created_at" {
                                continue;
                            }
                            if let Some(val) = row.get(col) {
                                set_clauses.push(format!("{} = ?", col));
                                values.push(json_to_sqlite(val));
                            }
                        }

                        if set_clauses.is_empty() {
                            continue;
                        }

                        values.push(rusqlite::types::Value::Text(title.to_string()));
                        let sql = format!(
                            "UPDATE {} SET {} WHERE title = ?",
                            table,
                            set_clauses.join(", ")
                        );

                        if tx
                            .execute(&sql, rusqlite::params_from_iter(values.iter()))
                            .is_ok()
                        {
                            total_updated += 1;
                        }
                    }
                }
            }
        }
    }

    // Merge Cards
    if table_exists(&tx, "cards") {
        for card in &payload.cards {
            if !table_exists(&tx, &card.domain) {
                continue;
            }
            let parent_id: Option<i64> = tx
                .query_row(
                    &format!("SELECT id FROM {} WHERE title = ?", card.domain),
                    [&card.item_title],
                    |r| r.get(0),
                )
                .ok();

            let parent_id = match parent_id {
                Some(id) => id,
                None => continue,
            };

            let existing_card: Option<(i64, String)> = tx
                .query_row(
                    "SELECT id, updated_at FROM cards WHERE domain = ? AND row_id = ? AND title = ?",
                    rusqlite::params![card.domain, parent_id, card.title],
                    |r| Ok((r.get(0)?, r.get(1)?)),
                )
                .ok();

            match existing_card {
                None => {
                    let _ = tx.execute(
                        "INSERT INTO cards (domain, row_id, title, draft_content, order_index, created_at, updated_at) \
                         VALUES (?, ?, ?, ?, ?, ?, ?)",
                        rusqlite::params![
                            card.domain,
                            parent_id,
                            card.title,
                            card.draft_content,
                            card.order_index,
                            card.created_at,
                            card.updated_at
                        ],
                    );
                }
                Some((card_id, existing_updated)) => {
                    if card.updated_at.as_str() > existing_updated.as_str() {
                        let _ = tx.execute(
                            "UPDATE cards SET draft_content = ?, order_index = ?, updated_at = ? WHERE id = ?",
                            rusqlite::params![card.draft_content, card.order_index, card.updated_at, card_id],
                        );
                    }
                }
            }
        }
    }

    // Merge Item Updates
    if table_exists(&tx, "item_updates") {
        for update in &payload.item_updates {
            if !table_exists(&tx, &update.domain) {
                continue;
            }
            let parent_id: Option<i64> = tx
                .query_row(
                    &format!("SELECT id FROM {} WHERE title = ?", update.domain),
                    [&update.item_title],
                    |r| r.get(0),
                )
                .ok();

            let parent_id = match parent_id {
                Some(id) => id,
                None => continue,
            };

            let exists: bool = tx
                .query_row(
                    "SELECT 1 FROM item_updates WHERE domain = ? AND row_id = ? AND content = ? AND created_at = ?",
                    rusqlite::params![update.domain, parent_id, update.content, update.created_at],
                    |_| Ok(()),
                )
                .is_ok();

            if !exists {
                let _ = tx.execute(
                    "INSERT INTO item_updates (domain, row_id, content, created_at) VALUES (?, ?, ?, ?)",
                    rusqlite::params![update.domain, parent_id, update.content, update.created_at],
                );
            }
        }
    }

    tx.commit()
        .map_err(|e| format!("Failed to commit merge transaction: {}", e))?;

    Ok((total_inserted, total_updated))
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

    // After a stop, tiny_http closes the listener asynchronously. Wait (max
    // ~3s) for the port to be released so the rebind does not fail with
    // WSAEADDRINUSE (10048) - the "port already in use" users saw after
    // stopping a broadcast and trying to start it again.
    let stopped = *state.stopped_at.lock().unwrap();
    if let Some(t) = stopped {
        while t.elapsed() < Duration::from_secs(5) {
            let port_free = std::net::TcpListener::bind(("0.0.0.0", SYNC_PORT)).is_ok();
            if port_free {
                break;
            }
            // The old handler thread only re-checks the stop flag when a
            // request wakes the accept loop. Nudge it with a throwaway
            // loopback connection so it exits and releases the port.
            let _ = std::net::TcpStream::connect(("127.0.0.1", SYNC_PORT));
            thread::sleep(Duration::from_millis(250));
        }
        *state.stopped_at.lock().unwrap() = None;
    }

    let local_ip = pick_advertised_ip().map_err(|e| e.to_string())?;
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

    let db_path = get_db_path(&app)?;
    let app_clone = app.clone();

    let server_arc_clone = server_arc.clone();
    let stop_flag = state.is_stopped.clone();
    stop_flag.store(false, Ordering::SeqCst);
    thread::spawn(move || {
        for mut request in server_arc_clone.incoming_requests() {
            if stop_flag.load(Ordering::SeqCst) {
                // stop_sync_server was called: exit the loop so the thread
                // drops its Server Arc and the listener socket closes,
                // releasing port 9377 promptly.
                break;
            }
            let path = request.url().split('?').next().unwrap_or_default();
            let peer_ip = request.remote_addr().map(SocketAddr::ip);

            let is_get_db = request.method() == &Method::Get && path == "/db";
            let is_sync_exchange = request.method() == &Method::Post && path == "/sync/exchange";

            if !is_get_db && !is_sync_exchange {
                let _ = request.respond(Response::from_string("Not Found").with_status_code(404));
                continue;
            }

            let peer_is_local = peer_ip
                .map(is_local_peer)
                .unwrap_or(false);
            if !peer_is_local {
                eprintln!("[sync] Rejected non-local peer: {:?}", peer_ip);
                let _ = request.respond(
                    Response::from_string("Forbidden: non-local peer")
                        .with_status_code(403)
                        .with_header(Header::from_bytes(&b"Cache-Control"[..], &b"no-store"[..]).unwrap())
                );
                continue;
            }

            let provided_pin = request_header(&request, "Authorization")
                .and_then(|value| value.strip_prefix("Bearer "))
                .map(str::trim)
                // Normalize: the display PIN is formatted ("482-391") but
                // clients send the six raw digits. Compare digits only,
                // otherwise every request fails with 401.
                .map(|p| p.replace('-', ""));
            let expected_pin = pin_state.lock().unwrap().clone().map(|p| p.replace('-', ""));
            let pin_valid = pin_expires_at
                .lock()
                .unwrap()
                .map(|expires| Instant::now() < expires)
                .unwrap_or(false);
            let authed = pin_valid
                && provided_pin
                    .zip(expected_pin.as_deref())
                    .map(|(provided, expected)| provided == expected)
                    .unwrap_or(false);

            if !authed {
                eprintln!("[sync] Unauthorized: invalid or expired PIN from {:?}", peer_ip);
                let _ = request.respond(unauthorized());
                continue;
            }

            // Flush WAL first: a file copy without checkpointing would ship a
            // stale snapshot missing recent writes (see checkpoint_wal doc).
            if let Err(err) = checkpoint_wal(&db_path) {
                let _ = request.respond(
                    Response::from_string(format!("Sync refused: {}", err))
                        .with_status_code(503),
                );
                continue;
            }

            if is_sync_exchange {
                let mut body = Vec::new();
                if request.as_reader().take((MAX_DATABASE_BYTES + 1) as u64).read_to_end(&mut body).is_err() || body.len() > MAX_DATABASE_BYTES {
                    let _ = request.respond(Response::from_string("Bad Request or Payload Too Large").with_status_code(400));
                    continue;
                }

                let client_payload: SyncExchangePayload = match serde_json::from_slice(&body) {
                    Ok(p) => p,
                    Err(e) => {
                        eprintln!("[sync] JSON parse error: {}", e);
                        let _ = request.respond(Response::from_string(format!("Invalid JSON: {}", e)).with_status_code(400));
                        continue;
                    }
                };

                let server_payload = match export_database_to_payload(&db_path) {
                    Ok(p) => p,
                    Err(e) => {
                        let _ = request.respond(Response::from_string(format!("Export failed: {}", e)).with_status_code(500));
                        continue;
                    }
                };

                let merge_stats = match merge_payload_into_db(&db_path, &client_payload) {
                    Ok(stats) => stats,
                    Err(e) => {
                        eprintln!("[sync] Merge error on server: {}", e);
                        let _ = request.respond(Response::from_string(format!("Merge failed: {}", e)).with_status_code(500));
                        continue;
                    }
                };

                // Signal frontend to reload
                let _ = app_clone.emit("db_swap_complete", ());

                #[derive(serde::Serialize)]
                struct ExchangeResponse {
                    server_inserted: usize,
                    server_updated: usize,
                    payload: SyncExchangePayload,
                }

                let resp_obj = ExchangeResponse {
                    server_inserted: merge_stats.0,
                    server_updated: merge_stats.1,
                    payload: server_payload,
                };

                let resp_json = match serde_json::to_vec(&resp_obj) {
                    Ok(j) => j,
                    Err(e) => {
                        let _ = request.respond(Response::from_string(format!("Serialization failed: {}", e)).with_status_code(500));
                        continue;
                    }
                };

                // Invalidate PIN after successful exchange
                *pin_state.lock().unwrap() = None;
                *pin_expires_at.lock().unwrap() = None;

                let response = Response::from_data(resp_json).with_header(
                    Header::from_bytes(&b"Content-Type"[..], &b"application/json"[..]).unwrap(),
                );
                let _ = request.respond(response);
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
    state.is_stopped.store(true, Ordering::SeqCst);
    state.is_broadcasting.store(false, Ordering::SeqCst);
    *state.pin.lock().unwrap() = None;
    *state.pin_expires_at.lock().unwrap() = None;
    let mut server_guard = state.server.lock().unwrap();
    if let Some(server) = server_guard.take() {
        // unblock() wakes the accept loop; the listener socket only closes
        // (releasing port 9377) once every Arc<Server> clone is dropped. The
        // handler thread exits its loop shortly after unblock, but that exit
        // is asynchronous - so we must NOT try to rebind immediately. Track
        // stop-time so start_sync_server can wait for the port to be free.
        server.unblock();
        *state.stopped_at.lock().unwrap() = Some(Instant::now());
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

#[tauri::command]
pub async fn bidirectional_sync(
    app: AppHandle,
    ip_port: String,
    pin: String,
) -> Result<SyncMergeStats, String> {
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
    let pin_raw = pin.replace('-', "");
    if pin_raw.len() != 6 || !pin_raw.chars().all(|ch| ch.is_ascii_digit()) {
        return Err("PIN must contain six digits.".to_string());
    }

    let db_path = get_db_path(&app)?;

    // 1. Checkpoint WAL on local DB
    checkpoint_wal(&db_path)?;

    // 2. Export local DB payload
    let local_payload = export_database_to_payload(&db_path)?;

    let url = format!("http://{}/sync/exchange", target);

    let body_bytes = serde_json::to_vec(&local_payload)
        .map_err(|e| format!("Failed to serialize payload: {}", e))?;

    // 3. Send to remote server
    let response = ureq::post(&url)
        .set("Authorization", &format!("Bearer {}", pin_raw))
        .set("Content-Type", "application/json")
        .timeout(Duration::from_secs(30))
        .send_bytes(&body_bytes)
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

    #[derive(serde::Deserialize)]
    struct ExchangeResponse {
        server_inserted: usize,
        server_updated: usize,
        payload: SyncExchangePayload,
    }

    let mut resp_bytes = Vec::new();
    response
        .into_reader()
        .take((MAX_DATABASE_BYTES + 1) as u64)
        .read_to_end(&mut resp_bytes)
        .map_err(|e| format!("Failed to read response: {}", e))?;

    let exchange_resp: ExchangeResponse = serde_json::from_slice(&resp_bytes)
        .map_err(|e| format!("Failed to parse response from remote device: {}", e))?;

    // 4. Backup existing DB before merging
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    if db_path.exists() {
        let backup_path = db_path.with_file_name(format!("mainframe_merge_backup_{}.db", timestamp));
        let _ = fs::copy(&db_path, &backup_path);
    }

    // 5. Merge remote payload into local DB
    let (local_inserted, local_updated) = merge_payload_into_db(&db_path, &exchange_resp.payload)?;

    // 6. Signal frontend to refresh
    let _ = app.emit("db_swap_complete", ());

    Ok(SyncMergeStats {
        inserted: local_inserted,
        updated: local_updated,
        remote_inserted: exchange_resp.server_inserted,
        remote_updated: exchange_resp.server_updated,
    })
}

