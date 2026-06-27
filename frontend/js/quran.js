// ============================================
// QURAN MODULE
// ============================================

class QuranModule {
    constructor() {
        this.surahs = [];
        this.currentSurah = null;
        this.bookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
        this.progress = JSON.parse(localStorage.getItem('quranProgress') || '{}');
        this.translations = {
            en: 'english',
            ur: 'urdu',
            bn: 'bengali',
            ar: 'arabic'
        };
        this.init();
    }

    async init() {
        await this.loadSurahs();
        this.renderSurahList();
        this.setupEventListeners();
        this.renderBookmarks();
        this.updateProgress();
    }

    async loadSurahs() {
        try {
            const response = await fetch('https://api.alquran.cloud/v1/meta');
            const data = await response.json();
            if (data.code === 200) {
                this.surahs = data.data.surahs;
            }
        } catch (error) {
            // Fallback data
            this.surahs = [
                { number: 1, name: 'Al-Fatihah', englishName: 'The Opener', verses: 7 },
                { number: 2, name: 'Al-Baqarah', englishName: 'The Cow', verses: 286 },
                { number: 3, name: 'Aal-Imran', englishName: 'Family of Imran', verses: 200 },
                { number: 4, name: 'An-Nisa', englishName: 'The Women', verses: 176 },
                { number: 5, name: 'Al-Maidah', englishName: 'The Table', verses: 120 },
                { number: 6, name: 'Al-An\'am', englishName: 'The Cattle', verses: 165 },
                { number: 7, name: 'Al-A\'raf', englishName: 'The Heights', verses: 206 },
                { number: 8, name: 'Al-Anfal', englishName: 'The Spoils', verses: 75 },
                { number: 9, name: 'At-Tawbah', englishName: 'The Repentance', verses: 129 },
                { number: 10, name: 'Yunus', englishName: 'Jonah', verses: 109 },
            ];
        }
    }

    renderSurahList(filter = '') {
        const container = document.getElementById('surahList');
        if (!container) return;

        const filtered = this.surahs.filter(s => 
            s.name.toLowerCase().includes(filter.toLowerCase()) ||
            s.englishName.toLowerCase().includes(filter.toLowerCase()) ||
            s.number.toString().includes(filter)
        );

        container.innerHTML = filtered.map(surah => `
            <div class="surah-item" data-surah="${surah.number}">
                <div class="surah-info">
                    <span class="surah-number">${surah.number}</span>
                    <div>
                        <div class="surah-name">${surah.name}</div>
                        <div class="surah-english">${surah.englishName}</div>
                    </div>
                </div>
                <div class="surah-verses">${surah.verses} verses</div>
            </div>
        `).join('');

        // Add click events
        container.querySelectorAll('.surah-item').forEach(item => {
            item.addEventListener('click', () => {
                const num = parseInt(item.dataset.surah);
                this.loadSurah(num);
            });
        });
    }

    async loadSurah(number) {
        try {
            const translation = document.getElementById('translationSelect')?.value || 'en';
            const lang = this.translations[translation] || 'english';
            
            // Load Arabic text
            const arabicRes = await fetch(`https://api.alquran.cloud/v1/surah/${number}`);
            const arabicData = await arabicRes.json();
            
            // Load translation
            const transRes = await fetch(`https://api.alquran.cloud/v1/surah/${number}/${lang}`);
            const transData = await transRes.json();

            if (arabicData.code === 200 && transData.code === 200) {
                this.displaySurah(arabicData.data, transData.data);
            }
        } catch (error) {
            console.error('Error loading surah:', error);
            // Fallback: show error message
            document.getElementById('quranText').innerHTML = `
                <p style="text-align:center;color:var(--text-muted);padding:40px;">
                    <i class="fas fa-exclamation-circle" style="font-size:48px;"></i><br>
                    Unable to load surah. Please check your connection.
                </p>
            `;
            document.getElementById('quranViewer').classList.add('active');
        }
    }

    displaySurah(arabicData, translationData) {
        const viewer = document.getElementById('quranViewer');
        const textContainer = document.getElementById('quranText');
        const title = document.getElementById('viewerTitle');

        title.textContent = `${arabicData.name} (${arabicData.englishName})`;
        
        // Combine verses
        const verses = arabicData.ayahs.map((ayah, index) => {
            const transAyah = translationData.ayahs[index] || { text: '' };
            return {
                number: ayah.numberInSurah,
                arabic: ayah.text,
                translation: transAyah.text
            };
        });

        textContainer.innerHTML = `
            <div style="text-align:center;padding:10px 0 20px;border-bottom:1px solid rgba(0,0,0,0.05);">
                <p style="color:var(--text-muted);font-size:14px;">
                    ${arabicData.revelationType} · ${arabicData.numberOfAyahs} verses
                </p>
            </div>
            ${verses.map(v => `
                <div class="ayah">
                    <span class="ayah-number">${v.number}</span>
                    <div class="ayah-text">${v.arabic}</div>
                    <div class="ayah-translation">${v.translation}</div>
                </div>
            `).join('')}
        `;

        viewer.classList.add('active');
        this.currentSurah = arabicData.number;
        
        // Update progress
        this.updateProgress();
    }

    setupEventListeners() {
        // Close viewer
        document.getElementById('closeViewer')?.addEventListener('click', () => {
            document.getElementById('quranViewer').classList.remove('active');
        });

        // Search
        const searchInput = document.getElementById('quranSearch');
        const searchBtn = document.getElementById('searchBtn');
        
        const performSearch = () => {
            if (searchInput) {
                this.renderSurahList(searchInput.value);
            }
        };

        searchInput?.addEventListener('input', performSearch);
        searchBtn?.addEventListener('click', performSearch);

        // Translation change
        document.getElementById('translationSelect')?.addEventListener('change', () => {
            if (this.currentSurah) {
                this.loadSurah(this.currentSurah);
            }
        });

        // Feature cards
        document.getElementById('readQuran')?.addEventListener('click', () => {
            document.querySelector('.surah-item')?.click();
        });

        document.getElementById('bookmarks')?.addEventListener('click', () => {
            document.getElementById('bookmarksList')?.scrollIntoView({ behavior: 'smooth' });
        });

        document.getElementById('searchQuran')?.addEventListener('click', () => {
            document.getElementById('quranSearch')?.focus();
        });

        document.getElementById('memorization')?.addEventListener('click', () => {
            this.startMemorization();
        });

        // Bookmark click
        document.querySelectorAll('.bookmark-item').forEach(item => {
            item.addEventListener('click', () => {
                const text = item.textContent;
                const match = text.match(/(\d+):(\d+)/);
                if (match) {
                    this.loadSurah(parseInt(match[1]));
                }
            });
        });
    }

    startMemorization() {
        // Simple memorization mode - show random ayah
        if (this.surahs.length === 0) return;
        
        const randomSurah = this.surahs[Math.floor(Math.random() * this.surahs.length)];
        this.loadSurah(randomSurah.number);
        
        // Highlight random ayah
        setTimeout(() => {
            const ayahs = document.querySelectorAll('.ayah');
            if (ayahs.length > 0) {
                const randomIndex = Math.floor(Math.random() * ayahs.length);
                ayahs.forEach((el, i) => {
                    el.style.background = i === randomIndex ? 'var(--primary-bg)' : 'transparent';
                    el.style.padding = i === randomIndex ? '12px 8px' : '12px 0';
                    el.style.borderRadius = i === randomIndex ? 'var(--radius-sm)' : '0';
                });
                ayahs[randomIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 500);
    }

    renderBookmarks() {
        const container = document.getElementById('bookmarksList');
        if (!container) return;

        if (this.bookmarks.length === 0) {
            container.innerHTML = '<span style="color:var(--text-muted);font-size:13px;">No bookmarks yet. Click on a verse to bookmark it.</span>';
            return;
        }

        container.innerHTML = this.bookmarks.map(b => `
            <span class="bookmark-item" data-surah="${b.surah}" data-ayah="${b.ayah}">
                ${b.name} ${b.ayah ? `:${b.ayah}` : ''}
                <i class="fas fa-times" style="margin-left:8px;font-size:12px;cursor:pointer;" data-remove="${b.id}"></i>
            </span>
        `).join('');

        // Add remove functionality
        container.querySelectorAll('[data-remove]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.remove;
                this.removeBookmark(id);
            });
        });
    }

    addBookmark(surah, ayah = null) {
        const surahData = this.surahs.find(s => s.number === surah);
        if (!surahData) return;

        const bookmark = {
            id: Date.now().toString(),
            surah,
            ayah,
            name: surahData.name
        };

        this.bookmarks.push(bookmark);
        localStorage.setItem('quranBookmarks', JSON.stringify(this.bookmarks));
        this.renderBookmarks();
    }

    removeBookmark(id) {
        this.bookmarks = this.bookmarks.filter(b => b.id !== id);
        localStorage.setItem('quranBookmarks', JSON.stringify(this.bookmarks));
        this.renderBookmarks();
    }

    updateProgress() {
        const progress = document.querySelector('.progress-tracker progress');
        if (progress) {
            const readCount = this.surahs.filter(s => this.progress[s.number]).length;
            progress.value = readCount;
            progress.max = this.surahs.length;
            
            const label = progress.parentElement.querySelector('span');
            if (label) {
                label.textContent = `${readCount} of ${this.surahs.length} Surahs`;
            }
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.quranModule = new QuranModule();
});
