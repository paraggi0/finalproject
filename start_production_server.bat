@echo off
title PT. Topline Evergreen Manufacturing - Server Startup
echo ==========================================
echo PT. Topline Evergreen Manufacturing
echo Production Server - IP: 192.168.1.184:3001
echo ==========================================
echo.

echo [1] Checking XAMPP MySQL Status...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe" >NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ MySQL is running
) else (
    echo ❌ MySQL not running - Please start XAMPP MySQL first
    pause
    exit /b 1
)

echo.
echo [2] Starting Backend Server...
cd /d "c:\Users\SOLIT\finalproject\backend"

echo [3] Current IP Configuration:
ipconfig | findstr "IPv4"

echo.
echo [4] Starting Node.js Server...
echo Server will be available at:
echo   - Local: http://localhost:3001
echo   - Network: http://192.168.1.184:3001
echo   - Android: http://192.168.1.184:3001/api/android
echo   - Website: http://192.168.1.184:3001/api/website
echo.

node server.js

pause
