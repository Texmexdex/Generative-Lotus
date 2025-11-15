@echo off
echo ========================================
echo   SVG Generative Art Tool (Node.js)
echo ========================================
echo.
echo Starting local server with Node.js...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    echo Alternatively, use start.bat which uses Python
    echo.
    pause
    exit /b 1
)

REM Check if http-server is installed globally
where http-server >nul 2>&1
if %errorlevel% neq 0 (
    echo http-server not found. Installing globally...
    echo.
    npm install -g http-server
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: Failed to install http-server
        echo Please run: npm install -g http-server
        echo.
        pause
        exit /b 1
    )
)

set PORT=8000

echo Server will start on http://localhost:%PORT%
echo.
echo Opening browser in 2 seconds...
echo Press Ctrl+C to stop the server
echo.

REM Wait 2 seconds then open browser
timeout /t 2 /nobreak >nul
start http://localhost:%PORT%

REM Start http-server
echo.
echo Server is running...
echo.
http-server -p %PORT% -c-1

REM If server stops, pause to show any error messages
pause
