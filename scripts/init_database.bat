@echo off
REM WanderIA - Inicializa la base de datos SQLite
echo.
echo ========================================
echo   WanderIA - Inicializacion de BD SQLite
echo ========================================
echo.

cd /d "%~dp0.."

REM Intentar con Python primero
where python >nul 2>&1
if %errorlevel% equ 0 (
    echo Usando Python para inicializar la BD...
    python scripts\init_database.py
    goto :end
)

where python3 >nul 2>&1
if %errorlevel% equ 0 (
    echo Usando Python3 para inicializar la BD...
    python3 scripts\init_database.py
    goto :end
)

REM Fallback: Node.js
echo Python no encontrado. Usando Node.js...
node -e "
const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
console.log('[OK] Carpeta data/ creada.');
console.log('[INFO] La BD SQLite se creara automaticamente al iniciar la app.');
"

:end
echo.
pause
