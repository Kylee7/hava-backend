const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { authenticateToken } = require('../middleware/auth');

// Get all activity logs
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 50, 
            action, 
            username,
            startDate,
            endDate 
        } = req.query;
        
        // Build query
        const query = {};
        
        if (action) query.action = action;
        if (username) query['user.username'] = new RegExp(username, 'i');
        
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }
        
        // Get logs with pagination
        const logs = await ActivityLog.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        
        const total = await ActivityLog.countDocuments(query);
        
        res.json({
            success: true,
            data: logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في تحميل السجلات',
            error: error.message
        });
    }
});

// Get logs statistics
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const now = new Date();
        const last24h = new Date(now - 24 * 60 * 60 * 1000);
        const last7d = new Date(now - 7 * 24 * 60 * 60 * 1000);
        
        const [
            totalLogs,
            logsLast24h,
            logsLast7d,
            actionCounts
        ] = await Promise.all([
            ActivityLog.countDocuments(),
            ActivityLog.countDocuments({ timestamp: { $gte: last24h } }),
            ActivityLog.countDocuments({ timestamp: { $gte: last7d } }),
            ActivityLog.aggregate([
                {
                    $group: {
                        _id: '$action',
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: 10
                }
            ])
        ]);
        
        res.json({
            success: true,
            data: {
                totalLogs,
                logsLast24h,
                logsLast7d,
                topActions: actionCounts
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في تحميل الإحصائيات'
        });
    }
});

// Clear old logs (admin only)
router.delete('/clear', authenticateToken, async (req, res) => {
    try {
        const { days = 30 } = req.body;
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
        
        const result = await ActivityLog.deleteMany({
            timestamp: { $lt: cutoffDate }
        });
        
        res.json({
            success: true,
            message: `تم حذف ${result.deletedCount} سجل`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف السجلات'
        });
    }
});

module.exports = router;
