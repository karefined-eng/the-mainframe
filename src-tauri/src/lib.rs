use tauri_plugin_sql::{Migration, MigrationKind};

mod sync;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: r#"
                CREATE TABLE IF NOT EXISTS courses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL UNIQUE,
                    notes TEXT,
                    status TEXT NOT NULL DEFAULT 'not_started',
                    created_at TEXT NOT NULL DEFAULT (datetime('now')),
                    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                    target_date TEXT,
                    raw_import_text TEXT,
                    platform TEXT,
                    url TEXT,
                    progress_percent INTEGER NOT NULL DEFAULT 0
                );
                CREATE TABLE IF NOT EXISTS acquisitions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL UNIQUE,
                    notes TEXT,
                    status TEXT NOT NULL DEFAULT 'not_started',
                    created_at TEXT NOT NULL DEFAULT (datetime('now')),
                    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                    target_date TEXT,
                    raw_import_text TEXT,
                    category TEXT,
                    estimated_cost REAL,
                    priority TEXT NOT NULL DEFAULT 'medium'
                );
                CREATE TABLE IF NOT EXISTS goals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL UNIQUE,
                    notes TEXT,
                    status TEXT NOT NULL DEFAULT 'not_started',
                    created_at TEXT NOT NULL DEFAULT (datetime('now')),
                    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                    target_date TEXT,
                    raw_import_text TEXT,
                    timeframe TEXT,
                    action_trigger TEXT
                );
                CREATE TABLE IF NOT EXISTS build_ideas (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL UNIQUE,
                    notes TEXT,
                    status TEXT NOT NULL DEFAULT 'not_started',
                    created_at TEXT NOT NULL DEFAULT (datetime('now')),
                    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                    target_date TEXT,
                    raw_import_text TEXT,
                    category TEXT,
                    repo_or_link TEXT,
                    action_trigger TEXT
                );
                CREATE TABLE IF NOT EXISTS ventures (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL UNIQUE,
                    notes TEXT,
                    status TEXT NOT NULL DEFAULT 'not_started',
                    created_at TEXT NOT NULL DEFAULT (datetime('now')),
                    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                    target_date TEXT,
                    raw_import_text TEXT,
                    stage TEXT NOT NULL DEFAULT 'idea',
                    action_trigger TEXT
                );
                CREATE TABLE IF NOT EXISTS app_settings (
                    key TEXT PRIMARY KEY,
                    value TEXT
                );
                INSERT OR IGNORE INTO app_settings (key, value) VALUES ('notification_density', 'balanced');
                PRAGMA user_version = 1;
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "add_notification_engine",
            sql: r#"
                ALTER TABLE courses ADD COLUMN last_notified_at TEXT;
                ALTER TABLE courses ADD COLUMN last_notified_score INTEGER;
                ALTER TABLE acquisitions ADD COLUMN last_notified_at TEXT;
                ALTER TABLE acquisitions ADD COLUMN last_notified_score INTEGER;
                ALTER TABLE goals ADD COLUMN last_notified_at TEXT;
                ALTER TABLE goals ADD COLUMN last_notified_score INTEGER;
                ALTER TABLE build_ideas ADD COLUMN last_notified_at TEXT;
                ALTER TABLE build_ideas ADD COLUMN last_notified_score INTEGER;
                ALTER TABLE ventures ADD COLUMN last_notified_at TEXT;
                ALTER TABLE ventures ADD COLUMN last_notified_score INTEGER;
                CREATE TABLE IF NOT EXISTS notification_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    domain TEXT NOT NULL,
                    row_id INTEGER NOT NULL,
                    message TEXT NOT NULL,
                    fired_at TEXT NOT NULL DEFAULT (datetime('now')),
                    dismissed INTEGER NOT NULL DEFAULT 0
                );
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "v2_calendar_and_domains",
            sql: r#"
                ALTER TABLE courses RENAME TO certifications;
                
                ALTER TABLE certifications ADD COLUMN target_time TEXT;
                ALTER TABLE acquisitions ADD COLUMN target_time TEXT;
                ALTER TABLE goals ADD COLUMN target_time TEXT;
                ALTER TABLE build_ideas ADD COLUMN target_time TEXT;
                ALTER TABLE ventures ADD COLUMN target_time TEXT;
                
                CREATE TABLE IF NOT EXISTS writing (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL UNIQUE,
                    notes TEXT,
                    status TEXT NOT NULL DEFAULT 'not_started',
                    created_at TEXT NOT NULL DEFAULT (datetime('now')),
                    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                    target_date TEXT,
                    target_time TEXT,
                    raw_import_text TEXT,
                    publish_target TEXT,
                    platform TEXT,
                    last_notified_at TEXT,
                    last_notified_score INTEGER
                );
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "add_skills_and_experiences",
            sql: r#"
                CREATE TABLE IF NOT EXISTS skills (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL UNIQUE,
                    notes TEXT,
                    status TEXT NOT NULL DEFAULT 'not_started',
                    created_at TEXT NOT NULL DEFAULT (datetime('now')),
                    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                    target_date TEXT,
                    target_time TEXT,
                    raw_import_text TEXT,
                    last_notified_at TEXT,
                    last_notified_score INTEGER
                );
                CREATE TABLE IF NOT EXISTS experiences (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL UNIQUE,
                    notes TEXT,
                    status TEXT NOT NULL DEFAULT 'not_started',
                    created_at TEXT NOT NULL DEFAULT (datetime('now')),
                    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                    target_date TEXT,
                    target_time TEXT,
                    raw_import_text TEXT,
                    last_notified_at TEXT,
                    last_notified_score INTEGER
                );
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "add_item_updates_and_domain_fields",
            sql: r#"
                CREATE TABLE IF NOT EXISTS item_updates (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    domain TEXT NOT NULL,
                    row_id INTEGER NOT NULL,
                    content TEXT NOT NULL,
                    created_at TEXT NOT NULL DEFAULT (datetime('now'))
                );
                
                ALTER TABLE certifications DROP COLUMN progress_percent;
                ALTER TABLE certifications ADD COLUMN credential_url TEXT;
                ALTER TABLE certifications ADD COLUMN expires_at TEXT;
                
                ALTER TABLE ventures ADD COLUMN target_audience TEXT;
                
                ALTER TABLE acquisitions ADD COLUMN necessity TEXT;
                
                ALTER TABLE writing DROP COLUMN publish_target;
                ALTER TABLE writing DROP COLUMN platform;
                ALTER TABLE writing ADD COLUMN writing_type TEXT;
                
                ALTER TABLE skills ADD COLUMN proficiency TEXT;
                ALTER TABLE skills ADD COLUMN proof_link TEXT;
                
                ALTER TABLE experiences ADD COLUMN impact TEXT;
                ALTER TABLE experiences ADD COLUMN takeaway TEXT;
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "add_draft_content_to_writing",
            sql: r#"
                ALTER TABLE writing ADD COLUMN draft_content TEXT;
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 7,
            description: "create_cards_table_and_migrate_notes",
            sql: r#"
                CREATE TABLE IF NOT EXISTS cards (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    domain TEXT NOT NULL,
                    row_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    draft_content TEXT,
                    order_index INTEGER NOT NULL DEFAULT 0,
                    created_at TEXT NOT NULL DEFAULT (datetime('now')),
                    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
                );
                
                INSERT INTO cards (domain, row_id, title, draft_content, order_index, created_at, updated_at)
                SELECT 'build_ideas', id, 'Legacy Notes', notes, 0, created_at, updated_at FROM build_ideas WHERE notes IS NOT NULL AND notes != '';

                INSERT INTO cards (domain, row_id, title, draft_content, order_index, created_at, updated_at)
                SELECT 'ventures', id, 'Legacy Notes', notes, 0, created_at, updated_at FROM ventures WHERE notes IS NOT NULL AND notes != '';

                INSERT INTO cards (domain, row_id, title, draft_content, order_index, created_at, updated_at)
                SELECT 'goals', id, 'Legacy Notes', notes, 0, created_at, updated_at FROM goals WHERE notes IS NOT NULL AND notes != '';

                INSERT INTO cards (domain, row_id, title, draft_content, order_index, created_at, updated_at)
                SELECT 'skills', id, 'Legacy Notes', notes, 0, created_at, updated_at FROM skills WHERE notes IS NOT NULL AND notes != '';

                INSERT INTO cards (domain, row_id, title, draft_content, order_index, created_at, updated_at)
                SELECT 'experiences', id, 'Legacy Notes', notes, 0, created_at, updated_at FROM experiences WHERE notes IS NOT NULL AND notes != '';

                INSERT INTO cards (domain, row_id, title, draft_content, order_index, created_at, updated_at)
                SELECT 'writing', id, 'Legacy Notes', notes || char(10) || coalesce(draft_content, ''), 0, created_at, updated_at FROM writing WHERE (notes IS NOT NULL AND notes != '') OR (draft_content IS NOT NULL AND draft_content != '');
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 8,
            description: "add_journal_domain",
            sql: r#"
                CREATE TABLE IF NOT EXISTS journal (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL UNIQUE,
                    notes TEXT,
                    status TEXT NOT NULL DEFAULT 'done',
                    created_at TEXT NOT NULL DEFAULT (datetime('now')),
                    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                    target_date TEXT,
                    target_time TEXT,
                    raw_import_text TEXT,
                    entry_type TEXT DEFAULT 'reflection',
                    last_notified_at TEXT,
                    last_notified_score INTEGER
                );
            "#,
            kind: MigrationKind::Up,
        },
    ];

    let mut builder = tauri::Builder::default();
    builder = builder
        .manage(sync::SyncState::default())
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:mainframe.db", migrations)
                .build(),
        );

    // barcode-scanner is mobile-only; the crate compiles empty on desktop.
    #[cfg(any(target_os = "android", target_os = "ios"))]
    {
        builder = builder.plugin(tauri_plugin_barcode_scanner::init());
    }

    // updater is desktop-only (Windows, macOS, Linux).
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        builder = builder.plugin(tauri_plugin_updater::Builder::new().build());
    }

    builder
        .invoke_handler(tauri::generate_handler![
            sync::start_sync_server,
            sync::stop_sync_server,
            sync::pull_from_device,
            sync::bidirectional_sync,
            sync::discover_devices
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
