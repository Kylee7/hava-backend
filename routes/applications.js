const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const User = require('../models/User');
const Notification = require('../models/Notification');
const SystemSettings = require('../models/SystemSettings');
const { authenticateToken } = require('../middleware/auth');
const discordBot = require('../discord-bot');

// Check if applications are open
router.get('/status', async (req, res) => {
    try {
        const isOpen = await SystemSettings.getSetting('applications_open', false);
        
        res.json({
            success: true,
            data: { isOpen }
        });
    } catch (error) {
        console.error('Error checking application status:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في التحقق من حالة التقديم'
        });
    }
});

// Toggle applications open/closed (Admin only)
router.post('/toggle', authenticateToken, async (req, res) => {
    try {
        const currentStatus = await SystemSettings.getSetting('applications_open', false);
        const newStatus = !currentStatus;
        
        await SystemSettings.setSetting('applications_open', newStatus, 'حالة فتح/إغلاق التقديمات');
        
        res.json({
            success: true,
            message: `تم ${newStatus ? 'فتح' : 'إغلاق'} التقديمات`,
            data: { isOpen: newStatus }
        });
    } catch (error) {
        console.error('Error toggling applications:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تغيير حالة التقديمات'
        });
    }
});

// Submit application (Public)
router.post('/submit', async (req, res) => {
    try {
        const { userId, basicAnswers, randomAnswers } = req.body;

        // Check if applications are open
        const isOpen = await SystemSettings.getSetting('applications_open', false);
        if (!isOpen) {
            return res.status(403).json({
                success: false,
                message: 'التقديمات مغلقة حالياً'
            });
        }

        // Validate user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        // Check if user already applied
        if (user.hasApplied) {
            return res.status(400).json({
                success: false,
                message: 'لقد قمت بالتقديم مسبقاً'
            });
        }

        // Validate basic answers
        if (!basicAnswers || !basicAnswers.realName || !basicAnswers.realAge || !basicAnswers.country) {
            return res.status(400).json({
                success: false,
                message: 'الرجاء ملء جميع المعلومات الأساسية'
            });
        }

        // Create application
        const application = await Application.create({
            userId: user._id,
            discordId: user.discordId,
            basicAnswers: {
                realName: basicAnswers.realName,
                realAge: parseInt(basicAnswers.realAge),
                country: basicAnswers.country
            },
            randomAnswers: randomAnswers || [],
            status: 'pending'
        });

        // Update user
        user.hasApplied = true;
        user.applicationStatus = 'pending';
        await user.save();

        res.status(201).json({
            success: true,
            message: 'تم إرسال التقديم بنجاح',
            data: application
        });

    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إرسال التقديم'
        });
    }
});

// Get user's application
router.get('/my-application/:userId', async (req, res) => {
    try {
        const application = await Application.findOne({ userId: req.params.userId })
            .populate('userId', 'username discordId avatar');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'لم يتم العثور على تقديم'
            });
        }

        res.json({
            success: true,
            data: application
        });
    } catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب التقديم'
        });
    }
});

// Get all applications (Admin only)
router.get('/all', authenticateToken, async (req, res) => {
    try {
        const { status } = req.query;
        
        let filter = {};
        if (status) filter.status = status;

        const applications = await Application.find(filter)
            .populate('userId', 'username discordId avatar email')
            .populate('reviewedBy', 'username')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: applications
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب التقديمات'
        });
    }
});

// Get single application (Admin only)
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('userId', 'username discordId avatar email')
            .populate('reviewedBy', 'username');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'التقديم غير موجود'
            });
        }

        res.json({
            success: true,
            data: application
        });
    } catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب التقديم'
        });
    }
});

// Accept application (Admin only)
router.post('/:id/accept', authenticateToken, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id).populate('userId');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'التقديم غير موجود'
            });
        }

        if (application.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'التقديم تمت مراجعته مسبقاً'
            });
        }

        // Update application
        application.status = 'accepted';
        application.reviewedBy = req.user.id;
        application.reviewedAt = new Date();
        await application.save();

        // Update user
        const user = application.userId;
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }
        user.applicationStatus = 'accepted';
        await user.save();

        // Create notification
        await Notification.create({
            userId: user._id,
            type: 'application_accepted',
            title: 'تم قبول تقديمك! 🎉',
            message: 'مبروك! تم قبول تقديمك في Perfect CFW. يمكنك الآن الدخول إلى السيرفر واللعب.',
            applicationId: application._id
        });

        // Send Discord notification
        try {
            if (process.env.DISCORD_BOT_TOKEN) {
                await discordBot.sendAcceptanceNotification(user.discordId, user.username);
            }
        } catch (error) {
            console.error('Discord notification error:', error.message);
        }

        res.json({
            success: true,
            message: 'تم قبول التقديم بنجاح',
            data: application
        });

    } catch (error) {
        console.error('Error accepting application:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            applicationId: req.params.id
        });
        res.status(500).json({
            success: false,
            message: 'خطأ في قبول التقديم'
        });
    }
});

// Reject application (Admin only)
router.post('/:id/reject', authenticateToken, async (req, res) => {
    try {
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'سبب الرفض مطلوب'
            });
        }

        const application = await Application.findById(req.params.id).populate('userId');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'التقديم غير موجود'
            });
        }

        if (application.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'التقديم تمت مراجعته مسبقاً'
            });
        }

        // Update application
        application.status = 'rejected';
        application.reviewedBy = req.user.id;
        application.reviewedAt = new Date();
        application.rejectionReason = reason;
        await application.save();

        // Update user
        const user = application.userId;
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }
        user.applicationStatus = 'rejected';
        await user.save();

        // Create notification
        await Notification.create({
            userId: user._id,
            type: 'application_rejected',
            title: 'تم رفض تقديمك',
            message: 'نأسف لإبلاغك بأنه تم رفض تقديمك في Perfect CFW.',
            rejectionReason: reason,
            applicationId: application._id
        });

        // Send Discord notification
        try {
            if (process.env.DISCORD_BOT_TOKEN) {
                await discordBot.sendRejectionNotification(user.discordId, user.username, reason);
            }
        } catch (error) {
            console.error('Discord notification error:', error.message);
        }

        res.json({
            success: true,
            message: 'تم رفض التقديم',
            data: application
        });

    } catch (error) {
        console.error('Error rejecting application:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            applicationId: req.params.id,
            reason: req.body.reason
        });
        res.status(500).json({
            success: false,
            message: 'خطأ في رفض التقديم'
        });
    }
});

// Get statistics (Admin only)
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        const total = await Application.countDocuments();
        const pending = await Application.countDocuments({ status: 'pending' });
        const accepted = await Application.countDocuments({ status: 'accepted' });
        const rejected = await Application.countDocuments({ status: 'rejected' });

        res.json({
            success: true,
            data: {
                total,
                pending,
                accepted,
                rejected
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الإحصائيات'
        });
    }
});

module.exports = router;
