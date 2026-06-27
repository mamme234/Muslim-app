// ============================================
// USER MODEL
// ============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    name: {
        type: String,
        default: 'Muslim User'
    },
    profilePicture: {
        type: String,
        default: ''
    },
    // Prayer Tracking
    prayers: {
        type: Number,
        default: 0
    },
    prayerHistory: {
        type: Map,
        of: [String],
        default: {}
    },
    // Quran Progress
    quranProgress: {
        type: Map,
        of: Number,
        default: {}
    },
    quranPages: {
        type: Number,
        default: 0
    },
    quranVersesMemorized: {
        type: Number,
        default: 0
    },
    // Hadith
    hadithRead: {
        type: Number,
        default: 0
    },
    favoriteHadith: [{
        text: String,
        reference: String,
        collection: String
    }],
    // Duas
    favoriteDuas: [{
        arabic: String,
        translation: String,
        reference: String
    }],
    // Streak
    streakDays: {
        type: Number,
        default: 0
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    // Achievements
    achievements: [{
        type: String,
        enum: [
            'quran_reader',
            'prayer_30_days',
            'dua_master',
            'hadith_50',
            'tajweed_beginner',
            'streak_7_days',
            'quran_memorizer'
        ]
    }],
    // Voice Profile
    voiceProfile: {
        type: String,
        default: null
    },
    voiceCorrections: {
        type: Map,
        of: String,
        default: {}
    },
    // Settings
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        },
        language: {
            type: String,
            default: 'en'
        },
        notifications: {
            prayer: { type: Boolean, default: true },
            dailyVerse: { type: Boolean, default: true },
            adhan: { type: Boolean, default: true }
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Update streak method
UserSchema.methods.updateStreak = function() {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    const allPrayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const todayPrayers = this.prayerHistory.get(today) || [];
    const yesterdayPrayers = this.prayerHistory.get(yesterday) || [];
    
    const completedToday = allPrayers.every(p => todayPrayers.includes(p));
    const completedYesterday = allPrayers.every(p => yesterdayPrayers.includes(p));
    
    if (completedToday) {
        if (completedYesterday) {
            this.streakDays += 1;
        } else {
            this.streakDays = 1;
        }
    } else {
        const now = new Date();
        const ishaTime = new Date();
        ishaTime.setHours(20, 0, 0, 0);
        if (now > ishaTime && !completedToday) {
            this.streakDays = 0;
        }
    }
    this.lastActive = new Date();
};

module.exports = mongoose.model('User', UserSchema);
