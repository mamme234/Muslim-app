// ============================================
// HADITH MODEL
// ============================================

const mongoose = require('mongoose');

const HadithSchema = new mongoose.Schema({
    collection: {
        type: String,
        required: true,
        enum: ['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah', 'malik']
    },
    book: {
        type: String
    },
    chapter: {
        type: String
    },
    number: {
        type: Number
    },
    arabic: {
        type: String
    },
    english: {
        type: String,
        required: true
    },
    reference: {
        type: String,
        required: true
    },
    grade: {
        type: String,
        enum: ['sahih', 'hasan', 'daif', 'mawdu'],
        default: 'sahih'
    },
    category: {
        type: String,
        enum: ['faith', 'prayer', 'charity', 'morals', 'family', 'knowledge', 'patience'],
        default: 'faith'
    },
    tags: [String],
    narrator: String,
    isVerified: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

HadithSchema.index({ collection: 1, english: 'text' });

module.exports = mongoose.model('Hadith', HadithSchema);
