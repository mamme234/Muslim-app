// ============================================
// MUSLIM APP - MAIN JAVASCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initTheme();
    
    // Initialize sidebar
    initSidebar();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize notifications
    initNotifications();
    
    // Initialize language
    initLanguage();
    
    // Initialize prayer countdown (if on home)
    if (document.getElementById('prayerCountdown')) {
        initPrayerCountdown();
    }
    
    // Initialize daily content
    initDailyContent();
    
    // Initialize islamic date
    initIslamicDate();
});

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
}

function applyTheme(isDark) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fa-solid fa-moon';
    }
}

// ============================================
// SIDEBAR
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
    
    // Close sidebar on outside click
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

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
    const menuItems = document.querySelectorAll('.menu-item, .bottom-nav-item');
    const sections = document.querySelectorAll('.section');
    const pageTitle = document.getElementById('pageTitle');
    
    const titleMap = {
        home: '🏠 Home',
        quran: '📖 Quran',
        'quran-teacher': '🎙️ AI Quran Teacher',
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
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            if (!section) return;
            
            // Update active states
            menuItems.forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            
            // Show section
            sections.forEach(s => s.classList.remove('active'));
            const targetSection = document.getElementById(section);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            // Update title
            pageTitle.textContent = titleMap[section] || section;
            
            // Close sidebar on mobile
            document.getElementById('sidebar')?.classList.remove('open');
        });
    });
}

// ============================================
// NOTIFICATIONS
// ============================================
function initNotifications() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// ============================================
// LANGUAGE
// ============================================
function initLanguage() {
    const langToggle = document.getElementById('languageToggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const select = document.getElementById('languageSelect');
            if (select) {
                select.focus();
                // Create a simple language switcher
                const currentLang = select.value;
                const languages = ['en', 'ar', 'om', 'am', 'so', 'ur', 'tr', 'fr', 'id'];
                const currentIndex = languages.indexOf(currentLang);
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
            // In production, would load translations
        });
        
        // Load saved language
        const savedLang = localStorage.getItem('language');
        if (savedLang) {
            langSelect.value = savedLang;
        }
    }
}

// ============================================
// PRAYER COUNTDOWN (Home)
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
    const displayNames = {
        fajr: 'Fajr',
        dhuhr: 'Dhuhr',
        asr: 'Asr',
        maghrib: 'Maghrib',
        isha: 'Isha'
    };
    
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
        
        // If no prayer found, use Fajr next day
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
                nextTime = tomorrow;
            }
        }
        
        if (nextPrayer && nextTime) {
            const diff = Math.floor((nextTime - now) / 1000);
            if (diff > 0) {
                const hours = String(Math.floor(diff / 3600)).padStart(2, '0');
                const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
                const seconds = String(diff % 60).padStart(2, '0');
                
                const countdownEl = document.getElementById('prayerCountdown');
                const nameEl = document.getElementById('nextPrayer');
                
                if (countdownEl) countdownEl.textContent = `${hours}:${minutes}:${seconds}`;
                if (nameEl) nameEl.textContent = displayNames[nextPrayer] || nextPrayer;
            }
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ============================================
// DAILY CONTENT
// ============================================
function initDailyContent() {
    // Daily Verse
    const verses = [
        { arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', translation: '"Indeed, with hardship comes ease"', ref: 'Surah Ash-Sharh 94:6' },
        { arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا', translation: '"And whoever fears Allah, He will make a way out for him"', ref: 'Surah At-Talaq 65:2' },
        { arabic: 'وَالَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ', translation: '"And those who believe and do righteous deeds"', ref: 'Surah Al-Baqarah 2:25' },
    ];
    const verse = verses[Math.floor(Math.random() * verses.length)];
    const verseContainer = document.getElementById('dailyVerse');
    if (verseContainer) {
        verseContainer.querySelector('.arabic').textContent = verse.arabic;
        verseContainer.querySelector('.translation').textContent = verse.translation;
        verseContainer.querySelector('.reference').textContent = verse.ref;
    }
    
    // Daily Hadith
    const hadiths = [
        { text: '"The best of you are those who are best to their families"', ref: 'Sunan Ibn Majah 1977' },
        { text: '"Whoever believes in Allah and the Last Day, let him speak good or remain silent"', ref: 'Sahih Bukhari 6018' },
        { text: '"The strong person is not the one who can wrestle, but the one who controls himself at times of anger"', ref: 'Sahih Bukhari 6114' },
    ];
    const hadith = hadiths[Math.floor(Math.random() * hadiths.length)];
    const hadithContainer = document.getElementById('dailyHadith');
    if (hadithContainer) {
        hadithContainer.querySelector('.hadith-text').textContent = hadith.text;
        hadithContainer.querySelector('.hadith-reference').textContent = hadith.ref;
    }
    
    // Daily Dua
    const duas = [
        { arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا', translation: '"O Allah, I ask You for beneficial knowledge"' },
        { arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ', translation: '"O Allah, I ask You for well-being"' },
        { arabic: 'رَبِّ زِدْنِي عِلْمًا', translation: '"My Lord, increase me in knowledge"' },
    ];
    const dua = duas[Math.floor(Math.random() * duas.length)];
    const duaContainer = document.getElementById('dailyDua');
    if (duaContainer) {
        duaContainer.querySelector('.dua-arabic').textContent = dua.arabic;
        duaContainer.querySelector('.dua-translation').textContent = dua.translation;
    }
}

// ============================================
// ISLAMIC DATE
// ============================================
function initIslamicDate() {
    const dateEl = document.getElementById('islamicDate');
    if (dateEl) {
        // Simplified Islamic date
        const months = ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 'Dhul-Qadah', 'Dhul-Hijjah'];
        const date = new Date();
        // Approximate Islamic date (simplified)
        const islamicDay = Math.floor((date - new Date(2024, 6, 7)) / (1000 * 60 * 60 * 24)) % 30 + 1;
        const islamicMonth = Math.floor(((date - new Date(2024, 6, 7)) / (1000 * 60 * 60 * 24)) / 30) % 12;
        dateEl.textContent = `${islamicDay} ${months[islamicMonth]} 1446 AH`;
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Toast notification
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

// Share function
function shareContent(text, title = 'Muslim App') {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: text
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(text).then(() => {
            showToast('📋 Copied to clipboard!');
        });
    }
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', (e) => {
    // Ctrl + / to focus search
    if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // Escape to close sidebar
    if (e.key === 'Escape') {
        document.getElementById('sidebar')?.classList.remove('open');
    }
});

console.log('🕌 Muslim App loaded successfully!');
