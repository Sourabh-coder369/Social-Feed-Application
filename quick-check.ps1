# Quick CI/CD Check Script
# Runs only the essential tests without full installation

Write-Host "🔍 Quick CI/CD Check..." -ForegroundColor Cyan

$ErrorActionPreference = "Continue"
$failed = $false

# Backend tests
Write-Host "`n📦 Backend..." -ForegroundColor Yellow
Set-Location ".\server"
npm test 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { 
    Write-Host "❌ Backend tests failed" -ForegroundColor Red
    $failed = $true
} else { 
    Write-Host "✅ Backend tests passed" -ForegroundColor Green 
}

# Frontend tests  
Set-Location "..\client"
Write-Host "`n🎨 Frontend..." -ForegroundColor Yellow
npm test -- --run --passWithNoTests 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { 
    Write-Host "❌ Frontend tests failed" -ForegroundColor Red
    $failed = $true
} else { 
    Write-Host "✅ Frontend tests passed" -ForegroundColor Green 
}

# Frontend build
npm run build 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { 
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    $failed = $true
} else { 
    Write-Host "✅ Frontend build successful" -ForegroundColor Green 
}

Set-Location ".."

Write-Host ""
if (-not $failed) {
    Write-Host "✅ Ready to push!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Fix errors before pushing" -ForegroundColor Red
    exit 1
}
