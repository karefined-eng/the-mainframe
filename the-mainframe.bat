@echo off
cd /d "%~dp0"
set PATH=%USERPROFILE%\.cargo\bin;%PATH%
title The Mainframe - dev
npm run tauri dev
echo.
echo Dev session ended. If the app window was blank, read the error above.
pause
