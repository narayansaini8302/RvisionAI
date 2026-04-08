const jwt = require('jsonwebtoken');
const blacklistModel = require('../models/blacklist.model');

async function authUser(req, res, next) {
    try {
        let token = null;
        
        // Check Authorization header first
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
            console.log('✅ Token found in Authorization header');
        }
        
        // Fallback to cookie if no header
        if (!token && req.cookies && req.cookies.token) {
            token = req.cookies.token;
            console.log('✅ Token found in cookie');
        }
        
        if (!token) {
            console.log('❌ No token provided');
            return res.status(401).json({ message: 'No token provided. Please login.' });
        }

        // Check if token is blacklisted
        const isBlacklisted = await blacklistModel.findOne({ token });
        if (isBlacklisted) {
            console.log('❌ Token is blacklisted');
            return res.status(401).json({ message: 'Token is invalid. Please login again.' });
        }

        // Verify token
        if (!process.env.JWT_SECRET) {
            console.error('❌ JWT_SECRET is not set in environment variables');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token verified for user:', decoded.email || decoded.id);
        
        req.user = decoded;
        next();
        
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired. Please login again.' });
        }
        
        return res.status(401).json({ message: 'Authentication failed' });
    }
}

module.exports = { authUser };