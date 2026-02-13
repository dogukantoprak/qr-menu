$ErrorActionPreference = "Stop"
$exe = "cloudflared.exe"
$url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"

if (-not (Test-Path $exe)) {
    Write-Host "Downloading Cloudflare Tunnel..."
    Invoke-WebRequest -Uri $url -OutFile $exe
}

Write-Host "Starting Tunnel on Port 5173..."
# Start process and redirect output to a file we can read
$p = Start-Process -FilePath ".\$exe" -ArgumentList "tunnel --url http://localhost:5173" -RedirectStandardOutput "tunnel_log.txt" -RedirectStandardError "tunnel_err.txt" -PassThru
Write-Host "Tunnel started with PID $($p.Id). Monitoring logs..."
Start-Sleep -Seconds 5
Get-Content "tunnel_err.txt" -Wait -Tail 10 | ForEach-Object {
    if ($_ -match "trycloudflare.com") {
        Write-Host "FOUND URL: $_"
        $folder = "c:\Users\doguk\.gemini\antigravity\brain\f4f1e829-59e1-4457-bbf9-d385a74077d6"
        $file = Join-Path $folder "TUNNEL_URL.txt"
        $_ | Out-File -FilePath $file -Encoding utf8 -Force
    }
}
