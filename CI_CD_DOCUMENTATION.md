# CI/CD Pipeline Documentation

This project includes automated CI/CD pipelines using GitHub Actions for continuous integration and deployment.

## 📋 Table of Contents

- [Overview](#overview)
- [Workflows](#workflows)
- [Setup Instructions](#setup-instructions)
- [Docker Deployment](#docker-deployment)
- [Deployment Platforms](#deployment-platforms)
- [Environment Variables](#environment-variables)

## 🎯 Overview

The CI/CD pipeline includes:
- ✅ Automated testing for frontend and backend
- ✅ Code linting and quality checks
- ✅ Security vulnerability scanning
- ✅ Build verification
- ✅ Artifact generation
- 🚀 Deployment (configurable)

## 🔄 Workflows

### 1. Backend CI/CD (`backend-ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches (server code changes)
- Pull requests to `main` or `develop` (server code changes)

**Jobs:**
1. **Test**: Runs backend tests with MySQL service
2. **Build**: Verifies backend can build successfully
3. **Deploy** (optional): Deploys to production

### 2. Frontend CI/CD (`frontend-ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches (client code changes)
- Pull requests to `main` or `develop` (client code changes)

**Jobs:**
1. **Test**: Runs frontend tests
2. **Build**: Creates production build
3. **Deploy** (optional): Deploys to hosting platform

### 3. Full Stack CI/CD (`fullstack-ci.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**Jobs:**
1. **Backend Test**: Tests backend with MySQL
2. **Frontend Test**: Tests frontend
3. **Build**: Builds both applications
4. **Security Scan**: Runs npm audit on dependencies

## 🚀 Setup Instructions

### 1. Enable GitHub Actions

1. Push your code to GitHub
2. GitHub Actions will automatically detect the workflow files in `.github/workflows/`
3. Navigate to the "Actions" tab in your repository to see workflow runs

### 2. Configure Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

#### Required for Deployment:
```
JWT_SECRET=your_production_jwt_secret
```

#### For Netlify Deployment:
```
NETLIFY_SITE_ID=your_site_id
NETLIFY_AUTH_TOKEN=your_auth_token
```

#### For Vercel Deployment:
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

#### For AWS S3 Deployment:
```
AWS_S3_BUCKET=your_bucket_name
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

### 3. Enable Deployment

Uncomment the `deploy` job in the workflow files you want to use:
- `backend-ci.yml` - for backend deployment
- `frontend-ci.yml` - for frontend deployment

## 🐳 Docker Deployment

### Local Development with Docker

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file with your values**

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

5. **Stop services:**
   ```bash
   docker-compose down
   ```

### Production Deployment with Docker

1. **Build images:**
   ```bash
   docker-compose build
   ```

2. **Start in production mode:**
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

3. **Run database migrations:**
   ```bash
   docker-compose exec backend npm run migrate
   ```

4. **Seed database (optional):**
   ```bash
   docker-compose exec mysql mysql -u root -p social_feed < /docker-entrypoint-initdb.d/seed.sql
   ```

### Docker Services

- **MySQL**: `localhost:3306`
- **Backend API**: `localhost:5000`
- **Frontend**: `localhost:80`

## 🌐 Deployment Platforms

### Option 1: Heroku

**Backend:**
```bash
# Install Heroku CLI
heroku login
heroku create your-app-name

# Add MySQL addon
heroku addons:create cleardb:ignite

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set NODE_ENV=production

# Deploy
git subtree push --prefix server heroku main
```

**Frontend:**
```bash
# Deploy to Heroku
heroku create your-frontend-app
heroku config:set VITE_API_URL=https://your-backend-app.herokuapp.com
git subtree push --prefix client heroku main
```

### Option 2: Netlify (Frontend)

1. Connect your GitHub repository
2. Set build settings:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/dist`
3. Add environment variables:
   - `VITE_API_URL`: Your backend API URL

### Option 3: Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd client
vercel --prod
```

### Option 4: Railway (Full Stack)

1. Create a new project on Railway
2. Connect your GitHub repository
3. Add MySQL database service
4. Deploy backend and frontend separately

### Option 5: DigitalOcean App Platform

1. Create a new App
2. Connect your GitHub repository
3. Configure components:
   - Backend: Node.js service
   - Frontend: Static site
   - Database: Managed MySQL
4. Set environment variables
5. Deploy

### Option 6: AWS (Full Stack)

**Backend:**
- Deploy to EC2 or Elastic Beanstalk
- Use RDS for MySQL
- Use S3 for file uploads

**Frontend:**
- Deploy to S3 + CloudFront
- Enable static website hosting

## 🔐 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
DB_HOST=your_db_host
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=social_feed
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-api.com
```

## 🧪 Testing Locally

### Run Backend Tests
```bash
cd server
npm test
```

### Run Frontend Tests
```bash
cd client
npm test
```

### Run Full Test Suite
```bash
# From root directory
npm run test:all
```

## 📊 Monitoring Deployments

### GitHub Actions
- View workflow runs in the "Actions" tab
- Check logs for each job
- Review artifacts

### Docker Health Checks
```bash
# Check container health
docker ps

# View health check logs
docker inspect --format='{{json .State.Health}}' social_feed_backend
```

## 🔧 Troubleshooting

### Workflow Fails

1. Check the workflow logs in GitHub Actions
2. Verify all secrets are correctly set
3. Ensure database migrations are up to date
4. Check for dependency conflicts

### Docker Issues

1. **Container won't start:**
   ```bash
   docker-compose logs [service_name]
   ```

2. **Database connection fails:**
   - Check if MySQL container is healthy
   - Verify environment variables
   - Wait for MySQL to fully initialize

3. **Build fails:**
   ```bash
   docker-compose build --no-cache
   ```

## 📝 Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Use environment-specific secrets** in GitHub
3. **Test locally** before pushing to production
4. **Monitor logs** after deployment
5. **Use staging environment** for testing
6. **Keep dependencies updated** regularly
7. **Review security audits** from npm audit

## 🆘 Support

If you encounter issues:
1. Check the workflow logs
2. Review the troubleshooting section
3. Verify environment variables
4. Check database connectivity
5. Review application logs

---

**Note:** Remember to customize the deployment steps based on your chosen platform and requirements.
