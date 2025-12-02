const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { authenticateToken } = require('../middleware/auth');

// Get all questions (Admin only)
router.get('/all', authenticateToken, async (req, res) => {
    try {
        const { type, isBasic, active } = req.query;
        
        let filter = {};
        if (type) filter.type = type;
        if (isBasic !== undefined) filter.isBasic = isBasic === 'true';
        if (active !== undefined) filter.active = active === 'true';

        const questions = await Question.find(filter).sort({ isBasic: -1, order: 1, createdAt: -1 });

        res.json({
            success: true,
            data: questions
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الأسئلة'
        });
    }
});

// Get questions for application (Public - returns basic + random)
router.get('/for-application', async (req, res) => {
    try {
        // Get basic questions (always shown, in order)
        const basicQuestions = await Question.getBasicQuestions();

        // Get 5 random questions from non-basic active questions
        const randomQuestions = await Question.getRandomQuestions(5);

        res.json({
            success: true,
            data: {
                basic: basicQuestions,
                random: randomQuestions
            }
        });
    } catch (error) {
        console.error('Error fetching application questions:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الأسئلة'
        });
    }
});

// Get single question (Admin only)
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'السؤال غير موجود'
            });
        }

        res.json({
            success: true,
            data: question
        });
    } catch (error) {
        console.error('Error fetching question:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب السؤال'
        });
    }
});

// Create question (Admin only)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { text, type, isRequired, isBasic, order, placeholder, validation } = req.body;

        if (!text || !type) {
            return res.status(400).json({
                success: false,
                message: 'نص السؤال والنوع مطلوبان'
            });
        }

        const question = await Question.create({
            text,
            type,
            isRequired: isRequired !== undefined ? isRequired : true,
            isBasic: isBasic || false,
            order: order || 0,
            placeholder: placeholder || '',
            validation: validation || {},
            active: true
        });

        res.status(201).json({
            success: true,
            message: 'تم إضافة السؤال بنجاح',
            data: question
        });
    } catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إضافة السؤال'
        });
    }
});

// Update question (Admin only)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { text, type, isRequired, isBasic, order, placeholder, validation, active } = req.body;

        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'السؤال غير موجود'
            });
        }

        // Update fields
        if (text !== undefined) question.text = text;
        if (type !== undefined) question.type = type;
        if (isRequired !== undefined) question.isRequired = isRequired;
        if (isBasic !== undefined) question.isBasic = isBasic;
        if (order !== undefined) question.order = order;
        if (placeholder !== undefined) question.placeholder = placeholder;
        if (validation !== undefined) question.validation = validation;
        if (active !== undefined) question.active = active;

        await question.save();

        res.json({
            success: true,
            message: 'تم تحديث السؤال بنجاح',
            data: question
        });
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث السؤال'
        });
    }
});

// Delete question (Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'السؤال غير موجود'
            });
        }

        res.json({
            success: true,
            message: 'تم حذف السؤال بنجاح'
        });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف السؤال'
        });
    }
});

// Toggle question active status (Admin only)
router.patch('/:id/toggle', authenticateToken, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'السؤال غير موجود'
            });
        }

        question.active = !question.active;
        await question.save();

        res.json({
            success: true,
            message: `تم ${question.active ? 'تفعيل' : 'إلغاء تفعيل'} السؤال`,
            data: question
        });
    } catch (error) {
        console.error('Error toggling question:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تغيير حالة السؤال'
        });
    }
});

module.exports = router;
