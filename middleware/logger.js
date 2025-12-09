const ActivityLog = require('../models/ActivityLog');

// Helper function to create log
async function createLog({ action, description, user, targetId, targetType, metadata, req }) {
    try {
        const log = new ActivityLog({
            action,
            description,
            user: user ? {
                username: user.username,
                userId: user._id || user.id
            } : null,
            targetId,
            targetType,
            metadata,
            ipAddress: req ? req.ip || req.connection.remoteAddress : null,
            userAgent: req ? req.get('user-agent') : null
        });
        
        await log.save();
        return log;
    } catch (error) {
        console.error('Error creating log:', error);
        // Don't throw error to prevent breaking the main operation
    }
}

// Middleware to log actions
function logAction(action, getDescription) {
    return async (req, res, next) => {
        // Store original methods
        const originalJson = res.json;
        const originalSend = res.send;
        
        // Override json method
        res.json = function(data) {
            // Only log if successful
            if (data && data.success) {
                const description = typeof getDescription === 'function' 
                    ? getDescription(req, data)
                    : getDescription;
                
                createLog({
                    action,
                    description,
                    user: req.user,
                    targetId: data.data?._id || req.params.id,
                    targetType: action.split('_')[1], // Extract type from action name
                    metadata: {
                        body: req.body,
                        params: req.params
                    },
                    req
                });
            }
            
            return originalJson.call(this, data);
        };
        
        next();
    };
}

module.exports = { createLog, logAction };
