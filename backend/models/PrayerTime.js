// ============================================
// PRAYER TIME MODEL
// ============================================

const mongoose = require('mongoose');

const PrayerTimeSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    city: {
        type: String,
        default: 'Mecca'
    },
    country: {
        type: String,
        default: 'Saudi Arabia'
    },
    method: {
        type: Number,
        default: 4
    },
    fajr: { type: String },
    sunrise: { type: String },
    dhuhr: { type: String },
    asr: { type: String },
    maghrib: { type: String },
    isha: { type: String },
    midnight: { type: String },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

PrayerTimeSchema.index({ date: 1, city: 1, country: 1 });

module.exports = mongoose.model('PrayerTime', PrayerTimeSchema);
