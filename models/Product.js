const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    nameEn: {
        type: String,
        required: false,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['vehicles', 'money', 'planes', 'properties', 'xp', 'vip', 'premium', 'other']
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    stockText: {
        type: String,
        default: 'يوجد'
    },
    image: {
        type: String,
        default: null
    },
    icon: {
        type: String,
        default: 'fas fa-box'
    },
    description: {
        type: String,
        default: ''
    },
    featured: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
