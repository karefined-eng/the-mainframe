import re
import os
import sqlite3

def parse_and_import():
    file_path = r"c:\Users\kwadw\Downloads\KWDW BACKUP\OneDrive\Documents\Desktop\SCRIBBLES\ACTIVELY RUNNNING ONLINE COURSE CER.md"
    db_path = os.path.join(os.getenv('APPDATA'), 'com.kwadw.the-mainframe', 'mainframe.db')
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Split by double newlines to get logical blocks
    blocks = content.split('\n\n')
    
    courses_to_insert = []
    
    for block in blocks:
        block = block.strip()
        if not block or block == "ACTIVELY RUNNNING ONLINE COURSE CERTIFICATIONS":
            continue
            
        # Try to extract URL and Title
        url_match = re.search(r'\[(https?://[^\]]+)\]', block)
        url = url_match.group(1) if url_match else None
        
        # Remove the URL part to get the title
        title = block
        if url_match:
            title = title.replace(url_match.group(0), "")
            
        # Clean up title (remove trailing slashes, backslashes, extra spaces)
        title = title.replace('\\', '').strip()
        if not title and url:
            title = "Unknown Course" # Fallback if no title but url exists
            
        if title:
            # We'll try to extract the platform from the title or URL
            platform = ""
            lower_title = title.lower()
            if "ibm" in lower_title: platform = "IBM SkillsBuild"
            elif "coursera" in lower_title: platform = "Coursera"
            elif "google" in lower_title: platform = "Google Skillshop"
            elif "uopeople" in lower_title: platform = "University of the People"
            elif "anthropic" in lower_title: platform = "Anthropic Skill Jar"
            elif "alison" in lower_title: platform = "Alison"
            elif "kaggle" in lower_title: platform = "Kaggle"
            elif "hp life" in lower_title: platform = "HP Life"
            elif "edx" in lower_title: platform = "Edx"
            elif "deeplearning.ai" in str(url): platform = "DeepLearning.AI"
            
            courses_to_insert.append({
                'title': title,
                'platform': platform,
                'url': url,
                'status': 'in_progress', # Since the file says ACTIVELY RUNNING
                'raw_import_text': block
            })

    # Insert into database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    inserted = 0
    skipped = 0
    
    try:
        for course in courses_to_insert:
            try:
                cursor.execute('''
                    INSERT OR IGNORE INTO courses 
                    (title, platform, url, status, raw_import_text) 
                    VALUES (?, ?, ?, ?, ?)
                ''', (course['title'], course['platform'], course['url'], course['status'], course['raw_import_text']))
                
                if cursor.rowcount > 0:
                    inserted += 1
                else:
                    skipped += 1
            except Exception as e:
                print(f"Error inserting {course['title']}: {e}")
                
        conn.commit()
        print(f"Successfully imported {inserted} courses (skipped {skipped} duplicates).")
    finally:
        conn.close()

if __name__ == "__main__":
    parse_and_import()
