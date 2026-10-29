@echo off
title Run Automated Authentication Test Suite
echo ========================================================
echo   Running Automated Backend Authentication Test Suite
echo ========================================================
echo.

set PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%
cd /d "%~dp0server"
call npm test

echo.
echo ========================================================
echo   Testing Complete. Press any key to exit.
echo ========================================================
pause
