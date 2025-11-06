# 👥 Test User Accounts - Social Feed Application

## 🎉 Ready-to-Use Test Accounts

### ✅ Working Test Users (Created Just Now)

| Name | Email | Password | User ID |
|------|-------|----------|---------|
| **John Doe** | `john.doe@test.com` | `Password123` | 27 |
| **Jane Smith** | `jane.smith@test.com` | `Password123` | 28 |
| **Mike Johnson** | `mike.j@test.com` | `Password123` | 29 |

### 🔑 Recently Created Users

| Name | Email | Password | Purpose |
|------|-------|----------|---------|
| **Test User** | `testuser@example.com` | `Test123456` | General testing |
| **Comment Tester** | `commenter@test.com` | `Test123456` | Comment testing |

---

## 📊 Seeded Users (25 users from database)

**⚠️ Note:** The seeded users have placeholder password hashes in the seed file and **cannot be logged into** directly. 
However, their posts, comments, likes, and friendships are all pre-populated in the database.

### Seeded User Emails (for reference only):

1. john.doe@example.com
2. jane.smith@example.com
3. michael.j@example.com
4. emily.w@example.com
5. david.brown@example.com
6. sarah.davis@example.com
7. robert.m@example.com
8. lisa.wilson@example.com
9. james.moore@example.com
10. jessica.t@example.com
11. chris.anderson@example.com
12. amanda.thomas@example.com
13. matt.jackson@example.com
14. ashley.white@example.com
15. daniel.harris@example.com
16. jennifer.martin@example.com
17. joshua.t@example.com
18. nicole.garcia@example.com
19. andrew.m@example.com
20. stephanie.r@example.com
21. ryan.clark@example.com
22. lauren.r@example.com
23. kevin.lewis@example.com
24. megan.lee@example.com
25. brian.walker@example.com

---

## 🧪 How to Test

### 1. **Login**
```
URL: http://localhost:5173
Email: john.doe@test.com
Password: Password123
```

### 2. **View Profile**
- Navigate to `/profile/:userId`
- Example: http://localhost:5173/profile/27

### 3. **Create Posts**
- Login with any test account
- Click "What's on your mind?"
- Write content (required)
- Add image URL (optional): `https://picsum.photos/800/600`
- Click "Post"

### 4. **View and Add Comments**
- Click the 💬 comment button on any post
- See existing comments from other users
- Type your comment and click "Post"

### 5. **Like Posts**
- Click the ❤️ like button on any post
- Watch the count update instantly

### 6. **Send Friend Requests**
- Go to Friends page
- Send requests to other users
- Accept/decline incoming requests

### 7. **View Notifications**
- Check notifications icon in navbar
- See likes, comments, and friend requests

---

## 📈 Database Stats

After seeding, your database contains:
- **25 seeded users** (existing content creators)
- **3+ test users** (with working login credentials)
- **35 posts** with images and videos
- **50 comments** (including replies)
- **60 likes** on posts and comments
- **30 friend relationships**
- **40 notifications**

---

## 🎯 Quick Test Scenarios

### Scenario 1: Full User Journey
1. Register: `john.doe@test.com` / `Password123`
2. Create a post with text and image
3. Like 3 other posts
4. Comment on 2 posts
5. View your profile to see your post count

### Scenario 2: Social Interaction
1. Login as: `jane.smith@test.com` / `Password123`
2. Send friend request to Mike Johnson (User ID: 29)
3. Login as: `mike.j@test.com` / `Password123`
4. Accept the friend request
5. Comment on Jane's posts

### Scenario 3: Content Exploration
1. Login with any account
2. Browse the feed (35 existing posts)
3. Click comment buttons to see discussions
4. View user profiles to see their posts
5. Check notifications for activity

---

## 🛠️ API Testing

### Get User Info
```bash
# Get user by ID
curl http://localhost:5000/api/users/27
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@test.com","password":"Password123"}'
```

### Create Post (requires token)
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"content":"Test post!","imageUrl":"https://picsum.photos/800/600"}'
```

---

## 📝 Notes

- All test accounts use simple passwords for easy testing
- User IDs start from 27 (1-25 are seeded users, 26 was test user)
- Seeded users have complete profiles with posts, comments, and friendships
- You can view seeded users' content even though you can't login as them
- All features work: posts, comments, likes, friends, notifications

---

## 🔄 Reset Data

To start fresh with clean data:

```powershell
cd server
node -e "const db = require('./src/db/index'); db.raw('DROP DATABASE IF EXISTS socialfeed').then(() => db.raw('CREATE DATABASE socialfeed')).then(() => { console.log('Database recreated'); process.exit(0); })"
npm run migrate
npm run seed
```

Then create new test users again!

---

**Happy Testing! 🚀**
