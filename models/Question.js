const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['text', 'number', 'email', 'textarea'],
        default: 'text'
    },
    isRequired: {
        type: Boolean,
        default: true
    },
    isBasic: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    },
    active: {
        type: Boolean,
        default: true
    },
    placeholder: {
        type: String,
        default: ''
    },
    validation: {
        minLength: Number,
        maxLength: Number,
        min: Number,
        max: Number
    }
}, {
    timestamps: true
});

questionSchema.statics.getRandomQuestions = async function(count = 5) {
    const randomQuestions = await this.aggregate([
        { $match: { active: true, isBasic: false } },
        { $sample: { size: count } }
    ]);
    return randomQuestions;
};

questionSchema.statics.getBasicQuestions = async function() {
    return await this.find({ active: true, isBasic: true }).sort({ order: 1 });
};

module.exports = mongoose.model('Question', questionSchema);
