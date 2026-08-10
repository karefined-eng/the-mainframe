use tauri_plugin_sql::{Migration, MigrationKind};

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
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:mainframe.db", migrations)
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
