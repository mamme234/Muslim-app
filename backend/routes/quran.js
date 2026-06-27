// ============================================
// QURAN ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { auth } = require('../middleware/auth');
const QuranProgress = require('../models/QuranProgress');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

const QURAN_API = 'https://api.alquran.cloud/v1';

// ===== GET ALL SURAHS =====
router.get('/surahs', async (req, res, next) => {
    try {
        const response = await fetch(`${QURAN_API}/meta`);
        const data = await response.json();
        if (data.code !== 200) {
            throw new AppError('Failed to fetch surahs', 500);
        }
        res.json({ success: true, data: data.data.surahs });
    } catch (error) {
        next(error);
    }
});

// ===== GET SURAH BY NUMBER =====
router.get('/surah/:number', async (req, res, next) => {
    try {
        const { number } = req.params;
        const { translation } = req.query;
        
        // Get Arabic text
        const arabicRes = await fetch(`${QURAN_API}/surah/${number}`);
        const arabicData = await arabicRes.json();
        
        if (arabicData.code !== 200) {
            throw new AppError('Surah not found', 404);
        }

        // Get translation if requested
        let translationData = null;
        if (translation && translation !== 'ar') {
            const langMap = {
                'en': 'english',
                'ur': 'urdu',
                'bn': 'bengali',
                'fr': 'french',
                'es': 'spanish'
            };
            const lang = langMap[translation] || 'english';
            const transRes = await fetch(`${QURAN_API}/surah/${number}/${lang}`);
            translationData = await transRes.json();
        }

        res.json({
            success: true,
            data: {
                surah: arabicData.data,
                translation: translationData?.data || null
            }
        });
    } catch (error) {
        next(error);
    }
});

// ===== GET AYAH =====
router.get('/ayah/:surah/:ayah', async (req, res, next) => {
    try {
        const { surah, ayah } = req.params;
        const response = await fetch(`${QURAN_API}/ayah/${surah}:${ayah}`);
        const data = await response.json();
        if (data.code !== 200) {
            throw new AppError('Ayah not found', 404);
        }
        res.json({ success: true, data: data.data });
    } catch (error) {
        next(error);
    }
});

// ===== SEARCH QURAN =====
router.get('/search', async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) {
            throw new AppError('Search query required', 400);
        }
        // Using external search API
        const response = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(q)}/all/en`);
        const data = await response.json();
        res.json({ success: true, data: data.data });
    } catch (error) {
        next(error);
    }
});

// ===== GET RECITERS =====
router.get('/reciters', async (req, res) => {
    const reciters = [
        { id: 1, name: 'Mishary Rashid Alafasy', style: 'Murattal' },
        { id: 2, name: 'Abdul Rahman Al-Sudais', style: 'Murattal' },
        { id: 3, name: 'Saad Al-Ghamdi', style: 'Murattal' },
        { id: 4, name: 'Maher Al-Muaiqly', style: 'Murattal' },
        { id: 5, name: 'Yasser Al-Dosari', style: 'Murattal' }
    ];
    res.json({ success: true, data: reciters });
});

// ===== SAVE QURAN PROGRESS (Authenticated) =====
router.post('/progress', auth, async (req, res, next) => {
    try {
        const { surah, ayah, memorized, accuracy } = req.body;
        
        let progress = await QuranProgress.findOne({
            userId: req.user._id,
            surah
        });

        if (!progress) {
            progress = new QuranProgress({
                userId: req.user._id,
                surah,
                ayah: ayah || 0,
                memorized: memorized || false,
                accuracy: accuracy || 0
            });
        } else {
            progress.ayah = ayah || progress.ayah;
            if (memorized) progress.memorized = true;
            if (accuracy) progress.accuracy = accuracy;
            progress.attempts += 1;
            progress.lastPracticed = new Date();
        }

        await progress.save();

        // Update user's total memorized verses
        if (memorized) {
            const totalMemorized = await QuranProgress.countDocuments({
                userId: req.user._id,
                memorized: true
            });
            req.user.quranVersesMemorized = totalMemorized;
            await req.user.save();
        }

        res.json({ success: true, data: progress });
    } catch (error) {
        next(error);
    }
});

// ===== GET QURAN PROGRESS (Authenticated) =====
router.get('/progress', auth, async (req, res, next) => {
    try {
        const progress = await QuranProgress.find({
            userId: req.user._id
        }).sort({ surah: 1 });

        const stats = {
            total: progress.length,
            memorized: progress.filter(p => p.memorized).length,
            averageAccuracy: progress.reduce((sum, p) => sum + p.accuracy, 0) / progress.length || 0
        };

        res.json({ success: true, data: { progress, stats } });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
