const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const db = require('../src/db');

// Configuration
const NUM_USERS = 100;
const NUM_POSTS_PER_USER = 5;
const NUM_COMMENTS = 500;
const NUM_LIKES = 1000;
const NUM_FRIENDSHIPS = 200;

/**
 * Generate fake users
 */
async function generateUsers() {
  console.log(`Generating ${NUM_USERS} users...`);
  const users = [];
  const passwordHash = await bcrypt.hash('password123', 10);

  for (let i = 0; i < NUM_USERS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    users.push({
      first_name: firstName,
      last_name: lastName,
      email,
      password_hash: passwordHash,
      date_of_birth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
      profile_pic_URL: faker.image.avatar()
    });
  }

  // Insert users in batches
  const batchSize = 50;
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    await db('Users').insert(batch);
  }

  console.log(`✓ ${NUM_USERS} users created`);
}

/**
 * Generate phone numbers for users
 */
async function generatePhoneNumbers() {
  console.log('Generating phone numbers...');
  
  const users = await db('Users').select('user_id');
  const phoneNumbers = [];

  for (const user of users) {
    // 70% of users have at least one phone number
    if (Math.random() < 0.7) {
      phoneNumbers.push({
        user_id: user.user_id,
        phone_number: faker.phone.number()
      });

      // 20% have a second phone number
      if (Math.random() < 0.2) {
        phoneNumbers.push({
          user_id: user.user_id,
          phone_number: faker.phone.number()
        });
      }
    }
  }

  await db('PhoneNumbers').insert(phoneNumbers);
  console.log(`✓ ${phoneNumbers.length} phone numbers created`);
}

/**
 * Generate posts
 */
async function generatePosts() {
  console.log(`Generating posts...`);
  
  const users = await db('Users').select('user_id');
  const posts = [];

  for (const user of users) {
    const numPosts = Math.floor(Math.random() * NUM_POSTS_PER_USER) + 1;
    
    for (let i = 0; i < numPosts; i++) {
      const hasImage = Math.random() < 0.7;
      const hasVideo = !hasImage && Math.random() < 0.5;

      posts.push({
        user_id: user.user_id,
        image_url: hasImage ? faker.image.url() : null,
        video_url: hasVideo ? `https://example.com/video/${faker.string.uuid()}.mp4` : null,
        created_at: faker.date.recent({ days: 30 })
      });
    }
  }

  // Insert in batches
  const batchSize = 100;
  for (let i = 0; i < posts.length; i += batchSize) {
    const batch = posts.slice(i, i + batchSize);
    await db('Posts').insert(batch);
  }

  console.log(`✓ ${posts.length} posts created`);
}

/**
 * Generate comments
 */
async function generateComments() {
  console.log(`Generating ${NUM_COMMENTS} comments...`);
  
  const posts = await db('Posts').select('post_id');
  const users = await db('Users').select('user_id');
  const comments = [];

  for (let i = 0; i < NUM_COMMENTS; i++) {
    const post = posts[Math.floor(Math.random() * posts.length)];
    const user = users[Math.floor(Math.random() * users.length)];

    comments.push({
      post_id: post.post_id,
      user_id: user.user_id,
      content: faker.lorem.sentence(),
      created_at: faker.date.recent({ days: 30 }),
      reply_to: null
    });
  }

  await db('Comments').insert(comments);
  console.log(`✓ ${NUM_COMMENTS} comments created`);

  // Generate some replies (20% of comments)
  const allComments = await db('Comments').select('comment_id', 'post_id');
  const numReplies = Math.floor(NUM_COMMENTS * 0.2);
  const replies = [];

  for (let i = 0; i < numReplies; i++) {
    const parentComment = allComments[Math.floor(Math.random() * allComments.length)];
    const user = users[Math.floor(Math.random() * users.length)];

    replies.push({
      post_id: parentComment.post_id,
      user_id: user.user_id,
      content: faker.lorem.sentence(),
      reply_to: parentComment.comment_id
    });
  }

  if (replies.length > 0) {
    await db('Comments').insert(replies);
    console.log(`✓ ${replies.length} replies created`);
  }
}

/**
 * Generate likes
 */
async function generateLikes() {
  console.log(`Generating ${NUM_LIKES} likes...`);
  
  const posts = await db('Posts').select('post_id');
  const comments = await db('Comments').select('comment_id');
  const users = await db('Users').select('user_id');
  const likes = [];
  const likeSet = new Set(); // To avoid duplicates

  let attempts = 0;
  while (likes.length < NUM_LIKES && attempts < NUM_LIKES * 2) {
    attempts++;
    const user = users[Math.floor(Math.random() * users.length)];
    const isPostLike = Math.random() < 0.7; // 70% post likes, 30% comment likes

    if (isPostLike) {
      const post = posts[Math.floor(Math.random() * posts.length)];
      const key = `${user.user_id}-post-${post.post_id}`;
      
      if (!likeSet.has(key)) {
        likeSet.add(key);
        likes.push({
          user_id: user.user_id,
          post_id: post.post_id,
          comment_id: null,
          like_type: 'post'
        });
      }
    } else {
      const comment = comments[Math.floor(Math.random() * comments.length)];
      const key = `${user.user_id}-comment-${comment.comment_id}`;
      
      if (!likeSet.has(key)) {
        likeSet.add(key);
        likes.push({
          user_id: user.user_id,
          post_id: null,
          comment_id: comment.comment_id,
          like_type: 'comment'
        });
      }
    }
  }

  // Insert in batches
  const batchSize = 100;
  for (let i = 0; i < likes.length; i += batchSize) {
    const batch = likes.slice(i, i + batchSize);
    await db('Likes').insert(batch);
  }

  console.log(`✓ ${likes.length} likes created`);
}

/**
 * Generate friendships
 */
async function generateFriendships() {
  console.log(`Generating ${NUM_FRIENDSHIPS} friendships...`);
  
  const users = await db('Users').select('user_id');
  const friendships = [];
  const friendshipSet = new Set();

  let attempts = 0;
  while (friendships.length < NUM_FRIENDSHIPS && attempts < NUM_FRIENDSHIPS * 2) {
    attempts++;
    const user1 = users[Math.floor(Math.random() * users.length)];
    const user2 = users[Math.floor(Math.random() * users.length)];

    if (user1.user_id !== user2.user_id) {
      const key = [user1.user_id, user2.user_id].sort().join('-');
      
      if (!friendshipSet.has(key)) {
        friendshipSet.add(key);
        const isAccepted = Math.random() < 0.8; // 80% accepted

        friendships.push({
          user_id: user1.user_id,
          recipient_id: user2.user_id,
          is_accepted: isAccepted,
          status: isAccepted ? 'accepted' : 'pending',
          created_at: faker.date.recent({ days: 60 })
        });
      }
    }
  }

  await db('Friends').insert(friendships);
  console.log(`✓ ${friendships.length} friendships created`);
}

/**
 * Generate notifications
 */
async function generateNotifications() {
  console.log('Generating notifications...');
  
  const users = await db('Users').select('user_id');
  const notificationTypes = ['like', 'comment', 'friend_request', 'other'];
  const notifications = [];

  for (const user of users) {
    const numNotifications = Math.floor(Math.random() * 10) + 1;
    
    for (let i = 0; i < numNotifications; i++) {
      notifications.push({
        user_id: user.user_id,
        content: faker.lorem.sentence(),
        notification_type: notificationTypes[Math.floor(Math.random() * notificationTypes.length)],
        is_read: Math.random() < 0.6, // 60% read
        created_at: faker.date.recent({ days: 7 })
      });
    }
  }

  // Insert in batches
  const batchSize = 100;
  for (let i = 0; i < notifications.length; i += batchSize) {
    const batch = notifications.slice(i, i + batchSize);
    await db('Notifications').insert(batch);
  }

  console.log(`✓ ${notifications.length} notifications created`);
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('Starting seed data generation...\n');

    await generateUsers();
    await generatePhoneNumbers();
    await generatePosts();
    await generateComments();
    await generateLikes();
    await generateFriendships();
    await generateNotifications();

    console.log('\n✅ Seed data generation completed successfully!');
    
    // Display final counts
    const userCount = await db('Users').count('* as count').first();
    const postCount = await db('Posts').count('* as count').first();
    const commentCount = await db('Comments').count('* as count').first();
    const likeCount = await db('Likes').count('* as count').first();
    
    console.log('\nFinal database statistics:');
    console.log(`- Users: ${userCount.count}`);
    console.log(`- Posts: ${postCount.count}`);
    console.log(`- Comments: ${commentCount.count}`);
    console.log(`- Likes: ${likeCount.count}`);

    process.exit(0);
  } catch (error) {
    console.error('Error generating seed data:', error);
    process.exit(1);
  }
}

main();
