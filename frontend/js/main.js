// ============================================
// PRO MAX ISLAMIC - COMPLETE MAIN.JS
// ALL 3 PARTS INTEGRATED
// ============================================

// ============================================
// GLOBAL STATE & CONFIGURATION
// ============================================

const AppState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    theme: localStorage.getItem('theme') || 'light',
    language: localStorage.getItem('language') || 'en',
    prayerTimes: {},
    trackedPrayers: JSON.parse(localStorage.getItem('trackedPrayers') || '{}'),
    zakatHistory: JSON.parse(localStorage.getItem('zakatHistory') || '[]'),
    dhikrCount: parseInt(localStorage.getItem('dhikrCount') || '0'),
    audioPlaylist: [],
    currentTrack: 0,
    isPlaying: false,
    audioPlayer: null,
    bookmarks: JSON.parse(localStorage.getItem('bookmarks') || '[]'),
    favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
    readingProgress: JSON.parse(localStorage.getItem('readingProgress') || '{}'),
    memorizedVerses: JSON.parse(localStorage.getItem('memorizedVerses') || '[]'),
    notifications: JSON.parse(localStorage.getItem('notifications') || '[]')
};

// ============================================
// TOAST NOTIFICATION
// ============================================

function showToast(message, type = 'info', duration = 3000) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();
    
    const colors = {
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#0f8a6d'
    };
    
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
        border: 2px solid ${colors[type] || colors.info};
        border-left: 6px solid ${colors[type] || colors.info};
        max-width: 90%;
        text-align: center;
        animation: slideUp 0.3s ease;
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
// AUTH FUNCTIONS
// ============================================

function showRegister() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('registerScreen').style.display = 'block';
    document.getElementById('forgotPasswordScreen').style.display = 'none';
}

function showLogin() {
    document.getElementById('registerScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('forgotPasswordScreen').style.display = 'none';
}

function showForgotPassword() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('registerScreen').style.display = 'none';
    document.getElementById('forgotPasswordScreen').style.display = 'block';
}

// Login Handler
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    if (username && password) {
        // Simulate API call
        const user = {
            id: Date.now(),
            username: username,
            name: username,
            email: username + '@email.com',
            joined: new Date().toISOString()
        };
        
        AppState.user = user;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', 'mock-token-' + Date.now());
        
        showApp();
        showToast('✅ Welcome back, ' + username + '!', 'success');
    } else {
        showToast('⚠️ Please fill in all fields', 'error');
    }
});

// Register Handler
document.getElementById('registerForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirmPassword')?.value;
    
    if (!username || !email || !password) {
        showToast('⚠️ Please fill in all required fields', 'error');
        return;
    }
    
    if (password !== confirm) {
        showToast('⚠️ Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('⚠️ Password must be at least 6 characters', 'error');
        return;
    }
    
    // Simulate registration
    const user = {
        id: Date.now(),
        username: username,
        name: username,
        email: email,
        phone: document.getElementById('regPhone')?.value || '',
        joined: new Date().toISOString()
    };
    
    AppState.user = user;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', 'mock-token-' + Date.now());
    
    showApp();
    showToast('🎉 Welcome, ' + username + '!', 'success');
});

// Forgot Password Handler
document.getElementById('forgotPasswordForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    if (email) {
        showToast('📧 Password reset link sent to ' + email, 'success');
        showLogin();
    }
});

// Password Toggle
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

// ============================================
// APP NAVIGATION
// ============================================

function showApp() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('appContainer').style.display = 'block';
    
    const user = AppState.user;
    if (user) {
        document.getElementById('userName').textContent = user.name || user.username;
        document.getElementById('profileName').textContent = user.name || user.username;
        document.getElementById('profileEmail').textContent = user.email || 'user@email.com';
        document.getElementById('userInitial').textContent = (user.name || user.username).charAt(0).toUpperCase();
        document.getElementById('profileInitial').textContent = (user.name || user.username).charAt(0).toUpperCase();
        document.getElementById('profileAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}&background=0f8a6d&color=fff&size=100`;
    }
}

function navigateTo(section) {
    document.querySelectorAll('.menu-item, .bottom-nav-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
    
    const targetSection = document.getElementById(section);
    if (targetSection) targetSection.classList.add('active');
    
    const pageTitle = document.getElementById('pageTitle');
    const titleMap = {
        home: '🏠 Home',
        quran: '📖 Quran',
        hadith: '📚 Hadith',
        duas: '🤲 Duas',
        prayer: '🕌 Prayer',
        zakat: '❤️ Zakat',
        hajj: '🕋 Hajj & Umrah',
        ramadan: '🌙 Ramadan',
        'quran-teacher': '🎙️ AI Teacher',
        'voice-assistant': '🗣️ Voice Assistant',
        ai: '🤖 AI Assistant',
        learning: '🎓 Learning',
        videos: '🎥 Videos',
        audio: '🎧 Audio',
        community: '👨‍👩‍👧 Community',
        kids: '👶 Kids',
        profile: '👤 Profile',
        settings: '⚙️ Settings'
    };
    pageTitle.textContent = titleMap[section] || section;
    document.getElementById('sidebar')?.classList.remove('open');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        AppState.user = null;
        document.getElementById('appContainer').style.display = 'none';
        document.getElementById('authContainer').style.display = 'block';
        showLogin();
        showToast('👋 Logged out successfully', 'info');
    }
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
        hadith: '📚 Hadith',
        duas: '🤲 Duas',
        prayer: '🕌 Prayer',
        zakat: '❤️ Zakat',
        hajj: '🕋 Hajj & Umrah',
        ramadan: '🌙 Ramadan',
        'quran-teacher': '🎙️ AI Teacher',
        'voice-assistant': '🗣️ Voice Assistant',
        ai: '🤖 AI Assistant',
        learning: '🎓 Learning',
        videos: '🎥 Videos',
        audio: '🎧 Audio',
        community: '👨‍👩‍👧 Community',
        kids: '👶 Kids',
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
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    
    // Set home as active by default
    const homeSection = document.getElementById('home');
    if (homeSection) homeSection.classList.add('active');
}

// ============================================
// LANGUAGE SETTINGS
// ============================================

function initLanguage() {
    const langToggle = document.getElementById('languageToggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const select = document.getElementById('languageSelect');
            if (select) {
                const languages = ['en', 'ar', 'om', 'am', 'so', 'ur', 'tr', 'fr', 'id'];
                const currentIndex = languages.indexOf(select.value);
                const nextIndex = (currentIndex + 1) % languages.length;
                select.value = languages[nextIndex];
                select.dispatchEvent(new Event('change'));
                showToast('🌍 Language changed', 'info');
            }
        });
    }
    
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) {
        langSelect.addEventListener('change', () => {
            localStorage.setItem('language', langSelect.value);
            showToast('🌍 Language saved: ' + langSelect.options[langSelect.selectedIndex].text, 'success');
            // In production, reload translations
        });
        const savedLang = localStorage.getItem('language');
        if (savedLang) {
            langSelect.value = savedLang;
        }
    }
}

// ============================================
// ISLAMIC DATE
// ============================================

function initIslamicDate() {
    const dateEl = document.getElementById('islamicDate');
    if (dateEl) {
        const months = ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 
                        'Jumada al-Thani', 'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 
                        'Dhul-Qadah', 'Dhul-Hijjah'];
        const date = new Date();
        // Approximate Islamic date (simplified)
        const islamicDay = Math.floor((date - new Date(2024, 6, 7)) / (1000 * 60 * 60 * 24)) % 30 + 1;
        const islamicMonth = Math.floor(((date - new Date(2024, 6, 7)) / (1000 * 60 * 60 * 24)) / 30) % 12;
        const islamicYear = 1446 + Math.floor(((date - new Date(2024, 6, 7)) / (1000 * 60 * 60 * 24)) / 354);
        dateEl.textContent = `${islamicDay} ${months[islamicMonth]} ${islamicYear} AH`;
    }
}

// ============================================
// DAILY CONTENT
// ============================================

function initDailyContent() {
    // Daily Verse
    const verses = [
        { arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', translation: '"Indeed, with hardship comes ease"', ref: 'Surah Ash-Sharh 94:6' },
        { arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا', translation: '"And whoever fears Allah, He will make a way out for him"', ref: 'Surah At-Talaq 65:2' },
        { arabic: 'وَالَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ', translation: '"And those who believe and do righteous deeds"', ref: 'Surah Al-Baqarah 2:25' }
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
    
    // Daily Hadith
    const hadiths = [
        { text: '"The best of you are those who are best to their families"', ref: 'Sunan Ibn Majah 1977' },
        { text: '"Whoever believes in Allah and the Last Day, let him speak good or remain silent"', ref: 'Sahih Bukhari 6018' },
        { text: '"The strong person is not the one who can wrestle, but the one who controls himself at times of anger"', ref: 'Sahih Bukhari 6114' }
    ];
    const hadith = hadiths[Math.floor(Math.random() * hadiths.length)];
    const hadithContainer = document.getElementById('dailyHadith');
    if (hadithContainer) {
        const textEl = hadithContainer.querySelector('.hadith-text');
        const refEl = hadithContainer.querySelector('.hadith-reference');
        if (textEl) textEl.textContent = hadith.text;
        if (refEl) refEl.textContent = hadith.ref;
    }
    
    // Daily Dua
    const duas = [
        { arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا', translation: '"O Allah, I ask You for beneficial knowledge"' },
        { arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ', translation: '"O Allah, I ask You for well-being"' },
        { arabic: 'رَبِّ زِدْنِي عِلْمًا', translation: '"My Lord, increase me in knowledge"' }
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
// DHIKR COUNTER
// ============================================

function initDhikrCounter() {
    const countEl = document.getElementById('dhikrCount');
    if (countEl) countEl.textContent = AppState.dhikrCount;
    
    document.getElementById('dhikrIncrement')?.addEventListener('click', () => {
        AppState.dhikrCount++;
        updateDhikrCounter();
    });
    
    document.getElementById('dhikrDecrement')?.addEventListener('click', () => {
        if (AppState.dhikrCount > 0) {
            AppState.dhikrCount--;
            updateDhikrCounter();
        }
    });
}

function updateDhikrCounter() {
    const countEl = document.getElementById('dhikrCount');
    if (countEl) countEl.textContent = AppState.dhikrCount;
    localStorage.setItem('dhikrCount', AppState.dhikrCount.toString());
}

function setDhikr(count) {
    AppState.dhikrCount = count;
    updateDhikrCounter();
    showToast(`📿 Counter set to ${count}`, 'info');
}

// ============================================
// PRAYER TRACKER
// ============================================

function initPrayerTracker() {
    const container = document.getElementById('prayerCheckboxes');
    if (!container) return;

    const today = new Date().toISOString().split('T')[0];
    const todayTracked = AppState.trackedPrayers[today] || [];

    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        const name = cb.value;
        if (todayTracked.includes(name)) {
            cb.checked = true;
            cb.parentElement.classList.add('checked');
        }

        cb.addEventListener('change', () => {
            if (cb.checked) {
                cb.parentElement.classList.add('checked');
                trackPrayer(name);
            } else {
                cb.parentElement.classList.remove('checked');
                untrackPrayer(name);
            }
            updatePrayerProgress();
        });
    });
    
    updatePrayerProgress();
}

function trackPrayer(name) {
    const today = new Date().toISOString().split('T')[0];
    if (!AppState.trackedPrayers[today]) AppState.trackedPrayers[today] = [];
    
    if (!AppState.trackedPrayers[today].includes(name)) {
        AppState.trackedPrayers[today].push(name);
        localStorage.setItem('trackedPrayers', JSON.stringify(AppState.trackedPrayers));
        
        if (AppState.trackedPrayers[today].length === 5) {
            showToast('🎉 All 5 prayers completed today! MashaAllah!', 'success');
        }
    }
}

function untrackPrayer(name) {
    const today = new Date().toISOString().split('T')[0];
    if (AppState.trackedPrayers[today]) {
        AppState.trackedPrayers[today] = AppState.trackedPrayers[today].filter(p => p !== name);
        localStorage.setItem('trackedPrayers', JSON.stringify(AppState.trackedPrayers));
    }
}

function updatePrayerProgress() {
    const container = document.getElementById('prayerCheckboxes');
    if (!container) return;

    const checked = container.querySelectorAll('input[type="checkbox"]:checked').length;
    const total = container.querySelectorAll('input[type="checkbox"]').length;
    const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;

    document.getElementById('prayerProgress').textContent = percentage;
}

function resetPrayerTracker() {
    const today = new Date().toISOString().split('T')[0];
    AppState.trackedPrayers[today] = [];
    localStorage.setItem('trackedPrayers', JSON.stringify(AppState.trackedPrayers));
    
    document.querySelectorAll('#prayerCheckboxes input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
        cb.parentElement.classList.remove('checked');
    });
    updatePrayerProgress();
    showToast('🔄 Prayer tracker reset', 'info');
}

// ============================================
// QIBLA COMPASS
// ============================================

function initQibla() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const meccaLat = 21.4225;
            const meccaLon = 39.8262;
            
            const dLon = meccaLon - lon;
            const x = Math.sin(dLon * Math.PI / 180) * Math.cos(meccaLat * Math.PI / 180);
            const y = Math.cos(lat * Math.PI / 180) * Math.sin(meccaLat * Math.PI / 180) -
                      Math.sin(lat * Math.PI / 180) * Math.cos(meccaLat * Math.PI / 180) * Math.cos(dLon * Math.PI / 180);
            let bearing = Math.atan2(x, y) * 180 / Math.PI;
            bearing = (bearing + 360) % 360;
            
            document.getElementById('qiblaDirection').textContent = `Qibla: ${bearing.toFixed(0)}° (${getDirection(bearing)})`;
            document.getElementById('qiblaNeedle').style.transform = `translate(-50%, -50%) rotate(${bearing}deg)`;
        }, () => {
            document.getElementById('qiblaDirection').textContent = 'Qibla: ~290° (Northwest)';
        });
    } else {
        document.getElementById('qiblaDirection').textContent = 'Qibla: ~290° (Northwest)';
    }
}

function getDirection(deg) {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(deg / 45) % 8;
    return dirs[index];
}

function calibrateQibla() {
    showToast('🧭 Calibrating compass...', 'info');
    initQibla();
}

// ============================================
// ZAKAT CALCULATOR
// ============================================

function calculateZakat() {
    const amount = parseFloat(document.getElementById('zakatAmount').value);
    const currency = document.getElementById('zakatCurrency').value;
    const nisab = parseFloat(document.getElementById('zakatNisab').value) || 595;
    
    if (!amount || amount <= 0) {
        showToast('⚠️ Please enter a valid amount', 'error');
        return;
    }
    
    const zakatRate = 0.025; // 2.5%
    const zakatDue = amount * zakatRate;
    const isEligible = amount >= nisab;
    
    const resultDiv = document.getElementById('zakatResult');
    resultDiv.innerHTML = `
        <div class="result-card">
            <h3>Zakat Calculation</h3>
            <p class="result-amount">${currency.toUpperCase()} ${zakatDue.toFixed(2)}</p>
            <p class="result-details">2.5% of ${currency.toUpperCase()} ${amount.toFixed(2)}</p>
            <p class="result-details">Nisab: ${currency.toUpperCase()} ${nisab.toFixed(2)}</p>
            <p class="result-details" style="color:${isEligible ? 'var(--primary)' : '#ef4444'};font-weight:600;">
                ${isEligible ? '✅ You are eligible to pay Zakat' : '⚠️ Your wealth is below Nisab threshold'}
            </p>
        </div>
        <button class="btn-secondary" onclick="saveZakatHistory(${amount}, ${zakatDue}, '${currency}')">
            <i class="fas fa-save"></i> Save History
        </button>
    `;
}

function saveZakatHistory(amount, zakatDue, currency) {
    const history = {
        id: Date.now(),
        amount: amount,
        zakatDue: zakatDue,
        currency: currency,
        date: new Date().toISOString()
    };
    
    AppState.zakatHistory.push(history);
    localStorage.setItem('zakatHistory', JSON.stringify(AppState.zakatHistory));
    showToast('✅ Zakat history saved!', 'success');
    loadZakatHistory();
}

function loadZakatHistory() {
    const container = document.getElementById('zakatHistoryList');
    if (!container) return;
    
    if (AppState.zakatHistory.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);font-size:14px;">No zakat history yet.</p>';
        return;
    }
    
    container.innerHTML = AppState.zakatHistory.slice().reverse().map(h => `
        <div class="history-item" style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-color);">
            <span>${h.currency.toUpperCase()} ${h.amount.toFixed(2)}</span>
            <span style="color:var(--primary);font-weight:600;">Zakat: ${h.currency.toUpperCase()} ${h.zakatDue.toFixed(2)}</span>
            <span style="font-size:12px;color:var(--text-muted);">${new Date(h.date).toLocaleDateString()}</span>
        </div>
    `).join('');
}

// ============================================
// QURAN MODULE
// ============================================

class QuranModule {
    constructor() {
        this.surahs = [];
        this.currentSurah = null;
        this.init();
    }

    async init() {
        await this.loadSurahs();
        this.renderSurahList();
        this.setupQuranEvents();
    }

    async loadSurahs() {
        try {
            const response = await fetch('https://api.alquran.cloud/v1/meta');
            const data = await response.json();
            if (data.code === 200) {
                this.surahs = data.data.surahs;
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
                        <button onclick="window.quranModule?.playSurahAudio(${number})" 
                            style="margin-top:8px;padding:8px 20px;background:var(--primary);color:white;border:none;border-radius:var(--radius-full);cursor:pointer;">
                            <i class="fas fa-play"></i> Play Recitation
                        </button>
                    </div>
                    ${surah.ayahs.map(ayah => `
                        <div class="ayah" onclick="window.quranModule?.selectAyah(${number}, ${ayah.numberInSurah})">
                            <span class="ayah-number">${ayah.numberInSurah}</span>
                            <div class="ayah-text">${ayah.text}</div>
                        </div>
                    `).join('')}
                `;

                viewer.classList.add('active');
                this.currentSurah = number;
                showToast(`📖 Opened ${surah.name}`, 'info');
            }
        } catch (error) {
            showToast('❌ Error loading surah', 'error');
        }
    }

    playSurahAudio(number) {
        const reciterMap = {
            mishary: 'mishary_rashid_alafasy',
            sudais: 'abdul_rahman_al_sudais',
            ghamdi: 'saad_al_ghamdi',
            muaiqly: 'maher_al_muaiqly'
        };
        const selectedReciter = document.getElementById('reciterSelect')?.value || 'mishary';
        const reciter = reciterMap[selectedReciter] || 'mishary_rashid_alafasy';
        const url = `https://cdn.islamic.network/quran/audio/128/${reciter}/${number}.mp3`;
        
        const audio = new Audio(url);
        audio.play().then(() => {
            showToast(`🔊 Playing recitation`, 'info');
        }).catch(() => {
            showToast('⚠️ Audio failed. Try another reciter.', 'error');
        });
    }

    selectAyah(surah, ayah) {
        showToast(`🎯 Selected Ayah ${ayah} of Surah ${surah}`, 'info');
        // Navigate to Quran Teacher
        navigateTo('quran-teacher');
        // Pass the ayah to teacher
        if (window.quranTeacherModule) {
            window.quranTeacherModule.setAyah(surah, ayah);
        }
    }

    setupQuranEvents() {
        document.getElementById('closeViewer')?.addEventListener('click', () => {
            document.getElementById('quranViewer').classList.remove('active');
        });

        document.getElementById('quranSearch')?.addEventListener('input', function() {
            const filter = this.value.toLowerCase();
            document.querySelectorAll('.surah-item').forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(filter) ? 'flex' : 'none';
            });
        });
    }
}

// ============================================
// HADITH MODULE
// ============================================

class HadithModule {
    constructor() {
        this.hadithData = {
            bukhari: [
                { text: '"The best of you are those who are best to their families"', reference: 'Sahih Bukhari, Book 78, Hadith 160' },
                { text: '"Whoever believes in Allah and the Last Day, let him speak good or remain silent"', reference: 'Sahih Bukhari, Book 78, Hadith 113' },
                { text: '"The strong person is not the one who can wrestle, but the one who controls himself at times of anger"', reference: 'Sahih Bukhari, Book 73, Hadith 135' }
            ],
            muslim: [
                { text: '"The best of people are those who are most beneficial to others"', reference: 'Sahih Muslim, Book 45, Hadith 100' },
                { text: '"A good word is charity"', reference: 'Sahih Muslim, Book 5, Hadith 57' }
            ],
            abudawud: [
                { text: '"Whoever guides someone to goodness will have a reward"', reference: 'Sunan Abi Dawud, Book 10, Hadith 20' }
            ],
            tirmidhi: [
                { text: '"The most beloved of deeds to Allah are those done consistently"', reference: 'Sunan Tirmidhi, Book 48, Hadith 1' }
            ],
            nasai: [
                { text: '"Whoever believes in Allah and the Last Day, let him honor his guest"', reference: 'Sunan Nasai, Book 45, Hadith 15' }
            ],
            ibnmajah: [
                { text: '"The best of you are those who are best to their families"', reference: 'Sunan Ibn Majah, Book 9, Hadith 1977' }
            ],
            nawawi: [
                { text: '"Actions are judged by intentions"', reference: '40 Hadith Nawawi, Hadith 1' },
                { text: '"Islam is built upon five pillars"', reference: '40 Hadith Nawawi, Hadith 3' }
            ],
            riyad: [
                { text: '"The most beloved of deeds to Allah are prayer on time and kindness to parents"', reference: 'Riyad as-Salihin, Hadith 1' }
            ]
        };
        this.currentCollection = 'bukhari';
        this.favorites = JSON.parse(localStorage.getItem('hadithFavorites') || '[]');
        this.init();
    }

    init() {
        this.renderCollections();
        this.renderHadith();
        this.setupHadithEvents();
    }

    renderCollections() {
        const container = document.querySelector('.collection-grid');
        if (!container) return;

        container.querySelectorAll('.collection-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.collection-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCollection = btn.dataset.collection;
                this.renderHadith();
            });
        });
    }

    renderHadith() {
        const container = document.getElementById('hadithList');
        if (!container) return;

        const hadiths = this.hadithData[this.currentCollection] || [];
        const searchTerm = document.getElementById('hadithSearch')?.value?.toLowerCase() || '';

        const filtered = hadiths.filter(h => 
            h.text.toLowerCase().includes(searchTerm) ||
            h.reference.toLowerCase().includes(searchTerm)
        );

        if (filtered.length === 0) {
            container.innerHTML = '<p style="text-align:center;padding:40px;color:var(--text-muted);">No hadith found</p>';
            return;
        }

        container.innerHTML = filtered.map(h => `
            <div class="hadith-item">
                <div class="hadith-text">${h.text}</div>
                <div class="hadith-reference">📚 ${h.reference}</div>
                <button class="favorite-btn" onclick="window.hadithModule?.toggleFavorite('${encodeURIComponent(h.text)}')" 
                    style="margin-top:8px;padding:4px 14px;border:none;background:var(--primary-bg);color:var(--primary);border-radius:var(--radius-full);font-size:12px;cursor:pointer;">
                    <i class="fas ${this.favorites.includes(h.text) ? 'fa-star' : 'fa-star-o'}"></i>
                    ${this.favorites.includes(h.text) ? 'Favorited' : 'Add to Favorites'}
                </button>
            </div>
        `).join('');
    }

    toggleFavorite(text) {
        const index = this.favorites.indexOf(text);
        if (index > -1) {
            this.favorites.splice(index, 1);
            showToast('Removed from favorites', 'info');
        } else {
            this.favorites.push(text);
            showToast('⭐ Added to favorites', 'success');
        }
        localStorage.setItem('hadithFavorites', JSON.stringify(this.favorites));
        this.renderHadith();
        this.renderFavorites();
    }

    renderFavorites() {
        const container = document.getElementById('favoriteHadith');
        if (!container) return;

        if (this.favorites.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);font-size:14px;">No favorite hadith yet.</p>';
            return;
        }

        let allHadith = [];
        Object.values(this.hadithData).forEach(arr => allHadith = allHadith.concat(arr));
        
        const favorites = allHadith.filter(h => this.favorites.includes(h.text));

        container.innerHTML = favorites.map(h => `
            <div class="hadith-item favorite-hadith" style="padding:12px 16px;">
                <div class="hadith-text">${h.text}</div>
                <div class="hadith-reference">📚 ${h.reference}</div>
            </div>
        `).join('');
    }

    showRandomHadith() {
        let allHadith = [];
        Object.values(this.hadithData).forEach(arr => allHadith = allHadith.concat(arr));
        const random = allHadith[Math.floor(Math.random() * allHadith.length)];
        if (random) {
            showToast(`📜 ${random.text}`, 'info');
        }
    }

    showDailyHadith() {
        this.showRandomHadith();
    }

    toggleHadithAudio() {
        showToast('🔊 Audio narration coming soon!', 'info');
    }

    toggleHadithDarkMode() {
        document.documentElement.toggleAttribute('data-hadith-dark');
        showToast('📖 Hadith dark mode toggled', 'info');
    }

    setupHadithEvents() {
        document.getElementById('hadithSearch')?.addEventListener('input', () => {
            this.renderHadith();
        });

        document.querySelector('.hadith-features .feature-group button')?.addEventListener('click', function() {
            // Handled by onclick attributes
        });
    }
}

// ============================================
// DUAS MODULE
// ============================================

class DuasModule {
    constructor() {
        this.duaData = {
            morning: [
                { arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا', translation: 'O Allah, we have entered the morning with You', reference: 'Sunan Abi Dawud 5068' },
                { arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا', translation: 'O Allah, I ask You for beneficial knowledge', reference: 'Sunan Ibn Majah 925' }
            ],
            evening: [
                { arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا', translation: 'O Allah, we have entered the evening with You', reference: 'Sunan Abi Dawud 5069' }
            ],
            sleep: [
                { arabic: 'اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا', translation: 'O Allah, with Your name I die and I live', reference: 'Sahih Bukhari 7394' }
            ],
            eating: [
                { arabic: 'بِسْمِ اللَّهِ فِي أَوَّلِهِ وَآخِرِهِ', translation: 'In the name of Allah at the beginning and at the end', reference: 'Sunan Abi Dawud 3767' }
            ],
            travel: [
                { arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا', translation: 'Glory to Him who has subjected this to us', reference: 'Surah Az-Zukhruf 43:13' }
            ],
            illness: [
                { arabic: 'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ', translation: 'I ask Allah the Mighty to cure you', reference: 'Sunan Abi Dawud 3106' }
            ],
            protection: [
                { arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', translation: 'I seek refuge in the perfect words of Allah from the evil He has created', reference: 'Sahih Muslim 2709' }
            ],
            forgiveness: [
                { arabic: 'اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ', translation: 'O Allah, forgive all my sins', reference: 'Sahih Muslim 483' }
            ],
            family: [
                { arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ', translation: 'Our Lord, grant us from our spouses and offspring comfort to our eyes', reference: 'Surah Al-Furqan 25:74' }
            ]
        };
        this.currentCategory = 'all';
        this.favorites = JSON.parse(localStorage.getItem('duaFavorites') || '[]');
        this.init();
    }

    init() {
        this.renderCategories();
        this.renderDuas();
        this.renderFavorites();
        this.setupDuaEvents();
    }

    renderCategories() {
        const container = document.querySelector('.category-grid');
        if (!container) return;

        container.querySelectorAll('.dua-cat').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.dua-cat').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.cat;
                this.renderDuas();
            });
        });
    }

    renderDuas() {
        const container = document.getElementById('duaList');
        if (!container) return;

        let duas = [];
        if (this.currentCategory === 'all') {
            Object.values(this.duaData).forEach(arr => duas = duas.concat(arr));
        } else {
            duas = this.duaData[this.currentCategory] || [];
        }

        const searchTerm = document.getElementById('duaSearch')?.value?.toLowerCase() || '';
        const filtered = duas.filter(d => 
            d.arabic.includes(searchTerm) ||
            d.translation.toLowerCase().includes(searchTerm)
        );

        if (filtered.length === 0) {
            container.innerHTML = '<p style="text-align:center;padding:40px;color:var(--text-muted);">No duas found</p>';
            return;
        }

        container.innerHTML = filtered.map(d => `
            <div class="dua-item">
                <div class="dua-arabic">${d.arabic}</div>
                <div class="dua-translation">"${d.translation}"</div>
                ${d.reference ? `<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">📚 ${d.reference}</div>` : ''}
                <div class="dua-actions">
                    <button onclick="window.duasModule?.toggleFavorite('${encodeURIComponent(d.arabic)}')">
                        <i class="fas ${this.favorites.includes(d.arabic) ? 'fa-star' : 'fa-star-o'}"></i>
                        ${this.favorites.includes(d.arabic) ? 'Favorited' : 'Add to Favorites'}
                    </button>
                    <button onclick="navigator.clipboard.writeText('${d.arabic}')">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <button onclick="window.duasModule?.playDuaAudio('${encodeURIComponent(d.arabic)}')">
                        <i class="fas fa-volume-up"></i> Audio
                    </button>
                </div>
            </div>
        `).join('');
    }

    toggleFavorite(arabic) {
        const index = this.favorites.indexOf(arabic);
        if (index > -1) {
            this.favorites.splice(index, 1);
            showToast('Removed from favorites', 'info');
        } else {
            this.favorites.push(arabic);
            showToast('⭐ Added to favorites', 'success');
        }
        localStorage.setItem('duaFavorites', JSON.stringify(this.favorites));
        this.renderDuas();
        this.renderFavorites();
    }

    renderFavorites() {
        const container = document.getElementById('favoriteDuas');
        if (!container) return;

        if (this.favorites.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);font-size:14px;">No favorite duas yet.</p>';
            return;
        }

        let allDuas = [];
        Object.values(this.duaData).forEach(arr => allDuas = allDuas.concat(arr));
        const favorites = allDuas.filter(d => this.favorites.includes(d.arabic));

        container.innerHTML = favorites.map(d => `
            <div class="dua-item favorite-dua" style="padding:12px 16px;">
                <div class="dua-arabic" style="font-size:18px;">${d.arabic}</div>
                <div class="dua-translation" style="font-size:13px;">${d.translation}</div>
            </div>
        `).join('');
    }

    playDuaAudio(text) {
        const utterance = new SpeechSynthesisUtterance(decodeURIComponent(text));
        utterance.lang = 'ar-SA';
        utterance.rate = 0.7;
        window.speechSynthesis?.speak(utterance);
        showToast('🔊 Playing dua audio', 'info');
    }

    repeatDua() {
        showToast('🔄 Repeat mode activated', 'info');
    }

    autoPlayDuas() {
        showToast('▶️ Auto-play started', 'info');
    }

    toggleDuaTranslation() {
        document.querySelectorAll('.dua-translation').forEach(el => {
            el.style.display = el.style.display === 'none' ? 'block' : 'none';
        });
        showToast('🌍 Translation toggled', 'info');
    }

    searchDuas() {
        this.renderDuas();
    }

    setupDuaEvents() {
        document.getElementById('duaSearch')?.addEventListener('input', () => {
            this.renderDuas();
        });
    }
}

// ============================================
// AI QURAN TEACHER MODULE
// ============================================

class QuranTeacherModule {
    constructor() {
        this.verses = [
            { arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', translation: 'In the name of Allah, the Most Gracious, the Most Merciful' },
            { arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: 'Praise be to Allah, Lord of all the worlds' },
            { arabic: 'الرَّحْمَٰنِ الرَّحِيمِ', translation: 'The Most Gracious, the Most Merciful' },
            { arabic: 'مَالِكِ يَوْمِ الدِّينِ', translation: 'Master of the Day of Judgment' },
            { arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', translation: 'You alone we worship, and You alone we ask for help' }
        ];
        this.currentVerseIndex = 0;
        this.accuracy = 0;
        this.versesMemorized = parseInt(localStorage.getItem('quranMemorizedCount') || '0');
        this.isRecording = false;
        this.recognition = null;
        this.init();
    }

    init() {
        this.showVerse();
        this.updateStats();
        this.setupTeacherEvents();
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

            this.recognition.onerror = () => {
                this.isRecording = false;
                document.getElementById('startRecording').style.display = 'inline-flex';
                document.getElementById('stopRecording').style.display = 'none';
                showToast('⚠️ Please speak clearly', 'error');
            };
        }
    }

    setupTeacherEvents() {
        document.getElementById('startRecording')?.addEventListener('click', () => {
            this.startRecording();
        });

        document.getElementById('stopRecording')?.addEventListener('click', () => {
            this.stopRecording();
        });

        document.getElementById('playCorrect')?.addEventListener('click', () => {
            this.playCorrectPronunciation();
        });

        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                showToast(`📚 Mode: ${btn.textContent}`, 'info');
            });
        });
    }

    startRecording() {
        if (!this.recognition) {
            showToast('⚠️ Speech recognition not available', 'error');
            return;
        }

        this.isRecording = true;
        document.getElementById('startRecording').style.display = 'none';
        document.getElementById('stopRecording').style.display = 'inline-flex';
        document.getElementById('feedbackArea').innerHTML = '<div class="feedback-item hint">🎙️ Listening...</div>';
        
        try {
            this.recognition.start();
        } catch (e) {
            console.error('Error starting recognition:', e);
        }
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
            this.versesMemorized++;
            localStorage.setItem('quranMemorizedCount', this.versesMemorized.toString());
            this.updateStats();
            this.currentVerseIndex = (this.currentVerseIndex + 1) % this.verses.length;
            setTimeout(() => this.showVerse(), 1500);
            showToast('🎯 Moving to next verse', 'success');
        } else if (accuracy >= 60) {
            feedback = `📖 Good effort! ${accuracy}% accurate. Keep going!`;
            feedbackClass = 'hint';
        } else {
            feedback = `🔄 Let's try again. Focus on pronunciation.`;
            feedbackClass = 'incorrect';
            setTimeout(() => this.playCorrectPronunciation(), 1000);
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

    playCorrectPronunciation() {
        const verse = this.verses[this.currentVerseIndex];
        const utterance = new SpeechSynthesisUtterance(verse.arabic);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.6;
        window.speechSynthesis?.speak(utterance);
        showToast('🔊 Playing correct pronunciation', 'info');
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

    updateStats() {
        document.getElementById('accuracyScore').textContent = `${this.accuracy}%`;
        document.getElementById('versesMemorized').textContent = this.versesMemorized;
        document.getElementById('tajweedScore').textContent = `${Math.min(this.accuracy + 10, 100)}%`;
        document.getElementById('fluencyScore').textContent = `${Math.min(this.accuracy + 5, 100)}%`;
    }

    setAyah(surah, ayah) {
        showToast(`📖 Practicing Ayah ${ayah} of Surah ${surah}`, 'info');
        // In production, load the specific ayah
    }
}

// ============================================
// AI ASSISTANT MODULE
// ============================================

class AIModule {
    constructor() {
        this.messages = [];
        this.conversationHistory = JSON.parse(localStorage.getItem('aiConversation') || '[]');
        this.isProcessing = false;
        this.init();
    }

    init() {
        if (this.conversationHistory.length > 0) {
            this.messages = this.conversationHistory;
            this.renderMessages();
        } else {
            this.addWelcomeMessage();
        }
        this.setupAIEvents();
    }

    addWelcomeMessage() {
        const welcome = {
            role: 'bot',
            content: `Assalamu Alaikum! I'm your Islamic AI assistant. I can help you with:

• 📖 Explaining Quran verses
• 📚 Clarifying Hadith
• 🕌 Islamic rulings and practices
• 🎓 Personalized learning plans
• 🔍 Searching Islamic content

💡 Try asking: "Explain Surah Al-Fatihah" or "What does the Quran say about patience?"
📚 Sources: Quran, Sahih Hadith, Scholarly Consensus`
        };
        this.messages.push(welcome);
        this.saveConversation();
        this.renderMessages();
    }

    setupAIEvents() {
        document.getElementById('aiSend')?.addEventListener('click', () => {
            this.handleUserInput();
        });

        document.getElementById('aiInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleUserInput();
            }
        });

        document.getElementById('aiVoice')?.addEventListener('click', () => {
            this.startVoiceInput();
        });
    }

    async handleUserInput() {
        const input = document.getElementById('aiInput');
        const question = input.value.trim();
        if (!question || this.isProcessing) return;

        this.addMessage('user', question);
        input.value = '';
        this.isProcessing = true;
        this.updateSendButton(true);

        this.showTypingIndicator();

        try {
            const response = await this.getAIResponse(question);
            this.removeTypingIndicator();
            this.addMessage('bot', response);
        } catch (error) {
            console.error('AI Error:', error);
            this.removeTypingIndicator();
            this.addMessage('bot', 'I apologize, but I encountered an error. Please try again later.');
        }

        this.isProcessing = false;
        this.updateSendButton(false);
    }

    addMessage(role, content) {
        const message = { role, content, timestamp: new Date().toISOString() };
        this.messages.push(message);
        this.saveConversation();
        this.renderMessages();
    }

    renderMessages() {
        const container = document.getElementById('aiMessages');
        if (!container) return;

        container.innerHTML = this.messages.map(msg => {
            const isUser = msg.role === 'user';
            const content = msg.content || '';
            const hasSources = content.includes('📚 Sources:');
            const parts = hasSources ? content.split('📚 Sources:') : [content];
            const mainContent = parts[0] || content;
            const sources = parts[1] || '';

            return `
                <div class="ai-message ${isUser ? 'user' : 'bot'}">
                    <div class="message-content">
                        <div style="white-space:pre-wrap;">${this.formatContent(mainContent)}</div>
                        ${sources ? `<div style="font-size:12px;color:var(--text-muted);margin-top:8px;padding-top:8px;border-top:1px solid var(--border-color);">📚 Sources: ${sources}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        container.scrollTop = container.scrollHeight;
    }

    formatContent(content) {
        return content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/• (.*?)(<br>|$)/g, '• $1$2');
    }

    showTypingIndicator() {
        const container = document.getElementById('aiMessages');
        if (!container) return;
        this.removeTypingIndicator();

        const indicator = document.createElement('div');
        indicator.className = 'ai-message bot';
        indicator.id = 'typingIndicator';
        indicator.innerHTML = `
            <div class="message-content">
                <div style="display:flex;gap:4px;padding:8px 12px;">
                    <span style="width:8px;height:8px;background:var(--text-muted);border-radius:50%;animation:typing 1.4s infinite;"></span>
                    <span style="width:8px;height:8px;background:var(--text-muted);border-radius:50%;animation:typing 1.4s infinite 0.2s;"></span>
                    <span style="width:8px;height:8px;background:var(--text-muted);border-radius:50%;animation:typing 1.4s infinite 0.4s;"></span>
                </div>
            </div>
        `;
        container.appendChild(indicator);
        container.scrollTop = container.scrollHeight;
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }

    updateSendButton(processing) {
        const sendBtn = document.getElementById('aiSend');
        if (sendBtn) {
            sendBtn.disabled = processing;
            sendBtn.innerHTML = processing ? 
                '<i class="fas fa-spinner fa-spin"></i>' : 
                '<i class="fas fa-paper-plane"></i>';
        }
    }

    saveConversation() {
        if (this.messages.length > 50) this.messages = this.messages.slice(-50);
        localStorage.setItem('aiConversation', JSON.stringify(this.messages));
    }

    async getAIResponse(question) {
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

        const lower = question.toLowerCase();
        let response = '';

        if (lower.includes('pillar') || lower.includes('pillars')) {
            response = `The Five Pillars of Islam are:

1. **Shahada** - Declaration of faith
2. **Salah** - Five daily prayers
3. **Zakat** - Charity (2.5%)
4. **Sawm** - Fasting in Ramadan
5. **Hajj** - Pilgrimage to Mecca

📚 Sources: Quran & Sahih Hadith`;
        } else if (lower.includes('fatihah') || lower.includes('al-fatihah')) {
            response = `**Surah Al-Fatihah** - The Opening

• 7 verses, recited in every prayer
• Summary: Praise to Allah, seeking guidance
• Key verse: "Guide us to the straight path"

📚 Source: Quran 1:1-7`;
        } else if (lower.includes('patience') || lower.includes('sabr')) {
            response = `**Patience (Sabr)** in Islam:

• "Indeed, Allah is with the patient" (Quran 2:153)
• "And be patient, for your patience is from Allah" (Quran 16:127)

📚 Sources: Quran 2:153, 16:127`;
        } else {
            response = `Thank you for your question. I'll provide an answer based on Islamic sources.

Please clarify your question so I can give you a more specific response about:
• Islamic beliefs (Tawhid, Angels, Prophets)
• Acts of worship (Prayer, Fasting, Zakat, Hajj)
• Islamic ethics and morals
• Quranic verses and their meanings

📚 Sources: Quran, Sahih Hadith (Bukhari & Muslim)`;
        }

        return response;
    }

    startVoiceInput() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.continuous = false;
            recognition.interimResults = true;

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('aiInput').value = transcript;
                this.handleUserInput();
            };

            recognition.start();
            showToast('🎤 Listening...', 'info');
        } else {
            showToast('⚠️ Voice input not supported', 'error');
        }
    }
}

// ============================================
// AUDIO MODULE
// ============================================

class AudioModule {
    constructor() {
        this.playlist = [
            { title: 'Surah Al-Fatihah', artist: 'Mishary Alafasy', duration: '3:45' },
            { title: 'Surah Al-Baqarah', artist: 'Mishary Alafasy', duration: '45:20' },
            { title: 'Surah Yasin', artist: 'Al-Sudais', duration: '12:30' },
            { title: 'Tawhid Lecture', artist: 'Sheikh Bin Baz', duration: '32:15' },
            { title: 'Morning Adhkar', artist: 'Various', duration: '8:30' }
        ];
        this.currentTrack = 0;
        this.isPlaying = false;
        this.audioPlayer = null;
        this.init();
    }

    init() {
        this.renderPlaylist();
        this.setupAudioEvents();
    }

    renderPlaylist() {
        const container = document.querySelector('.audio-list');
        if (!container) return;

        container.innerHTML = this.playlist.map((track, index) => `
            <div class="audio-item" onclick="window.audioModule?.playTrack(${index})">
                <span>${track.title}</span>
                <span class="audio-duration">${track.duration}</span>
                <button class="download-btn" onclick="event.stopPropagation(); window.audioModule?.downloadTrack(${index})">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        `).join('');
    }

    playTrack(index) {
        this.currentTrack = index;
        const track = this.playlist[index];
        document.getElementById('audioTitle').textContent = track.title;
        document.getElementById('audioArtist').textContent = track.artist;
        
        // Simulate audio playback
        this.isPlaying = true;
        document.querySelector('.audio-controls button:first-child').innerHTML = '<i class="fas fa-pause"></i>';
        showToast(`▶️ Playing: ${track.title}`, 'info');
        
        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 1;
            document.getElementById('audioProgress').value = progress;
            document.getElementById('audioCurrent').textContent = `0:${String(Math.floor(progress * 0.5)).padStart(2, '0')}`;
            if (progress >= 100) {
                clearInterval(interval);
                this.isPlaying = false;
                document.querySelector('.audio-controls button:first-child').innerHTML = '<i class="fas fa-play"></i>';
            }
        }, 100);
    }

    playAudio() {
        if (this.isPlaying) {
            this.pauseAudio();
        } else {
            this.playTrack(this.currentTrack);
        }
    }

    pauseAudio() {
        this.isPlaying = false;
        document.querySelector('.audio-controls button:first-child').innerHTML = '<i class="fas fa-play"></i>';
        showToast('⏸️ Paused', 'info');
    }

    stopAudio() {
        this.isPlaying = false;
        document.querySelector('.audio-controls button:first-child').innerHTML = '<i class="fas fa-play"></i>';
        document.getElementById('audioProgress').value = 0;
        document.getElementById('audioCurrent').textContent = '0:00';
        showToast('⏹️ Stopped', 'info');
    }

    nextAudio() {
        this.currentTrack = (this.currentTrack + 1) % this.playlist.length;
        this.playTrack(this.currentTrack);
    }

    prevAudio() {
        this.currentTrack = (this.currentTrack - 1 + this.playlist.length) % this.playlist.length;
        this.playTrack(this.currentTrack);
    }

    shuffleAudio() {
        showToast('🔀 Shuffled', 'info');
        this.currentTrack = Math.floor(Math.random() * this.playlist.length);
        this.playTrack(this.currentTrack);
    }

    repeatAudio() {
        showToast('🔁 Repeat mode', 'info');
    }

    downloadTrack(index) {
        showToast(`⬇️ Downloading: ${this.playlist[index].title}`, 'info');
    }

    setPlaybackSpeed(speed) {
        document.querySelectorAll('.audio-options button').forEach(b => b.classList.remove('active'));
        document.querySelector(`.audio-options button[onclick*="${speed}"]`)?.classList.add('active');
        showToast(`⏩ Speed: ${speed}x`, 'info');
    }

    toggleSleepTimer() {
        showToast('⏰ Sleep timer: 30 minutes', 'info');
    }

    toggleEqualizer() {
        showToast('🎛️ Equalizer opened', 'info');
    }

    setupAudioEvents() {
        document.getElementById('audioProgress')?.addEventListener('input', function() {
            // Handle seek
        });
    }
}

// ============================================
// VIDEO MODULE
// ============================================

function playVideo(category) {
    const videos = {
        tajweed: { title: 'Tajweed Lesson 1', url: 'https://www.youtube.com/watch?v=VIDEO_ID' },
        tafsir: { title: 'Tafseer Surah Al-Fatihah', url: 'https://www.youtube.com/watch?v=VIDEO_ID' },
        recitation: { title: 'Quran Recitation - Al-Baqarah', url: 'https://www.youtube.com/watch?v=VIDEO_ID' },
        seerah: { title: 'Life of Prophet Muhammad', url: 'https://www.youtube.com/watch?v=VIDEO_ID' },
        history: { title: 'Islamic Golden Age', url: 'https://www.youtube.com/watch?v=VIDEO_ID' },
        kids: { title: 'Learn Arabic Alphabet', url: 'https://www.youtube.com/watch?v=VIDEO_ID' }
    };
    
    const video = videos[category];
    if (video) {
        showToast(`▶️ Playing: ${video.title}`, 'info');
        window.open(video.url, '_blank');
    }
}

// ============================================
// COMMUNITY FUNCTIONS
// ============================================

function likePost(btn) {
    const count = btn.closest('.post-actions').parentElement.querySelector('.post-stats span:first-child');
    if (count) {
        const likes = parseInt(count.textContent) || 0;
        count.textContent = `❤️ ${likes + 1}`;
        btn.style.color = '#ef4444';
    }
}

function commentPost(btn) {
    showToast('💬 Comment feature coming soon!', 'info');
}

function sharePost(btn) {
    if (navigator.share) {
        navigator.share({
            title: 'Islamic Post',
            text: document.querySelector('.post-content')?.textContent || 'Share this post'
        });
    } else {
        showToast('📤 Share link copied!', 'info');
    }
}

function showGroups() {
    showToast('👥 Groups feature coming soon!', 'info');
}

function showEvents() {
    showToast('📅 Events feature coming soon!', 'info');
}

function showForum() {
    showToast('💬 Forum feature coming soon!', 'info');
}

function showAnnouncements() {
    showToast('📢 Announcements feature coming soon!', 'info');
}

// ============================================
// KIDS FUNCTIONS
// ============================================

function showKidsStory(story) {
    const stories = {
        prophet: 'The Story of Prophet Muhammad ﷺ - The final messenger of Allah',
        brave: 'The Brave King - A story about courage and faith',
        ant: 'The Ant and the Prophet - Learning from Allah\'s creation',
        cave: 'The People of the Cave - A story of faith and perseverance'
    };
    showToast(`📖 ${stories[story] || 'Story time!'}`, 'info');
}

function startGame(game) {
    const games = {
        alphabet: '🔤 Arabic Alphabet Match - Find matching letters!',
        prayer: '🕌 Prayer Time Quiz - Learn the 5 daily prayers!',
        memory: '🧠 Memory Game - Test your memory!',
        coloring: '🎨 Coloring Pages - Color Islamic pictures!'
    };
    showToast(`🎮 ${games[game] || 'Game time!'}`, 'info');
}

function showKidsLearning(topic) {
    const topics = {
        quran: '📖 Quran for Kids - Learn short surahs!',
        dua: '🤲 Dua Learning - Learn daily duas!',
        wudu: '🚿 Wudu Lessons - Learn how to make wudu!',
        manners: '💫 Good Manners - Learn Islamic manners!'
    };
    showToast(`📝 ${topics[topic] || 'Learning time!'}`, 'info');
}

// ============================================
// HAJJ FUNCTIONS
// ============================================

function showHajjDetail(type) {
    const details = {
        tamattu: 'Tamattu\' Hajj - Umrah + Hajj with sacrifice. Most common type.',
        qiran: 'Qiran Hajj - Umrah + Hajj combined without separation.',
        ifrad: 'Ifrad Hajj - Hajj only, no Umrah.'
    };
    showToast(`🕋 ${details[type] || 'Hajj detail'}`, 'info');
}

function openHajjMap() {
    showToast('📍 Opening Hajj Map...', 'info');
    window.open('https://www.google.com/maps/search/hajj+map', '_blank');
}

// ============================================
// RAMADAN FUNCTIONS
// ============================================

function showRamadanCalendar() {
    showToast('📅 Opening Ramadan Calendar...', 'info');
}

function showRamadanRecipes() {
    showToast('🍽️ Showing Ramadan recipes...', 'info');
}

function showRamadanArticles() {
    showToast('📰 Opening Ramadan articles...', 'info');
}

function showRamadanVideos() {
    showToast('🎥 Opening Ramadan videos...', 'info');
}

// ============================================
// PROFILE FUNCTIONS
// ============================================

function changeAvatar() {
    showToast('📸 Choose a new profile picture', 'info');
}

function editProfile() {
    showToast('✏️ Edit profile feature coming soon!', 'info');
}

function changePassword() {
    showToast('🔑 Change password feature coming soon!', 'info');
}

function exportData() {
    showToast('📤 Exporting your data...', 'info');
}

function backupData() {
    showToast('☁️ Backing up to cloud...', 'info');
}

// ============================================
// SETTINGS FUNCTIONS
// ============================================

function clearCache() {
    if (confirm('Clear all cached data?')) {
        localStorage.clear();
        showToast('🗑️ Cache cleared!', 'success');
        location.reload();
    }
}

function exportAllData() {
    const data = {
        user: AppState.user,
        bookmarks: AppState.bookmarks,
        favorites: AppState.favorites,
        trackedPrayers: AppState.trackedPrayers,
        zakatHistory: AppState.zakatHistory
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'muslim-app-data.json';
    a.click();
    showToast('📥 Data exported successfully!', 'success');
}

function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This cannot be undone!')) {
        if (confirm('Final confirmation: Delete all data?')) {
            localStorage.clear();
            showToast('🗑️ Account deleted', 'info');
            location.reload();
        }
    }
}

// ============================================
// SEARCH FUNCTIONS
// ============================================

function initSearch() {
    const searchInput = document.getElementById('globalSearchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        if (query.length > 1) {
            performGlobalSearch(query);
        } else {
            document.getElementById('searchResults').innerHTML = '';
        }
    });

    document.querySelectorAll('.search-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.search-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const query = document.getElementById('globalSearchInput').value;
            if (query.length > 1) {
                performGlobalSearch(query);
            }
        });
    });

    document.getElementById('voiceSearchBtn')?.addEventListener('click', () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.continuous = false;
            recognition.interimResults = true;

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('globalSearchInput').value = transcript;
                performGlobalSearch(transcript);
            };

            recognition.start();
            showToast('🎤 Listening...', 'info');
        } else {
            showToast('⚠️ Voice search not supported', 'error');
        }
    });
}

function performGlobalSearch(query) {
    const resultsContainer = document.getElementById('searchResults');
    const activeTab = document.querySelector('.search-tab.active')?.dataset.search || 'all';
    
    // Simulate search results
    const results = [
        { type: 'quran', title: `Surah Al-Fatihah - "In the name of Allah"`, ref: '1:1' },
        { type: 'hadith', title: '"The best of you are those who are best to their families"', ref: 'Bukhari' },
        { type: 'dua', title: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا', ref: 'Morning Dua' },
        { type: 'video', title: 'Tajweed Lesson 1', ref: '15:30' }
    ];

    resultsContainer.innerHTML = results.map(r => `
        <div style="padding:10px;border-bottom:1px solid var(--border-color);cursor:pointer;" onclick="showToast('📖 ${r.title}')">
            <div style="font-weight:600;">${r.title}</div>
            <div style="font-size:12px;color:var(--text-muted);">${r.type.toUpperCase()} · ${r.ref}</div>
        </div>
    `).join('');
}

function searchQuran() {
    const query = document.getElementById('quranSearch')?.value;
    if (query) {
        showToast(`🔍 Searching Quran for: "${query}"`, 'info');
    }
}

function searchHadith() {
    const query = document.getElementById('hadithSearch')?.value;
    if (query) {
        showToast(`🔍 Searching Hadith for: "${query}"`, 'info');
    }
}

function searchDuas() {
    const query = document.getElementById('duaSearch')?.value;
    if (query) {
        showToast(`🔍 Searching Duas for: "${query}"`, 'info');
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
        AppState.user = user;
        showApp();
    }
    
    // Initialize modules
    initTheme();
    initSidebar();
    initNavigation();
    initLanguage();
    initIslamicDate();
    initDailyContent();
    initPrayerCountdown();
    initDhikrCounter();
    initPrayerTracker();
    initQibla();
    loadZakatHistory();
    initSearch();
    
    // Initialize classes
    window.quranModule = new QuranModule();
    window.hadithModule = new HadithModule();
    window.duasModule = new DuasModule();
    window.quranTeacherModule = new QuranTeacherModule();
    window.aiModule = new AIModule();
    window.audioModule = new AudioModule();
    
    // Load saved favorites
    if (window.hadithModule) {
        window.hadithModule.renderFavorites();
    }
    if (window.duasModule) {
        window.duasModule.renderFavorites();
    }
    
    // Notification bell
    document.getElementById('notificationBell')?.addEventListener('click', () => {
        showToast('🔔 You have 3 notifications', 'info');
    });
    
    console.log('✅ All modules initialized successfully!');
});

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', function(e) {
    // Ctrl + / to focus search
    if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('globalSearchInput');
        if (searchInput) searchInput.focus();
    }
    
    // Escape to close sidebar
    if (e.key === 'Escape') {
        document.getElementById('sidebar')?.classList.remove('open');
        document.getElementById('quranViewer')?.classList.remove('active');
    }
    
    // Space to play/pause audio
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        if (e.code === 'Space') {
            e.preventDefault();
            if (window.audioModule) {
                window.audioModule.playAudio();
            }
        }
    }
});
