// ============================================
// MUSLIM APP - MAIN JAVASCRIPT
// Shared functionality across all pages
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // ===== THEME =====
    initTheme();
    
    // ===== SIDEBAR =====
    initSidebar();
    
    // ===== NOTIFICATIONS =====
    initNotifications();
    
    // ===== PRAYER COUNTDOWN (on home page) =====
    if (document.getElementById('prayerCountdown')) {
        initPrayerCountdown();
    }
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
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
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
    
    // Close sidebar on outside click (mobile)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            const isClickInside = sidebar?.contains(e.target);
            const isClickOnToggle = menuToggle?.contains(e.target);
            if (!isClickInside && !isClickOnToggle && sidebar?.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        }
    });
    
    // Active link highlighting
    const currentPath = window.location.pathname;
    document.querySelectorAll('.menu-item, .bottom-nav-item').forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href)) {
            link.classList.add('active');
        }
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
// PRAYER COUNTDOWN (Home page)
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
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg-card);
        padding: 12px 24px;
        border-radius: var(--radius-full);
        box-shadow: var(--shadow-hover);
        z-index: 9999;
        font-weight: 500;
        border-left: 4px solid var(--primary);
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

// Get today's date in Islamic format (simplified)
function getIslamicDate() {
    const months = ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 'Dhul-Qadah', 'Dhul-Hijjah'];
    // Simplified - would use a proper Islamic date library in production
    const date = new Date();
    return `${date.getDate()} ${months[date.getMonth()]}`;
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
