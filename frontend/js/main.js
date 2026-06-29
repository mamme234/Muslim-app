// ============================================
// MAIN.JS - Complete App Logic
// ============================================

// ============================================
// AUTH FUNCTIONS
// ============================================

// User data (in production, this would come from backend)
let currentUser = null;

function showRegister() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('registerScreen').style.display = 'block';
}

function showLogin() {
    document.getElementById('registerScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'block';
}

// Login
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    if (username && password) {
        // Simulate login
        currentUser = { username, name: username };
        localStorage.setItem('user', JSON.stringify(currentUser));
        showApp();
        showToast('✅ Welcome back, ' + username + '!');
    } else {
        showToast('⚠️ Please fill in all fields');
    }
});

// Register
document.getElementById('registerForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    if (username && email && password) {
        // Simulate register
        currentUser = { username, name: username, email };
        localStorage.setItem('user', JSON.stringify(currentUser));
        showApp();
        showToast('🎉 Welcome, ' + username + '!');
    } else {
        showToast('⚠️ Please fill in all fields');
    }
});

// Password toggle
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', function() {
        const input = this.parentElement.querySelector('input');
        if (input.type === 'password') {
            input.type = 'text';
            this.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            input.type = 'password';
            this.innerHTML = '<i class="fas fa-eye"></i>';
        }
    });
});

// Show app after login
function showApp() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';
    
    // Update user info
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('userName').textContent = user.name || user.username;
        document.getElementById('profileName').textContent = user.name || user.username;
        document.getElementById('profileEmail').textContent = user.email || 'user@email.com';
        document.getElementById('userInitial').textContent = (user.name || user.username).charAt(0).toUpperCase();
        document.getElementById('profileInitial').textContent = (user.name || user.username).charAt(0).toUpperCase();
    }
}

// Logout
function logout() {
    localStorage.removeItem('user');
    currentUser = null;
    document.getElementById('appContainer').style.display = 'none';
    document.getElementById('authContainer').style.display = 'block';
    showLogin();
    showToast('👋 Logged out');
}
window.logout = logout;

// Show profile
function showProfile() {
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
    document.getElementById('profile').classList.add('active');
    document.getElementById('pageTitle').textContent = '👤 Profile';
    document.getElementById('sidebar')?.classList.remove('open');
}
window.showProfile = showProfile;

// ============================================
// TOAST NOTIFICATION
// ============================================

function showToast(message, duration = 3000) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg-card);
        padding: 14px 28px;
        border-radius: var(--radius-full);
        box-shadow: var(--shadow-lg);
        z-index: 9999;
        font-weight: 500;
        color: var(--text-primary);
        border: 1px solid var(--border-color);
        max-width: 90%;
        text-align: center;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ============================================
// THEME MANAGEMENT
// ============================================

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const isDark = savedTheme === 'dark';
    applyTheme(isDark);
    
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const isDark = current === 'dark';
            applyTheme(!isDark);
            localStorage.setItem('theme', !isDark ? 'dark' : 'light');
        });
    }

    const darkToggle = document.getElementById('darkModeToggle');
    if (darkToggle) {
        darkToggle.checked = isDark;
        darkToggle.addEventListener('change', () => {
            applyTheme(darkToggle.checked);
            localStorage.setItem('theme', darkToggle.checked ? 'dark' : 'light');
        });
    }
}

function applyTheme(isDark) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fa-solid fa-moon';
    }
}

// ============================================
// SIDEBAR & NAVIGATION
// ============================================

function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar?.classList.toggle('open');
        });
    }
    
    if (closeSidebar) {
        closeSidebar.addEventListener('click', () => {
            sidebar?.classList.remove('open');
        });
    }
    
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            const isClickInside = sidebar?.contains(e.target);
            const isClickOnToggle = menuToggle?.contains(e.target);
            if (!isClickInside && !isClickOnToggle && sidebar?.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        }
    });
}

function initNavigation() {
    const menuItems = document.querySelectorAll('.menu-item, .bottom-nav-item');
    const sections = document.querySelectorAll('.section');
    const pageTitle = document.getElementById('pageTitle');
    
    const titleMap = {
        home: '🏠 Home',
        quran: '📖 Quran',
        'quran-teacher': '🎙️ AI Teacher',
        'voice-assistant': '🗣️ Voice Assistant',
        hadith: '📚 Hadith',
        duas: '🤲 Duas',
        prayer: '🕌 Prayer',
        learning: '🎓 Learning',
        videos: '🎥 Videos',
        audio: '🎧 Audio',
        community: '👨‍👩‍👧 Community',
        ramadan: '🌙 Ramadan',
        hajj: '🕋 Hajj',
        kids: '👶 Kids',
        ai: '🤖 AI Assistant',
        profile: '👤 Profile',
        settings: '⚙️ Settings'
    };
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            if (!section) return;
            
            menuItems.forEach(el => el.classList.remove('active'));
            this.classList.add('active');
            
            sections.forEach(s => s.classList.remove('active'));
            const targetSection = document.getElementById(section);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            pageTitle.textContent = titleMap[section] || section;
            document.getElementById('sidebar')?.classList.remove('open');
        });
    });
    
    const homeSection = document.getElementById('home');
    if (homeSection) homeSection.classList.add('active');
}

// ============================================
// DAILY CONTENT
// ============================================

function initDailyContent() {
    const verses = [
        { arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', translation: '"Indeed, with hardship comes ease"', ref: 'Surah Ash-Sharh 94:6' },
        { arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا', translation: '"And whoever fears Allah, He will make a way out for him"', ref: 'Surah At-Talaq 65:2' }
    ];
    const verse = verses[Math.floor(Math.random() * verses.length)];
    const verseContainer = document.getElementById('dailyVerse');
    if (verseContainer) {
        const arabicEl = verseContainer.querySelector('.arabic');
        const transEl = verseContainer.querySelector('.translation');
        const refEl = verseContainer.querySelector('.reference');
        if (arabicEl) arabicEl.textContent = verse.arabic;
        if (transEl) transEl.textContent = verse.translation;
        if (refEl) refEl.textContent = verse.ref;
    }
    
    const hadiths = [
        { text: '"The best of you are those who are best to their families"', ref: 'Sunan Ibn Majah 1977' },
        { text: '"Whoever believes in Allah and the Last Day, let him speak good or remain silent"', ref: 'Sahih Bukhari 6018' }
    ];
    const hadith = hadiths[Math.floor(Math.random() * hadiths.length)];
    const hadithContainer = document.getElementById('dailyHadith');
    if (hadithContainer) {
        const textEl = hadithContainer.querySelector('.hadith-text');
        const refEl = hadithContainer.querySelector('.hadith-reference');
        if (textEl) textEl.textContent = hadith.text;
        if (refEl) refEl.textContent = hadith.ref;
    }
    
    const duas = [
        { arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا', translation: '"O Allah, I ask You for beneficial knowledge"' },
        { arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ', translation: '"O Allah, I ask You for well-being"' }
    ];
    const dua = duas[Math.floor(Math.random() * duas.length)];
    const duaContainer = document.getElementById('dailyDua');
    if (duaContainer) {
        const arabicEl = duaContainer.querySelector('.dua-arabic');
        const transEl = duaContainer.querySelector('.dua-translation');
        if (arabicEl) arabicEl.textContent = dua.arabic;
        if (transEl) transEl.textContent = dua.translation;
    }
}

// ============================================
// PRAYER COUNTDOWN
// ============================================

function initPrayerCountdown() {
    const times = {
        fajr: '5:12 AM',
        dhuhr: '12:34 PM',
        asr: '3:45 PM',
        maghrib: '6:20 PM',
        isha: '7:56 PM'
    };
    
    const prayerNames = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const displayNames = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };
    
    function updateCountdown() {
        const now = new Date();
        let nextPrayer = null;
        let nextTime = null;
        
        for (const name of prayerNames) {
            const timeStr = times[name];
            if (!timeStr) continue;
            
            const parts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
            if (!parts) continue;
            
            let hours = parseInt(parts[1]);
            const minutes = parseInt(parts[2]);
            const ampm = parts[3]?.toUpperCase();
            
            if (ampm === 'PM' && hours < 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
            
            const prayerDate = new Date(now);
            prayerDate.setHours(hours, minutes, 0, 0);
            
            if (prayerDate > now) {
                if (!nextTime || prayerDate < nextTime) {
                    nextPrayer = name;
                    nextTime = prayerDate;
                }
            }
        }
        
        if (!nextPrayer) {
            const fajrTime = times.fajr;
            const parts = fajrTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
            if (parts) {
                let hours = parseInt(parts[1]);
                const minutes = parseInt(parts[2]);
                const ampm = parts[3]?.toUpperCase();
                if (ampm === 'PM' && hours < 12) hours += 12;
                if (ampm === 'AM' && hours === 12) hours = 0;
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(hours, minutes, 0, 0);
                nextPrayer = 'fajr';
            }
        }
        
        if (nextPrayer) {
            const countdownEl = document.getElementById('prayerCountdown');
            const nameEl = document.getElementById('nextPrayer');
            if (nameEl) nameEl.textContent = displayNames[nextPrayer] || nextPrayer;
            
            if (nextTime) {
                const diff = Math.floor((nextTime - now) / 1000);
                if (diff > 0) {
                    const h = String(Math.floor(diff / 3600)).padStart(2, '0');
                    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
                    const s = String(diff % 60).padStart(2, '0');
                    if (countdownEl) countdownEl.textContent = `${h}:${m}:${s}`;
                }
            }
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ============================================
// ISLAMIC DATE
// ============================================

function initIslamicDate() {
    const dateEl = document.getElementById('islamicDate');
    if (dateEl) {
        const months = ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 'Dhul-Qadah', 'Dhul-Hijjah'];
        const date = new Date();
        const islamicDay = Math.floor((date - new Date(2024, 6, 7)) / (1000 * 60 * 60 * 24)) % 30 + 1;
        const islamicMonth = Math.floor(((date - new Date(2024, 6, 7)) / (1000 * 60 * 60 * 24)) / 30) % 12;
        dateEl.textContent = `${islamicDay} ${months[islamicMonth]} 1446 AH`;
    }
}

// ============================================
// QURAN MODULE
// ============================================

class QuranModule {
    constructor() {
        this.surahs = [];
        this.init();
    }

    async init() {
        await this.loadSurahs();
        this.renderSurahList();
        this.setupEvents();
    }

    async loadSurahs() {
        try {
            const response = await fetch('https://api.alquran.cloud/v1/meta');
            const data = await response.json();
            if (data.code === 200) {
                this.surahs = data.data.surahs.slice(0, 20);
            }
        } catch (error) {
            // Fallback
            this.surahs = [];
            for (let i = 1; i <= 10; i++) {
                this.surahs.push({ number: i, name: `Surah ${i}`, englishName: `Surah ${i}`, verses: 7 });
            }
        }
        this.renderSurahList();
    }

    renderSurahList() {
        const container = document.getElementById('surahList');
        if (!container) return;

        container.innerHTML = this.surahs.map(surah => `
            <div class="surah-item" data-surah="${surah.number}">
                <div class="surah-info">
                    <span class="surah-number">${surah.number}</span>
                    <div>
                        <div class="surah-name">${surah.name}</div>
                        <div class="surah-english">${surah.englishName}</div>
                    </div>
                </div>
                <div class="surah-verses">${surah.verses} verses</div>
            </div>
        `).join('');

        container.querySelectorAll('.surah-item').forEach(item => {
            item.addEventListener('click', () => {
                const num = parseInt(item.dataset.surah);
                this.loadSurah(num);
            });
        });
    }

    async loadSurah(number) {
        const viewer = document.getElementById('quranViewer');
        const textContainer = document.getElementById('quranText');
        const title = document.getElementById('viewerTitle');

        try {
            const response = await fetch(`https://api.alquran.cloud/v1/surah/${number}/en`);
            const data = await response.json();
            if (data.code === 200) {
                const surah = data.data;
                title.textContent = `${surah.name} (${surah.englishName})`;

                textContainer.innerHTML = `
                    <div style="text-align:center;padding:10px 0 20px;border-bottom:1px solid var(--border-color);">
                        <p style="color:var(--text-muted);font-size:14px;">${surah.numberOfAyahs} verses</p>
                    </div>
                    ${surah.ayahs.map(ayah => `
                        <div class="ayah">
                            <span class="ayah-number">${ayah.numberInSurah}</span>
                            <div class="ayah-text">${ayah.text}</div>
                        </div>
                    `).join('')}
                `;

                viewer.classList.add('active');
            }
        } catch (error) {
            showToast('❌ Error loading surah');
        }
    }

    setupEvents() {
        document.getElementById('closeViewer')?.addEventListener('click', () => {
            document.getElementById('quranViewer').classList.remove('active');
        });
    }
}

// ============================================
// QURAN TEACHER
// ============================================

class QuranTeacherModule {
    constructor() {
        this.verses = [
            { arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', translation: 'In the name of Allah' },
            { arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: 'Praise be to Allah' }
        ];
        this.currentVerseIndex = 0;
        this.init();
    }

    init() {
        this.showVerse();
        this.setupEvents();
        this.initSpeechRecognition();
    }

    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'ar-SA';
            this.recognition.continuous = false;
            this.recognition.interimResults = true;

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.processRecitation(transcript);
            };

            this.recognition.onend = () => {
                this.isRecording = false;
                document.getElementById('startRecording').style.display = 'inline-flex';
                document.getElementById('stopRecording').style.display = 'none';
            };
        }
    }

    setupEvents() {
        document.getElementById('startRecording')?.addEventListener('click', () => {
            this.startRecording();
        });

        document.getElementById('stopRecording')?.addEventListener('click', () => {
            this.stopRecording();
        });
    }

    startRecording() {
        if (!this.recognition) {
            showToast('⚠️ Speech recognition not available');
            return;
        }

        this.isRecording = true;
        document.getElementById('startRecording').style.display = 'none';
        document.getElementById('stopRecording').style.display = 'inline-flex';
        document.getElementById('feedbackArea').innerHTML = '<div class="feedback-item hint">🎙️ Listening...</div>';
        
        try {
            this.recognition.start();
        } catch (e) {}
    }

    stopRecording() {
        if (this.recognition) {
            try { this.recognition.stop(); } catch (e) {}
        }
        this.isRecording = false;
        document.getElementById('startRecording').style.display = 'inline-flex';
        document.getElementById('stopRecording').style.display = 'none';
    }

    processRecitation(transcript) {
        const currentVerse = this.verses[this.currentVerseIndex];
        const correctText = currentVerse.arabic;
        
        const similarity = this.calculateSimilarity(transcript, correctText);
        const accuracy = Math.round(similarity * 100);
        
        let feedback = '';
        let feedbackClass = '';
        
        if (accuracy >= 80) {
            feedback = `✅ Excellent! ${accuracy}% accurate. MashaAllah!`;
            feedbackClass = 'correct';
            this.currentVerseIndex = (this.currentVerseIndex + 1) % this.verses.length;
            setTimeout(() => this.showVerse(), 1500);
        } else if (accuracy >= 60) {
            feedback = `📖 Good effort! ${accuracy}% accurate. Keep going!`;
            feedbackClass = 'hint';
        } else {
            feedback = `🔄 Let's try again. Focus on pronunciation.`;
            feedbackClass = 'incorrect';
        }
        
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-item ${feedbackClass}">
                ${feedback}
                <br><small style="font-size:12px;">You said: "${transcript}"</small>
                ${accuracy < 80 ? `<br><small style="font-size:12px;">🎯 Correct: "${correctText}"</small>` : ''}
            </div>
        `;
    }

    calculateSimilarity(text1, text2) {
        const chars1 = text1.split('');
        const chars2 = text2.split('');
        const maxLen = Math.max(chars1.length, chars2.length);
        if (maxLen === 0) return 0;
        
        let matches = 0;
        for (let i = 0; i < Math.min(chars1.length, chars2.length); i++) {
            if (chars1[i] === chars2[i]) matches++;
        }
        
        return matches / maxLen;
    }

    showVerse() {
        const verse = this.verses[this.currentVerseIndex];
        const container = document.getElementById('currentVerse');
        if (container) {
            container.innerHTML = `
                <p class="arabic">${verse.arabic}</p>
                <p class="translation">"${verse.translation}"</p>
            `;
        }
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-item hint">🎙️ Click Start and recite the verse</div>
        `;
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🕌 Pro Max Islamic App loaded!');
    
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        currentUser = user;
        showApp();
    }
    
    initTheme();
    initSidebar();
    initNavigation();
    initDailyContent();
    initPrayerCountdown();
    initIslamicDate();
    
    window.quranModule = new QuranModule();
    window.quranTeacherModule = new QuranTeacherModule();
});
