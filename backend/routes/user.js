// ============================================
// USER ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

// ===== GET USER PROFILE =====
router.get('/profile', auth, async (req, res) => {
    res.json({
        success: true,
        data: {
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
            preferences: req.user.preferences,
            createdAt: req.user.createdAt
        }
    });
});

// ===== UPDATE USER PROFILE =====
router.put('/profile', auth, async (req, res, next) => {
    try {
        const { name, preferences } = req.body;
        
        if (name) req.user.name = name;
        if (preferences) {
            req.user.preferences = { ...req.user.preferences, ...preferences };
        }

        await req.user.save();
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                name: req.user.name,
                preferences: req.user.preferences
            }
        });
    } catch (error) {
        next(error);
    }
});

// ===== GET USER STATS =====
router.get('/stats', auth, async (req, res) => {
    res.json({
        success: true,
        data: {
            prayers: req.user.prayers || 0,
            quranPages: req.user.quranPages || 0,
            quranVersesMemorized: req.user.quranVersesMemorized || 0,
            hadithRead: req.user.hadithRead || 0,
            streakDays: req.user.streakDays || 0,
            achievements: req.user.achievements || []
        }
    });
});

// ===== GET ACHIEVEMENTS =====
router.get('/achievements', auth, async (req, res) => {
    const allAchievements = [
        { id: 'quran_reader', name: '📖 Quran Reader', description: 'Read 100 pages', earned: req.user.achievements.includes('quran_reader') },
        { id: 'prayer_30_days', name: '🕌 30 Days Prayer', description: 'Track prayers for 30 days', earned: req.user.achievements.includes('prayer_30_days') },
        { id: 'dua_master', name: '🤲 Dua Master', description: 'Save 10 favorite duas', earned: req.user.achievements.includes('dua_master') },
        { id: 'hadith_50', name: '📚 50 Hadith', description: 'Read 50 hadith', earned: req.user.achievements.includes('hadith_50') },
        { id: 'tajweed_beginner', name: '⭐ Tajweed Beginner', description: 'Complete beginner tajweed', earned: req.user.achievements.includes('tajweed_beginner') },
        { id: 'streak_7_days', name: '🔥 7 Day Streak', description: 'Maintain 7 day streak', earned: req.user.achievements.includes('streak_7_days') },
        { id: 'quran_memorizer', name: '📖 Quran Memorizer', description: 'Memorize 5 verses', earned: req.user.achievements.includes('quran_memorizer') }
    ];

    res.json({
        success: true,
        data: {
            earned: req.user.achievements,
            all: allAchievements
        }
    });
});

// ===== UPDATE PREFERENCES =====
router.patch('/preferences', auth, async (req, res, next) => {
    try {
        const { theme, language, notifications } = req.body;
        
        if (theme) req.user.preferences.theme = theme;
        if (language) req.user.preferences.language = language;
        if (notifications) {
            req.user.preferences.notifications = {
                ...req.user.preferences.notifications,
                ...notifications
            };
        }

        await req.user.save();
        res.json({
            success: true,
            message: 'Preferences updated',
            data: req.user.preferences
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
