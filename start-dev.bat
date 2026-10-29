@echo off
title User Authentication Lab - Development Launcher
echo ========================================================
echo   Launching User Authentication Full-Stack Lab Project
echo ========================================================
echo.

set PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%

:: 1. Check and Start MongoDB Server if not already listening on port 27017
netstat -ano | findstr :27017 | findstr LISTENING >nul
if %errorlevel% neq 0 (
    echo [1/3] Starting Local MongoDB on port 27017...
    if not exist "%LOCALAPPDATA%\mongodb\auth_lab_db" mkdir "%LOCALAPPDATA%\mongodb\auth_lab_db"
    start "MongoDB Database (:27017)" cmd /k ""%USERPROFILE%\.cache\mongodb-binaries\mongod-x64-win32-6.0.14.exe" --dbpath "%LOCALAPPDATA%\mongodb\auth_lab_db" --port 27017 --bind_ip 127.0.0.1"
    timeout /t 3 /nobreak >nul
) else (
    echo [1/3] MongoDB Database is already running on port 27017.
)

:: 2. Start Express.js Backend Server
echo [2/3] Starting Express.js Backend Server on Port 5000...
start "Express Backend (:5000)" cmd /k "set PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH% && cd /d "%~dp0server" && npm run dev"

timeout /t 3 /nobreak >nul

:: 3. Start React + Vite Frontend Server
echo [3/3] Starting React + Vite Frontend Server on Port 5173...
start "React Frontend (:5173)" cmd /k "set PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH% && cd /d "%~dp0client" && npm run dev"

echo.
echo ========================================================
echo   All 3 services launched successfully!
echo   - Database: mongodb://127.0.0.1:27017/auth_lab_db
echo   - Backend:  http://localhost:5000 (Health: /api/health)
echo   - Frontend: http://localhost:5173
echo ========================================================
timeout /t 5
