const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: [
            'LOGIN',
            'LOGOUT',
            'CREATE_PRODUCT',
            'UPDATE_PRODUCT',
            'DELETE_PRODUCT',
            'CREATE_DISCOUNT_CODE',
            'DELETE_DISCOUNT_CODE',
            'UPDATE_DISCOUNT_CODE',
            'CREATE_RULE',
            'UPDATE_RULE',
            'DELETE_RULE',
            'CREATE_RULE_CATEGORY',
            'UPDATE_RULE_CATEGORY',
            'DELETE_RULE_CATEGORY',
            'CREATE_ORDER',
            'OTHER'
        ]
    },
    description: {
        type: String,
        required: true
    },
    user: {
        username: String,
        userId: String
    },
    targetId: {
        type: String // ID of the affected resource
    },
    targetType: {
        type: String // Type of resource (Product, DiscountCode, Rule, etc.)
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed // Additional data
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ 'user.username': 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
