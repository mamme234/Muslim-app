// ============================================
// VOICE CORRECTION ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const VoiceCorrection = require('../models/VoiceCorrection');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

// ===== SAVE VOICE CORRECTION (Authenticated) =====
router.post('/save', auth, async (req, res, next) => {
    try {
        const { phrase, audioData, fileType } = req.body;
        const validPhrases = ['bismillah', 'repeat', 'correct', 'mistake', 'tryagain', 'mashaallah'];

        if (!validPhrases.includes(phrase)) {
            throw new AppError('Invalid phrase', 400);
        }

        // Check if voice correction exists
        let voice = await VoiceCorrection.findOne({
            userId: req.user._id,
            phrase
        });

        if (voice) {
            // Update existing
            voice.audioData = audioData;
            voice.fileType = fileType || 'audio/webm';
            voice.updatedAt = new Date();
            await voice.save();
        } else {
            // Create new
            voice = new VoiceCorrection({
                userId: req.user._id,
                phrase,
                audioData,
                fileType: fileType || 'audio/webm',
                fileSize: Buffer.byteLength(audioData, 'base64')
            });
            await voice.save();
        }

        res.json({
            success: true,
            message: `Voice for "${phrase}" saved successfully`,
            data: voice
        });
    } catch (error) {
        next(error);
    }
});

// ===== GET ALL VOICE CORRECTIONS (Authenticated) =====
router.get('/all', auth, async (req, res, next) => {
    try {
        const voices = await VoiceCorrection.find({
            userId: req.user._id,
            isActive: true
        });

        const result = {};
        voices.forEach(v => {
            result[v.phrase] = {
                audioData: v.audioData,
                fileType: v.fileType,
                createdAt: v.createdAt
            };
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

// ===== GET SINGLE VOICE CORRECTION (Authenticated) =====
router.get('/:phrase', auth, async (req, res, next) => {
    try {
        const { phrase } = req.params;
        const voice = await VoiceCorrection.findOne({
            userId: req.user._id,
            phrase,
            isActive: true
        });

        if (!voice) {
            throw new AppError('Voice correction not found', 404);
        }

        res.json({
            success: true,
            data: {
                phrase: voice.phrase,
                audioData: voice.audioData,
                fileType: voice.fileType
            }
        });
    } catch (error) {
        next(error);
    }
});

// ===== DELETE VOICE CORRECTION (Authenticated) =====
router.delete('/:phrase', auth, async (req, res, next) => {
    try {
        const { phrase } = req.params;
        const voice = await VoiceCorrection.findOne({
            userId: req.user._id,
            phrase
        });

        if (!voice) {
            throw new AppError('Voice correction not found', 404);
        }

        voice.isActive = false;
        await voice.save();

        res.json({
            success: true,
            message: `Voice for "${phrase}" deleted successfully`
        });
    } catch (error) {
        next(error);
    }
});

// ===== DELETE ALL VOICE CORRECTIONS (Authenticated) =====
router.delete('/all', auth, async (req, res, next) => {
    try {
        await VoiceCorrection.updateMany(
            { userId: req.user._id },
            { isActive: false }
        );

        res.json({
            success: true,
            message: 'All voice corrections deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

// ===== CHECK IF VOICE EXISTS (Authenticated) =====
router.get('/check/:phrase', auth, async (req, res, next) => {
    try {
        const { phrase } = req.params;
        const voice = await VoiceCorrection.findOne({
            userId: req.user._id,
            phrase,
            isActive: true
        });

        res.json({
            success: true,
            exists: !!voice
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
