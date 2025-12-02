const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    discordId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    discriminator: {
        type: String,
        default: '0'
    },
    nickname: String,
    email: String,
    avatar: String,
    accessToken: String,
    refreshToken: String,
    hasApplied: {
        type: Boolean,
        default: false
    },
    applicationStatus: {
        type: String,
        enum: ['none', 'pending', 'accepted', 'rejected'],
        default: 'none'
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

userSchema.methods.getAvatarUrl = function() {
    if (!this.avatar) {
        const defaultNum = parseInt(this.discriminator || 0) % 5;
        return 'https://cdn.discordapp.com/embed/avatars/' + defaultNum + '.png';
    }
    return 'https://cdn.discordapp.com/avatars/' + this.discordId + '/' + this.avatar + '.png';
};

userSchema.methods.getFullUsername = function() {
    if (this.discriminator && this.discriminator !== '0') {
        return this.username + '#' + this.discriminator;
    }
    return '@' + this.username;
};

module.exports = mongoose.model('User', userSchema);
