import sqlite3
import os
import json
import datetime
from pathlib import Path

# Setup database path
app_data = os.getenv("APPDATA")
if not app_data:
    app_data = str(Path.home() / "AppData" / "Roaming")
    
db_path = os.path.join(app_data, 'com.kwadw.the-mainframe', 'mainframe.db')
json_path = os.path.join('imports', 'bluetooth_import.json')

def run_import():
    if not os.path.exists(json_path):
        print(f"File not found: {json_path}")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        items = json.load(f)

    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # First, make sure the skills and experiences tables exist, just in case!
    schema = """
    CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL UNIQUE,
        notes TEXT,
        status TEXT DEFAULT 'not_started',
        recurrence TEXT,
        created_at TEXT,
        updated_at TEXT,
        target_date TEXT,
        raw_import_text TEXT
    );
    CREATE TABLE IF NOT EXISTS experiences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL UNIQUE,
        notes TEXT,
        status TEXT DEFAULT 'not_started',
        recurrence TEXT,
        created_at TEXT,
        updated_at TEXT,
        target_date TEXT,
        raw_import_text TEXT
    );
    """
    c.executescript(schema)

    success_count = 0
    now = datetime.datetime.utcnow().isoformat() + "Z"

    for item in items:
        domain = item.get("domain")
        title = item.get("title")
        notes = item.get("notes", "")
        status = item.get("status", "not_started")
        
        try:
            # Mainframe SQLite Deduplication Rule: Use INSERT OR IGNORE
            c.execute(f'''
                INSERT OR IGNORE INTO {domain} 
                (title, notes, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
            ''', (title, notes, status, now, now))
            
            # Check if row was actually inserted (rowcount == 1 means inserted, 0 means ignored)
            if c.rowcount > 0:
                print(f"Imported into {domain}: {title}")
                success_count += 1
            else:
                print(f"Skipped duplicate in {domain}: {title}")
                
        except Exception as e:
            print(f"Error inserting {title} into {domain}: {e}")

    conn.commit()
    conn.close()
    
    print(f"\nImport complete! {success_count} new items added to The Mainframe.")

if __name__ == "__main__":
    run_import()
