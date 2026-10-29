@echo off
title Local MongoDB Server (:27017)
echo ========================================================
echo   Starting Local MongoDB Server on Port 27017
echo ========================================================
echo.

if not exist "%LOCALAPPDATA%\mongodb\auth_lab_db" mkdir "%LOCALAPPDATA%\mongodb\auth_lab_db"
"%USERPROFILE%\.cache\mongodb-binaries\mongod-x64-win32-6.0.14.exe" --dbpath "%LOCALAPPDATA%\mongodb\auth_lab_db" --port 27017 --bind_ip 127.0.0.1
