@echo off
echo ============================================
echo   DATUMAUTO BIM COMMAND CENTER
echo ============================================
echo.
echo Starting DatumAuto BIM Command Center...
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if required files exist
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

:: Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
)

:: Create required directories
if not exist "data" mkdir data
if not exist "public\uploads" mkdir public\uploads
if not exist "logs" mkdir logs

:: Check for .env file
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit .env file and add your DeepSeek API key!
    echo.
)

:: Start the server
echo Starting server...
echo.
echo Server will be available at: http://localhost:3000
echo WebSocket: ws://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

node server/index.js

pause