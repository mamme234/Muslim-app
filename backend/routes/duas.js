// ============================================
// DUAS ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Dua = require('../models/Dua');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

// ===== GET ALL DUAS =====
router.get('/', async (req, res, next) => {
    try {
        const { category, search, limit = 50 } = req.query;
        let query = {};
        
        if (category && category !== 'all') {
            query.category = category;
        }
        
        if (search) {
            query.$or = [
                { arabic: { $regex: search, $options: 'i' } },
                { translation: { $regex: search, $options: 'i' } }
            ];
        }

        const duas = await Dua.find(query).limit(parseInt(limit));
        const categories = await Dua.distinct('category');
        
        res.json({
            success: true,
            data: {
                duas,
                categories,
                total: await Dua.countDocuments(query)
            }
        });
    } catch (error) {
        next(error);
    }
});

// ===== GET DUA BY ID =====
router.get('/:id', async (req, res, next) => {
    try {
        const dua = await Dua.findById(req.params.id);
        if (!dua) {
            throw new AppError('Dua not found', 404);
        }
        res.json({ success: true, data: dua });
    } catch (error) {
        next(error);
    }
});

// ===== GET DUAS BY CATEGORY =====
router.get('/category/:category', async (req, res, next) => {
    try {
        const { category } = req.params;
        const duas = await Dua.find({ category });
        res.json({ success: true, data: duas });
    } catch (error) {
        next(error);
    }
});

// ===== GET MORNING ADHKAR =====
router.get('/adhkar/morning', async (req, res, next) => {
    try {
        const duas = await Dua.find({ category: 'morning' });
        res.json({ success: true, data: duas });
    } catch (error) {
        next(error);
    }
});

// ===== GET EVENING ADHKAR =====
router.get('/adhkar/evening', async (req, res, next) => {
    try {
        const duas = await Dua.find({ category: 'evening' });
        res.json({ success: true, data: duas });
    } catch (error) {
        next(error);
    }
});

// ===== FAVORITE DUAS (Authenticated) =====
router.post('/favorite', auth, async (req, res, next) => {
    try {
        const { duaId } = req.body;
        const dua = await Dua.findById(duaId);
        if (!dua) {
            throw new AppError('Dua not found', 404);
        }

        const exists = req.user.favoriteDuas.some(f => f._id?.toString() === duaId);
        if (exists) {
            req.user.favoriteDuas = req.user.favoriteDuas.filter(f => f._id?.toString() !== duaId);
            await req.user.save();
            return res.json({ success: true, message: 'Removed from favorites' });
        }

        req.user.favoriteDuas.push(dua);
        await req.user.save();
        res.json({ success: true, message: 'Added to favorites' });
    } catch (error) {
        next(error);
    }
});

// ===== GET FAVORITE DUAS (Authenticated) =====
router.get('/favorites/list', auth, async (req, res) => {
    res.json({
        success: true,
        data: req.user.favoriteDuas
    });
});

// ===== SEED DUAS (Development) =====
router.post('/seed', async (req, res, next) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            throw new AppError('Not allowed in production', 403);
        }

        const defaultDuas = [
            { category: 'morning', arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا', translation: 'O Allah, we have entered the morning with You', reference: 'Sunan Abi Dawud 5068' },
            { category: 'morning', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا', translation: 'O Allah, I ask You for beneficial knowledge', reference: 'Sunan Ibn Majah 925' },
            { category: 'evening', arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا', translation: 'O Allah, we have entered the evening with You', reference: 'Sunan Abi Dawud 5069' },
            { category: 'sleep', arabic: 'اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا', translation: 'O Allah, with Your name I die and I live', reference: 'Sahih Bukhari 7394' },
            { category: 'eating', arabic: 'بِسْمِ اللَّهِ فِي أَوَّلِهِ وَآخِرِهِ', translation: 'In the name of Allah at the beginning and at the end', reference: 'Sunan Abi Dawud 3767' },
            { category: 'travel', arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا', translation: 'Glory to Him who has subjected this to us', reference: 'Surah Az-Zukhruf 43:13' },
            { category: 'illness', arabic: 'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ', translation: 'I ask Allah the Mighty, Lord of the Mighty Throne, to cure you', reference: 'Sunan Abi Dawud 3106' },
            { category: 'daily', arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: 'Praise be to Allah, Lord of all the worlds', reference: 'Surah Al-Fatihah 1:2' }
        ];

        await Dua.insertMany(defaultDuas);
        res.json({ success: true, message: `${defaultDuas.length} duas seeded successfully` });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
