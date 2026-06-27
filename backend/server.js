// ============================================
// MUSLIM APP - MAIN SERVER
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/auth');
const quranRoutes = require('./routes/quran');
const prayerRoutes = require('./routes/prayer');
const duasRoutes = require('./routes/duas');
const hadithRoutes = require('./routes/hadith');
const userRoutes = require('./routes/user');
const voiceRoutes = require('./routes/voice');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE =====

// Security
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
app.use(cors({
    origin: process.env.CLIENT_URL?.split(',') || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON & URL Encoded
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ===== DATABASE =====
const connectDB = require('./config/database');
connectDB();

// ===== ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/quran', quranRoutes);
app.use('/api/prayer', prayerRoutes);
app.use('/api/duas', duasRoutes);
app.use('/api/hadith', hadithRoutes);
app.use('/api/user', userRoutes);
app.use('/api/voice', voiceRoutes);

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '2.0.0'
    });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log(`🕌 Muslim App Server running on port ${PORT}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 http://localhost:${PORT}`);
});
