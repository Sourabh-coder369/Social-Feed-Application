const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/admin/stats
 * @desc    Get admin statistics
 * @access  Private (should add admin role check)
 */
router.get('/stats', authMiddleware, adminController.getAdminStats);

module.exports = router;
