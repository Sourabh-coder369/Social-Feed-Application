# Social Feed Application - Quick Start Guide

This guide will help you get the application up and running quickly.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js v16+ and npm
- MySQL 8.0+
- Git

## Step-by-Step Setup

### 1. Database Setup

First, create a MySQL database:

```sql
CREATE DATABASE socialfeed;
```

### 2. Server Setup

Open PowerShell and navigate to the server directory:

```powershell
cd server
npm install
```

Create a `.env` file by copying the example:

```powershell
Copy-Item .env.example .env
```

Edit the `.env` file with your database credentials:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=socialfeed
JWT_SECRET=your_secure_random_string_here
PORT=5000
NODE_ENV=development
```

Run the database migrations (creates tables, triggers, procedures, functions):

```powershell
npm run migrate
```

Seed the database with initial data (20+ rows per table):

```powershell
npm run seed
```

**Optional:** Generate additional test data (100+ users, many posts):

```powershell
npm run generate-seed
```

Start the server:

```powershell
npm run dev
```

The server will run on http://localhost:5000

Test the server health:
Visit http://localhost:5000/health in your browser

### 3. Client Setup

Open a new PowerShell window and navigate to the client directory:

```powershell
cd client
npm install
```

Create a `.env` file:

```powershell
Copy-Item .env.example .env
```

The default configuration should work:

```
VITE_API_URL=http://localhost:5000
```

Start the development server:

```powershell
npm run dev
```

The client will run on http://localhost:5173

### 4. Access the Application

Open your browser and go to http://localhost:5173

You can now:
1. **Register** a new account
2. **Login** with your credentials
3. **Test with seed data:** Use email `john.doe@example.com` with password `password123` (if you haven't changed the seed data password hash)

## Default Test Account

The seed data includes multiple users. To login with a seeded user, you'll need to:

1. Register a new account (recommended), or
2. Update the password hash in `server/sql/seed.sql` to match `password123` and re-run `npm run seed`

The provided hash in seed.sql is a placeholder. For actual testing:

```javascript
// Generate a proper bcrypt hash
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('password123', 10);
console.log(hash);
```

## Troubleshooting

### Server won't start
- Check that MySQL is running
- Verify database credentials in `.env`
- Ensure port 5000 is not in use

### Client won't connect to server
- Ensure server is running on port 5000
- Check VITE_API_URL in client `.env`
- Check browser console for CORS errors

### Database errors
- Run migrations again: `npm run migrate`
- Check MySQL user permissions
- Verify database name matches `.env`

### "Module not found" errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## Running Tests

### Server Tests
```powershell
cd server
npm test
```

### Client Tests
```powershell
cd client
npm test
```

## API Testing

You can test the API using tools like Postman or curl:

### Register User
```powershell
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d '{\"firstName\":\"Test\",\"lastName\":\"User\",\"email\":\"test@example.com\",\"password\":\"password123\",\"dateOfBirth\":\"1990-01-01\"}'
```

### Login
```powershell
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'
```

## Project Structure Overview

```
DBMS_MAIN_PROJECT/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── services/      # API services
│   │   └── tests/         # Component tests
│   └── package.json
├── server/                # Node.js backend
│   ├── sql/              # Database files
│   │   ├── schema.sql    # Table definitions
│   │   ├── triggers.sql  # Database triggers
│   │   ├── procedures.sql# Stored procedures
│   │   ├── functions.sql # Stored functions
│   │   └── seed.sql      # Initial data
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth & validation
│   │   ├── db/           # Database config
│   │   └── app.js        # Express app
│   ├── scripts/          # Utility scripts
│   └── tests/            # API tests
└── README.md             # Main documentation
```

## Next Steps

After setup:
1. Explore the Feed page
2. Create a post with an image URL (e.g., https://picsum.photos/800/600)
3. Like and comment on posts
4. Send friend requests
5. Check notifications
6. View user profiles

## Support

For issues:
1. Check the troubleshooting section
2. Review error logs in the terminal
3. Check browser console for client errors
4. Verify all environment variables are set

## Features Implemented

✅ User registration and authentication with JWT
✅ Create, view, and delete posts
✅ Like posts and comments (with triggers updating counts)
✅ Comment on posts with reply support
✅ Friend request system
✅ Notifications system
✅ User profiles with age calculation (stored function)
✅ Paginated feeds
✅ Top liked posts (stored procedure)
✅ Admin statistics dashboard
✅ Responsive UI with Tailwind CSS
✅ Optimistic UI updates
✅ Error handling and validation
✅ Database triggers for automatic count updates
✅ Stored procedures for complex queries
✅ Stored functions for computed values

Enjoy building with Social Feed! 🚀
