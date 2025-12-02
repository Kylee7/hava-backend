const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    discordId: {
        type: String,
        required: true
    },
    basicAnswers: {
        realName: {
            type: String,
            required: true
        },
        realAge: {
            type: Number,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    randomAnswers: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question'
        },
        questionText: String,
        answer: String
    }],
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    reviewedAt: Date,
    rejectionReason: String
}, {
    timestamps: true
});

// Index for faster queries
applicationSchema.index({ userId: 1 });
applicationSchema.index({ discordId: 1 });
applicationSchema.index({ status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
