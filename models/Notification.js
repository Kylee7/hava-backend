const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['application_accepted', 'application_rejected', 'general'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    rejectionReason: String,
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application'
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for faster queries
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
    return await this.countDocuments({ userId, isRead: false });
};

module.exports = mongoose.model('Notification', notificationSchema);
