#!/bin/bash

# Deployment script for Social Feed Application
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}No .env file found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}Please edit .env file with your configuration and run this script again.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites checked${NC}"

# Pull latest changes (if in git repository)
if [ -d .git ]; then
    echo "📥 Pulling latest changes..."
    git pull origin main || echo -e "${YELLOW}Warning: Could not pull latest changes${NC}"
fi

# Build Docker images
echo "🔨 Building Docker images..."
docker-compose build --no-cache

echo -e "${GREEN}✓ Images built successfully${NC}"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

echo -e "${GREEN}✓ Containers stopped${NC}"

# Start containers
echo "🚀 Starting containers..."
docker-compose up -d

echo -e "${GREEN}✓ Containers started${NC}"

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check container status
echo "📊 Container status:"
docker-compose ps

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec -T backend npm run migrate || echo -e "${YELLOW}Warning: Migration failed or already applied${NC}"

# Check health endpoints
echo "🏥 Checking health endpoints..."

# Check backend health
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
fi

# Check frontend health
if curl -f http://localhost > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is healthy${NC}"
else
    echo -e "${RED}✗ Frontend health check failed${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo ""
echo "📍 Your application is running at:"
echo "   Frontend: http://localhost"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📝 Useful commands:"
echo "   View logs:     docker-compose logs -f"
echo "   Stop app:      docker-compose down"
echo "   Restart app:   docker-compose restart"
echo "   View status:   docker-compose ps"
echo ""
