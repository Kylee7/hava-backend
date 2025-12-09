const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Get user notifications
router.get('/user/:userId', async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.params.userId })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الإشعارات'
        });
    }
});

// Get unread count
router.get('/user/:userId/unread-count', async (req, res) => {
    try {
        const count = await Notification.getUnreadCount(req.params.userId);

        res.json({
            success: true,
            data: { count }
        });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب عدد الإشعارات'
        });
    }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'الإشعار غير موجود'
            });
        }

        notification.isRead = true;
        await notification.save();

        res.json({
            success: true,
            message: 'تم تحديد الإشعار كمقروء',
            data: notification
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث الإشعار'
        });
    }
});

// Mark all as read
router.post('/user/:userId/read-all', async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.params.userId, isRead: false },
            { isRead: true }
        );

        res.json({
            success: true,
            message: 'تم تحديد جميع الإشعارات كمقروءة'
        });
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث الإشعارات'
        });
    }
});

// Delete notification
router.delete('/:id', async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'الإشعار غير موجود'
            });
        }

        res.json({
            success: true,
            message: 'تم حذف الإشعار'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف الإشعار'
        });
    }
});

module.exports = router;
