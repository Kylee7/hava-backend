const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET: جلب جميع المنتجات (عام - للموقع)
router.get('/', async (req, res) => {
    try {
        const { category, featured } = req.query;
        
        let filter = { active: true };
        if (category) filter.category = category;
        if (featured) filter.featured = true;

        const products = await Product.find(filter).sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المنتجات',
            error: error.message
        });
    }
});

// GET: جلب منتج واحد بالـ ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المنتج',
            error: error.message
        });
    }
});

// POST: إضافة منتج جديد (يحتاج صلاحية Admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();

        res.status(201).json({
            success: true,
            message: 'تم إضافة المنتج بنجاح',
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'خطأ في إضافة المنتج',
            error: error.message
        });
    }
});

// PUT: تعديل منتج (يحتاج صلاحية Admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }

        res.json({
            success: true,
            message: 'تم تعديل المنتج بنجاح',
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'خطأ في تعديل المنتج',
            error: error.message
        });
    }
});

// DELETE: حذف منتج (يحتاج صلاحية Admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'المنتج غير موجود'
            });
        }

        res.json({
            success: true,
            message: 'تم حذف المنتج بنجاح'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف المنتج',
            error: error.message
        });
    }
});

// GET: احصائيات المنتجات (Admin)
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const activeProducts = await Product.countDocuments({ active: true });
        const categories = await Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                total: totalProducts,
                active: activeProducts,
                categories
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الإحصائيات',
            error: error.message
        });
    }
});

module.exports = router;
