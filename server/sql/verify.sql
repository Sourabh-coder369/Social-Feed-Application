# Database Schema Verification
# Run this after migrations to verify everything is set up correctly

SELECT 'Tables Created:' as status;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'socialfeed'
ORDER BY TABLE_NAME;

SELECT '' as spacer;
SELECT 'Triggers Created:' as status;
SHOW TRIGGERS FROM socialfeed;

SELECT '' as spacer;
SELECT 'Stored Procedures:' as status;
SHOW PROCEDURE STATUS WHERE Db = 'socialfeed';

SELECT '' as spacer;
SELECT 'Stored Functions:' as status;
SHOW FUNCTION STATUS WHERE Db = 'socialfeed';

SELECT '' as spacer;
SELECT 'Data Counts:' as status;
SELECT 'Users' as table_name, COUNT(*) as count FROM Users
UNION ALL
SELECT 'Posts', COUNT(*) FROM Posts
UNION ALL
SELECT 'Comments', COUNT(*) FROM Comments
UNION ALL
SELECT 'Likes', COUNT(*) FROM Likes
UNION ALL
SELECT 'Friends', COUNT(*) FROM Friends
UNION ALL
SELECT 'Notifications', COUNT(*) FROM Notifications;

SELECT '' as spacer;
SELECT 'Sample Data Check:' as status;
SELECT user_id, first_name, last_name, email, post_count, created_at 
FROM Users 
LIMIT 5;
