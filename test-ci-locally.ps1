# Local CI/CD Pipeline Test Script
# This script mimics what GitHub Actions will do

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LOCAL CI/CD PIPELINE TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$testsPassed = $true

function Write-Section {
    param($title)
    Write-Host ""
    Write-Host ">>> $title" -ForegroundColor Yellow
    Write-Host ""
}

function Handle-Error {
    param($message)
    Write-Host "ERROR: $message" -ForegroundColor Red
    $global:testsPassed = $false
}

try {
    Write-Section "1. BACKEND CI/CD PIPELINE"
    
    Set-Location ".\server"
    
    Write-Host "Checking backend dependencies..." -ForegroundColor Cyan
    if (-Not (Test-Path "node_modules")) {
        Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Handle-Error "Backend dependency installation failed"
            throw "Backend npm install failed"
        }
    } else {
        Write-Host "Backend dependencies already installed" -ForegroundColor Green
    }
    
    Write-Section "1.1 Environment Configuration"
    if (Test-Path ".env") {
        Write-Host "env file exists" -ForegroundColor Green
    } else {
        Write-Host "env file not found (will use defaults)" -ForegroundColor Yellow
    }
    
    Write-Section "1.2 Database Migrations"
    Write-Host "Running database migrations..." -ForegroundColor Cyan
    npm run migrate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Migrations failed or already applied" -ForegroundColor Yellow
    } else {
        Write-Host "Database migrations completed" -ForegroundColor Green
    }
    
    Write-Section "1.3 Backend Tests"
    Write-Host "Running backend tests..." -ForegroundColor Cyan
    npm test
    if ($LASTEXITCODE -ne 0) {
        Handle-Error "Backend tests failed"
    } else {
        Write-Host "All backend tests passed" -ForegroundColor Green
    }
    
    Write-Section "1.4 Backend Syntax Check"
    Write-Host "Checking for syntax errors..." -ForegroundColor Cyan
    node -c src/app.js
    if ($LASTEXITCODE -ne 0) {
        Handle-Error "Backend syntax check failed"
    } else {
        Write-Host "No syntax errors found" -ForegroundColor Green
    }
    
    Set-Location ".."
    
    Write-Section "2. FRONTEND CI/CD PIPELINE"
    
    Set-Location ".\client"
    
    Write-Host "Checking frontend dependencies..." -ForegroundColor Cyan
    if (-Not (Test-Path "node_modules")) {
        Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Handle-Error "Frontend dependency installation failed"
            throw "Frontend npm install failed"
        }
    } else {
        Write-Host "Frontend dependencies already installed" -ForegroundColor Green
    }
    
    Write-Section "2.1 Frontend Tests"
    Write-Host "Running frontend tests..." -ForegroundColor Cyan
    npm test -- --run --passWithNoTests
    if ($LASTEXITCODE -ne 0) {
        Handle-Error "Frontend tests failed"
    } else {
        Write-Host "All frontend tests passed" -ForegroundColor Green
    }
    
    Write-Section "2.2 Frontend Build"
    Write-Host "Building frontend for production..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Handle-Error "Frontend build failed"
    } else {
        Write-Host "Frontend build successful" -ForegroundColor Green
        if (Test-Path "dist") {
            $distSize = (Get-ChildItem "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
            Write-Host "  Build size: $([math]::Round($distSize, 2)) MB" -ForegroundColor Cyan
        }
    }
    
    Set-Location ".."
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  CI/CD PIPELINE TEST COMPLETE" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    if ($testsPassed) {
        Write-Host "ALL CHECKS PASSED!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your code is ready to push to GitHub!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "  1. git add ." -ForegroundColor White
        Write-Host "  2. git commit -m 'your message'" -ForegroundColor White
        Write-Host "  3. git push origin master" -ForegroundColor White
        Write-Host ""
        exit 0
    } else {
        Write-Host "SOME CHECKS FAILED" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please fix the errors above before pushing to GitHub." -ForegroundColor Yellow
        Write-Host ""
        exit 1
    }
    
} catch {
    Write-Host ""
    Write-Host "PIPELINE TEST FAILED" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Set-Location $PSScriptRoot
    exit 1
}
