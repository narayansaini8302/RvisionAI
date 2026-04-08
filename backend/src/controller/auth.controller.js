const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const blacklistModel = require('../models/blacklist.model');

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = async(req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if(!username || !email || !password) {
            return res.status(400).json({ message: 'Please enter username, email and password' });
        }
        
        const userAlreadyExists = await userModel.findOne({
            $or: [{ email }, { username }]
        });
        
        if (userAlreadyExists) {
            return res.status(400).json({ message: 'Email or username already exists' });
        }

        // Hash the password
        const hash = await bcrypt.hash(password, 10);
        const newUser = new userModel({ username, email, password: hash });
        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }, 
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        
        // Set the token in a cookie - CONSISTENT SETTINGS
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,           // Always true for production (HTTPS)
            sameSite: "none",       // Required for cross-domain requests (Vercel → Render)
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/"
        });
        
        res.status(201).json({ 
            message: 'User registered successfully',
            token: token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }   
}

/**
 * @desc Login a user
 * @route POST /api/auth/login
 * @access Public
 */
const login = async(req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }
        
        // Find user
        const user = await userModel.findOne({ email: email });
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Compare password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user._id,
                username: user.username,
                email: user.email
            }, 
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        
        // Set token in cookie - CONSISTENT with register
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,           // Always true for production
            sameSite: "none",       // Must match register
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/"
        });
        
        res.status(200).json({ 
            message: 'Login successful',
            token: token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

/**
 * @desc Logout a user
 * @route POST /api/auth/logout
 * @access Public
 */
const logout = async(req, res) => {
    try {
        console.log('Logout - Received cookies:', req.cookies);
        const token = req.cookies.token;
        
        if (!token) {
            console.log('Logout - No token found in cookies');
            return res.status(400).json({ message: 'No token provided' });
        }
        
        console.log('Logout - Token found, blacklisting...');
        
        // Add the token to the blacklist
        const blacklistedToken = new blacklistModel({ token });
        await blacklistedToken.save();
        
        console.log('Logout - Token blacklisted successfully');
        
        // Clear the token cookie - MUST MATCH THE SETTINGS USED IN LOGIN/REGISTER
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/"
        });
        
        console.log('Logout - Cookie cleared');
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Error logging out', error: error.message });
    }
}

/**
 * @route GET /api/auth/get-me
 * @desc Get the authenticated user's information
 * @access Private
 */
const getMe = async(req, res) => {
    try {
        console.log('GetMe called - User from middleware:', req.user);
        
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        
        const user = await userModel.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json({
            message: 'User information retrieved successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { register, login, logout, getMe };