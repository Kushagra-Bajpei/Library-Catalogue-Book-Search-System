@echo off
:: =============================================================
::  LibraryOS — Windows Setup & Run Script
::  Installs dependencies, builds C++ backend,
::  and launches both frontend + backend servers.
::  Usage: Double click setup-windows.bat or run from Command Prompt.
:: =============================================================

echo ================================================
echo  Library Catalogue & AVL Search System
echo  Windows Setup & Run Script
echo ================================================

:: Check for CMake
where cmake >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] cmake not found. Please install CMake and add it to your PATH.
    pause
    exit /b 1
)

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] node not found. Please install Node.js and add it to your PATH.
    pause
    exit /b 1
)

:: Check for Compiler
where g++ >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] GNU C++ compiler (g++) not found. Please install MinGW and add it to your PATH.
    pause
    exit /b 1
)

echo.
echo [1/3] Building C++ Backend...
if not exist "backend\build" mkdir "backend\build"
cd backend\build

:: Clear build artifacts and compile
cmake .. -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE=Release
cmake --build .
if %errorlevel% neq 0 (
    echo [ERROR] Backend build failed.
    cd ..\..
    pause
    exit /b 1
)
echo [OK] Backend build compiled successfully.
cd ..\..

echo.
echo [2/3] Setting Up React Frontend...
cd frontend
if not exist "node_modules" (
    echo Running npm install...
    call npm install
) else (
    echo node_modules already ready.
)
cd ..

echo.
echo [3/3] Launching Servers...
echo Starting C++ Backend...
start "Library C++ Backend" cmd /c "cd backend && build\library_server.exe"

timeout /t 2 /nobreak >nul

echo Starting React Frontend...
start "Vite React Frontend" cmd /c "cd frontend && npm run dev"

echo.
echo ============================================================
echo   🚀  LibraryOS is RUNNING!
echo   Frontend  -^>  http://localhost:5173
echo   Backend   -^>  http://localhost:8080
echo ============================================================
echo Press any key to stop and exit.
pause

taskkill /FI "WINDOWTITLE eq Library C++ Backend*" /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq Vite React Frontend*" /F >nul 2>nul
echo Servers closed.
