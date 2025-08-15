@echo off
echo ===================================================
echo    PT. Topline Evergreen Manufacturing
echo    Production System Startup
echo ===================================================
echo.

echo [1/3] Starting Backend Server...
cd backend
start "Backend Server" cmd /k "echo Backend Server Starting... && node server.js"

echo [2/3] Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

echo [3/3] Opening Frontend...
cd ..\frontend
start "Frontend" http://localhost:3001

echo.
echo ===================================================
echo    System Started Successfully!
echo ===================================================
echo Backend Server: http://localhost:3001
echo Android API: http://localhost:3001/api/android
echo Frontend: http://localhost:3001
echo.
echo Credentials:
echo - production01 / admin123
echo - qc01 / admin123  
echo - wh01 / admin123
echo ===================================================

pause
