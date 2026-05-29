@echo off
REM WanderIA - Script de configuracion de Ollama para Windows
REM Este script verifica y configura Ollama con el modelo llama3.2:3b

echo.
echo ========================================
echo   WanderIA - Configuracion de Ollama
echo ========================================
echo.

REM Verificar si Ollama esta instalado
where ollama >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [INFO] Ollama no esta instalado.
    echo.
    echo Para instalar Ollama en Windows:
    echo 1. Ir a: https://ollama.ai/download/windows
    echo 2. Descargar e instalar el ejecutable
    echo 3. Reiniciar la terminal despues de la instalacion
    echo.
    echo Presiona cualquier tecla para abrir la pagina de descarga...
    pause >nul
    start https://ollama.ai/download/windows
    exit /b 1
)

echo [OK] Ollama encontrado.
echo.

REM Verificar si el servicio esta corriendo
echo Verificando estado del servicio Ollama...
curl -s http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [INFO] El servicio Ollama no esta corriendo.
    echo Iniciando servicio Ollama...
    echo.
    start /b ollama serve
    timeout /t 3 /nobreak >nul
)

echo [OK] Servicio Ollama activo.
echo.

REM Verificar si el modelo esta instalado
echo Verificando modelo llama3.2:3b...
ollama list | findstr "llama3.2:3b" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [INFO] El modelo llama3.2:3b no esta instalado.
    echo Descargando modelo (esto puede tomar varios minutos)...
    echo.
    ollama pull llama3.2:3b
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Error al descargar el modelo.
        pause
        exit /b 1
    )
)

echo.
echo [OK] Modelo llama3.2:3b listo.
echo.

REM Test rapido
echo Realizando prueba rapida del modelo...
echo.
curl -s -X POST http://localhost:11434/api/generate -d "{\"model\":\"llama3.2:3b\",\"prompt\":\"Hola\",\"stream\":false}" | findstr "response" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] El modelo responde correctamente.
) else (
    echo [ADVERTENCIA] No se pudo verificar la respuesta del modelo.
)

echo.
echo ========================================
echo   Configuracion de Ollama completada
echo ========================================
echo.
echo El servicio Ollama esta listo para usarse.
echo URL del API: http://localhost:11434
echo Modelo: llama3.2:3b
echo.
pause
