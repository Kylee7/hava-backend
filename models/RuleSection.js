const mongoose = require('mongoose');

// Schema for individual rules
const ruleSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    order: {
        type: Number,
        default: 0
    }
});

// Schema for rule sections
const ruleSectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    icon: {
        type: String,
        default: 'fa-gavel'
    },
    type: {
        type: String,
        enum: ['list', 'table', 'text', 'custom'],
        default: 'list'
    },
    order: {
        type: Number,
        default: 0
    },
    active: {
        type: Boolean,
        default: true
    },
    // For list type sections
    rules: [ruleSchema],
    
    // For text type sections (like Safe Zones)
    content: {
        type: String,
        default: ''
    },
    
    // For table type sections (like Warnings)
    tableHeaders: [{
        type: String
    }],
    tableRows: [{
        cells: [String]
    }],
    
    // Additional notes for the section
    notes: [{
        type: String
    }],
    
    // Styling options
    cardStyle: {
        type: String,
        enum: ['normal', 'warning', 'info', 'success'],
        default: 'normal'
    }
}, {
    timestamps: true
});

// Methods
ruleSectionSchema.methods.addRule = function(ruleText) {
    const maxNumber = this.rules.length > 0 
        ? Math.max(...this.rules.map(r => r.number))
        : 0;
    
    this.rules.push({
        number: maxNumber + 1,
        text: ruleText,
        order: this.rules.length
    });
    
    return this.save();
};

ruleSectionSchema.methods.removeRule = function(ruleId) {
    this.rules = this.rules.filter(r => r._id.toString() !== ruleId);
    
    // Reorder remaining rules
    this.rules.forEach((rule, index) => {
        rule.number = index + 1;
        rule.order = index;
    });
    
    return this.save();
};

ruleSectionSchema.methods.updateRule = function(ruleId, newText) {
    const rule = this.rules.id(ruleId);
    if (rule) {
        rule.text = newText;
        return this.save();
    }
    return Promise.reject(new Error('Rule not found'));
};

// Static methods
ruleSectionSchema.statics.getActiveSections = function() {
    return this.find({ active: true }).sort({ order: 1 });
};

ruleSectionSchema.statics.reorder = async function(sectionId, newOrder) {
    const section = await this.findById(sectionId);
    if (!section) throw new Error('Section not found');
    
    const oldOrder = section.order;
    
    if (newOrder > oldOrder) {
        // Moving down
        await this.updateMany(
            { order: { $gt: oldOrder, $lte: newOrder } },
            { $inc: { order: -1 } }
        );
    } else if (newOrder < oldOrder) {
        // Moving up
        await this.updateMany(
            { order: { $gte: newOrder, $lt: oldOrder } },
            { $inc: { order: 1 } }
        );
    }
    
    section.order = newOrder;
    return section.save();
};

module.exports = mongoose.model('RuleSection', ruleSectionSchema);
