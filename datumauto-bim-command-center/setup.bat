@echo off
echo Setting up DatumAuto BIM Command Center...
echo.

REM Create directories
if not exist "server\routes" mkdir server\routes
if not exist "public" mkdir public
if not exist "data" mkdir data

REM Install dependencies
echo Installing dependencies...
call npm install express express-session cors

echo.
echo ✅ Setup completed!
echo.
echo To start the application:
echo 1. Run: node server/index.js
echo 2. Open: http://localhost:3000
echo 3. Login with: director@datumauto.com / admin123
echo.
pause