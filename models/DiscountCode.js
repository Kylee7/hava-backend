const mongoose = require('mongoose');

const discountCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountPercentage: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    usageLimit: {
        type: Number,
        default: null // null = unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: String,
        default: 'Admin'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Check if code is valid
discountCodeSchema.methods.isValid = function() {
    const now = new Date();
    
    // Check if active
    if (!this.isActive) return false;
    
    // Check date range
    if (now < this.validFrom || now > this.validUntil) return false;
    
    // Check usage limit
    if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
    
    return true;
};

// Get days remaining
discountCodeSchema.methods.getDaysRemaining = function() {
    const now = new Date();
    const diff = this.validUntil - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

module.exports = mongoose.model('DiscountCode', discountCodeSchema);
