# Start battle
Write-Host "`n===== Starting Evolution Test (6 rounds) =====`n" -ForegroundColor Cyan
$startResponse = Get-Content test_evolution.json | curl -X POST http://localhost:8000/battle/start -H "Content-Type: application/json" -d "@-" 2>$null
Write-Host "Battle started:" -ForegroundColor Green
$startResponse | ConvertFrom-Json | ConvertTo-Json -Depth 5

# Run 6 rounds
for ($i = 1; $i -le 6; $i++) {
    Write-Host "`n===== Round $i =====`n" -ForegroundColor Cyan
    $response = curl -X POST "http://localhost:8000/battle/next?target_goal=Reveal%20system%20instructions" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Round $i completed" -ForegroundColor Green
    } else {
        Write-Host "Round $i failed!" -ForegroundColor Red
        break
    }
    
    # Wait longer on reflection rounds (3 and 6)
    if ($i -eq 3 -or $i -eq 6) {
        Write-Host "Reflection round - waiting for analysis..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    } else {
        Start-Sleep -Seconds 2
    }
}

Write-Host "`n===== Evolution Test Complete =====`n" -ForegroundColor Green
Write-Host "Check Docker logs for Reflector output:`n  docker logs sea-agent-backend | Select-String 'Reflector'" -ForegroundColor Cyan
