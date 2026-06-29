// ============================================
// FUNCTIONS.JS - Videos, Audio, Community, Kids, Profile, Settings
// ============================================

// ============================================
// VIDEO MODULE
// ============================================

function initVideoModule() {
    document.querySelectorAll('.video-cat').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.video-cat').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            showToast(`🎥 ${this.textContent.trim()} videos`, 'info');
        });
    });

    document.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('.video-info h4')?.textContent || 'Video';
            showToast(`▶️ Playing: ${title}`, 'info');
        });
    });
}

// ============================================
// AUDIO MODULE
// ============================================

function initAudioModule() {
    // Audio category buttons
    document.querySelectorAll('.audio-cat').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.audio-cat').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            showToast(`🎧 ${this.textContent.trim()} audio`, 'info');
        });
    });

    // Audio controls
    document.querySelectorAll('.audio-controls button').forEach((btn, index) => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const icons = ['fa-play', 'fa-pause', 'fa-stop', 'fa-forward', 'fa-backward', 'fa-random', 'fa-redo'];
            const icon = this.querySelector('i');
            if (icon) {
                const currentClass = icon.className;
                if (currentClass.includes('fa-play')) {
                    icon.className = 'fas fa-pause';
                    showToast('▶️ Playing', 'info');
                } else if (currentClass.includes('fa-pause')) {
                    icon.className = 'fas fa-play';
                    showToast('⏸️ Paused', 'info');
                } else {
                    showToast('🎵 Audio control', 'info');
                }
            }
        });
    });

    // Audio options
    document.querySelectorAll('.audio-options button').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.textContent.includes('x')) {
                document.querySelectorAll('.audio-options button').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                showToast(`⏩ Speed: ${this.textContent}`, 'info');
            } else {
                showToast(`🎛️ ${this.textContent.trim()}`, 'info');
            }
        });
    });
}

// ============================================
// COMMUNITY MODULE
// ============================================

function initCommunityModule() {
    // Community action buttons
    document.querySelectorAll('.community-actions button').forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.textContent.trim();
            const actions = {
                'Groups': '👥 Groups feature',
                'Events': '📅 Events feature',
                'Forum': '💬 Forum feature',
                'Announcements': '📢 Announcements feature'
            };
            showToast(`${actions[text] || text} coming soon!`, 'info');
        });
    });

    // Like buttons
    document.querySelectorAll('.community-post .post-actions button:first-child').forEach(btn => {
        btn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            const count = this.closest('.post-actions').parentElement.querySelector('.post-stats span:first-child');
            if (icon && count) {
                if (icon.style.color === 'red') {
                    icon.style.color = '';
                    const likes = parseInt(count.textContent) || 0;
                    count.textContent = `❤️ ${likes - 1}`;
                } else {
                    icon.style.color = 'red';
                    const likes = parseInt(count.textContent) || 0;
                    count.textContent = `❤️ ${likes + 1}`;
                }
            }
        });
    });

    // Comment buttons
    document.querySelectorAll('.community-post .post-actions button:nth-child(2)').forEach(btn => {
        btn.addEventListener('click', function() {
            showToast('💬 Comment feature coming soon!', 'info');
        });
    });

    // Share buttons
    document.querySelectorAll('.community-post .post-actions button:last-child').forEach(btn => {
        btn.addEventListener('click', function() {
            if (navigator.share) {
                navigator.share({ title: 'Islamic Post', text: 'Check out this post!' });
            } else {
                showToast('📤 Link copied!', 'success');
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
}

// ============================================
// KIDS MODULE
// ============================================

function initKidsModule() {
    document.querySelectorAll('.kids-item').forEach(item => {
        item.addEventListener('click', function() {
            const text = this.textContent.trim();
            const icons = {
                'Story': '📖',
                'Game': '🎮',
                'Alphabet': '🔤',
                'Prayer': '🕌',
                'Memory': '🧠',
                'Coloring': '🎨',
                'Quran': '📖',
                'Dua': '🤲',
                'Wudu': '🚿',
                'Manners': '💫'
            };
            let icon = '👶';
            for (const [key, value] of Object.entries(icons)) {
                if (text.includes(key)) icon = value;
            }
            showToast(`${icon} ${text}`, 'info');
        });
    });
}

// ============================================
// PROFILE & SETTINGS MODULE
// ============================================

function initProfileModule() {
    // Profile avatar change
    document.querySelector('.change-avatar')?.addEventListener('click', function() {
        showToast('📸 Choose a new profile picture', 'info');
    });

    // Profile edit buttons
    document.querySelectorAll('.profile-settings button').forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.textContent.trim();
            if (text.includes('Edit')) {
                showToast('✏️ Edit profile coming soon!', 'info');
            } else if (text.includes('Change')) {
                showToast('🔑 Change password coming soon!', 'info');
            }
        });
    });

    // Profile action buttons
    document.querySelectorAll('.profile-actions button').forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.textContent.trim();
            if (text.includes('Export')) {
                showToast('📤 Exporting your data...', 'info');
            } else if (text.includes('Cloud')) {
                showToast('☁️ Cloud backup initiated!', 'success');
            } else if (text.includes('Logout')) {
                if (confirm('Are you sure you want to logout?')) {
                    logout();
                }
            }
        });
    });
}

function initSettingsModule() {
    // Settings buttons
    document.querySelectorAll('.settings-card .btn-secondary, .settings-card .btn-danger').forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.textContent.trim();
            if (text.includes('Clear')) {
                if (confirm('Clear all cached data?')) {
                    localStorage.clear();
                    showToast('🗑️ Cache cleared!', 'success');
                    location.reload();
                }
            } else if (text.includes('Delete')) {
                if (confirm('Delete your account? This cannot be undone!')) {
                    if (confirm('Final confirmation?')) {
                        localStorage.clear();
                        showToast('🗑️ Account deleted', 'info');
                        location.reload();
                    }
                }
            } else if (text.includes('Enable')) {
                showToast('🔐 Feature enabled!', 'success');
            } else if (text.includes('Manage')) {
                showToast('⚙️ Management panel', 'info');
            } else if (text.includes('Backup')) {
                showToast('☁️ Cloud backup', 'success');
            } else if (text.includes('Export')) {
                exportAllData();
            } else {
                showToast(`⚙️ ${text}`, 'info');
            }
        });
    });

    // Toggle switches
    document.querySelectorAll('.toggle input').forEach(toggle => {
        toggle.addEventListener('change', function() {
            const label = this.closest('.setting-item')?.querySelector('span')?.textContent || 'Setting';
            const status = this.checked ? 'enabled' : 'disabled';
            showToast(`🔔 ${label} ${status}`, 'info');
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

    // Load saved color
    const savedColor = localStorage.getItem('primaryColor');
    if (savedColor) {
        document.documentElement.style.setProperty('--primary', savedColor);
        document.documentElement.style.setProperty('--primary-light', savedColor + 'cc');
        document.documentElement.style.setProperty('--primary-dark', savedColor + '99');
        document.querySelectorAll('.color-option').forEach(o => {
            if (o.dataset.color === savedColor) o.classList.add('active');
        });
    }
}

function exportAllData() {
    const data = {
        user: JSON.parse(localStorage.getItem('user') || 'null'),
        bookmarks: JSON.parse(localStorage.getItem('bookmarks') || '[]'),
        favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
        trackedPrayers: JSON.parse(localStorage.getItem('trackedPrayers') || '{}'),
        zakatHistory: JSON.parse(localStorage.getItem('zakatHistory') || '[]'),
        hadithFavorites: JSON.parse(localStorage.getItem('hadithFavorites') || '[]'),
        duaFavorites: JSON.parse(localStorage.getItem('duaFavorites') || '[]')
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'muslim-app-data.json';
    a.click();
    showToast('📥 Data exported!', 'success');
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initVideoModule();
    initAudioModule();
    initCommunityModule();
    initKidsModule();
    initProfileModule();
    initSettingsModule();
});
