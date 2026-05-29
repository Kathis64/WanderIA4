@echo off
REM WanderIA - Script de inicio completo para Windows
echo.
echo ========================================
echo   WanderIA - Iniciando aplicacion
echo ========================================
echo.

cd /d "%~dp0.."

REM Verificar .env.local
if not exist ".env.local" (
    echo [AVISO] .env.local no existe. Creando desde .env.example...
    copy .env.example .env.local
    echo [OK] .env.local creado. Recuerda configurar JWT_SECRET.
    echo.
)

REM Verificar node_modules
if not exist "node_modules" (
    echo [INFO] Instalando dependencias...
    npm install
    npm add better-sqlite3
    npm add -D @types/better-sqlite3
)

REM Crear carpeta data si no existe
if not exist "data" (
    mkdir data
    echo [OK] Carpeta data/ creada.
)

REM Verificar Ollama en segundo plano
echo Verificando Ollama...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Iniciando Ollama en segundo plano...
    start /b "" ollama serve
    timeout /t 3 /nobreak >nul
    echo [OK] Ollama iniciado.
) else (
    echo [OK] Ollama ya esta corriendo.
)

echo.
echo Iniciando WanderIA en http://localhost:3000
echo Presiona Ctrl+C para detener
echo.
pnpm dev
