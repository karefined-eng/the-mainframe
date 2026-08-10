import sys
import json
import sqlite3
import os

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/import.py <path_to_json>")
        sys.exit(1)
        
    json_path = sys.argv[1]
    
    appdata = os.getenv('APPDATA')
    if not appdata:
        print("Error: APPDATA environment variable not found.")
        sys.exit(1)
        
    db_path = os.path.join(appdata, 'com.kwadw.the-mainframe', 'mainframe.db')
    
    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        sys.exit(1)
        
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            items = json.load(f)
    except Exception as e:
        print(f"Error reading JSON file: {e}")
        sys.exit(1)
        
    if not items:
        print("No items to import.")
        sys.exit(0)
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    inserted_count = 0
    
    try:
        for item in items:
            domain = item.pop('domain', None)
            title = item.get('title')
            
            if not domain or not title:
                print(f"Skipping invalid item: {item}")
                continue
                
            # Basic validation to prevent SQL injection on table name
            valid_domains = ["certifications", "build_ideas", "acquisitions", "goals", "ventures", "writing", "skills", "experiences"]
            if domain not in valid_domains:
                print(f"Skipping item with invalid domain '{domain}': {title}")
                continue
                
            # Set default status if missing
            if 'status' not in item:
                item['status'] = 'not_started'
                
            columns = list(item.keys())
            placeholders = ", ".join(["?"] * len(columns))
            col_names = ", ".join(columns)
            values = tuple(item[col] for col in columns)
            
            query = f"INSERT OR IGNORE INTO {domain} ({col_names}) VALUES ({placeholders})"
            cursor.execute(query, values)
            inserted_count += 1
            
        conn.commit()
        print(f"Successfully imported {inserted_count} items into the Mainframe!")
    except Exception as e:
        print(f"Error during import: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    main()
