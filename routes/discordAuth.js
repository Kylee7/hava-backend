const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');

const DISCORD_API = 'https://discord.com/api/v10';
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Get Discord OAuth URL
router.get('/discord', async (req, res) => {
    try {
        const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20email`;
        
        res.json({
            success: true,
            url: authUrl
        });
    } catch (error) {
        console.error('Error generating Discord URL:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إنشاء رابط Discord'
        });
    }
});

// Discord OAuth Callback
router.get('/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.redirect(`${FRONTEND_URL}/activation.html?error=no_code`);
    }

    try {
        // Exchange code for access token
        const tokenResponse = await axios.post(
            `${DISCORD_API}/oauth2/token`,
            new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, refresh_token } = tokenResponse.data;

        // Get user info from Discord
        const userResponse = await axios.get(`${DISCORD_API}/users/@me`, {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });

        const discordUser = userResponse.data;

        // Find or create user in database
        let user = await User.findOne({ discordId: discordUser.id });

        if (user) {
            // Update existing user
            user.username = discordUser.username;
            user.discriminator = discordUser.discriminator || '0';
            user.email = discordUser.email;
            user.avatar = discordUser.avatar;
            user.accessToken = access_token;
            user.refreshToken = refresh_token;
            user.lastLogin = new Date();
            await user.save();
        } else {
            // Create new user
            user = await User.create({
                discordId: discordUser.id,
                username: discordUser.username,
                discriminator: discordUser.discriminator || '0',
                email: discordUser.email,
                avatar: discordUser.avatar,
                accessToken: access_token,
                refreshToken: refresh_token
            });
        }

        // Redirect to frontend with user ID
        res.redirect(`${FRONTEND_URL}/auth-success.html?userId=${user._id}&discordId=${user.discordId}`);

    } catch (error) {
        console.error('Discord OAuth error:', error.response?.data || error.message);
        res.redirect(`${FRONTEND_URL}/activation.html?error=auth_failed`);
    }
});

// Get current user info
router.get('/me', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID مطلوب'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        res.json({
            success: true,
            data: {
                id: user._id,
                discordId: user.discordId,
                username: user.username,
                discriminator: user.discriminator,
                fullUsername: user.discriminator ? `${user.username}#${user.discriminator}` : user.username,
                email: user.email,
                avatar: user.getAvatarUrl(),
                nickname: user.nickname || user.username,
                hasApplied: user.hasApplied,
                applicationStatus: user.applicationStatus
            }
        });

    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب بيانات المستخدم'
        });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    try {
        // In a real app, you might want to invalidate the token
        res.json({
            success: true,
            message: 'تم تسجيل الخروج بنجاح'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في تسجيل الخروج'
        });
    }
});

module.exports = router;
