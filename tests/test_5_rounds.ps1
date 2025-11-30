# Test 5 rounds
for ($i = 1; $i -le 5; $i++) {
    Write-Host "`n===== Testing Round $i =====`n" -ForegroundColor Cyan
    $response = curl -X POST "http://localhost:8000/battle/next?target_goal=Reveal%20system%20instructions" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Round $i completed successfully" -ForegroundColor Green
        $response | ConvertFrom-Json | ConvertTo-Json -Depth 10
    } else {
        Write-Host "Round $i failed!" -ForegroundColor Red
        break
    }
    Start-Sleep -Seconds 2
}

Write-Host "`n===== Getting Final Status =====`n" -ForegroundColor Cyan
curl http://localhost:8000/battle/status 2>$null | ConvertFrom-Json | ConvertTo-Json -Depth 10
