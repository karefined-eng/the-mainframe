import sqlite3
import os

db = os.path.join(os.getenv('APPDATA'), 'com.kwadw.the-mainframe', 'mainframe.db')
if not os.path.exists(db):
    print("Database not found")
    exit(1)

conn = sqlite3.connect(db)
c = conn.cursor()
try:
    c.execute("SELECT title, estimated_cost, priority, category FROM acquisitions")
    print('Title | Cost | Priority | Category')
    print('-'*50)
    for r in c.fetchall():
        print(f"{r[0]} | {r[1]} | {r[2]} | {r[3]}")
except Exception as e:
    print(f"Error reading acquisitions: {e}")
