const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const blacklistModel = require('../models/blacklist.model');

/**
 * @desc Register a new user
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

        const hash = await bcrypt.hash(password, 10);
        const newUser = new userModel({ username, email, password: hash });
        await newUser.save();

        // Check JWT_SECRET
        if (!process.env.JWT_SECRET) {
            console.error('❌ JWT_SECRET is not set!');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        const token = jwt.sign(
            { 
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }, 
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        
        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/"
        });
        
        console.log('✅ User registered:', email);
        
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
        console.error('❌ Register error:', error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }   
};

/**
 * @desc Login a user
 */
const login = async(req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }
        
        const user = await userModel.findOne({ email: email });
        
        if (!user) {
            console.log('❌ Login failed: User not found -', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log('❌ Login failed: Invalid password -', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        if (!process.env.JWT_SECRET) {
            console.error('❌ JWT_SECRET is not set!');
            return res.status(500).json({ message: 'Server configuration error' });
        }
        
        const token = jwt.sign(
            { 
                id: user._id,
                username: user.username,
                email: user.email
            }, 
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/"
        });
        
        console.log('✅ User logged in:', email);
        
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
        console.error('❌ Login error:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

// ... rest of the file remains the same (logout, getMe)

module.exports = { register, login, logout, getMe };