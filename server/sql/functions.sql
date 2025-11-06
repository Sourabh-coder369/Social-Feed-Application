-- Social Feed Stored Functions
-- MySQL 8.0+

DELIMITER $$

-- Function: GetUserAge
-- Computes the age of a user in years from their date of birth
DROP FUNCTION IF EXISTS GetUserAge$$
CREATE FUNCTION GetUserAge(uid INT)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE user_dob DATE;
  DECLARE user_age INT;
  
  -- Get user's date of birth
  SELECT date_of_birth INTO user_dob
  FROM Users
  WHERE user_id = uid;
  
  -- If user not found, return NULL
  IF user_dob IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Calculate age
  SET user_age = TIMESTAMPDIFF(YEAR, user_dob, CURDATE());
  
  RETURN user_age;
END$$

-- Function: GetTotalLikesForUser
-- Returns the sum of likes_count across all posts by a user
DROP FUNCTION IF EXISTS GetTotalLikesForUser$$
CREATE FUNCTION GetTotalLikesForUser(uid INT)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE total_likes INT;
  
  -- Calculate total likes across all user's posts
  SELECT COALESCE(SUM(likes_count), 0) INTO total_likes
  FROM Posts
  WHERE user_id = uid;
  
  RETURN total_likes;
END$$

-- Function: GetUnreadNotifications
-- Returns count of unread notifications for a user
DROP FUNCTION IF EXISTS GetUnreadNotifications$$
CREATE FUNCTION GetUnreadNotifications(uid INT)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE unread_count INT;
  
  -- Count unread notifications
  SELECT COUNT(*) INTO unread_count
  FROM Notifications
  WHERE user_id = uid AND is_read = FALSE;
  
  RETURN unread_count;
END$$

DELIMITER ;
