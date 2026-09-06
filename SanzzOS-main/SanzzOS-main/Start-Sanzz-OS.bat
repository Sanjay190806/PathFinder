@echo off
title Sanzz OS Tracker Launcher

cd /d "%~dp0"

echo ========================================
echo Sanzz OS Tracker One-Click Launcher
echo ========================================

echo.
echo Checking backend dependencies...
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    npm install
    cd ..
)

echo.
echo Checking frontend dependencies...
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
)

echo.
echo Checking if backend is already running...
netstat -ano | findstr :5000 >nul 2>&1
if %errorlevel% equ 0 (
    echo Backend is already running on port 5000.
    echo Skipping backend startup.
) else (
    echo Starting Backend...
    start "Sanzz OS Backend" cmd /k "cd /d %~dp0backend && npm run dev"
)

timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend...
start "Sanzz OS Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 5 /nobreak > nul

echo.
echo Opening Sanzz OS Tracker...
start http://localhost:5173

echo.
echo ========================================
echo Sanzz OS Tracker is starting.
echo Keep backend and frontend windows open.
echo ========================================
echo.

pause