@echo off
echo Starting MySQL and Backend Server...

echo [1] Starting MySQL...
net start mysql >nul 2>&1
if %ERRORLEVEL%==0 (
    echo ✅ MySQL service started
) else (
    echo Starting MySQL via XAMPP...
    cd /d "C:\xampp\mysql\bin"
    start /B mysqld.exe --defaults-file=../my.ini --console
    timeout /t 3 >nul
)

echo [2] Starting Backend Server...
cd /d "c:\Users\SOLIT\finalproject\backend"
node server.js
