@echo off
echo ============================================
echo   DATUMAUTO BIM COMMAND CENTER
echo ============================================
echo.
echo Starting DatumAuto BIM Command Center...
echo.

:: Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if server directory exists
if not exist "server" (
    echo Creating server directory...
    mkdir server
)

:: Check if index.js exists
if not exist "server\index.js" (
    echo Creating server files...
    echo Please wait...
    
    :: Create the server file from above
    echo // Server content will be created
)

:: Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install --no-audit --no-fund
)

:: Create directories
if not exist "data" mkdir data
if not exist "public\uploads" mkdir public\uploads
if not exist "logs" mkdir logs

:: Start server
echo.
echo Starting server at http://localhost:3000
echo.
echo Login with:
echo Email: director@datumauto.com
echo Password: admin123
echo.
echo Press Ctrl+C to stop the server
echo.

node server/index.js
pause