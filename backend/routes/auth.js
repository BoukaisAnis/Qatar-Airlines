const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { 
            userId: user._id,
            email: user.email,
            tier: user.tier 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
    );
};

// Validation middleware
const validateRegister = [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/\d/).withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/).withMessage('Password must contain at least one special character'),
    body('country').trim().notEmpty().withMessage('Country is required')
];

const validateLogin = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
];

// Register User
router.post('/register', validateRegister, async (req, res) => {
    try {
        console.log('📝 Register request received:', req.body.email);
        
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password, firstName, lastName, phone, country, newsletter } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'User already exists with this email'
            });
        }

        // Create new user
        const user = new User({
            firstName,
            lastName,
            email,
            phone,
            password,
            country,
            newsletter: newsletter || false,
            tier: 'Silver',
            avios: 2000
        });

        await user.save();
        console.log('✅ User registered:', user.email);

        // Generate token
        const token = generateToken(user);

        // Return user data and token
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                tier: user.tier,
                avios: user.avios,
                phone: user.phone,
                country: user.country
            }
        });

    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ 
            message: 'Error registering user',
            error: error.message 
        });
    }
});

// Login User
router.post('/login', validateLogin, async (req, res) => {
    try {
        console.log('🔐 Login request received:', req.body.email);
        
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password, remember } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid email or password'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({ 
                message: 'Account is deactivated'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: 'Invalid email or password'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token with longer expiry if remember me is checked
        const tokenExpiry = remember ? '30d' : '7d';
        const token = jwt.sign(
            { 
                userId: user._id,
                email: user.email,
                tier: user.tier 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: tokenExpiry }
        );

        console.log('✅ User logged in:', user.email);

        // Return user data and token
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                tier: user.tier,
                avios: user.avios,
                phone: user.phone,
                country: user.country,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ 
            message: 'Error logging in',
            error: error.message 
        });
    }
});

// Get User Profile (Protected)
router.get('/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ 
                message: 'No authorization header'
            });
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                message: 'No token provided'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Find user
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ 
                message: 'User not found'
            });
        }

        res.json({
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                tier: user.tier,
                avios: user.avios,
                phone: user.phone,
                country: user.country,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: 'Invalid token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token expired'
            });
        }
        console.error('❌ Profile error:', error);
        res.status(500).json({ 
            message: 'Error fetching profile',
            error: error.message 
        });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.json({ 
        message: 'Logged out successfully' 
    });
});

module.exports = router;