@echo off
echo ========================================
echo   SVG Generative Art Tool
echo ========================================
echo.
echo Starting local server...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    echo.
    pause
    exit /b 1
)

REM Get the current directory
set "CURRENT_DIR=%~dp0"

REM Find an available port (default 8000)
set PORT=8000

echo Server will start on http://localhost:%PORT%
echo.
echo Opening browser in 3 seconds...
echo Press Ctrl+C to stop the server
echo.

REM Wait 3 seconds then open browser
timeout /t 3 /nobreak >nul
start http://localhost:%PORT%

REM Start Python HTTP server
echo.
echo Server is running...
echo.
python -m http.server %PORT%

REM If server stops, pause to show any error messages
pause
