#!/usr/bin/env pwsh
# Script para iniciar todos los nodos del sistema distribuido

Write-Host "- Iniciando FoodBank - Sistema Distribuido" -ForegroundColor Green
Write-Host "- Bancos de Alimentos" -ForegroundColor Cyan
Write-Host ""

function Start-Node {
    param (
        [string]$bancoNombre,
        [string]$envFile,
        [int]$puerto
    )

    Write-Host "- Iniciando $bancoNombre (puerto $puerto)..." -ForegroundColor Yellow

    $command = "cd `"$PSScriptRoot`"; `$env:NODE_ENV='development'; node --require dotenv/config index.js dotenv_config_path=nodes/$envFile"
    $process = Start-Process powershell -ArgumentList "-NoExit", "-Command", $command -PassThru

    Write-Host "- $bancoNombre iniciado (PID: $($process.Id))" -ForegroundColor Green
    Start-Sleep -Milliseconds 500
}

Start-Node "Comondu" "comondu.env" 3001
Start-Node "La Paz" "lapaz.env" 3002
Start-Node "Loreto" "loreto.env" 3003
Start-Node "Mulege" "mulege.env" 3004

Write-Host ""
Write-Host "- Todos los bancos se estan iniciando..." -ForegroundColor Green
Write-Host ""
Write-Host "- URLs disponibles:" -ForegroundColor Green
Write-Host "  - Comondu: http://localhost:3001/status" -ForegroundColor White
Write-Host "  - La Paz:  http://localhost:3002/status" -ForegroundColor White
Write-Host "  - Loreto:  http://localhost:3003/status" -ForegroundColor White
Write-Host "  - Mulege:  http://localhost:3004/status" -ForegroundColor White
Write-Host ""
Write-Host "- Ver estado de todos: http://localhost:3001/api/nodos/estado" -ForegroundColor Magenta
Write-Host ""
