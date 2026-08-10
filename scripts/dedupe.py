import sqlite3
import os

def deduplicate():
    db_path = os.path.join(os.getenv('APPDATA'), 'com.kwadw.the-mainframe', 'mainframe.db')
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Find duplicates
        cursor.execute('''
            SELECT title, COUNT(*) 
            FROM acquisitions 
            GROUP BY title 
            HAVING COUNT(*) > 1
        ''')
        duplicates = cursor.fetchall()
        
        if not duplicates:
            print("No duplicates found in the acquisitions table.")
            return

        print(f"Found {len(duplicates)} items with duplicates. Cleaning them up...")
        
        # Keep the one with the highest ID (most recently added/updated)
        # and delete the rest
        deleted_count = 0
        for title, count in duplicates:
            cursor.execute('''
                DELETE FROM acquisitions 
                WHERE title = ? AND id NOT IN (
                    SELECT MAX(id) FROM acquisitions WHERE title = ?
                )
            ''', (title, title))
            deleted_count += (count - 1)
            print(f"  - Removed {count - 1} duplicate(s) of '{title}'")
            
        conn.commit()
        print(f"\nSuccessfully removed {deleted_count} duplicate rows!")
        
    except Exception as e:
        print(f"Error during deduplication: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    deduplicate()
