const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { authenticateToken } = require('../middleware/auth');

// POST: تسجيل دخول الأدمن
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // التحقق من وجود البيانات
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'يرجى إدخال اسم المستخدم وكلمة المرور'
            });
        }

        // البحث عن الأدمن
        const admin = await Admin.findOne({ username, active: true });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
            });
        }

        // التحقق من كلمة المرور
        const isMatch = await admin.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
            });
        }

        // إنشاء Token
        const token = jwt.sign(
            { 
                id: admin._id, 
                username: admin.username,
                role: admin.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                role: admin.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في تسجيل الدخول',
            error: error.message
        });
    }
});

// GET: التحقق من صلاحية Token
router.get('/verify', authenticateToken, async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id).select('-password');
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        res.json({
            success: true,
            admin: {
                id: admin._id,
                username: admin.username,
                role: admin.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في التحقق',
            error: error.message
        });
    }
});

// POST: إنشاء أدمن جديد (للمرة الأولى فقط أو من superadmin)
router.post('/create-admin', async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // التحقق من عدم وجود أدمن بنفس الاسم
        const existingAdmin = await Admin.findOne({ username });
        
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'اسم المستخدم موجود بالفعل'
            });
        }

        const admin = new Admin({
            username,
            password,
            email,
            role: 'admin'
        });

        await admin.save();

        res.status(201).json({
            success: true,
            message: 'تم إنشاء حساب الأدمن بنجاح',
            admin: {
                username: admin.username,
                email: admin.email
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'خطأ في إنشاء الحساب',
            error: error.message
        });
    }
});

module.exports = router;
