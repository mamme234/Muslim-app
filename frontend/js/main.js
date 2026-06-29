// ============================================
// PRO MAX ISLAMIC - MAIN.JS
// Core Navigation, Theme, Auth, Utilities
// ============================================

// ============================================
// GLOBAL STATE
// ============================================

const AppState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    theme: localStorage.getItem('theme') || 'light',
    language: localStorage.getItem('language') || 'en',
    trackedPrayers: JSON.parse(localStorage.getItem('trackedPrayers') || '{}'),
    dhikrCount: parseInt(localStorage.getItem('dhikrCount') || '0')
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
        border-left: 4px solid ${colors[type] || colors.info};
        max-width: 90%;
        text-align: center;
        animation: fadeIn 0.3s ease;
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

// Login
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    if (username && password) {
        const user = { id: Date.now(), username: username, name: username, email: username + '@email.com' };
        AppState.user = user;
        localStorage.setItem('user', JSON.stringify(user));
        showApp();
        showToast('✅ Welcome back, ' + username + '!', 'success');
    } else {
        showToast('⚠️ Please fill in all fields', 'error');
    }
});

// Register
document.getElementById('registerForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirmPassword')?.value;
    
    if (!username || !email || !password) {
        showToast('⚠️ Please fill in all fields', 'error');
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
    
    const user = { id: Date.now(), username: username, name: username, email: email };
    AppState.user = user;
    localStorage.setItem('user', JSON.stringify(user));
    showApp();
    showToast('🎉 Welcome, ' + username + '!', 'success');
});

// Forgot Password
document.getElementById('forgotPasswordForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    if (email) {
        showToast('📧 Reset link sent to ' + email, 'success');
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
    }
}

function navigateTo(section) {
    // Update menu items
    document.querySelectorAll('.menu-item, .bottom-nav-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll(`.menu-item[data-section="${section}"], .bottom-nav-item[data-section="${section}"]`).forEach(el => el.classList.add('active'));
    
    // Update sections
    document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(section);
    if (target) target.classList.add('active');
    
    // Update title
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
    document.getElementById('pageTitle').textContent = titleMap[section] || section;
    document.getElementById('sidebar')?.classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        AppState.user = null;
        document.getElementById('appContainer').style.display = 'none';
        document.getElementById('authContainer').style.display = 'block';
        showLogin();
        showToast('👋 Logged out', 'info');
    }
}

// ============================================
// THEME MANAGEMENT
// ============================================

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const isDark = savedTheme === 'dark';
    applyTheme(isDark);
    
    document.getElementById('themeToggle')?.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const isDark = current === 'dark';
        applyTheme(!isDark);
        localStorage.setItem('theme', !isDark ? 'dark' : 'light');
    });

    document.getElementById('darkModeToggle')?.addEventListener('change', function() {
        applyTheme(this.checked);
        localStorage.setItem('theme', this.checked ? 'dark' : 'light');
    });
}

function applyTheme(isDark) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    const icon = document.querySelector('#themeToggle i');
    if (icon) icon.className = isDark ? 'fas fa-sun' : 'fa-solid fa-moon';
    const toggle = document.getElementById('darkModeToggle');
    if (toggle) toggle.checked = isDark;
}

// ============================================
// SIDEBAR & NAVIGATION
// ============================================

function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    document.getElementById('menuToggle')?.addEventListener('click', () => sidebar?.classList.toggle('open'));
    document.getElementById('closeSidebar')?.addEventListener('click', () => sidebar?.classList.remove('open'));
    
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            const isClickInside = sidebar?.contains(e.target);
            const isClickOnToggle = document.getElementById('menuToggle')?.contains(e.target);
            if (!isClickInside && !isClickOnToggle && sidebar?.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        }
    });
}

function initNavigation() {
    document.querySelectorAll('.menu-item, .bottom-nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            if (section) navigateTo(section);
        });
    });
}

// ============================================
// LANGUAGE
// ============================================

function initLanguage() {
    document.getElementById('languageToggle')?.addEventListener('click', () => {
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
    
    document.getElementById('languageSelect')?.addEventListener('change', function() {
        localStorage.setItem('language', this.value);
        showToast('🌍 Language: ' + this.options[this.selectedIndex].text, 'success');
    });
    
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
        const select = document.getElementById('languageSelect');
        if (select) select.value = savedLang;
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
        { arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا', translation: '"And whoever fears Allah, He will make a way out for him"', ref: 'Surah At-Talaq 65:2' }
    ];
    const verse = verses[Math.floor(Math.random() * verses.length)];
    const vc = document.getElementById('dailyVerse');
    if (vc) {
        vc.querySelector('.arabic').textContent = verse.arabic;
        vc.querySelector('.translation').textContent = verse.translation;
        vc.querySelector('.reference').textContent = verse.ref;
    }
    
    // Daily Hadith
    const hadiths = [
        { text: '"The best of you are those who are best to their families"', ref: 'Sunan Ibn Majah 1977' },
        { text: '"Whoever believes in Allah and the Last Day, let him speak good or remain silent"', ref: 'Sahih Bukhari 6018' }
    ];
    const hadith = hadiths[Math.floor(Math.random() * hadiths.length)];
    const hc = document.getElementById('dailyHadith');
    if (hc) {
        hc.querySelector('.hadith-text').textContent = hadith.text;
        hc.querySelector('.hadith-reference').textContent = hadith.ref;
    }
    
    // Daily Dua
    const duas = [
        { arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا', translation: '"O Allah, I ask You for beneficial knowledge"' },
        { arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ', translation: '"O Allah, I ask You for well-being"' }
    ];
    const dua = duas[Math.floor(Math.random() * duas.length)];
    const dc = document.getElementById('dailyDua');
    if (dc) {
        dc.querySelector('.dua-arabic').textContent = dua.arabic;
        dc.querySelector('.dua-translation').textContent = dua.translation;
    }
}

// ============================================
// PRAYER COUNTDOWN
// ============================================

function initPrayerCountdown() {
    const times = { fajr: '5:12 AM', dhuhr: '12:34 PM', asr: '3:45 PM', maghrib: '6:20 PM', isha: '7:56 PM' };
    const names = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const display = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };
    
    function update() {
        const now = new Date();
        let next = null, nextTime = null;
        
        for (const name of names) {
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
                if (!nextTime || prayerDate < nextTime) { next = name; nextTime = prayerDate; }
            }
        }
        
        if (!next) next = 'fajr';
        
        const countdownEl = document.getElementById('prayerCountdown');
        const nameEl = document.getElementById('nextPrayer');
        if (nameEl) nameEl.textContent = display[next] || next;
        
        if (nextTime) {
            const diff = Math.floor((nextTime - now) / 1000);
            if (diff > 0 && countdownEl) {
                const h = String(Math.floor(diff / 3600)).padStart(2, '0');
                const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
                const s = String(diff % 60).padStart(2, '0');
                countdownEl.textContent = `${h}:${m}:${s}`;
            }
        }
    }
    
    update();
    setInterval(update, 1000);
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
    
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const count = parseInt(this.dataset.count);
            AppState.dhikrCount = count;
            updateDhikrCounter();
            showToast(`📿 Set to ${count}`, 'info');
        });
    });
}

function updateDhikrCounter() {
    const countEl = document.getElementById('dhikrCount');
    if (countEl) countEl.textContent = AppState.dhikrCount;
    localStorage.setItem('dhikrCount', AppState.dhikrCount.toString());
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
        cb.addEventListener('change', function() {
            if (this.checked) {
                this.parentElement.classList.add('checked');
                trackPrayer(this.value);
            } else {
                this.parentElement.classList.remove('checked');
                untrackPrayer(this.value);
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
            showToast('🎉 All 5 prayers completed! MashaAllah!', 'success');
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
    showToast('🔄 Tracker reset', 'info');
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
            document.getElementById('qiblaDirection').textContent = `Qibla: ${bearing.toFixed(0)}°`;
            document.getElementById('qiblaNeedle').style.transform = `translate(-50%, -50%) rotate(${bearing}deg)`;
        }, () => {
            document.getElementById('qiblaDirection').textContent = 'Qibla: ~290°';
        });
    }
}

function calibrateQibla() {
    showToast('🧭 Calibrating compass...', 'info');
    initQibla();
}

// ============================================
// SEARCH
// ============================================

function initSearch() {
    const searchInput = document.getElementById('globalSearchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        if (query.length > 1) {
            performSearch(query);
        } else {
            document.getElementById('searchResults').innerHTML = '';
        }
    });

    document.querySelectorAll('.search-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.search-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const query = document.getElementById('globalSearchInput').value;
            if (query.length > 1) performSearch(query);
        });
    });

    document.getElementById('voiceSearchBtn')?.addEventListener('click', () => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.lang = 'en-US';
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('globalSearchInput').value = transcript;
                performSearch(transcript);
            };
            recognition.start();
            showToast('🎤 Listening...', 'info');
        } else {
            showToast('⚠️ Voice search not supported', 'error');
        }
    });
}

function performSearch(query) {
    const results = [
        { type: 'quran', title: 'Surah Al-Fatihah - "In the name of Allah"', ref: '1:1' },
        { type: 'hadith', title: '"The best of you are those who are best to their families"', ref: 'Bukhari' },
        { type: 'dua', title: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا', ref: 'Morning Dua' }
    ];
    const container = document.getElementById('searchResults');
    container.innerHTML = results.map(r => `
        <div style="padding:10px;border-bottom:1px solid var(--border-color);cursor:pointer;" onclick="showToast('📖 ${r.title}')">
            <div style="font-weight:600;">${r.title}</div>
            <div style="font-size:12px;color:var(--text-muted);">${r.type.toUpperCase()} · ${r.ref}</div>
        </div>
    `).join('');
}

// ============================================
// PROFILE & SETTINGS
// ============================================

function editProfile() { showToast('✏️ Edit profile coming soon!', 'info'); }
function changePassword() { showToast('🔑 Change password coming soon!', 'info'); }
function exportData() { showToast('📤 Exporting data...', 'info'); }
function backupData() { showToast('☁️ Cloud backup initiated', 'success'); }
function clearCache() { 
    localStorage.clear(); 
    showToast('🗑️ Cache cleared!', 'success'); 
    location.reload(); 
}
function deleteAccount() {
    if (confirm('Delete your account? This cannot be undone!')) {
        localStorage.clear();
        showToast('🗑️ Account deleted', 'info');
        location.reload();
    }
}

// ============================================
// NOTIFICATIONS
// ============================================

document.getElementById('notificationBell')?.addEventListener('click', () => {
    showToast('🔔 3 notifications', 'info');
});

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🕌 Pro Max Islamic App loaded!');
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        AppState.user = user;
        showApp();
    }
    
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
    initSearch();
    
    // Quick Access buttons
    document.querySelectorAll('.quick-item').forEach(item => {
        item.addEventListener('click', function() {
            const section = this.querySelector('span')?.textContent?.toLowerCase();
            const map = {
                'quran': 'quran',
                'hadith': 'hadith',
                'prayer': 'prayer',
                'duas': 'duas',
                'videos': 'videos',
                'audio': 'audio',
                'ai assistant': 'ai',
                'learning': 'learning',
                'ramadan': 'ramadan',
                'zakat': 'zakat',
                'hajj': 'hajj'
            };
            const target = map[section] || section;
            if (target) navigateTo(target);
        });
    });
    
    // Continue buttons
    document.querySelectorAll('.continue-card').forEach(card => {
        card.addEventListener('click', function() {
            const text = this.querySelector('span')?.textContent;
            if (text?.includes('Reading')) navigateTo('quran');
            else if (text?.includes('Listening')) navigateTo('audio');
        });
    });
    
    // Favorite items
    document.querySelectorAll('.fav-item').forEach(item => {
        item.addEventListener('click', function() {
            const text = this.querySelector('span')?.textContent?.toLowerCase();
            const map = { 'quran': 'quran', 'hadith': 'hadith', 'duas': 'duas', 'prayer': 'prayer' };
            const target = map[text] || text;
            if (target) navigateTo(target);
        });
    });
    
    // Zakat type buttons
    document.querySelectorAll('.zakat-type').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.zakat-type').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            showToast(`💰 ${this.textContent.trim()} Zakat`, 'info');
        });
    });
    
    // Video cards
    document.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('.video-info h4')?.textContent || 'Video';
            showToast(`▶️ Playing: ${title}`, 'info');
        });
    });
    
    // Audio items
    document.querySelectorAll('.audio-item').forEach((item, index) => {
        item.addEventListener('click', function() {
            const title = this.querySelector('span')?.textContent || `Track ${index + 1}`;
            showToast(`▶️ Playing: ${title}`, 'info');
        });
    });
    
    // Audio controls
    document.querySelectorAll('.audio-controls button, .audio-options button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const icon = this.querySelector('i');
            if (icon) {
                if (icon.classList.contains('fa-play')) {
                    icon.className = 'fas fa-pause';
                    showToast('▶️ Playing', 'info');
                } else if (icon.classList.contains('fa-pause')) {
                    icon.className = 'fas fa-play';
                    showToast('⏸️ Paused', 'info');
                } else if (icon.classList.contains('fa-stop')) {
                    icon.className = 'fas fa-play';
                    showToast('⏹️ Stopped', 'info');
                } else {
                    showToast('🎵 Audio control', 'info');
                }
            }
        });
    });
    
    // Hajj tabs
    document.querySelectorAll('.hajj-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.hajj-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            showToast(`🕋 ${this.textContent.trim()}`, 'info');
        });
    });
    
    // Hajj types
    document.querySelectorAll('.hajj-type').forEach(type => {
        type.addEventListener('click', function() {
            const title = this.querySelector('h4')?.textContent || 'Hajj type';
            showToast(`🕋 ${title} selected`, 'info');
        });
    });
    
    // Ramadan features
    document.querySelectorAll('.ramadan-features button').forEach(btn => {
        btn.addEventListener('click', function() {
            showToast(`🌙 ${this.textContent.trim()}`, 'info');
        });
    });
    
    // Kids items
    document.querySelectorAll('.kids-item').forEach(item => {
        item.addEventListener('click', function() {
            showToast(`👶 ${this.textContent.trim()}`, 'info');
        });
    });
    
    // Course cards
    document.querySelectorAll('.course-card .btn-primary-small').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const title = this.closest('.course-card')?.querySelector('h3')?.textContent || 'Course';
            showToast(`📚 Opening ${title}`, 'info');
        });
    });
    
    // Community posts
    document.querySelectorAll('.community-post .post-actions button').forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.textContent.trim();
            if (text.includes('Like')) {
                const icon = this.querySelector('i');
                if (icon) {
                    icon.style.color = icon.style.color === 'red' ? '' : 'red';
                }
            } else if (text.includes('Comment')) {
                showToast('💬 Comment feature coming soon!', 'info');
            } else if (text.includes('Share')) {
                showToast('📤 Shared!', 'success');
            }
        });
    });
    
    // Follow buttons
    document.querySelectorAll('.follow-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.textContent === 'Follow') {
                this.textContent = 'Following';
                this.style.background = 'var(--primary)';
                this.style.color = 'white';
                showToast('✅ Following', 'success');
            } else {
                this.textContent = 'Follow';
                this.style.background = 'transparent';
                this.style.color = 'var(--primary)';
                showToast('Unfollowed', 'info');
            }
        });
    });
    
    // Profile settings buttons
    document.querySelectorAll('.profile-settings button').forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.textContent.trim();
            if (text.includes('Edit')) editProfile();
            else if (text.includes('Change')) changePassword();
        });
    });
    
    // Profile actions
    document.querySelectorAll('.profile-actions .btn-primary, .profile-actions .btn-secondary').forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.textContent.trim();
            if (text.includes('Export')) exportData();
            else if (text.includes('Cloud')) backupData();
            else if (text.includes('Logout')) logout();
        });
    });
    
    // Settings buttons
    document.querySelectorAll('.settings-card .btn-secondary, .settings-card .btn-danger').forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.textContent.trim();
            if (text.includes('Clear')) clearCache();
            else if (text.includes('Delete')) deleteAccount();
            else if (text.includes('Enable')) showToast('🔐 Feature enabled!', 'success');
            else if (text.includes('Manage')) showToast('⚙️ Management panel', 'info');
            else if (text.includes('Backup')) backupData();
            else if (text.includes('Export')) exportData();
            else showToast(`⚙️ ${text}`, 'info');
        });
    });
    
    // Color themes
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            const color = this.dataset.color;
            document.documentElement.style.setProperty('--primary', color);
            document.documentElement.style.setProperty('--primary-light', color + 'cc');
            document.documentElement.style.setProperty('--primary-dark', color + '99');
            localStorage.setItem('primaryColor', color);
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            showToast('🎨 Theme color updated', 'success');
        });
    });
    
    console.log('✅ All buttons are now working!');
});
