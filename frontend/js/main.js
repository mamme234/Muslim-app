// ============================================
// MAIN.JS - CORE FUNCTIONALITY
// Theme, Sidebar, Navigation, Utilities
// ============================================

// ============================================
// UTILITY FUNCTIONS
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

function getAuthToken() {
    return localStorage.getItem('authToken');
}

function setAuthToken(token) {
    if (token) {
        localStorage.setItem('authToken', token);
    } else {
        localStorage.removeItem('authToken');
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
        'quran-teacher': '🎙️ AI Teacher',
        'voice-assistant': '🗣️ Voice Assistant',
        hadith: '📚 Hadith',
        duas: '🤲 Duas & Adhkar',
        prayer: '🕌 Prayer',
        learning: '🎓 Learning',
        videos: '🎥 Videos',
        audio: '🎧 Audio',
        community: '👨‍👩‍👧 Community',
        ramadan: '🌙 Ramadan',
        hajj: '🕋 Hajj & Umrah',
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
                console.log('✅ Section opened:', section);
            }
            
            pageTitle.textContent = titleMap[section] || section;
            document.getElementById('sidebar')?.classList.remove('open');
        });
    });
    
    const homeSection = document.getElementById('home');
    if (homeSection) homeSection.classList.add('active');
}

// ============================================
// LANGUAGE & DATE
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
                showToast('🌍 Language changed');
            }
        });
    }
    
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) {
        langSelect.addEventListener('change', () => {
            localStorage.setItem('language', langSelect.value);
            showToast('🌍 Language saved');
        });
        const savedLang = localStorage.getItem('language');
        if (savedLang) {
            langSelect.value = savedLang;
        }
    }
}

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

function initDailyContent() {
    // Daily Verse
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
    
    // Daily Hadith
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
    
    // Daily Dua
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

function checkAPIStatus() {
    const dot = document.querySelector('.status-dot');
    if (!dot) return;
    
    try {
        fetch('https://muslim-app-8ccm.onrender.com/api/health')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'OK') {
                    dot.style.background = '#22c55e';
                } else {
                    dot.style.background = '#ef4444';
                }
            })
            .catch(() => {
                dot.style.background = '#ef4444';
            });
    } catch (error) {
        dot.style.background = '#ef4444';
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🕌 Pro Max Islamic App loaded!');
    
    initTheme();
    initSidebar();
    initNavigation();
    initLanguage();
    initIslamicDate();
    initDailyContent();
    initPrayerCountdown();
    checkAPIStatus();
    
    setInterval(checkAPIStatus, 30000);
    
    window.showToast = showToast;
    window.getAuthToken = getAuthToken;
    window.setAuthToken = setAuthToken;
});
