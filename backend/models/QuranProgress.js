// ============================================
// QURAN PROGRESS MODEL
// ============================================

const mongoose = require('mongoose');

const QuranProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    surah: {
        type: Number,
        required: true,
        min: 1,
        max: 114
    },
    ayah: {
        type: Number,
        default: 0
    },
    memorized: {
        type: Boolean,
        default: false
    },
    accuracy: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    attempts: {
        type: Number,
        default: 0
    },
    lastPracticed: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String
    }
});

QuranProgressSchema.index({ userId: 1, surah: 1 });

module.exports = mongoose.model('QuranProgress', QuranProgressSchema);
