import sqlite3
import os
import datetime
import json
from pathlib import Path

app_data = os.getenv("APPDATA")
if not app_data:
    app_data = str(Path.home() / "AppData" / "Roaming")
    
db_path = os.path.join(app_data, 'com.kwadw.the-mainframe', 'mainframe.db')

def insert_item(c, domain, title, notes="", **extra_fields):
    now = datetime.datetime.utcnow().isoformat() + "Z"
    if not title:
        return False

    valid_domains = ["certifications", "build_ideas", "acquisitions", "goals", "ventures", "writing", "skills", "experiences"]
    if domain not in valid_domains:
        return False

    fields = ['title', 'notes', 'created_at', 'updated_at']
    values = [title, notes, now, now]
    
    for k, v in extra_fields.items():
        if v is not None:
            fields.append(k)
            values.append(v)
            
    cols_str = ", ".join(fields)
    placeholders = ", ".join(["?"] * len(fields))
    
    try:
        c.execute(f'''
            INSERT OR IGNORE INTO {domain} ({cols_str})
            VALUES ({placeholders})
        ''', values)
        return c.rowcount > 0
    except Exception as e:
        print(f"Error inserting '{title}' into {domain}: {e}")
        return False

def run_import():
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    print("Starting cleaned import from import.json...\n")
    total_inserted = 0

    import_path = os.path.join(os.path.dirname(__file__), '..', 'imports', 'import.json')
    if not os.path.exists(import_path):
        print(f"Error: Could not find {import_path}")
        return

    with open(import_path, 'r', encoding='utf-8') as f:
        items = json.load(f)
        
    for item in items:
        domain = item.pop('domain')
        title = item.pop('title')
        notes = item.pop('notes', "")
        
        if insert_item(c, domain, title, notes, **item):
            total_inserted += 1

    conn.commit()
    conn.close()
    
    print(f"\nImport complete! {total_inserted} new items added to The Mainframe.")

if __name__ == "__main__":
    run_import()


