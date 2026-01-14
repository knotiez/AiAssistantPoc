$port = 3000
$tcp = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($tcp) {
    Write-Host "Binding port $port is currently in use. Killing process..." -ForegroundColor Yellow
    $pid_to_kill = $tcp.OwningProcess
    Stop-Process -Id $pid_to_kill -Force
    Write-Host "Process $pid_to_kill killed." -ForegroundColor Green
} else {
    Write-Host "Port $port is free." -ForegroundColor Green
}

Write-Host "Starting Spring Boot application..." -ForegroundColor Cyan
./gradlew.bat bootRun
