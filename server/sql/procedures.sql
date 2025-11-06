-- Social Feed Stored Procedures
-- MySQL 8.0+

DELIMITER $$

-- Procedure: GetUserPosts
-- Returns paginated posts for a specific user with author information
DROP PROCEDURE IF EXISTS GetUserPosts$$
CREATE PROCEDURE GetUserPosts(
  IN uid INT,
  IN page INT,
  IN pageSize INT
)
BEGIN
  DECLARE offsetVal INT;
  
  -- Validate inputs
  IF page < 1 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Page must be greater than 0';
  END IF;
  
  IF pageSize < 1 OR pageSize > 100 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Page size must be between 1 and 100';
  END IF;
  
  SET offsetVal = (page - 1) * pageSize;
  
  -- Return paginated posts
  SELECT 
    p.post_id,
    p.user_id,
    p.video_url,
    p.image_url,
    p.created_at,
    p.likes_count,
    p.comments_count,
    u.first_name,
    u.last_name,
    u.profile_pic_URL
  FROM Posts p
  INNER JOIN Users u ON p.user_id = u.user_id
  WHERE p.user_id = uid
  ORDER BY p.created_at DESC
  LIMIT pageSize OFFSET offsetVal;
END$$

-- Procedure: GetTopLikedPosts
-- Returns top posts ordered by likes_count descending
DROP PROCEDURE IF EXISTS GetTopLikedPosts$$
CREATE PROCEDURE GetTopLikedPosts(
  IN limitCount INT
)
BEGIN
  -- Validate input
  IF limitCount < 1 OR limitCount > 100 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Limit must be between 1 and 100';
  END IF;
  
  -- Return top liked posts
  SELECT 
    p.post_id,
    p.user_id,
    p.video_url,
    p.image_url,
    p.created_at,
    p.likes_count,
    p.comments_count,
    u.first_name,
    u.last_name,
    u.profile_pic_URL
  FROM Posts p
  INNER JOIN Users u ON p.user_id = u.user_id
  ORDER BY p.likes_count DESC, p.created_at DESC
  LIMIT limitCount;
END$$

-- Procedure: SendNotification
-- Inserts a notification and returns the new notification ID
DROP PROCEDURE IF EXISTS SendNotification$$
CREATE PROCEDURE SendNotification(
  IN uid INT,
  IN n_content VARCHAR(255),
  IN n_type VARCHAR(50)
)
BEGIN
  DECLARE new_notification_id INT;
  DECLARE valid_type ENUM('like','comment','friend_request','other');
  
  -- Validate user exists
  IF NOT EXISTS (SELECT 1 FROM Users WHERE user_id = uid) THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'User does not exist';
  END IF;
  
  -- Validate and set notification type
  SET valid_type = CASE
    WHEN n_type IN ('like', 'comment', 'friend_request', 'other') THEN n_type
    ELSE 'other'
  END;
  
  -- Insert notification
  INSERT INTO Notifications (user_id, content, notification_type, is_read, created_at)
  VALUES (uid, n_content, valid_type, FALSE, CURRENT_TIMESTAMP);
  
  -- Get the new notification ID
  SET new_notification_id = LAST_INSERT_ID();
  
  -- Return the new notification
  SELECT 
    n_id,
    user_id,
    content,
    notification_type,
    is_read,
    created_at
  FROM Notifications
  WHERE n_id = new_notification_id;
END$$

DELIMITER ;
