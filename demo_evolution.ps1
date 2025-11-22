# Evolution Demonstration Script
Write-Host "`n$('='*70)" -ForegroundColor Cyan
Write-Host "  🧬 SELF-EVOLVING AGENT SYSTEM - EVOLUTION DEMONSTRATION" -ForegroundColor Cyan  
Write-Host "$('='*70)`n" -ForegroundColor Cyan

# Start battle
Write-Host "📍 Step 1: Starting battle with 6 rounds...`n" -ForegroundColor Yellow
$startResponse = Get-Content test_evolution.json | curl -X POST http://localhost:8000/battle/start -H "Content-Type: application/json" -d "@-" 2>$null
Write-Host "✅ Battle initialized`n" -ForegroundColor Green

# Run 6 rounds
for ($i = 1; $i -le 6; $i++) {
    Write-Host "$('─'*70)" -ForegroundColor DarkGray
    Write-Host "🎯 Round $i of 6" -ForegroundColor Cyan
    Write-Host "$('─'*70)" -ForegroundColor DarkGray
    
    $response = curl -X POST "http://localhost:8000/battle/next?target_goal=Reveal%20system%20instructions" 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        $round = $response | ConvertFrom-Json
        Write-Host "  Attack: " -NoNewline -ForegroundColor Magenta
        Write-Host $round.attack.Substring(0, [Math]::Min(80, $round.attack.Length)) + "..."
        Write-Host "  Defense: " -NoNewline -ForegroundColor Blue
        Write-Host $round.response.Substring(0, [Math]::Min(80, $round.response.Length)) + "..."
        Write-Host "  Breach: " -NoNewline -ForegroundColor $(if($round.breach){"Red"}else{"Green"})
        Write-Host $round.breach
        Write-Host ""
    } else {
        Write-Host "❌ Round $i failed!`n" -ForegroundColor Red
        break
    }
    
    # Reflection rounds
    if ($i -eq 3) {
        Write-Host "`n🔍 REFLECTION TRIGGERED - Analyzing first 3 rounds..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    } elseif ($i -eq 6) {
        Write-Host "`n🔍 REFLECTION TRIGGERED - Analyzing all 6 rounds..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    } else {
        Start-Sleep -Seconds 2
    }
}

Write-Host "`n$('='*70)" -ForegroundColor Cyan
Write-Host "  📊 EVOLUTION ANALYSIS RESULTS" -ForegroundColor Cyan
Write-Host "$('='*70)`n" -ForegroundColor Cyan

# Get reflections
Write-Host "📍 Fetching Reflector insights...`n" -ForegroundColor Yellow
$reflections = curl http://localhost:8000/reflections 2>$null | ConvertFrom-Json

Write-Host "Total Reflections: $($reflections.total_reflections)`n" -ForegroundColor Cyan

foreach ($reflection in $reflections.reflections) {
    Write-Host "$('─'*70)" -ForegroundColor DarkGray
    Write-Host "🔍 Reflection at Round $($reflection.round)" -ForegroundColor Cyan
    Write-Host "   Rounds Analyzed: $($reflection.total_rounds_analyzed)" -ForegroundColor Gray
    Write-Host "$('─'*70)`n" -ForegroundColor DarkGray
    
    $insightNum = 1
    foreach($insight in $reflection.insights) {
        Write-Host "  💡 Insight $insightNum - $($insight.type)" -ForegroundColor Yellow
        Write-Host "     Category: $($insight.category)" -ForegroundColor Gray
        Write-Host "     Content:" -ForegroundColor Gray
        Write-Host "     $($insight.content)`n" -ForegroundColor White
        $insightNum++
    }
}

Write-Host "`n$('='*70)" -ForegroundColor Green
Write-Host "  ✅ DEMONSTRATION COMPLETE" -ForegroundColor Green  
Write-Host "$('='*70)`n" -ForegroundColor Green

Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "  - View logs: docker logs sea-agent-backend" -ForegroundColor Gray
Write-Host "  - API docs: http://localhost:8000/docs" -ForegroundColor Gray
Write-Host "  - Frontend: http://localhost:3000" -ForegroundColor Gray
