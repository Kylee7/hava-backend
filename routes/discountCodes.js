const express = require('express');
const router = express.Router();
const DiscountCode = require('../models/DiscountCode');
const { authenticateToken } = require('../middleware/auth');
const { createLog } = require('../middleware/logger');

// Generate random code
function generateRandomCode(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Get all discount codes
router.get('/', authenticateToken, async (req, res) => {
    try {
        const codes = await DiscountCode.find().sort({ createdAt: -1 });
        
        // Add status to each code
        const codesWithStatus = codes.map(code => {
            const codeObj = code.toObject();
            codeObj.isValidNow = code.isValid();
            codeObj.daysRemaining = code.getDaysRemaining();
            return codeObj;
        });
        
        res.json({
            success: true,
            data: codesWithStatus
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في تحميل الأكواد',
            error: error.message
        });
    }
});

// Get active discount codes only (for frontend)
router.get('/active', async (req, res) => {
    try {
        const now = new Date();
        const codes = await DiscountCode.find({
            isActive: true,
            validFrom: { $lte: now },
            validUntil: { $gte: now }
        });
        
        res.json({
            success: true,
            data: codes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في تحميل الأكواد'
        });
    }
});

// Validate discount code (for frontend)
router.post('/validate', async (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'الرجاء إدخال كود الخصم'
            });
        }
        
        const discountCode = await DiscountCode.findOne({ 
            code: code.toUpperCase() 
        });
        
        if (!discountCode) {
            return res.status(404).json({
                success: false,
                message: 'كود الخصم غير موجود'
            });
        }
        
        if (!discountCode.isValid()) {
            return res.status(400).json({
                success: false,
                message: 'كود الخصم غير صالح أو منتهي الصلاحية'
            });
        }
        
        res.json({
            success: true,
            message: 'كود الخصم صالح',
            data: {
                code: discountCode.code,
                discountPercentage: discountCode.discountPercentage
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في التحقق من الكود'
        });
    }
});

// Apply discount code (increment usage)
router.post('/apply', async (req, res) => {
    try {
        const { code } = req.body;
        
        const discountCode = await DiscountCode.findOne({ 
            code: code.toUpperCase() 
        });
        
        if (!discountCode || !discountCode.isValid()) {
            return res.status(400).json({
                success: false,
                message: 'كود الخصم غير صالح'
            });
        }
        
        // Increment usage count
        discountCode.usedCount += 1;
        await discountCode.save();
        
        res.json({
            success: true,
            message: 'تم تطبيق كود الخصم',
            data: {
                discountPercentage: discountCode.discountPercentage
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في تطبيق الكود'
        });
    }
});

// Create new discount code
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { 
            code, 
            discountPercentage, 
            validDays,
            usageLimit,
            autoGenerate 
        } = req.body;
        
        // Validate input
        if (!discountPercentage || !validDays) {
            return res.status(400).json({
                success: false,
                message: 'الرجاء إدخال نسبة الخصم ومدة الصلاحية'
            });
        }
        
        if (discountPercentage < 1 || discountPercentage > 100) {
            return res.status(400).json({
                success: false,
                message: 'نسبة الخصم يجب أن تكون بين 1 و 100'
            });
        }
        
        // Generate or use provided code
        let finalCode;
        if (autoGenerate) {
            // Generate unique random code
            let isUnique = false;
            while (!isUnique) {
                finalCode = generateRandomCode();
                const existing = await DiscountCode.findOne({ code: finalCode });
                if (!existing) isUnique = true;
            }
        } else {
            if (!code) {
                return res.status(400).json({
                    success: false,
                    message: 'الرجاء إدخال كود الخصم'
                });
            }
            finalCode = code.toUpperCase().trim();
            
            // Check if code already exists
            const existing = await DiscountCode.findOne({ code: finalCode });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'هذا الكود موجود بالفعل'
                });
            }
        }
        
        // Calculate valid until date
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + parseInt(validDays));
        
        // Create discount code
        const discountCode = new DiscountCode({
            code: finalCode,
            discountPercentage: parseInt(discountPercentage),
            validUntil,
            usageLimit: usageLimit ? parseInt(usageLimit) : null,
            createdBy: req.user.username || 'Admin'
        });
        
        await discountCode.save();
        
        // Log action
        await createLog({
            action: 'CREATE_DISCOUNT_CODE',
            description: `تم إنشاء كود خصم: ${discountCode.code} بنسبة ${discountCode.discountPercentage}%`,
            user: req.user,
            targetId: discountCode._id,
            targetType: 'DiscountCode',
            metadata: { code: discountCode.code, discount: discountCode.discountPercentage },
            req
        });
        
        res.json({
            success: true,
            message: 'تم إنشاء كود الخصم بنجاح',
            data: discountCode
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء الكود',
            error: error.message
        });
    }
});

// Update discount code
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { isActive, discountPercentage, validDays } = req.body;
        
        const discountCode = await DiscountCode.findById(req.params.id);
        
        if (!discountCode) {
            return res.status(404).json({
                success: false,
                message: 'الكود غير موجود'
            });
        }
        
        // Update fields
        if (isActive !== undefined) discountCode.isActive = isActive;
        if (discountPercentage) discountCode.discountPercentage = discountPercentage;
        if (validDays) {
            const validUntil = new Date();
            validUntil.setDate(validUntil.getDate() + parseInt(validDays));
            discountCode.validUntil = validUntil;
        }
        
        await discountCode.save();
        
        res.json({
            success: true,
            message: 'تم تحديث الكود بنجاح',
            data: discountCode
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث الكود'
        });
    }
});

// Delete discount code
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const discountCode = await DiscountCode.findByIdAndDelete(req.params.id);
        
        if (!discountCode) {
            return res.status(404).json({
                success: false,
                message: 'الكود غير موجود'
            });
        }
        
        // Log action
        await createLog({
            action: 'DELETE_DISCOUNT_CODE',
            description: `تم حذف كود خصم: ${discountCode.code}`,
            user: req.user,
            targetId: discountCode._id,
            targetType: 'DiscountCode',
            metadata: { code: discountCode.code },
            req
        });
        
        res.json({
            success: true,
            message: 'تم حذف الكود بنجاح'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف الكود'
        });
    }
});

module.exports = router;
