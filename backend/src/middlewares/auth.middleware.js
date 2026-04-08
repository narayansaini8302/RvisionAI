// middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const blacklistModel = require('../models/blacklist.model');

// async function authUser(req, res, next) {  // ✅ Add async
//     try {
//         const token = req.cookies.token;
        
//         if (!token) {
//             return res.status(401).json({ message: 'No token provided' });
//         }
        
//         // ✅ Add await here
//         const isBlacklisted = await blacklistModel.findOne({ token });
//         if (isBlacklisted) {
//             return res.status(401).json({ message: 'Token is blacklisted' });
//         }
        
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded;
//         next();
//     } catch (error) {
//         console.error('Auth middleware error:', error);
        
//         if (error.name === 'JsonWebTokenError') {
//             return res.status(401).json({ message: 'Invalid token' });
//         }
//         if (error.name === 'TokenExpiredError') {
//             return res.status(401).json({ message: 'Token expired' });
//         }
        
//         res.status(401).json({ message: 'Authentication failed', error: error.message });
//     }
// }
async function authUser(req, res, next) {
    try {
        // 🔥 FIX: Read from header instead of cookies
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];

        const isBlacklisted = await blacklistModel.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ message: 'Token is blacklisted' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);

        return res.status(401).json({ message: 'Authentication failed' });
    }
}
module.exports = { authUser };