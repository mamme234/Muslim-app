// ============================================
// VOICE CORRECTION MODEL
// ============================================

const mongoose = require('mongoose');

const VoiceCorrectionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    phrase: {
        type: String,
        required: true,
        enum: ['bismillah', 'repeat', 'correct', 'mistake', 'tryagain', 'mashaallah']
    },
    audioData: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        default: 'audio/webm'
    },
    fileSize: {
        type: Number
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

VoiceCorrectionSchema.index({ userId: 1, phrase: 1 });

module.exports = mongoose.model('VoiceCorrection', VoiceCorrectionSchema);
