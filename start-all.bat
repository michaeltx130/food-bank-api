@echo off
REM Script para iniciar todos los nodos del sistema distribuido
REM Requiere: Node.js, npm

echo.
echo - Iniciando
echo - 4 Bancos de Alimentos
echo.

REM Verificar si Node.js está instalado
where node >nul 2>nul
if errorlevel 1 (
    echo  Node.js no está instalado o no está en el PATH
    pause
    exit /b 1
)

REM Iniciar cada nodo en una ventana separada
echo  Iniciando Comondu (puerto 3001)...
start "Comondu" cmd /k "cd /d %~dp0 && set DOTENV_PATH=nodes/comondu.env && node --require dotenv/config index.js"
timeout /t 1 >nul

echo  Iniciando Loreto (puerto 3002)...
start "Loreto" cmd /k "cd /d %~dp0 && set DOTENV_PATH=nodes/loreto.env && node --require dotenv/config index.js"
timeout /t 1 >nul

echo  Iniciando La Paz (puerto 3003)...
start "La Paz" cmd /k "cd /d %~dp0 && set DOTENV_PATH=nodes/lapaz.env && node --require dotenv/config index.js"
timeout /t 1 >nul

echo  Iniciando Mulege (puerto 3004)...
start "Mulege" cmd /k "cd /d %~dp0 && set DOTENV_PATH=nodes/mulege.env && node --require dotenv/config index.js"
timeout /t 1 >nul

echo.
echo  Todos los bancos se están iniciando...
echo.
echo URLs disponibles:
echo   • Comondu:  http://localhost:3001/status
echo   • Loreto:   http://localhost:3002/status
echo   • La Paz:   http://localhost:3003/status
echo   • Mulege:   http://localhost:3004/status
echo.
echo  --- Ver estado de todos: http://localhost:3001/api/nodos/estado
echo.
pause
