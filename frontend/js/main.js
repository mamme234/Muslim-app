// ============================================
// API CONFIGURATION
// ============================================

const API_CONFIG = {
    baseURL: 'https://muslim-app-8ccm.onrender.com/api',
    // For local development, use:
    // baseURL: 'http://localhost:5000/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    }
};

// ===== API HELPER FUNCTIONS =====

// Get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Set auth token
function setAuthToken(token) {
    if (token) {
        localStorage.setItem('authToken', token);
    } else {
        localStorage.removeItem('authToken');
    }
}

// API Request function
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
    // Auth
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

    // Quran
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

    // Prayer
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

    // Duas
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

    // Hadith
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

    // User
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

    // Voice
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

    // Upload
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

    // Health
    health: () => apiRequest('/health')
};

// ============================================
// EXPOSE API TO GLOBAL SCOPE
// ============================================

window.API = API;
window.getAuthToken = getAuthToken;
window.setAuthToken = setAuthToken;

console.log('🕌 API Connected to:', API_CONFIG.baseURL);
