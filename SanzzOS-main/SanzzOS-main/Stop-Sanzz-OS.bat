@echo off
title Sanzz OS Tracker Stopper
echo ========================================
echo Stopping Sanzz OS Tracker Servers...
echo ========================================

echo.
echo Stopping local app ports 5000 and 5173 if they are running...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000"') do (
    taskkill /PID %%a /T /F 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173"') do (
    taskkill /PID %%a /T /F 2>nul
)

echo.
echo Closing Sanzz OS command windows...
taskkill /FI "WINDOWTITLE eq Sanzz OS Backend*" /T /F 2>nul
taskkill /FI "WINDOWTITLE eq Sanzz OS Frontend*" /T /F 2>nul

echo.
echo If a window remains open, close only the Sanzz OS Backend or Frontend window manually.
echo Do not kill unrelated node.exe processes unless you are fixing a Prisma DLL lock.
echo.
echo ========================================
echo Sanzz OS Tracker has been stopped.
echo ========================================
timeout /t 3 > nul
