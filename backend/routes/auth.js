// ============================================
// AUTH ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

// ===== REGISTER =====
router.post('/register', [
    body('email').isEmail().normalizeEmail(),
    body('username').isLength({ min: 3 }).trim(),
    body('password').isLength({ min: 6 })
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, name } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            throw new AppError('User already exists', 400);
        }

        const user = new User({ username, email, password, name });
        await user.save();

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                name: user.name,
                prayers: user.prayers,
                quranPages: user.quranPages,
                streakDays: user.streakDays
            }
        });
    } catch (error) {
        next(error);
    }
});

// ===== LOGIN =====
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new AppError('Invalid credentials', 401);
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                name: user.name,
                prayers: user.prayers,
                quranPages: user.quranPages,
                streakDays: user.streakDays,
                achievements: user.achievements
            }
        });
    } catch (error) {
        next(error);
    }
});

// ===== GET CURRENT USER =====
router.get('/me', auth, async (req, res, next) => {
    try {
        res.json({
            success: true,
            user: {
                id: req.user._id,
                username: req.user.username,
                email: req.user.email,
                name: req.user.name,
                prayers: req.user.prayers,
                quranPages: req.user.quranPages,
                quranVersesMemorized: req.user.quranVersesMemorized,
                hadithRead: req.user.hadithRead,
                streakDays: req.user.streakDays,
                achievements: req.user.achievements,
                preferences: req.user.preferences
            }
        });
    } catch (error) {
        next(error);
    }
});

// ===== LOGOUT (client side) =====
router.post('/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
