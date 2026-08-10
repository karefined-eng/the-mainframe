import sqlite3
import os

def init_db():
    db_path = os.path.join(os.getenv('APPDATA'), 'com.kwadw.the-mainframe', 'mainframe.db')
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    common_columns = '''
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL UNIQUE,
        notes TEXT,
        status TEXT DEFAULT 'not_started',
        recurrence TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        target_date TEXT,
        raw_import_text TEXT,
        last_notified_at TEXT,
        last_notified_score INTEGER
    '''

    try:
        # 1. courses
        cursor.execute(f'''
            CREATE TABLE IF NOT EXISTS courses (
                {common_columns},
                platform TEXT,
                url TEXT,
                progress_percent INTEGER DEFAULT 0
            )
        ''')

        # 2. acquisitions
        cursor.execute(f'''
            CREATE TABLE IF NOT EXISTS acquisitions (
                {common_columns},
                category TEXT,
                estimated_cost REAL,
                priority TEXT DEFAULT 'medium'
            )
        ''')

        # 3. goals
        cursor.execute(f'''
            CREATE TABLE IF NOT EXISTS goals (
                {common_columns},
                timeframe TEXT,
                action_trigger TEXT
            )
        ''')

        # 4. build_ideas
        cursor.execute(f'''
            CREATE TABLE IF NOT EXISTS build_ideas (
                {common_columns},
                category TEXT,
                repo_or_link TEXT,
                action_trigger TEXT
            )
        ''')

        # 5. ventures
        cursor.execute(f'''
            CREATE TABLE IF NOT EXISTS ventures (
                {common_columns},
                stage TEXT DEFAULT 'idea',
                action_trigger TEXT
            )
        ''')

        # 6. notification_log
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notification_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                domain TEXT NOT NULL,
                row_id INTEGER NOT NULL,
                message TEXT NOT NULL,
                fired_at TEXT NOT NULL,
                dismissed BOOLEAN DEFAULT 0
            )
        ''')
        
        # Also ensure the schema version is set
        cursor.execute("PRAGMA user_version = 1")

        conn.commit()
        print("Successfully initialized all missing tables in the database!")
        
    except Exception as e:
        print(f"Error initializing tables: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    init_db()
