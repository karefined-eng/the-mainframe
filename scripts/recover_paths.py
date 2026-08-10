import json
import os
import re

def recover_paths():
    transcript_path = r'C:\Users\kwadw\.gemini\antigravity-ide\brain\e99e6645-1712-49fc-b7fd-809af8dafa18\.system_generated\logs\transcript.jsonl'
    
    if not os.path.exists(transcript_path):
        print(f"Could not find the previous transcript at {transcript_path}")
        return

    print("--- RECOVERED MESSAGES FROM PREVIOUS SESSION ---\n")
    
    found_paths = []
    
    with open(transcript_path, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                data = json.loads(line)
                if data.get('type') == 'USER_INPUT':
                    content = data.get('content', '')
                    # Look for anything that looks like a file path (starts with c:\)
                    paths = re.findall(r'(c:\\[^\n]+)', content, re.IGNORECASE)
                    if paths:
                        print(f"Found paths in a user message:\n{content}\n")
                        found_paths.extend(paths)
            except json.JSONDecodeError:
                continue

    if found_paths:
        print("\n--- EXTRACTED FILE PATHS ---")
        for path in set(found_paths):
            # Clean up the paths just in case there's trailing markdown formatting
            clean_path = re.sub(r'[\]\)].*$', '', path.strip())
            print(clean_path)
            
        print("\n(You can copy and paste these into your imports/import_sources.txt!)")
    else:
        print("I couldn't find any explicit file paths starting with 'c:\\' in your previous messages.")

if __name__ == "__main__":
    recover_paths()
