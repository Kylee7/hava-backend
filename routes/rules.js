const express = require('express');
const router = express.Router();
const RuleSection = require('../models/RuleSection');
const { authenticateToken } = require('../middleware/auth');

// Get all sections (public - for frontend display)
router.get('/', async (req, res) => {
    try {
        const sections = await RuleSection.find({ active: true }).sort({ order: 1 });
        
        res.json({
            success: true,
            data: sections
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في جلب القوانين',
            error: error.message
        });
    }
});

// Get all sections including inactive (admin only)
router.get('/all', authenticateToken, async (req, res) => {
    try {
        const sections = await RuleSection.find().sort({ order: 1 });
        
        res.json({
            success: true,
            data: sections
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في جلب القوانين',
            error: error.message
        });
    }
});

// Get single section
router.get('/:id', async (req, res) => {
    try {
        const section = await RuleSection.findById(req.params.id);
        
        if (!section) {
            return res.status(404).json({
                success: false,
                message: 'القسم غير موجود'
            });
        }
        
        res.json({
            success: true,
            data: section
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في جلب القسم',
            error: error.message
        });
    }
});

// Create new section (admin only)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, icon, type, content, rules, tableHeaders, tableRows, notes, cardStyle } = req.body;
        
        // Get the highest order number
        const maxOrder = await RuleSection.findOne().sort({ order: -1 }).select('order');
        const newOrder = maxOrder ? maxOrder.order + 1 : 0;
        
        const section = new RuleSection({
            title,
            icon: icon || 'fa-gavel',
            type: type || 'list',
            order: newOrder,
            content,
            rules,
            tableHeaders,
            tableRows,
            notes,
            cardStyle: cardStyle || 'normal'
        });
        
        await section.save();
        
        res.status(201).json({
            success: true,
            message: 'تم إضافة القسم بنجاح',
            data: section
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في إضافة القسم',
            error: error.message
        });
    }
});

// Update section (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { title, icon, type, content, rules, tableHeaders, tableRows, notes, cardStyle, active } = req.body;
        
        const section = await RuleSection.findById(req.params.id);
        
        if (!section) {
            return res.status(404).json({
                success: false,
                message: 'القسم غير موجود'
            });
        }
        
        // Update fields
        if (title !== undefined) section.title = title;
        if (icon !== undefined) section.icon = icon;
        if (type !== undefined) section.type = type;
        if (content !== undefined) section.content = content;
        if (rules !== undefined) section.rules = rules;
        if (tableHeaders !== undefined) section.tableHeaders = tableHeaders;
        if (tableRows !== undefined) section.tableRows = tableRows;
        if (notes !== undefined) section.notes = notes;
        if (cardStyle !== undefined) section.cardStyle = cardStyle;
        if (active !== undefined) section.active = active;
        
        await section.save();
        
        res.json({
            success: true,
            message: 'تم تحديث القسم بنجاح',
            data: section
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في تحديث القسم',
            error: error.message
        });
    }
});

// Delete section (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const section = await RuleSection.findByIdAndDelete(req.params.id);
        
        if (!section) {
            return res.status(404).json({
                success: false,
                message: 'القسم غير موجود'
            });
        }
        
        // Reorder remaining sections
        await RuleSection.updateMany(
            { order: { $gt: section.order } },
            { $inc: { order: -1 } }
        );
        
        res.json({
            success: true,
            message: 'تم حذف القسم بنجاح'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في حذف القسم',
            error: error.message
        });
    }
});

// Reorder section (admin only)
router.put('/:id/reorder', authenticateToken, async (req, res) => {
    try {
        const { newOrder } = req.body;
        
        if (newOrder === undefined || newOrder < 0) {
            return res.status(400).json({
                success: false,
                message: 'الترتيب الجديد غير صحيح'
            });
        }
        
        const section = await RuleSection.reorder(req.params.id, newOrder);
        
        res.json({
            success: true,
            message: 'تم تغيير الترتيب بنجاح',
            data: section
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في تغيير الترتيب',
            error: error.message
        });
    }
});

// Add rule to section (admin only)
router.post('/:id/rules', authenticateToken, async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'نص القانون مطلوب'
            });
        }
        
        const section = await RuleSection.findById(req.params.id);
        
        if (!section) {
            return res.status(404).json({
                success: false,
                message: 'القسم غير موجود'
            });
        }
        
        await section.addRule(text);
        
        res.status(201).json({
            success: true,
            message: 'تم إضافة القانون بنجاح',
            data: section
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في إضافة القانون',
            error: error.message
        });
    }
});

// Update rule in section (admin only)
router.put('/:id/rules/:ruleId', authenticateToken, async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'نص القانون مطلوب'
            });
        }
        
        const section = await RuleSection.findById(req.params.id);
        
        if (!section) {
            return res.status(404).json({
                success: false,
                message: 'القسم غير موجود'
            });
        }
        
        await section.updateRule(req.params.ruleId, text);
        
        res.json({
            success: true,
            message: 'تم تحديث القانون بنجاح',
            data: section
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في تحديث القانون',
            error: error.message
        });
    }
});

// Delete rule from section (admin only)
router.delete('/:id/rules/:ruleId', authenticateToken, async (req, res) => {
    try {
        const section = await RuleSection.findById(req.params.id);
        
        if (!section) {
            return res.status(404).json({
                success: false,
                message: 'القسم غير موجود'
            });
        }
        
        await section.removeRule(req.params.ruleId);
        
        res.json({
            success: true,
            message: 'تم حذف القانون بنجاح',
            data: section
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في حذف القانون',
            error: error.message
        });
    }
});

module.exports = router;
