import sqlite3
import os
import datetime
import re
from pathlib import Path

# Setup database path
app_data = os.getenv("APPDATA")
if not app_data:
    app_data = str(Path.home() / "AppData" / "Roaming")
    
db_path = os.path.join(app_data, 'com.kwadw.the-mainframe', 'mainframe.db')

def setup_tables(c):
    # Ensure all tables exist including 'writing' domain which is newly introduced
    schema = """
    CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL UNIQUE,
        notes TEXT,
        status TEXT DEFAULT 'not_started',
        recurrence TEXT,
        created_at TEXT,
        updated_at TEXT,
        target_date TEXT,
        raw_import_text TEXT,
        platform TEXT,
        url TEXT,
        progress_percent INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS writing (
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
    CREATE TABLE IF NOT EXISTS build_ideas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL UNIQUE,
        notes TEXT,
        status TEXT DEFAULT 'not_started',
        recurrence TEXT,
        created_at TEXT,
        updated_at TEXT,
        target_date TEXT,
        raw_import_text TEXT,
        category TEXT,
        repo_or_link TEXT
    );
    CREATE TABLE IF NOT EXISTS ventures (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL UNIQUE,
        notes TEXT,
        status TEXT DEFAULT 'not_started',
        recurrence TEXT,
        created_at TEXT,
        updated_at TEXT,
        target_date TEXT,
        raw_import_text TEXT,
        stage TEXT DEFAULT 'idea'
    );
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
    """
    c.executescript(schema)

def insert_item(c, domain, title, notes="", raw_text=""):
    now = datetime.datetime.utcnow().isoformat() + "Z"
    try:
        c.execute(f'''
            INSERT OR IGNORE INTO {domain} 
            (title, notes, created_at, updated_at, raw_import_text)
            VALUES (?, ?, ?, ?, ?)
        ''', (title, notes, now, now, raw_text))
        return c.rowcount > 0
    except Exception as e:
        print(f"Error inserting '{title}' into {domain}: {e}")
        return False

def clean_title(line):
    # Remove leading dots, quotes, and whitespace
    line = line.strip()
    if line.startswith('.'):
        line = line[1:].strip()
    if line.startswith('"') and line.endswith('"'):
        line = line[1:-1].strip()
    return line

def process_file_lines(c, filepath, domain):
    if not os.path.exists(filepath):
        print(f"Skipping (not found): {filepath}")
        return 0
    
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    inserted = 0
    for line in lines:
        cleaned = clean_title(line)
        if cleaned:
            if insert_item(c, domain, title=cleaned, raw_text=line.strip()):
                inserted += 1
    return inserted

def process_html_file(c, filepath, domain):
    if not os.path.exists(filepath):
        print(f"Skipping (not found): {filepath}")
        return 0
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Extract text between <br> tags or just plain text from the body
    body_match = re.search(r'<body>(.*?)</body>', content, re.IGNORECASE)
    if body_match:
        content = body_match.group(1)
        
    items = content.split('<br>')
    inserted = 0
    for item in items:
        cleaned = clean_title(item)
        if cleaned and cleaned.lower() != 'leflist': # ignore the title if it's there
            if insert_item(c, domain, title=cleaned, raw_text=item.strip()):
                inserted += 1
    return inserted

def process_single_item(c, filepath, domain, title):
    if not os.path.exists(filepath):
        print(f"Skipping (not found): {filepath}")
        return 0
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if insert_item(c, domain, title=title, notes=content):
        return 1
    return 0

def run_import():
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    setup_tables(c)

    print("Starting import from sources...\n")
    total_inserted = 0

    # 1. Courses
    total_inserted += process_file_lines(c, r"c:\Users\kwadw\Downloads\KWDW BACKUP\OneDrive\Documents\Desktop\SCRIBBLES\ACTIVELY RUNNNING ONLINE COURSE CER.md", "courses")
    total_inserted += process_file_lines(c, r"c:\Users\kwadw\Downloads\KWDW BACKUP\Downloads\EUROPEAN MEDICAL SCHOOLS RELATED DOCUMENTS\SCRIBBLES\Dec 12, 2023 341 PM.txt", "courses")

    # 2. Writing
    total_inserted += process_file_lines(c, r"c:\Users\kwadw\Downloads\KWDW BACKUP\Downloads\EUROPEAN MEDICAL SCHOOLS RELATED DOCUMENTS\SCRIBBLES\articleswrite-upopinions.txt", "writing")

    # 3. Build Ideas
    total_inserted += process_file_lines(c, r"c:\Users\kwadw\Downloads\KWDW BACKUP\Downloads\EUROPEAN MEDICAL SCHOOLS RELATED DOCUMENTS\SCRIBBLES\Based on the success of your Tetteh.txt", "build_ideas")

    # 4. Ventures
    total_inserted += process_file_lines(c, r"c:\Users\kwadw\Downloads\KWDW BACKUP\Downloads\EUROPEAN MEDICAL SCHOOLS RELATED DOCUMENTS\SCRIBBLES\venturesenterpriseexploits.txt", "ventures")
    total_inserted += process_single_item(c, r"c:\Users\kwadw\Downloads\KWDW BACKUP\Downloads\EUROPEAN MEDICAL SCHOOLS RELATED DOCUMENTS\SCRIBBLES\VENTURE CAPITAL.md", "ventures", "Venture Capital Concept")

    # 5. Skills
    total_inserted += process_html_file(c, r"c:\Users\kwadw\Documents\the-mainframe\imports\bluetooth_content_share.html", "skills")

    conn.commit()
    conn.close()
    
    print(f"\nImport complete! {total_inserted} new items added to The Mainframe.")

if __name__ == "__main__":
    run_import()
