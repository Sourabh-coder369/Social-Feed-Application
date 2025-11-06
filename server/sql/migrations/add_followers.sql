-- Migration: Add Followers/Following System
-- This creates a separate followers table from the friends system

-- Create Followers table
CREATE TABLE IF NOT EXISTS Followers (
  follower_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  followed_user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (followed_user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_follow (user_id, followed_user_id),
  CHECK (user_id != followed_user_id)
);

-- Add indexes for performance
CREATE INDEX idx_followers_user_id ON Followers(user_id);
CREATE INDEX idx_followers_followed_user_id ON Followers(followed_user_id);

-- Create view for user follower counts
CREATE OR REPLACE VIEW UserFollowerStats AS
SELECT 
  u.user_id,
  COUNT(DISTINCT f1.follower_id) as followers_count,
  COUNT(DISTINCT f2.follower_id) as following_count
FROM Users u
LEFT JOIN Followers f1 ON u.user_id = f1.followed_user_id
LEFT JOIN Followers f2 ON u.user_id = f2.user_id
GROUP BY u.user_id;
