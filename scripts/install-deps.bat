@echo off
REM WanderIA - Instala dependencias incluyendo better-sqlite3
echo.
echo ========================================
echo   WanderIA - Instalacion de dependencias
echo ========================================
echo.

cd /d "%~dp0.."

REM Verificar pnpm
where pnpm >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] pnpm no encontrado. Instalando...
    npm install -g pnpm
)

echo Instalando dependencias del proyecto...
pnpm install

echo.
echo Instalando better-sqlite3 para persistencia de BD...
npm add better-sqlite3
npm add -D @types/better-sqlite3

echo.
echo Configurando variables de entorno...
if not exist ".env.local" (
    copy .env.example .env.local
    echo [OK] .env.local creado desde .env.example
    echo.
    echo IMPORTANTE: Edita .env.local y cambia JWT_SECRET por una clave segura
) else (
    echo [INFO] .env.local ya existe
)

echo.
echo ========================================
echo   Instalacion completada
echo ========================================
echo.
echo Proximos pasos:
echo 1. Editar .env.local y configurar JWT_SECRET
echo 2. Ejecutar: scripts\init_database.bat (o python scripts\init_database.py)
echo 3. Ejecutar: scripts\setup-ollama.bat
echo 4. Iniciar app: pnpm dev
echo.
pause
