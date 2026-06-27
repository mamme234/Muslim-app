// ============================================
// HADITH MODULE
// ============================================

class HadithModule {
    constructor() {
        this.currentCollection = 'bukhari';
        this.favorites = JSON.parse(localStorage.getItem('favoriteHadith') || '[]');
        this.readCount = parseInt(localStorage.getItem('hadithReadCount') || '0');
        this.hadithData = {
            bukhari: [
                { text: '"The best of you are those who are best to their families"', reference: 'Sahih Bukhari, Book 78, Hadith 160', grade: 'sahih' },
                { text: '"Whoever believes in Allah and the Last Day, let him speak good or remain silent"', reference: 'Sahih Bukhari, Book 78, Hadith 113', grade: 'sahih' },
                { text: '"The strong person is not the one who can wrestle, but the one who controls himself at times of anger"', reference: 'Sahih Bukhari, Book 73, Hadith 135', grade: 'sahih' },
                { text: '"None of you truly believes until he loves for his brother what he loves for himself"', reference: 'Sahih Bukhari, Book 2, Hadith 13', grade: 'sahih' }
            ],
            muslim: [
                { text: '"The best of people are those who are most beneficial to others"', reference: 'Sahih Muslim, Book 45, Hadith 100', grade: 'sahih' },
                { text: '"A good word is charity"', reference: 'Sahih Muslim, Book 5, Hadith 57', grade: 'sahih' }
            ],
            abudawud: [
                { text: '"Whoever guides someone to goodness will have a reward like the one who does it"', reference: 'Sunan Abi Dawud, Book 10, Hadith 20', grade: 'sahih' }
            ],
            tirmidhi: [
                { text: '"The most beloved of deeds to Allah are those done consistently"', reference: 'Sunan Tirmidhi, Book 48, Hadith 1', grade: 'hasan' }
            ],
            nasai: [
                { text: '"Whoever believes in Allah and the Last Day, let him honor his guest"', reference: 'Sunan Nasai, Book 45, Hadith 15', grade: 'sahih' }
            ],
            ibnmajah: [
                { text: '"The best of you are those who are best to their families"', reference: 'Sunan Ibn Majah, Book 9, Hadith 1977', grade: 'hasan' }
            ]
        };
        this.init();
    }

    init() {
        this.renderCollections();
        this.renderHadith();
        this.renderFavorites();
        this.updateStats();
        this.setupEventListeners();
        this.setDailyHadith();
    }

    renderCollections() {
        const container = document.getElementById('hadithCollections');
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

    renderHadith(search = '') {
        const container = document.getElementById('hadithList');
        if (!container) return;

        let hadiths = this.hadithData[this.currentCollection] || [];

        if (search) {
            const term = search.toLowerCase();
            hadiths = hadiths.filter(h => h.text.toLowerCase().includes(term) || h.reference.toLowerCase().includes(term));
        }

        if (hadiths.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);">
                <i class="fas fa-scroll" style="font-size:48px;"></i><p>No hadith found in this collection</p>
            </div>`;
            return;
        }

        container.innerHTML = hadiths.map((hadith, index) => {
            const isFavorite = this.favorites.some(f => f.text === hadith.text && f.reference === hadith.reference);
            const gradeClass = hadith.grade || 'sahih';
            return `
                <div class="hadith-item ${isFavorite ? 'favorite-hadith' : ''}" data-index="${index}">
                    <div class="hadith-text">${hadith.text}</div>
                    <div class="hadith-reference">
                        <span>📚 ${hadith.reference}</span>
                        <span style="margin-left:12px;padding:2px 12px;border-radius:var(--radius-full);font-size:11px;font-weight:600;background:${gradeClass === 'sahih' ? '#d4edda' : '#fff3cd'};color:${gradeClass === 'sahih' ? '#155724' : '#856404'}">
                            ${gradeClass.toUpperCase()}
                        </span>
                    </div>
                    <div class="hadith-actions" style="margin-top:8px;display:flex;gap:10px;">
                        <button class="favorite-btn" data-text="${encodeURIComponent(hadith.text)}" data-ref="${encodeURIComponent(hadith.reference)}" style="padding:4px 14px;border:none;background:var(--primary-bg);color:var(--primary);border-radius:var(--radius-full);font-size:12px;cursor:pointer;">
                            <i class="fas ${isFavorite ? 'fa-star' : 'fa-star-o'}"></i>
                            ${isFavorite ? 'Favorited' : 'Add to Favorites'}
                        </button>
                        <button class="copy-btn" data-text="${encodeURIComponent(hadith.text)}" style="padding:4px 14px;border:none;background:var(--primary-bg);color:var(--primary);border-radius:var(--radius-full);font-size:12px;cursor:pointer;">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = decodeURIComponent(btn.dataset.text);
                const reference = decodeURIComponent(btn.dataset.ref);
                this.toggleFavorite(text, reference);
            });
        });

        container.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = decodeURIComponent(btn.dataset.text);
                navigator.clipboard.writeText(text).then(() => {
                    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i> Copy'; }, 2000);
                });
            });
        });
    }

    toggleFavorite(text, reference) {
        const index = this.favorites.findIndex(f => f.text === text && f.reference === reference);
        if (index > -1) {
            this.favorites.splice(index, 1);
            showToast('Removed from favorites');
        } else {
            this.favorites.push({ text, reference });
            showToast('⭐ Added to favorites');
        }
        localStorage.setItem('favoriteHadith', JSON.stringify(this.favorites));
        this.renderFavorites();
        this.renderHadith();
        this.updateStats();
    }

    renderFavorites() {
        const container = document.getElementById('favoriteHadith');
        if (!container) return;

        if (this.favorites.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:14px;">
                <i class="fas fa-star-o" style="font-size:24px;"></i>
                <p>No favorite hadith yet. Click the star icon on any hadith to add it.</p>
            </div>`;
            return;
        }

        container.innerHTML = this.favorites.map(h => `
            <div class="hadith-item favorite-hadith" style="padding:12px 16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <div style="font-size:15px;font-style:italic;color:var(--text-secondary);">${h.text}</div>
                        <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">${h.reference}</div>
                    </div>
                    <button class="favorite-btn" data-text="${encodeURIComponent(h.text)}" data-ref="${encodeURIComponent(h.reference)}" style="background:none;border:none;color:var(--gold);font-size:18px;cursor:pointer;">
                        <i class="fas fa-star"></i>
                    </button>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = decodeURIComponent(btn.dataset.text);
                const reference = decodeURIComponent(btn.dataset.ref);
                this.toggleFavorite(text, reference);
            });
        });
    }

    setDailyHadith() {
        const container = document.getElementById('dailyHadith');
        if (!container) return;

        const allHadith = [];
        Object.values(this.hadithData).forEach(catHadith => { allHadith.push(...catHadith); });

        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const index = dayOfYear % allHadith.length;
        const hadith = allHadith[index] || allHadith[0];

        container.innerHTML = `
            <p style="font-size:16px;line-height:1.6;font-style:italic;color:var(--text-secondary);">${hadith.text}</p>
            <p style="font-size:13px;color:var(--text-muted);margin-top:8px;">${hadith.reference} · ${hadith.grade.toUpperCase()}</p>
        `;
    }

    updateStats() {
        const readEl = document.getElementById('hadithRead');
        const favEl = document.getElementById('favoriteCount');
        const streakEl = document.getElementById('dailyStreak');

        if (readEl) readEl.textContent = this.readCount;
        if (favEl) favEl.textContent = this.favorites.length;
        
        const lastRead = localStorage.getItem('lastHadithRead');
        const today = new Date().toISOString().split('T')[0];
        let streak = parseInt(localStorage.getItem('hadithStreak') || '0');
        
        if (lastRead === today) {
        } else if (lastRead === this.getYesterday()) {
            streak++;
            localStorage.setItem('hadithStreak', streak.toString());
        } else if (lastRead !== today) {
            streak = 0;
            localStorage.setItem('hadithStreak', '0');
        }
        localStorage.setItem('lastHadithRead', today);
        
        if (streakEl) streakEl.textContent = streak;
    }

    getYesterday() {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return date.toISOString().split('T')[0];
    }

    setupEventListeners() {
        const searchInput = document.getElementById('hadithSearch');
        const searchBtn = document.querySelector('#hadithSearch + button');

        const performSearch = () => {
            if (searchInput) {
                this.renderHadith(searchInput.value);
                if (searchInput.value.length > 2) {
                    this.readCount++;
                    localStorage.setItem('hadithReadCount', this.readCount.toString());
                    this.updateStats();
                }
            }
        };

        searchInput?.addEventListener('input', performSearch);
        searchBtn?.addEventListener('click', performSearch);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.hadithModule = new HadithModule();
});
