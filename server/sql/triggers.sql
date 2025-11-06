-- Social Feed Database Triggers
-- MySQL 8.0+

DELIMITER $$

-- Trigger: After INSERT on Posts - increment Users.post_count
DROP TRIGGER IF EXISTS after_post_insert$$
CREATE TRIGGER after_post_insert
AFTER INSERT ON `Posts`
FOR EACH ROW
BEGIN
  UPDATE `Users`
  SET post_count = post_count + 1
  WHERE user_id = NEW.user_id;
END$$

-- Trigger: After DELETE on Posts - decrement Users.post_count
DROP TRIGGER IF EXISTS after_post_delete$$
CREATE TRIGGER after_post_delete
AFTER DELETE ON `Posts`
FOR EACH ROW
BEGIN
  UPDATE `Users`
  SET post_count = GREATEST(0, post_count - 1)
  WHERE user_id = OLD.user_id;
END$$

-- Trigger: After INSERT on Likes - increment likes_count
DROP TRIGGER IF EXISTS after_like_insert$$
CREATE TRIGGER after_like_insert
AFTER INSERT ON `Likes`
FOR EACH ROW
BEGIN
  IF NEW.like_type = 'post' AND NEW.post_id IS NOT NULL THEN
    UPDATE `Posts`
    SET likes_count = likes_count + 1
    WHERE post_id = NEW.post_id;
  ELSEIF NEW.like_type = 'comment' AND NEW.comment_id IS NOT NULL THEN
    UPDATE `Comments`
    SET likes_count = likes_count + 1
    WHERE comment_id = NEW.comment_id;
  END IF;
END$$

-- Trigger: After DELETE on Likes - decrement likes_count
DROP TRIGGER IF EXISTS after_like_delete$$
CREATE TRIGGER after_like_delete
AFTER DELETE ON `Likes`
FOR EACH ROW
BEGIN
  IF OLD.like_type = 'post' AND OLD.post_id IS NOT NULL THEN
    UPDATE `Posts`
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE post_id = OLD.post_id;
  ELSEIF OLD.like_type = 'comment' AND OLD.comment_id IS NOT NULL THEN
    UPDATE `Comments`
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE comment_id = OLD.comment_id;
  END IF;
END$$

-- Trigger: After INSERT on Comments - increment Posts.comments_count
DROP TRIGGER IF EXISTS after_comment_insert$$
CREATE TRIGGER after_comment_insert
AFTER INSERT ON `Comments`
FOR EACH ROW
BEGIN
  UPDATE `Posts`
  SET comments_count = comments_count + 1
  WHERE post_id = NEW.post_id;
END$$

-- Trigger: After DELETE on Comments - decrement Posts.comments_count
DROP TRIGGER IF EXISTS after_comment_delete$$
CREATE TRIGGER after_comment_delete
AFTER DELETE ON `Comments`
FOR EACH ROW
BEGIN
  UPDATE `Posts`
  SET comments_count = GREATEST(0, comments_count - 1)
  WHERE post_id = OLD.post_id;
END$$

DELIMITER ;
