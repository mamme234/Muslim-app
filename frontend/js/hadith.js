// ============================================
// HADITH MODULE
// ============================================

class HadithModule {
    constructor() {
        this.currentCollection = 'bukhari';
        this.currentCategory = 'all';
        this.favorites = JSON.parse(localStorage.getItem('favoriteHadith') || '[]');
        this.readCount = parseInt(localStorage.getItem('hadithReadCount') || '0');
        this.hadithData = {
            bukhari: [
                { 
                    text: '"The best of you are those who are best to their families"',
                    reference: 'Sahih Bukhari, Book 78, Hadith 160',
                    grade: 'sahih',
                    category: 'family'
                },
                {
                    text: '"Whoever believes in Allah and the Last Day, let him speak good or remain silent"',
                    reference: 'Sahih Bukhari, Book 78, Hadith 113',
                    grade: 'sahih',
                    category: 'faith'
                },
                {
                    text: '"The strong person is not the one who can wrestle, but the one who controls himself at times of anger"',
                    reference: 'Sahih Bukhari, Book 73, Hadith 135',
                    grade: 'sahih',
                    category: 'morals'
                },
                {
                    text: '"None of you truly believes until he loves for his brother what he loves for himself"',
                    reference: 'Sahih Bukhari, Book 2, Hadith 13',
                    grade: 'sahih',
                    category: 'faith'
                },
                {
                    text: '"Whoever removes a worldly hardship from a believer, Allah will remove one of the hardships of the Day of Judgment"',
                    reference: 'Sahih Bukhari, Book 46, Hadith 36',
                    grade: 'sahih',
                    category: 'charity'
                },
                {
                    text: '"The best of people are those who are most beneficial to others"',
                    reference: 'Sahih Bukhari, Book 78, Hadith 135',
                    grade: 'sahih',
                    category: 'morals'
                },
                {
                    text: '"Whoever seeks knowledge, Allah will make the path to Paradise easy for him"',
                    reference: 'Sahih Bukhari, Book 3, Hadith 1',
                    grade: 'sahih',
                    category: 'knowledge'
                },
                {
                    text: '"The most beloved of deeds to Allah are those done consistently, even if they are small"',
                    reference: 'Sahih Bukhari, Book 78, Hadith 15',
                    grade: 'sahih',
                    category: 'faith'
                }
            ],
            muslim: [
                {
                    text: '"The best of people are those who are most beneficial to others"',
                    reference: 'Sahih Muslim, Book 45, Hadith 100',
                    grade: 'sahih',
                    category: 'morals'
                },
                {
                    text: '"A good word is charity"',
                    reference: 'Sahih Muslim, Book 5, Hadith 57',
                    grade: 'sahih',
                    category: 'charity'
                },
                {
                    text: '"Whoever believes in Allah and the Last Day, let him honor his neighbor"',
                    reference: 'Sahih Muslim, Book 1, Hadith 74',
                    grade: 'sahih',
                    category: 'family'
                },
                {
                    text: '"The greatest of sins is to associate partners with Allah"',
                    reference: 'Sahih Muslim, Book 1, Hadith 141',
                    grade: 'sahih',
                    category: 'faith'
                },
                {
                    text: '"Patience is half of faith"',
                    reference: 'Sahih Muslim, Book 1, Hadith 223',
                    grade: 'sahih',
                    category: 'patience'
                }
            ],
            abudawud: [
                {
                    text: '"The best of you are those who are best to their families"',
                    reference: 'Sunan Abi Dawud, Book 11, Hadith 225',
                    grade: 'hasan',
                    category: 'family'
                },
                {
                    text: '"Whoever guides someone to goodness will have a reward like the one who does it"',
                    reference: 'Sunan Abi Dawud, Book 10, Hadith 20',
                    grade: 'sahih',
                    category: 'charity'
                },
                {
                    text: '"The best of people are those who are most beneficial to others"',
                    reference: 'Sunan Abi Dawud, Book 12, Hadith 35',
                    grade: 'hasan',
                    category: 'morals'
                }
            ],
            tirmidhi: [
                {
                    text: '"The most beloved of deeds to Allah are those done consistently"',
                    reference: 'Sunan Tirmidhi, Book 48, Hadith 1',
                    grade: 'hasan',
                    category: 'faith'
                },
                {
                    text: '"Whoever is not grateful to people is not grateful to Allah"',
                    reference: 'Sunan Tirmidhi, Book 27, Hadith 13',
                    grade: 'sahih',
                    category: 'morals'
                },
                {
                    text: '"The best of you are those who learn the Quran and teach it"',
                    reference: 'Sunan Tirmidhi, Book 42, Hadith 2',
                    grade: 'sahih',
                    category: 'knowledge'
                }
            ],
            nasai: [
                {
                    text: '"Whoever believes in Allah and the Last Day, let him honor his guest"',
                    reference: 'Sunan Nasai, Book 45, Hadith 15',
                    grade: 'sahih',
                    category: 'family'
                },
                {
                    text: '"The best of you are those who are best to their wives"',
                    reference: 'Sunan Nasai, Book 26, Hadith 14',
                    grade: 'sahih',
                    category: 'family'
                }
            ],
            ibnmajah: [
                {
                    text: '"The best of you are those who are best to their families"',
                    reference: 'Sunan Ibn Majah, Book 9, Hadith 1977',
                    grade: 'hasan',
                    category: 'family'
                },
                {
                    text: '"Whoever seeks knowledge and does not find it, Allah will reward him"',
                    reference: 'Sunan Ibn Majah, Book 1, Hadith 224',
                    grade: 'hasan',
                    category: 'knowledge'
                }
            ],
            malik: [
                {
                    text: '"The best of people are those who are most beneficial to others"',
                    reference: 'Muwatta Malik, Book 56, Hadith 10',
                    grade: 'sahih',
                    category: 'morals'
                }
            ]
        };
        this.init();
    }

    init() {
        this.renderCollections();
        this.renderCategories();
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

    renderCategories() {
        const container = document.getElementById('hadithCategories');
        if (!container) return;

        container.querySelectorAll('.hadith-category').forEach(cat => {
            cat.addEventListener('click', () => {
                container.querySelectorAll('.hadith-category').forEach(c => c.classList.remove('active'));
                cat.classList.add('active');
                this.currentCategory = cat.dataset.cat;
                this.renderHadith();
            });
        });
    }

    renderHadith(search = '') {
        const container = document.getElementById('hadithList');
        if (!container) return;

        let hadiths = this.hadithData[this.currentCollection] || [];

        // Filter by category
        if (this.currentCategory !== 'all') {
            hadiths = hadiths.filter(h => h.category === this.currentCategory);
        }

        // Filter by search
        if (search) {
            const term = search.toLowerCase();
            hadiths = hadiths.filter(h => 
                h.text.toLowerCase().includes(term) ||
                h.reference.toLowerCase().includes(term)
            );
        }

        if (hadiths.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:40px;color:var(--text-muted);">
                    <i class="fas fa-scroll" style="font-size:48px;"></i>
                    <p>No hadith found in this collection</p>
                </div>
            `;
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
                        <span class="grade ${gradeClass}">${gradeClass.toUpperCase()}</span>
                    </div>
                    <div class="hadith-actions">
                        <button class="favorite-btn" data-text="${encodeURIComponent(hadith.text)}" data-ref="${encodeURIComponent(hadith.reference)}">
                            <i class="fas ${isFavorite ? 'fa-star' : 'fa-star-o'}"></i>
                            ${isFavorite ? 'Favorited' : 'Add to Favorites'}
                        </button>
                        <button class="copy-btn" data-text="${encodeURIComponent(hadith.text)}">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                        <button class="share-btn" data-text="${encodeURIComponent(hadith.text)} - ${hadith.reference}">
                            <i class="fas fa-share-alt"></i> Share
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners for actions
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
                    setTimeout(() => {
                        btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                    }, 2000);
                });
            });
        });

        container.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = decodeURIComponent(btn.dataset.text);
                if (navigator.share) {
                    navigator.share({
                        title: 'Hadith',
                        text: text
                    });
                } else {
                    navigator.clipboard.writeText(text).then(() => {
                        alert('Hadith copied to clipboard!');
                    });
                }
            });
        });
    }

    toggleFavorite(text, reference) {
        const index = this.favorites.findIndex(f => f.text === text && f.reference === reference);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push({ text, reference });
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
            container.innerHTML = `
                <div style="text-align:center;padding:20px;color:var(--text-muted);font-size:14px;">
                    <i class="fas fa-star-o" style="font-size:24px;"></i>
                    <p>No favorite hadith yet. Click the star icon on any hadith to add it.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.favorites.map((h, index) => `
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

        // Get today's hadith based on date
        const today = new Date().toISOString().split('T')[0];
        const allHadith = [];
        Object.values(this.hadithData).forEach(catHadith => {
            allHadith.push(...catHadith);
        });

        // Use date to select a consistent hadith
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const index = dayOfYear % allHadith.length;
        const hadith = allHadith[index] || allHadith[0];

        container.innerHTML = `
            <p style="font-size:16px;line-height:1.6;font-style:italic;color:var(--text-secondary);">
                ${hadith.text}
            </p>
            <p style="font-size:13px;color:var(--text-muted);margin-top:8px;">
                ${hadith.reference} · ${hadith.grade.toUpperCase()}
            </p>
        `;
    }

    updateStats() {
        const readEl = document.getElementById('hadithRead');
        const favEl = document.getElementById('favoriteCount');
        const streakEl = document.getElementById('dailyStreak');

        if (readEl) readEl.textContent = this.readCount;
        if (favEl) favEl.textContent = this.favorites.length;
        
        // Calculate streak from localStorage
        const lastRead = localStorage.getItem('lastHadithRead');
        const today = new Date().toISOString().split('T')[0];
        let streak = parseInt(localStorage.getItem('hadithStreak') || '0');
        
        if (lastRead === today) {
            // Already read today
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
        // Search
        const searchInput = document.getElementById('hadithSearch');
        const searchBtn = document.getElementById('searchBtn');

        const performSearch = () => {
            if (searchInput) {
                this.renderHadith(searchInput.value);
                // Increment read count
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.hadithModule = new HadithModule();
});
