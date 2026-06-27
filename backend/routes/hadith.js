// ============================================
// HADITH ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Hadith = require('../models/Hadith');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

// ===== GET ALL HADITH =====
router.get('/', async (req, res, next) => {
    try {
        const { collection, category, search, limit = 50 } = req.query;
        let query = {};
        
        if (collection && collection !== 'all') {
            query.collection = collection;
        }
        
        if (category && category !== 'all') {
            query.category = category;
        }
        
        if (search) {
            query.english = { $regex: search, $options: 'i' };
        }

        const hadiths = await Hadith.find(query).limit(parseInt(limit));
        const collections = await Hadith.distinct('collection');
        const categories = await Hadith.distinct('category');
        
        res.json({
            success: true,
            data: {
                hadiths,
                collections,
                categories,
                total: await Hadith.countDocuments(query)
            }
        });
    } catch (error) {
        next(error);
    }
});

// ===== GET HADITH BY COLLECTION =====
router.get('/collection/:collection', async (req, res, next) => {
    try {
        const { collection } = req.params;
        const hadiths = await Hadith.find({ collection });
        res.json({ success: true, data: hadiths });
    } catch (error) {
        next(error);
    }
});

// ===== GET RANDOM HADITH =====
router.get('/random', async (req, res, next) => {
    try {
        const count = await Hadith.countDocuments();
        const random = Math.floor(Math.random() * count);
        const hadith = await Hadith.findOne().skip(random);
        res.json({ success: true, data: hadith });
    } catch (error) {
        next(error);
    }
});

// ===== FAVORITE HADITH (Authenticated) =====
router.post('/favorite', auth, async (req, res, next) => {
    try {
        const { hadithId } = req.body;
        const hadith = await Hadith.findById(hadithId);
        if (!hadith) {
            throw new AppError('Hadith not found', 404);
        }

        const exists = req.user.favoriteHadith.some(f => f._id?.toString() === hadithId);
        if (exists) {
            req.user.favoriteHadith = req.user.favoriteHadith.filter(f => f._id?.toString() !== hadithId);
            await req.user.save();
            return res.json({ success: true, message: 'Removed from favorites' });
        }

        req.user.favoriteHadith.push(hadith);
        req.user.hadithRead = (req.user.hadithRead || 0) + 1;
        await req.user.save();
        res.json({ success: true, message: 'Added to favorites' });
    } catch (error) {
        next(error);
    }
});

// ===== GET FAVORITE HADITH (Authenticated) =====
router.get('/favorites/list', auth, async (req, res) => {
    res.json({
        success: true,
        data: req.user.favoriteHadith
    });
});

// ===== SEED HADITH (Development) =====
router.post('/seed', async (req, res, next) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            throw new AppError('Not allowed in production', 403);
        }

        const defaultHadith = [
            { collection: 'bukhari', english: '"The best of you are those who are best to their families"', reference: 'Sahih Bukhari, Book 78, Hadith 160', grade: 'sahih', category: 'family' },
            { collection: 'bukhari', english: '"Whoever believes in Allah and the Last Day, let him speak good or remain silent"', reference: 'Sahih Bukhari, Book 78, Hadith 113', grade: 'sahih', category: 'faith' },
            { collection: 'bukhari', english: '"The strong person is not the one who can wrestle, but the one who controls himself at times of anger"', reference: 'Sahih Bukhari, Book 73, Hadith 135', grade: 'sahih', category: 'morals' },
            { collection: 'muslim', english: '"The best of people are those who are most beneficial to others"', reference: 'Sahih Muslim, Book 45, Hadith 100', grade: 'sahih', category: 'charity' },
            { collection: 'muslim', english: '"A good word is charity"', reference: 'Sahih Muslim, Book 5, Hadith 57', grade: 'sahih', category: 'charity' },
            { collection: 'tirmidhi', english: '"The most beloved of deeds to Allah are those done consistently"', reference: 'Sunan Tirmidhi, Book 48, Hadith 1', grade: 'hasan', category: 'faith' }
        ];

        await Hadith.insertMany(defaultHadith);
        res.json({ success: true, message: `${defaultHadith.length} hadith seeded successfully` });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
