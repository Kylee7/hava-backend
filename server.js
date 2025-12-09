const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middleware
// CORS configuration with trailing slash fix
const frontendUrl = (process.env.FRONTEND_URL || '*').replace(/\/$/, ''); // Remove trailing slash
app.use(cors({
    origin: frontendUrl,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use('/api/', limiter);

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('✅ Connected to MongoDB successfully');
    initializeAdmin();
})
.catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
});

// Initialize admin account
async function initializeAdmin() {
    try {
        const Admin = require('./models/Admin');
        const bcrypt = require('bcryptjs');
        
        let admin = await Admin.findOne({ username: 'superadmin' });
        
        if (!admin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            admin = await Admin.create({
                username: 'superadmin',
                password: hashedPassword,
                email: 'admin@perfect-cfw.com',
                role: 'superadmin',
                active: true
            });
            console.log('✅ Admin created: superadmin / admin123');
        } else {
            if (admin.role !== 'superadmin') {
                admin.role = 'superadmin';
                await admin.save();
            }
            console.log('✅ Admin ready (superadmin)');
        }
    } catch (error) {
        console.error('⚠️ Admin setup warning:', error.message);
    }
}

// Routes - Core system
app.use('/api/products', require('./routes/products'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/discount-codes', require('./routes/discountCodes'));
app.use('/api/activity-logs', require('./routes/activityLogs'));
app.use('/api/admins', require('./routes/admins'));
app.use('/api/rules', require('./routes/rules'));

// Routes - Activation system
app.use('/api/discord-auth', require('./routes/discordAuth'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/notifications', require('./routes/notifications'));

// Initialize Discord Bot (optional)
try {
    if (process.env.DISCORD_BOT_TOKEN) {
        const discordBot = require('./discord-bot');
        console.log('🤖 Discord Bot initialized');
    } else {
        console.log('⚠️ Discord Bot disabled (no token)');
    }
} catch (error) {
    console.error('⚠️ Discord Bot initialization failed:', error.message);
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Perfect CFW Backend API is running',
        version: '2.0.0',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Perfect CFW API - Ready',
        version: '2.0.0'
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('🚀 Server running on port ' + PORT);
    console.log('🌐 Environment: ' + (process.env.NODE_ENV || 'production'));
    console.log('✨ Activation System: ENABLED');
});

module.exports = app;
