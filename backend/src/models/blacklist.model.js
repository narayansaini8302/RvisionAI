// models/blacklist.model.js
const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,   
        required: true,
        unique: true
    }
}, { 
    timestamps: true 
});

// ✅ Auto-delete blacklisted tokens after 7 days
blacklistSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

module.exports = mongoose.model('Blacklist', blacklistSchema);