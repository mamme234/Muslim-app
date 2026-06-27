// ============================================
// MUSLIM APP - COMPLETE BACKEND
// ALL ROUTES IN ONE FILE
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// DATABASE CONNECTION
// ============================================
const MONGODB_URI = 'mongodb+srv://Muhammad:muhammad1234@cluster0.eiyisqm.mongodb.net/Crypto';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ============================================
// MODELS
// ============================================

// User Model
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    name: { type: String, default: 'Muslim User' },
    profilePicture: { type: String, default: '' },
    prayers: { type: Number, default: 0 },
    prayerHistory: { type: Map, of: [String], default: {} },
    quranPages: { type: Number, default: 0 },
    quranVersesMemorized: { type: Number, default: 0 },
    quranProgress: { type: Map, of: Number, default: {} },
    hadithRead: { type: Number, default: 0 },
    favoriteHadith: [{ text: String, reference: String, collection: String }],
    favoriteDuas: [{ arabic: String, translation: String, reference: String }],
    streakDays: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    achievements: { type: [String], default: [] },
    voiceCorrections: { type: Map, of: Object, default: {} },
    preferences: {
        theme: { type: String, enum: ['light', 'dark'], default: 'light' },
        language: { type: String, default: 'en' },
        notifications: {
            prayer: { type: Boolean, default: true },
            dailyVerse: { type: Boolean, default: true },
            adhan: { type: Boolean, default: true }
        }
    },
    createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', UserSchema);

// Prayer Time Model
const PrayerTimeSchema = new mongoose.Schema({
    date: { type: String, required: true },
    city: { type: String, default: 'Mecca' },
    country: { type: String, default: 'Saudi Arabia' },
    method: { type: Number, default: 4 },
    fajr: String,
    sunrise: String,
    dhuhr: String,
    asr: String,
    maghrib: String,
    isha: String,
    midnight: String,
    createdAt: { type: Date, default: Date.now }
});
const PrayerTime = mongoose.model('PrayerTime', PrayerTimeSchema);

// Dua Model
const DuaSchema = new mongoose.Schema({
    category: { type: String, required: true, enum: ['morning', 'evening', 'sleep', 'eating', 'travel', 'illness', 'marriage', 'hajj', 'daily', 'general'] },
    arabic: { type: String, required: true },
    translation: { type: String, required: true },
    transliteration: String,
    reference: String,
    source: { type: String, enum: ['quran', 'hadith', 'scholar'], default: 'hadith' },
    tags: [String],
    isVerified: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});
const Dua = mongoose.model('Dua', DuaSchema);

// Hadith Model
const HadithSchema = new mongoose.Schema({
    collection: { type: String, required: true, enum: ['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah', 'malik'] },
    book: String,
    chapter: String,
    number: Number,
    arabic: String,
    english: { type: String, required: true },
    reference: { type: String, required: true },
    grade: { type: String, enum: ['sahih', 'hasan', 'daif', 'mawdu'], default: 'sahih' },
    category: { type: String, enum: ['faith', 'prayer', 'charity', 'morals', 'family', 'knowledge', 'patience'], default: 'faith' },
    tags: [String],
    narrator: String,
    isVerified: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});
const Hadith = mongoose.model('Hadith', HadithSchema);

// Quran Progress Model
const QuranProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    surah: { type: Number, required: true, min: 1, max: 114 },
    ayah: { type: Number, default: 0 },
    memorized: { type: Boolean, default: false },
    accuracy: { type: Number, min: 0, max: 100, default: 0 },
    attempts: { type: Number, default: 0 },
    lastPracticed: { type: Date, default: Date.now },
    notes: String
});
const QuranProgress = mongoose.model('QuranProgress', QuranProgressSchema);

// ============================================
// MIDDLEWARE
// ============================================

// Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, unique + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/m4a'];
        cb(null, allowed.includes(file.mimetype));
    }
});

// Auth Middleware
const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'muslimappsecret');
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(401).json({ error: 'User not found' });

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
    }
};

// ============================================
// EXPRESS MIDDLEWARE
// ============================================
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Create uploads directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ============================================
// ============================================
// AUTH ROUTES
// ============================================
// ============================================

// Register
app.post('/api/auth/register', [
    body('email').isEmail().normalizeEmail(),
    body('username').isLength({ min: 3 }).trim(),
    body('password').isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { username, email, password, name } = req.body;
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        const user = new User({ username, email, password, name });
        await user.save();

        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET || 'muslimappsecret', { expiresIn: '30d' });

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
        res.status(500).json({ error: error.message });
    }
});

// Login
app.post('/api/auth/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET || 'muslimappsecret', { expiresIn: '30d' });

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
        res.status(500).json({ error: error.message });
    }
});

// Get current user
app.get('/api/auth/me', auth, async (req, res) => {
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
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

// ============================================
// ============================================
// QURAN ROUTES
// ============================================
// ============================================

const QURAN_API = 'https://api.alquran.cloud/v1';

// Get all surahs
app.get('/api/quran/surahs', async (req, res) => {
    try {
        const response = await fetch(`${QURAN_API}/meta`);
        const data = await response.json();
        if (data.code !== 200) return res.status(500).json({ error: 'Failed to fetch surahs' });
        res.json({ success: true, data: data.data.surahs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get surah by number
app.get('/api/quran/surah/:number', async (req, res) => {
    try {
        const { number } = req.params;
        const { translation } = req.query;
        
        const arabicRes = await fetch(`${QURAN_API}/surah/${number}`);
        const arabicData = await arabicRes.json();
        if (arabicData.code !== 200) return res.status(404).json({ error: 'Surah not found' });

        let translationData = null;
        if (translation && translation !== 'ar') {
            const langMap = { 'en': 'english', 'ur': 'urdu', 'bn': 'bengali', 'fr': 'french', 'es': 'spanish' };
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
        res.status(500).json({ error: error.message });
    }
});

// Get ayah
app.get('/api/quran/ayah/:surah/:ayah', async (req, res) => {
    try {
        const { surah, ayah } = req.params;
        const response = await fetch(`${QURAN_API}/ayah/${surah}:${ayah}`);
        const data = await response.json();
        if (data.code !== 200) return res.status(404).json({ error: 'Ayah not found' });
        res.json({ success: true, data: data.data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search Quran
app.get('/api/quran/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ error: 'Search query required' });
        const response = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(q)}/all/en`);
        const data = await response.json();
        res.json({ success: true, data: data.data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get reciters
app.get('/api/quran/reciters', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, name: 'Mishary Rashid Alafasy', style: 'Murattal' },
            { id: 2, name: 'Abdul Rahman Al-Sudais', style: 'Murattal' },
            { id: 3, name: 'Saad Al-Ghamdi', style: 'Murattal' },
            { id: 4, name: 'Maher Al-Muaiqly', style: 'Murattal' },
            { id: 5, name: 'Yasser Al-Dosari', style: 'Murattal' }
        ]
    });
});

// Save Quran progress
app.post('/api/quran/progress', auth, async (req, res) => {
    try {
        const { surah, ayah, memorized, accuracy } = req.body;
        let progress = await QuranProgress.findOne({ userId: req.user._id, surah });
        if (!progress) {
            progress = new QuranProgress({ userId: req.user._id, surah, ayah: ayah || 0, memorized: memorized || false, accuracy: accuracy || 0 });
        } else {
            progress.ayah = ayah || progress.ayah;
            if (memorized) progress.memorized = true;
            if (accuracy) progress.accuracy = accuracy;
            progress.attempts += 1;
            progress.lastPracticed = new Date();
        }
        await progress.save();
        if (memorized) {
            const totalMemorized = await QuranProgress.countDocuments({ userId: req.user._id, memorized: true });
            req.user.quranVersesMemorized = totalMemorized;
            await req.user.save();
        }
        res.json({ success: true, data: progress });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Quran progress
app.get('/api/quran/progress', auth, async (req, res) => {
    try {
        const progress = await QuranProgress.find({ userId: req.user._id }).sort({ surah: 1 });
        const stats = {
            total: progress.length,
            memorized: progress.filter(p => p.memorized).length,
            averageAccuracy: progress.reduce((sum, p) => sum + p.accuracy, 0) / progress.length || 0
        };
        res.json({ success: true, data: { progress, stats } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ============================================
// PRAYER ROUTES
// ============================================
// ============================================

const ALADHAN_API = process.env.ALADHAN_API_URL || 'https://api.aladhan.com/v1';

// Get prayer times
app.get('/api/prayer/times', async (req, res) => {
    try {
        const { city = 'Mecca', country = 'Saudi Arabia', method = 4, date } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];

        let prayerTime = await PrayerTime.findOne({ date: targetDate, city, country, method });
        if (!prayerTime) {
            const response = await fetch(`${ALADHAN_API}/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`);
            const data = await response.json();
            if (data.code !== 200) return res.status(500).json({ error: 'Failed to fetch prayer times' });
            const timings = data.data.timings;
            prayerTime = new PrayerTime({
                date: targetDate, city, country, method,
                fajr: timings.Fajr, sunrise: timings.Sunrise, dhuhr: timings.Dhuhr,
                asr: timings.Asr, maghrib: timings.Maghrib, isha: timings.Isha, midnight: timings.Midnight
            });
            await prayerTime.save();
        }
        res.json({ success: true, data: prayerTime });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get monthly prayer times
app.get('/api/prayer/month', async (req, res) => {
    try {
        const { city = 'Mecca', country = 'Saudi Arabia', method = 4, month, year } = req.query;
        const targetMonth = month || new Date().getMonth() + 1;
        const targetYear = year || new Date().getFullYear();
        const response = await fetch(`${ALADHAN_API}/calendarByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}&month=${targetMonth}&year=${targetYear}`);
        const data = await response.json();
        if (data.code !== 200) return res.status(500).json({ error: 'Failed to fetch monthly prayer times' });
        res.json({ success: true, data: data.data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Track prayer
app.post('/api/prayer/track', auth, async (req, res) => {
    try {
        const { prayerName, date } = req.body;
        const validPrayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        if (!validPrayers.includes(prayerName)) return res.status(400).json({ error: 'Invalid prayer name' });

        const today = date || new Date().toISOString().split('T')[0];
        if (!req.user.prayerHistory) req.user.prayerHistory = new Map();

        const todayPrayers = req.user.prayerHistory.get(today) || [];
        if (!todayPrayers.includes(prayerName)) {
            todayPrayers.push(prayerName);
            req.user.prayerHistory.set(today, todayPrayers);
            req.user.prayers = (req.user.prayers || 0) + 1;
            await req.user.save();
        }
        res.json({
            success: true,
            data: {
                prayer: prayerName,
                date: today,
                total: req.user.prayers,
                streak: req.user.streakDays,
                todayPrayers: todayPrayers
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get prayer history
app.get('/api/prayer/history', auth, async (req, res) => {
    const history = Object.fromEntries(req.user.prayerHistory || new Map());
    res.json({ success: true, data: { history, total: req.user.prayers, streak: req.user.streakDays } });
});

// Get Qibla direction
app.post('/api/prayer/qibla', async (req, res) => {
    try {
        const { lat, lon } = req.body;
        if (!lat || !lon) return res.status(400).json({ error: 'Latitude and longitude required' });

        const meccaLat = 21.4225;
        const meccaLon = 39.8262;
        const dLon = meccaLon - lon;
        const x = Math.sin(dLon * Math.PI / 180) * Math.cos(meccaLat * Math.PI / 180);
        const y = Math.cos(lat * Math.PI / 180) * Math.sin(meccaLat * Math.PI / 180) - Math.sin(lat * Math.PI / 180) * Math.cos(meccaLat * Math.PI / 180) * Math.cos(dLon * Math.PI / 180);
        let bearing = Math.atan2(x, y) * 180 / Math.PI;
        bearing = (bearing + 360) % 360;

        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const dirIndex = Math.round(bearing / 45) % 8;

        res.json({ success: true, data: { bearing: bearing.toFixed(2), direction: directions[dirIndex], meccaLat, meccaLon } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ============================================
// DUAS ROUTES
// ============================================
// ============================================

// Get all duas
app.get('/api/duas', async (req, res) => {
    try {
        const { category, search, limit = 50 } = req.query;
        let query = {};
        if (category && category !== 'all') query.category = category;
        if (search) query.$or = [{ arabic: { $regex: search, $options: 'i' } }, { translation: { $regex: search, $options: 'i' } }];

        const duas = await Dua.find(query).limit(parseInt(limit));
        const categories = await Dua.distinct('category');
        res.json({ success: true, data: { duas, categories, total: await Dua.countDocuments(query) } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get dua by ID
app.get('/api/duas/:id', async (req, res) => {
    try {
        const dua = await Dua.findById(req.params.id);
        if (!dua) return res.status(404).json({ error: 'Dua not found' });
        res.json({ success: true, data: dua });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get duas by category
app.get('/api/duas/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const duas = await Dua.find({ category });
        res.json({ success: true, data: duas });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get morning adhkar
app.get('/api/duas/adhkar/morning', async (req, res) => {
    try {
        const duas = await Dua.find({ category: 'morning' });
        res.json({ success: true, data: duas });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get evening adhkar
app.get('/api/duas/adhkar/evening', async (req, res) => {
    try {
        const duas = await Dua.find({ category: 'evening' });
        res.json({ success: true, data: duas });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Favorite duas
app.post('/api/duas/favorite', auth, async (req, res) => {
    try {
        const { duaId } = req.body;
        const dua = await Dua.findById(duaId);
        if (!dua) return res.status(404).json({ error: 'Dua not found' });

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
        res.status(500).json({ error: error.message });
    }
});

// Get favorite duas
app.get('/api/duas/favorites/list', auth, async (req, res) => {
    res.json({ success: true, data: req.user.favoriteDuas });
});

// Seed duas
app.post('/api/duas/seed', async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'Not allowed in production' });
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
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ============================================
// HADITH ROUTES
// ============================================
// ============================================

// Get all hadith
app.get('/api/hadith', async (req, res) => {
    try {
        const { collection, category, search, limit = 50 } = req.query;
        let query = {};
        if (collection && collection !== 'all') query.collection = collection;
        if (category && category !== 'all') query.category = category;
        if (search) query.english = { $regex: search, $options: 'i' };

        const hadiths = await Hadith.find(query).limit(parseInt(limit));
        const collections = await Hadith.distinct('collection');
        const categories = await Hadith.distinct('category');
        res.json({ success: true, data: { hadiths, collections, categories, total: await Hadith.countDocuments(query) } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get hadith by collection
app.get('/api/hadith/collection/:collection', async (req, res) => {
    try {
        const { collection } = req.params;
        const hadiths = await Hadith.find({ collection });
        res.json({ success: true, data: hadiths });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get random hadith
app.get('/api/hadith/random', async (req, res) => {
    try {
        const count = await Hadith.countDocuments();
        const random = Math.floor(Math.random() * count);
        const hadith = await Hadith.findOne().skip(random);
        res.json({ success: true, data: hadith });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Favorite hadith
app.post('/api/hadith/favorite', auth, async (req, res) => {
    try {
        const { hadithId } = req.body;
        const hadith = await Hadith.findById(hadithId);
        if (!hadith) return res.status(404).json({ error: 'Hadith not found' });

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
        res.status(500).json({ error: error.message });
    }
});

// Get favorite hadith
app.get('/api/hadith/favorites/list', auth, async (req, res) => {
    res.json({ success: true, data: req.user.favoriteHadith });
});

// Seed hadith
app.post('/api/hadith/seed', async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'Not allowed in production' });
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
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ============================================
// USER ROUTES
// ============================================
// ============================================

// Get user profile
app.get('/api/user/profile', auth, async (req, res) => {
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

// Update user profile
app.put('/api/user/profile', auth, async (req, res) => {
    try {
        const { name, preferences } = req.body;
        if (name) req.user.name = name;
        if (preferences) req.user.preferences = { ...req.user.preferences, ...preferences };
        await req.user.save();
        res.json({ success: true, message: 'Profile updated successfully', data: { name: req.user.name, preferences: req.user.preferences } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user stats
app.get('/api/user/stats', auth, async (req, res) => {
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

// Get achievements
app.get('/api/user/achievements', auth, async (req, res) => {
    const allAchievements = [
        { id: 'quran_reader', name: '📖 Quran Reader', description: 'Read 100 pages', earned: req.user.achievements.includes('quran_reader') },
        { id: 'prayer_30_days', name: '🕌 30 Days Prayer', description: 'Track prayers for 30 days', earned: req.user.achievements.includes('prayer_30_days') },
        { id: 'dua_master', name: '🤲 Dua Master', description: 'Save 10 favorite duas', earned: req.user.achievements.includes('dua_master') },
        { id: 'hadith_50', name: '📚 50 Hadith', description: 'Read 50 hadith', earned: req.user.achievements.includes('hadith_50') },
        { id: 'tajweed_beginner', name: '⭐ Tajweed Beginner', description: 'Complete beginner tajweed', earned: req.user.achievements.includes('tajweed_beginner') },
        { id: 'streak_7_days', name: '🔥 7 Day Streak', description: 'Maintain 7 day streak', earned: req.user.achievements.includes('streak_7_days') },
        { id: 'quran_memorizer', name: '📖 Quran Memorizer', description: 'Memorize 5 verses', earned: req.user.achievements.includes('quran_memorizer') }
    ];
    res.json({ success: true, data: { earned: req.user.achievements, all: allAchievements } });
});

// Update preferences
app.patch('/api/user/preferences', auth, async (req, res) => {
    try {
        const { theme, language, notifications } = req.body;
        if (theme) req.user.preferences.theme = theme;
        if (language) req.user.preferences.language = language;
        if (notifications) req.user.preferences.notifications = { ...req.user.preferences.notifications, ...notifications };
        await req.user.save();
        res.json({ success: true, message: 'Preferences updated', data: req.user.preferences });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ============================================
// VOICE CORRECTION ROUTES
// ============================================
// ============================================

// Upload voice file
app.post('/api/voice/upload', auth, upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No audio file uploaded' });
        const { phrase } = req.body;
        const validPhrases = ['bismillah', 'repeat', 'correct', 'mistake', 'tryagain', 'mashaallah'];
        if (!validPhrases.includes(phrase)) return res.status(400).json({ error: 'Invalid phrase' });

        if (!req.user.voiceCorrections) req.user.voiceCorrections = new Map();
        req.user.voiceCorrections.set(phrase, {
            filename: req.file.filename,
            path: `/uploads/${req.file.filename}`,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadedAt: new Date()
        });
        await req.user.save();

        res.json({
            success: true,
            message: `Voice for "${phrase}" uploaded successfully`,
            data: { phrase, filename: req.file.filename, path: `/uploads/${req.file.filename}` }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get voice file
app.get('/api/voice/:phrase', auth, async (req, res) => {
    try {
        const { phrase } = req.params;
        const voice = req.user.voiceCorrections?.get(phrase);
        if (!voice) return res.status(404).json({ error: 'Voice not found' });
        res.json({ success: true, data: { phrase, path: voice.path, filename: voice.filename, size: voice.size } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all voices
app.get('/api/voice/all/list', auth, async (req, res) => {
    const voices = {};
    if (req.user.voiceCorrections) {
        for (const [key, value] of req.user.voiceCorrections) {
            voices[key] = { path: value.path, filename: value.filename, size: value.size };
        }
    }
    res.json({ success: true, data: voices });
});

// Delete voice
app.delete('/api/voice/:phrase', auth, async (req, res) => {
    try {
        const { phrase } = req.params;
        if (!req.user.voiceCorrections?.has(phrase)) return res.status(404).json({ error: 'Voice not found' });
        req.user.voiceCorrections.delete(phrase);
        await req.user.save();
        res.json({ success: true, message: `Voice for "${phrase}" deleted successfully` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete all voices
app.delete('/api/voice/all', auth, async (req, res) => {
    try {
        req.user.voiceCorrections = new Map();
        await req.user.save();
        res.json({ success: true, message: 'All voice corrections deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check voice exists
app.get('/api/voice/check/:phrase', auth, async (req, res) => {
    const { phrase } = req.params;
    const exists = req.user.voiceCorrections?.has(phrase) || false;
    res.json({ success: true, exists });
});

// ============================================
// ============================================
// FILE UPLOAD ROUTE
// ============================================
// ============================================

app.post('/api/upload/voice', auth, upload.single('audio'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        res.json({
            success: true,
            message: 'File uploaded successfully',
            data: { filename: req.file.filename, path: `/uploads/${req.file.filename}`, size: req.file.size }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ============================================
// HEALTH CHECK
// ============================================
// ============================================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '2.0.0',
        mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// ============================================
// ============================================
// ERROR HANDLER
// ============================================
// ============================================

app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.status || 500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// ============================================
// ============================================
// START SERVER
// ============================================
// ============================================

app.listen(PORT, () => {
    console.log(`🕌 Muslim App Server running on port ${PORT}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 http://localhost:${PORT}`);
    console.log(`✅ MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
});

module.exports = app;
