@echo off
title SERIALOS Modern Studio
echo ======================================================
echo    SERIALOS - The Modern Melodrama Operating System
echo ======================================================
echo.

set "NODE_CMD="

:: 1. Check if global node is installed
where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    set "NODE_CMD=node"
)

:: 2. Check for agy-node in Antigravity AppData
if not defined NODE_CMD (
    if exist "%APPDATA%\Antigravity\bin\agy-node.cmd" (
        set "NODE_CMD=%APPDATA%\Antigravity\bin\agy-node.cmd"
    )
)

:: 3. Check for Antigravity electron node
if not defined NODE_CMD (
    if exist "%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe" (
        set ELECTRON_RUN_AS_NODE=1
        set "NODE_CMD=%LOCALAPPDATA%\Programs\antigravity\Antigravity.exe"
    )
)

if not defined NODE_CMD (
    echo [ERROR] Node.js was not detected on your system.
    echo Please install Node.js from https://nodejs.org or open dist\index.html directly.
    pause
    exit /b 1
)

echo Starting SERIALOS on http://localhost:5173 ...
call %NODE_CMD% serve.js
pause

