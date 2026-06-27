// ============================================
// PRO MAX ISLAMIC - MAIN JAVASCRIPT
// ============================================

// ===== API CONFIGURATION =====
const API_CONFIG = {
    baseURL: 'https://muslim-app-8ccm.onrender.com/api',
    // For local development: 'http://localhost:5000/api'
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    }
};

// ===== TOAST NOTIFICATION =====
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

// ===== AUTH TOKEN MANAGEMENT =====
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

// ===== API REQUEST =====
async function apiRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    const token = getAuthToken();
    
    const config = {
        ...options,
        headers: {
            ...API_CONFIG.headers,
            ...options.headers,
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || data.message || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ===== API METHODS =====
const API = {
    auth: {
        register: (userData) => apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        }),
        login: (credentials) => apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        }),
        logout: () => {
            setAuthToken(null);
            return Promise.resolve({ success: true });
        },
        getMe: () => apiRequest('/auth/me')
    },
    quran: {
        getSurahs: () => apiRequest('/quran/surahs'),
        getSurah: (number, translation = 'en') => apiRequest(`/quran/surah/${number}?translation=${translation}`),
        getAyah: (surah, ayah) => apiRequest(`/quran/ayah/${surah}/${ayah}`),
        search: (query) => apiRequest(`/quran/search?q=${encodeURIComponent(query)}`),
        getReciters: () => apiRequest('/quran/reciters'),
        saveProgress: (data) => apiRequest('/quran/progress', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        getProgress: () => apiRequest('/quran/progress')
    },
    prayer: {
        getTimes: (params) => {
            const query = new URLSearchParams(params).toString();
            return apiRequest(`/prayer/times?${query}`);
        },
        getMonth: (params) => {
            const query = new URLSearchParams(params).toString();
            return apiRequest(`/prayer/month?${query}`);
        },
        track: (data) => apiRequest('/prayer/track', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        getHistory: () => apiRequest('/prayer/history'),
        getQibla: (coords) => apiRequest('/prayer/qibla', {
            method: 'POST',
            body: JSON.stringify(coords)
        })
    },
    duas: {
        getAll: (params) => {
            const query = new URLSearchParams(params).toString();
            return apiRequest(`/duas?${query}`);
        },
        getById: (id) => apiRequest(`/duas/${id}`),
        getByCategory: (category) => apiRequest(`/duas/category/${category}`),
        getMorning: () => apiRequest('/duas/adhkar/morning'),
        getEvening: () => apiRequest('/duas/adhkar/evening'),
        favorite: (duaId) => apiRequest('/duas/favorite', {
            method: 'POST',
            body: JSON.stringify({ duaId })
        }),
        getFavorites: () => apiRequest('/duas/favorites/list')
    },
    hadith: {
        getAll: (params) => {
            const query = new URLSearchParams(params).toString();
            return apiRequest(`/hadith?${query}`);
        },
        getByCollection: (collection) => apiRequest(`/hadith/collection/${collection}`),
        getRandom: () => apiRequest('/hadith/random'),
        favorite: (hadithId) => apiRequest('/hadith/favorite', {
            method: 'POST',
            body: JSON.stringify({ hadithId })
        }),
        getFavorites: () => apiRequest('/hadith/favorites/list')
    },
    user: {
        getProfile: () => apiRequest('/user/profile'),
        updateProfile: (data) => apiRequest('/user/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        getStats: () => apiRequest('/user/stats'),
        getAchievements: () => apiRequest('/user/achievements'),
        updatePreferences: (data) => apiRequest('/user/preferences', {
            method: 'PATCH',
            body: JSON.stringify(data)
        })
    },
    voice: {
        upload: (formData) => {
            return fetch(`${API_CONFIG.baseURL}/voice/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: formData
            }).then(res => res.json());
        },
        get: (phrase) => apiRequest(`/voice/${phrase}`),
        getAll: () => apiRequest('/voice/all/list'),
        delete: (phrase) => apiRequest(`/voice/${phrase}`, {
            method: 'DELETE'
        }),
        deleteAll: () => apiRequest('/voice/all', {
            method: 'DELETE'
        }),
        check: (phrase) => apiRequest(`/voice/check/${phrase}`)
    },
    upload: {
        voice: (formData) => {
            return fetch(`${API_CONFIG.baseURL}/upload/voice`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: formData
            }).then(res => res.json());
        }
    },
    health: () => apiRequest('/health')
};

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
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            if (!section) return;
            
            menuItems.forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            
            sections.forEach(s => s.classList.remove('active'));
            const targetSection = document.getElementById(section);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            pageTitle.textContent = titleMap[section] || section;
            document.getElementById('sidebar')?.classList.remove('open');
        });
    });
}

// ============================================
// API STATUS CHECK
// ============================================
async function checkAPIStatus() {
    const dot = document.querySelector('.status-dot');
    
    try {
        const response = await fetch('https://muslim-app-8ccm.onrender.com/api/health');
        const data = await response.json();
        
        if (response.ok && data.status === 'OK') {
            dot.style.background = '#22c55e';
        } else {
            dot.style.background = '#ef4444';
        }
    } catch (error) {
        dot.style.background = '#ef4444';
        console.warn('⚠️ Backend not reachable');
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
        const months = ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 'Dhul-Qadah', 'Dhul-Hijjah'];
        const date = new Date();
        const islamicDay = Math.floor((date - new Date(2024, 6, 7)) / (1000 * 60 * 60 * 24)) % 30 + 1;
        const islamicMonth = Math.floor(((date - new Date(2024, 6, 7)) / (1000 * 60 * 60 * 24)) / 30) % 12;
        dateEl.textContent = `${islamicDay} ${months[islamicMonth]} 1446 AH`;
    }
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🕌 Pro Max Islamic App loaded!');
    
    initTheme();
    initSidebar();
    initNavigation();
    initLanguage();
    initIslamicDate();
    checkAPIStatus();
    
    setInterval(checkAPIStatus, 30000);
    
    // Expose API globally
    window.API = API;
    window.showToast = showToast;
    window.getAuthToken = getAuthToken;
    window.setAuthToken = setAuthToken;
});

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]');
        if (searchInput) searchInput.focus();
    }
    if (e.key === 'Escape') {
        document.getElementById('sidebar')?.classList.remove('open');
        document.getElementById('quranViewer')?.classList.remove('active');
    }
});
