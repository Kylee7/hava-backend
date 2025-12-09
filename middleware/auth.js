const jwt = require('jsonwebtoken');

// Middleware للتحقق من صلاحية الـ Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'لا يوجد صلاحية - يرجى تسجيل الدخول' 
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                success: false, 
                message: 'صلاحية غير صالحة' 
            });
        }
        req.user = user;
        next();
    });
};

// Middleware للتحقق من صلاحية الأدمن
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        return res.status(403).json({ 
            success: false, 
            message: 'ليس لديك صلاحية للوصول' 
        });
    }
    next();
};

// Middleware للتحقق من صلاحية السوبر أدمن فقط
const requireSuperAdmin = (req, res, next) => {
    if (req.user.role !== 'superadmin') {
        return res.status(403).json({ 
            success: false, 
            message: 'هذه الصفحة مخصصة للمسؤول الرئيسي فقط' 
        });
    }
    next();
};

module.exports = { authenticateToken, requireAdmin, requireSuperAdmin };
