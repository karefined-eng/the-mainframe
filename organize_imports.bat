@echo off
cd /d "%~dp0"

echo Creating imports folder...
mkdir imports 2>nul

echo Moving root files into imports...
move import.json imports\ 2>nul
move essentials_import.json imports\ 2>nul
move obsidian_import.json imports\ 2>nul
move Share.png imports\ 2>nul

echo Copying external reference files into imports...
copy "C:\Users\kwadw\Downloads\KWDW BACKUP\Downloads\EUROPEAN MEDICAL SCHOOLS RELATED DOCUMENTS\SCRIBBLES\ESSENTIALS.txt" imports\ 2>nul
copy "C:\Users\kwadw\Downloads\KWDW BACKUP\Downloads\EUROPEAN MEDICAL SCHOOLS RELATED DOCUMENTS\SCRIBBLES\essentials.md" imports\ 2>nul
copy "C:\Users\kwadw\Downloads\KWDW BACKUP\Downloads\EUROPEAN MEDICAL SCHOOLS RELATED DOCUMENTS\SCRIBBLES\Dec 12, 2023 341 PM.txt" imports\ 2>nul

echo Done! Remember to use 'python scripts/import.py imports/your_file.json' for the new paths!
pause
