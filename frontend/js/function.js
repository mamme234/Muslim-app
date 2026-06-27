// ============================================
// FUNCTIONS.JS - Kids, Community, Profile, Settings
// ============================================

// ============================================
// KIDS MODULE
// ============================================

class KidsModule {
    constructor() {
        this.stories = [
            { title: 'The Story of Prophet Muhammad ﷺ', description: 'The life of the final prophet' },
            { title: 'The Brave King', description: 'A story about courage and faith' },
            { title: 'The Ant and the Prophet', description: 'Learning from Allah\'s creation' }
        ];
        this.games = [
            { name: 'Arabic Alphabet Match', description: 'Match letters with sounds' },
            { name: 'Prayer Time Quiz', description: 'Learn the 5 daily prayers' },
            { name: 'Memory Game', description: 'Test your memory with Islamic words' }
        ];
        this.memorization = [
            { name: 'Short Surahs', items: ['Al-Fatihah', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas'] },
            { name: 'Daily Duas', items: ['Morning Dua', 'Evening Dua', 'Sleep Dua'] },
            { name: '99 Names of Allah', items: ['Ar-Rahman', 'Ar-Rahim', 'Al-Malik'] }
        ];
        this.init();
    }

    init() {
        this.renderKidsContent();
        this.setupKidsEvents();
    }

    renderKidsContent() {
        // Stories
        const storyContainer = document.querySelector('.story-list');
        if (storyContainer) {
            storyContainer.innerHTML = this.stories.map(s => `
                <div class="story-item" onclick="showToast('📖 ${s.title} - ${s.description}')">
                    ${s.title}
                </div>
            `).join('');
        }

        // Games
        const gameContainer = document.querySelector('.game-list');
        if (gameContainer) {
            gameContainer.innerHTML = this.games.map(g => `
                <div class="game-item" onclick="showToast('🎮 ${g.name} - ${g.description}')">
                    ${g.name}
                </div>
            `).join('');
        }

        // Memorization
        const memContainer = document.querySelector('.memorization-list');
        if (memContainer) {
            memContainer.innerHTML = this.memorization.map(m => `
                <div class="memorization-item" onclick="showToast('📝 ${m.name}')">
                    ${m.name} (${m.items.length} items)
                </div>
            `).join('');
        }
    }

    setupKidsEvents() {
        // Parent dashboard stats
        const stats = [
            { number: 3, label: 'Children' },
            { number: 12, label: 'Lessons Completed' },
            { number: 85, label: 'Progress' }
        ];
        
        const statContainer = document.querySelector('.parent-stats');
        if (statContainer) {
            statContainer.innerHTML = stats.map(s => `
                <div class="stat-item">
                    <span class="stat-number">${s.number}${typeof s.number === 'number' && s.number !== 85 ? '' : '%'}</span>
                    <span class="stat-label">${s.label}</span>
                </div>
            `).join('');
        }
    }
}

// ============================================
// COMMUNITY MODULE
// ============================================

class CommunityModule {
    constructor() {
        this.posts = [
            {
                avatar: 'A',
                name: 'Ahmed Al-Farsi',
                time: '2 hours ago',
                content: '"Alhamdulillah, just completed memorizing Surah Al-Mulk! 📖"',
                likes: 24,
                comments: 5
            },
            {
                avatar: 'F',
                name: 'Fatima Al-Hassan',
                time: '5 hours ago',
                content: '"Join our weekly Tafsir study group every Saturday at 3 PM 🕌"',
                likes: 18,
                comments: 8
            }
        ];
        this.init();
    }

    init() {
        this.renderCommunityPosts();
        this.setupCommunityEvents();
    }

    renderCommunityPosts() {
        const container = document.querySelector('.community-feed');
        if (!container) return;

        container.innerHTML = this.posts.map(post => `
            <div class="community-post card">
                <div class="post-header">
                    <div class="post-avatar">${post.avatar}</div>
                    <div>
                        <div class="post-name">${post.name}</div>
                        <div class="post-time">${post.time}</div>
                    </div>
                </div>
                <div class="post-content">${post.content}</div>
                <div class="post-actions">
                    <button onclick="this.innerHTML = '<i class=\\'fas fa-heart\\'></i> ${post.likes + 1}'; this.style.color = 'var(--primary)'">
                        <i class="fas fa-heart"></i> ${post.likes}
                    </button>
                    <button><i class="fas fa-comment"></i> ${post.comments}</button>
                    <button onclick="showToast('📤 Shared!')"><i class="fas fa-share"></i> Share</button>
                </div>
            </div>
        `).join('');
    }

    setupCommunityEvents() {
        // Any community specific events
    }
}

// ============================================
// PROFILE MODULE
// ============================================

class ProfileModule {
    constructor() {
        this.userData = {
            name: 'Muslim User',
            email: 'muslim@email.com',
            memberSince: '2024',
            prayers: 1247,
            quranPages: 856,
            hadith: 43,
            streak: 7,
            achievements: ['📖 Quran Reader', '🕌 30 Days Prayer', '🤲 Dua Master', '📚 50 Hadith']
        };
        this.init();
    }

    init() {
        this.renderProfile();
        this.setupProfileEvents();
    }

    renderProfile() {
        const nameEl = document.querySelector('.profile-card h2');
        const emailEl = document.querySelector('.profile-email');
        const memberEl = document.querySelector('.profile-header p:last-child');
        const stats = document.querySelectorAll('.profile-stats .stat .stat-value');
        const achievements = document.querySelector('.achievement-list');

        if (nameEl) nameEl.textContent = this.userData.name;
        if (emailEl) emailEl.textContent = this.userData.email;
        if (memberEl) memberEl.textContent = `Member since ${this.userData.memberSince}`;
        
        if (stats.length >= 4) {
            stats[0].textContent = this.userData.prayers.toLocaleString();
            stats[1].textContent = this.userData.quranPages;
            stats[2].textContent = this.userData.hadith;
            stats[3].textContent = `${this.userData.streak} Days`;
        }

        if (achievements) {
            achievements.innerHTML = this.userData.achievements.map(a => `<span>${a}</span>`).join('');
        }
    }

    setupProfileEvents() {
        document.querySelector('.btn-primary')?.addEventListener('click', () => {
            showToast('☁️ Cloud backup initiated!');
        });
    }
}

// ============================================
// SETTINGS MODULE
// ============================================

class SettingsModule {
    constructor() {
        this.settings = {
            language: localStorage.getItem('language') || 'en',
            theme: localStorage.getItem('theme') || 'light',
            notifications: {
                prayer: true,
                dailyVerse: true,
                adhan: true
            }
        };
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupSettingsEvents();
        this.initColorThemes();
    }

    loadSettings() {
        // Language
        const langSelect = document.getElementById('languageSelect');
        if (langSelect) {
            langSelect.value = this.settings.language;
        }

        // Theme
        const themeToggle = document.getElementById('darkModeToggle');
        if (themeToggle) {
            themeToggle.checked = this.settings.theme === 'dark';
        }
    }

    setupSettingsEvents() {
        // Language change
        document.getElementById('languageSelect')?.addEventListener('change', (e) => {
            this.settings.language = e.target.value;
            localStorage.setItem('language', e.target.value);
            showToast('🌍 Language updated');
        });

        // Theme toggle
        document.getElementById('darkModeToggle')?.addEventListener('change', (e) => {
            this.settings.theme = e.target.checked ? 'dark' : 'light';
            localStorage.setItem('theme', this.settings.theme);
            // Theme is applied in main.js
        });

        // Notification toggles
        document.querySelectorAll('.settings-card .toggle input').forEach((toggle, index) => {
            toggle.addEventListener('change', (e) => {
                const keys = ['prayer', 'dailyVerse', 'adhan'];
                this.settings.notifications[keys[index]] = e.target.checked;
                showToast(`🔔 ${keys[index]} notifications ${e.target.checked ? 'enabled' : 'disabled'}`);
            });
        });

        // Button clicks
        document.querySelectorAll('.settings-card .btn-secondary').forEach(btn => {
            btn.addEventListener('click', () => {
                showToast(`⚙️ ${btn.textContent} feature coming soon!`);
            });
        });
    }

    initColorThemes() {
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                const color = option.dataset.color;
                document.documentElement.style.setProperty('--primary', color);
                document.documentElement.style.setProperty('--primary-light', color + 'cc');
                document.documentElement.style.setProperty('--primary-dark', color + '99');
                localStorage.setItem('primaryColor', color);
                showToast('🎨 Theme color updated');
            });
        });

        const savedColor = localStorage.getItem('primaryColor');
        if (savedColor) {
            document.documentElement.style.setProperty('--primary', savedColor);
            document.documentElement.style.setProperty('--primary-light', savedColor + 'cc');
            document.documentElement.style.setProperty('--primary-dark', savedColor + '99');
        }
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    window.kidsModule = new KidsModule();
    window.communityModule = new CommunityModule();
    window.profileModule = new ProfileModule();
    window.settingsModule = new SettingsModule();
});
