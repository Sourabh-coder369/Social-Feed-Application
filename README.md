# Social Feed Application

A full-stack social media feed application built with React, Node.js, Express, and MySQL.

## Features

- 🔐 JWT-based authentication with bcrypt password hashing
- 📝 Create, view, and delete posts with images/videos
- 💬 Comment on posts with nested reply support
- ❤️ Like posts and comments
- 👥 Friend request system
- 🔔 Real-time notifications
- 📊 Admin statistics dashboard
- 📱 Responsive UI with Tailwind CSS

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router v6
- Axios
- React Query (TanStack Query)

### Backend
- Node.js + Express
- Knex.js for migrations and query building
- MySQL 8.0
- JWT for authentication
- bcrypt for password hashing

## Project Structure

```
/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context (Auth)
│   │   ├── services/      # API services
│   │   └── App.jsx
│   └── tests/             # Frontend tests
├── server/                # Node.js backend
│   ├── sql/               # SQL files
│   │   ├── schema.sql     # Table definitions
│   │   ├── triggers.sql   # Database triggers
│   │   ├── procedures.sql # Stored procedures
│   │   ├── functions.sql  # Stored functions
│   │   └── seed.sql       # Seed data
│   ├── src/
│   │   ├── routes/        # Express routes
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Auth & validation middleware
│   │   ├── services/      # Business logic
│   │   ├── db/            # Database config & migrations
│   │   └── app.js         # Express app
│   ├── scripts/           # Utility scripts
│   │   └── generate_seed.js
│   └── tests/             # Backend tests
```

## Prerequisites

- Node.js v16+ and npm
- MySQL 8.0+
- Git

## Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd DBMS_MAIN_PROJECT
```

### 2. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE socialfeed;
```

### 3. Server Setup

```bash
cd server
npm install
```

Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=socialfeed
JWT_SECRET=your_jwt_secret_key_change_this
PORT=5000
```

Run migrations (creates tables, triggers, procedures, functions):

```bash
npm run migrate
```

Seed the database with initial data:

```bash
npm run seed
```

Generate additional test data (optional):

```bash
npm run generate-seed
```

Start the server:

```bash
npm run dev
```

Server will run on `http://localhost:5000`

### 4. Client Setup

```bash
cd client
npm install
```

Create `.env` file:

```bash
cp .env.example .env
```

Start the development server:

```bash
npm run dev
```

Client will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/:id` - Get user profile with age and counts
- `GET /api/users/:id/posts?page=1&limit=10` - Get user's posts (paginated)

### Posts
- `GET /api/posts` - Get all posts (paginated)
- `GET /api/posts/:id` - Get single post with comments
- `POST /api/posts` - Create new post (protected)
- `DELETE /api/posts/:id` - Delete post (owner only)

### Comments
- `POST /api/posts/:id/comments` - Add comment to post
- `POST /api/comments/:id/reply` - Reply to comment

### Likes
- `POST /api/posts/:id/like` - Like a post
- `POST /api/comments/:id/like` - Like a comment
- `DELETE /api/likes/:id` - Unlike

### Friends
- `GET /api/friends` - Get friends list
- `POST /api/friends/request` - Send friend request
- `POST /api/friends/:id/accept` - Accept friend request
- `DELETE /api/friends/:id` - Remove friend/reject request

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/mark-read` - Mark notifications as read
- `GET /api/notifications/unread-count` - Get unread count

### Admin
- `GET /api/admin/stats` - Get platform statistics (admin only)

## Database Schema

### Tables
- **Users** - User accounts and profiles
- **PhoneNumbers** - User phone numbers (one-to-many)
- **Posts** - User posts with media
- **Comments** - Comments on posts with reply support
- **Likes** - Likes on posts and comments
- **Friends** - Friend relationships
- **Notifications** - User notifications

### Key Features
- Triggers automatically update counts (post_count, likes_count, etc.)
- Stored procedures for complex queries (GetUserPosts, GetTopLikedPosts, SendNotification)
- Functions for computed values (GetUserAge, GetTotalLikesForUser, GetUnreadNotifications)
- Proper indexes for performance
- Foreign key constraints with CASCADE delete

## Testing

### Backend Tests

```bash
cd server
npm test
```

### Frontend Tests

```bash
cd client
npm test
```

## Scripts

### Server
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with initial data
- `npm run generate-seed` - Generate large test dataset

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests

## Environment Variables

### Server (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=socialfeed
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000
```

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token authentication
- Protected routes requiring authentication
- Input validation and sanitization
- Parameterized queries to prevent SQL injection
- CORS configuration
- Rate limiting (recommended for production)

## Production Deployment

### Server
1. Set `NODE_ENV=production`
2. Use a process manager (PM2)
3. Set up SSL/TLS
4. Configure reverse proxy (nginx)
5. Enable rate limiting
6. Set up monitoring and logging

### Client
1. Build the application: `npm run build`
2. Serve static files with nginx or CDN
3. Configure environment variables

### Database
1. Use connection pooling
2. Regular backups
3. Monitor performance
4. Optimize indexes based on query patterns

## License

MIT

## Contributors

Your Name

---

For issues or questions, please open an issue on GitHub.
