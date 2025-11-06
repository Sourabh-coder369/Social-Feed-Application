-- Social Feed Database Schema
-- MySQL 8.0+

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS Notifications;
DROP TABLE IF EXISTS Friends;
DROP TABLE IF EXISTS Likes;
DROP TABLE IF EXISTS Comments;
DROP TABLE IF EXISTS Posts;
DROP TABLE IF EXISTS PhoneNumbers;
DROP TABLE IF EXISTS Users;

-- Users Table
CREATE TABLE Users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  followers_count INT NOT NULL DEFAULT 0,
  following_count INT NOT NULL DEFAULT 0,
  profile_pic_URL VARCHAR(255),
  post_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PhoneNumbers Table
CREATE TABLE PhoneNumbers (
  phone_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  CONSTRAINT fk_phone_user FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Posts Table
CREATE TABLE Posts (
  post_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(255),
  video_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  likes_count INT NOT NULL DEFAULT 0,
  comments_count INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_post_user FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  INDEX idx_posts_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comments Table
CREATE TABLE Comments (
  comment_id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  likes_count INT NOT NULL DEFAULT 0,
  reply_to INT DEFAULT NULL,
  CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES Posts(post_id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_reply FOREIGN KEY (reply_to) REFERENCES Comments(comment_id) ON DELETE CASCADE,
  INDEX idx_comments_post (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Likes Table
CREATE TABLE Likes (
  like_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT,
  comment_id INT,
  like_type ENUM('post','comment') NOT NULL,
  liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_like_user FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_like_post FOREIGN KEY (post_id) REFERENCES Posts(post_id) ON DELETE CASCADE,
  CONSTRAINT fk_like_comment FOREIGN KEY (comment_id) REFERENCES Comments(comment_id) ON DELETE CASCADE,
  CONSTRAINT chk_like_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL AND like_type='post')
    OR
    (comment_id IS NOT NULL AND post_id IS NULL AND like_type='comment')
  ),
  INDEX idx_likes_user_post_comment (user_id, post_id, comment_id),
  UNIQUE KEY unique_user_post_like (user_id, post_id),
  UNIQUE KEY unique_user_comment_like (user_id, comment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Friends Table
CREATE TABLE Friends (
  friendship_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  recipient_id INT NOT NULL,
  is_accepted BOOLEAN DEFAULT FALSE,
  status ENUM('pending','accepted','blocked') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_friend_user FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_friend_recipient FOREIGN KEY (recipient_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_friendship (user_id, recipient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications Table
CREATE TABLE Notifications (
  n_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  content VARCHAR(255) NOT NULL,
  notification_type ENUM('like','comment','friend_request','other') DEFAULT 'other',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  INDEX idx_notifications_user_read (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
