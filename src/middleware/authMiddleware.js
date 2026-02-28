const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dashdrive_enterprise_secret';

/**
 * Middleware to verify Merchant JWT tokens.
 */
const authenticateMerchant = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access Denied: No Token Provided' });
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid Token' });
    }
};

/**
 * Middleware for Role-Based Access Control (RBAC).
 */
const authorizeRole = (requiredRoles) => {
    return (req, res, next) => {
        if (!req.user || !requiredRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient Permissions' });
        }
        next();
    };
};

module.exports = { authenticateMerchant, authorizeRole };
