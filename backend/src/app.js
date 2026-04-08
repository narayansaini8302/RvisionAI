// backend/src/app.js
const express = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration - directly in app.js (simpler)
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://rvision-ai.vercel.app',
    'https://rvisionai-backend.onrender.com'
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin
        if (!origin) return callback(null, true);
        
        // Check exact match
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // Allow all Vercel preview URLs
        if (origin.includes('.vercel.app')) {
            return callback(null, true);
        }
        
        console.log('⚠️ Blocked origin:', origin);
        callback(null, true); // Temporarily allow all for debugging
        // callback(new Error('Not allowed by CORS')); // Use this in production
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie']
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'RvisionAI API is running',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            interview: '/api/interview',
            health: '/health'
        }
    });
});

// Routes
const authRouter = require('./routes/auth.route');
const interviewRouter = require('./routes/interview.route');

app.use('/api/auth', authRouter);
app.use('/api/interview', interviewRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        path: req.originalUrl
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ error: 'CORS not allowed' });
    }
    
    res.status(err.status || 500).json({ 
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message 
    });
});

module.exports = app;