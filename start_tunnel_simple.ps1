$ErrorActionPreference = "Stop"
$exe = "cloudflared.exe"
$url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"

if (-not (Test-Path $exe)) {
    Write-Host "Downloading Cloudflare Tunnel..."
    Invoke-WebRequest -Uri $url -OutFile $exe
}

Write-Host "`n=== Starting Cloudflare Tunnel on Port 5173 ===`n" -ForegroundColor Cyan
Write-Host "Frontend must be running on localhost:5173" -ForegroundColor Yellow
Write-Host "Initializing tunnel...`n" -ForegroundColor Gray

& ".\$exe" tunnel --url http://localhost:5173
