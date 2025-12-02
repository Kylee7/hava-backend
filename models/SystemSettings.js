const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    description: String
}, {
    timestamps: true
});

// Index for faster queries
systemSettingsSchema.index({ key: 1 });

// Static method to get a setting
systemSettingsSchema.statics.getSetting = async function(key, defaultValue = null) {
    const setting = await this.findOne({ key });
    return setting ? setting.value : defaultValue;
};

// Static method to set a setting
systemSettingsSchema.statics.setSetting = async function(key, value, description = '') {
    return await this.findOneAndUpdate(
        { key },
        { value, description },
        { upsert: true, new: true }
    );
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
