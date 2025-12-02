const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');
const { createLog } = require('../middleware/logger');

// Get all admins (superadmin only)
router.get('/', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const admins = await Admin.find()
            .select('-password')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: admins
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في تحميل المسؤولين'
        });
    }
});

// Create new admin (superadmin only)
router.post('/', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const { username, password, email } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'اسم المستخدم وكلمة المرور مطلوبان'
            });
        }
        
        // Check if username exists
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'اسم المستخدم موجود بالفعل'
            });
        }
        
        // Create new admin with 'admin' role (not superadmin)
        const admin = new Admin({
            username,
            password,
            email,
            role: 'admin'
        });
        
        await admin.save();
        
        // Log action
        await createLog({
            action: 'CREATE_ADMIN',
            description: `تم إنشاء حساب مسؤول جديد: ${username}`,
            user: req.user,
            targetId: admin._id,
            targetType: 'Admin',
            metadata: { username },
            req
        });
        
        res.json({
            success: true,
            message: 'تم إنشاء الحساب بنجاح',
            data: {
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء الحساب',
            error: error.message
        });
    }
});

// Delete admin (superadmin only)
router.delete('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'الحساب غير موجود'
            });
        }
        
        // Prevent deleting superadmin
        if (admin.role === 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'لا يمكن حذف حساب المسؤول الرئيسي'
            });
        }
        
        // Prevent deleting yourself
        if (admin._id.toString() === req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'لا يمكنك حذف حسابك الخاص'
            });
        }
        
        await Admin.findByIdAndDelete(req.params.id);
        
        // Log action
        await createLog({
            action: 'DELETE_ADMIN',
            description: `تم حذف حساب مسؤول: ${admin.username}`,
            user: req.user,
            targetId: admin._id,
            targetType: 'Admin',
            metadata: { username: admin.username },
            req
        });
        
        res.json({
            success: true,
            message: 'تم حذف الحساب بنجاح'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف الحساب'
        });
    }
});

// Check if current user is superadmin
router.get('/check-superadmin', authenticateToken, async (req, res) => {
    res.json({
        success: true,
        isSuperAdmin: req.user.role === 'superadmin'
    });
});

module.exports = router;
