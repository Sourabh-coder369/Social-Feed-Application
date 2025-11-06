# Deployment script for Windows (PowerShell)

Write-Host "🚀 Starting deployment process..." -ForegroundColor Green

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "No .env file found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "Please edit .env file with your configuration and run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Prerequisites checked" -ForegroundColor Green

# Pull latest changes (if in git repository)
if (Test-Path .git) {
    Write-Host "📥 Pulling latest changes..." -ForegroundColor Cyan
    try {
        git pull origin main
    } catch {
        Write-Host "Warning: Could not pull latest changes" -ForegroundColor Yellow
    }
}

# Build Docker images
Write-Host "🔨 Building Docker images..." -ForegroundColor Cyan
docker-compose build --no-cache

Write-Host "✓ Images built successfully" -ForegroundColor Green

# Stop existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Cyan
docker-compose down

Write-Host "✓ Containers stopped" -ForegroundColor Green

# Start containers
Write-Host "🚀 Starting containers..." -ForegroundColor Cyan
docker-compose up -d

Write-Host "✓ Containers started" -ForegroundColor Green

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Check container status
Write-Host "📊 Container status:" -ForegroundColor Cyan
docker-compose ps

# Run database migrations
Write-Host "🗄️  Running database migrations..." -ForegroundColor Cyan
try {
    docker-compose exec -T backend npm run migrate
} catch {
    Write-Host "Warning: Migration failed or already applied" -ForegroundColor Yellow
}

# Check health endpoints
Write-Host "🏥 Checking health endpoints..." -ForegroundColor Cyan

try {
    $backend = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 5
    if ($backend.StatusCode -eq 200) {
        Write-Host "✓ Backend is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Backend health check failed" -ForegroundColor Red
}

try {
    $frontend = Invoke-WebRequest -Uri "http://localhost" -UseBasicParsing -TimeoutSec 5
    if ($frontend.StatusCode -eq 200) {
        Write-Host "✓ Frontend is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Frontend health check failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Your application is running at:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost"
Write-Host "   Backend:  http://localhost:5000"
Write-Host ""
Write-Host "📝 Useful commands:" -ForegroundColor Cyan
Write-Host "   View logs:     docker-compose logs -f"
Write-Host "   Stop app:      docker-compose down"
Write-Host "   Restart app:   docker-compose restart"
Write-Host "   View status:   docker-compose ps"
Write-Host ""
