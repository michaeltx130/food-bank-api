@echo off
REM Script para iniciar todos los nodos del sistema distribuido
REM Requiere: Node.js, npm

echo.
echo - Iniciando
echo - 4 Bancos de Alimentos
echo.

REM Verificar si Node.js esta instalado
where node >nul 2>nul
if errorlevel 1 (
    echo Node.js no esta instalado o no esta en el PATH
    pause
    exit /b 1
)

REM Iniciar cada nodo en una ventana separada
echo Iniciando Comondu (puerto 3001)...
start "Comondu" cmd /k "cd /d %~dp0 && node --require dotenv/config index.js dotenv_config_path=nodes/comondu.env"
timeout /t 1 >nul

echo Iniciando La Paz (puerto 3002)...
start "La Paz" cmd /k "cd /d %~dp0 && node --require dotenv/config index.js dotenv_config_path=nodes/lapaz.env"
timeout /t 1 >nul

echo Iniciando Loreto (puerto 3003)...
start "Loreto" cmd /k "cd /d %~dp0 && node --require dotenv/config index.js dotenv_config_path=nodes/loreto.env"
timeout /t 1 >nul

echo Iniciando Mulege (puerto 3004)...
start "Mulege" cmd /k "cd /d %~dp0 && node --require dotenv/config index.js dotenv_config_path=nodes/mulege.env"
timeout /t 1 >nul

echo.
echo Todos los bancos se estan iniciando...
echo.
echo URLs disponibles:
echo   - Comondu: http://localhost:3001/status
echo   - La Paz:  http://localhost:3002/status
echo   - Loreto:  http://localhost:3003/status
echo   - Mulege:  http://localhost:3004/status
echo.
echo Ver estado de todos: http://localhost:3001/api/nodos/estado
echo.
pause
