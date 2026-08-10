import sqlite3
import os

def apply_unique_constraints():
    db_path = os.path.join(os.getenv('APPDATA'), 'com.kwadw.the-mainframe', 'mainframe.db')
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    tables = ["courses", "acquisitions", "goals", "build_ideas", "ventures"]

    try:
        for table in tables:
            print(f"Applying UNIQUE(title) constraint to '{table}'...")
            
            # Create a temporary table with the UNIQUE constraint
            # Note: Assuming the schema defined in 01_DATA_SCHEMA.md
            cursor.execute(f"PRAGMA table_info({table})")
            columns_info = cursor.fetchall()
            
            if not columns_info:
                print(f"  - Table '{table}' does not exist yet. Skipping.")
                continue

            # Check if there is already a unique index on title
            cursor.execute(f"PRAGMA index_list({table})")
            indices = cursor.fetchall()
            has_unique = False
            for idx in indices:
                if idx[2] == 1: # 1 means it's a unique index
                    cursor.execute(f"PRAGMA index_info({idx[1]})")
                    cols = cursor.fetchall()
                    if any(c[2] == 'title' for c in cols):
                        has_unique = True
                        break
            
            if has_unique:
                print(f"  - Unique constraint on 'title' already exists for '{table}'.")
                continue
                
            # SQLite easiest way to add unique constraint is to create a UNIQUE index
            cursor.execute(f"CREATE UNIQUE INDEX IF NOT EXISTS idx_{table}_title_unique ON {table}(title)")
            print(f"  - Added unique index to '{table}'.")

        conn.commit()
        print("\nSuccessfully applied database-level guardrails to all existing tables!")
        
    except Exception as e:
        print(f"Error applying constraints: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    apply_unique_constraints()
