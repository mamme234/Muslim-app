// ============================================
// QURAN MODULE
// ============================================

class QuranModule {
    constructor() {
        this.surahs = [];
        this.currentSurah = null;
        this.bookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
        this.progress = JSON.parse(localStorage.getItem('quranProgress') || '{}');
        this.currentReciter = localStorage.getItem('selectedReciter') || 'mishary';
        this.translations = { en: 'english', ur: 'urdu', bn: 'bengali', ar: 'arabic' };
        this.init();
    }

    async init() {
        await this.loadSurahs();
        this.renderSurahList();
        this.setupEventListeners();
        this.renderBookmarks();
        this.updateProgress();
        this.initReciters();
    }

    async loadSurahs() {
        try {
            const data = await API.quran.getSurahs();
            if (data.success) {
                this.surahs = data.data;
            }
        } catch (error) {
            console.warn('Using fallback surahs', error);
            this.surahs = [
                { number: 1, name: 'Al-Fatihah', englishName: 'The Opener', verses: 7 },
                { number: 2, name: 'Al-Baqarah', englishName: 'The Cow', verses: 286 },
                { number: 3, name: 'Aal-Imran', englishName: 'Family of Imran', verses: 200 },
                { number: 4, name: 'An-Nisa', englishName: 'The Women', verses: 176 },
                { number: 5, name: 'Al-Maidah', englishName: 'The Table', verses: 120 },
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
            
            const data = await API.quran.getSurah(number, translation);
            if (data.success) {
                this.displaySurah(data.data.surah, data.data.translation);
            }
        } catch (error) {
            console.error('Error loading surah:', error);
            showToast('❌ Unable to load surah. Please try again.');
        }
    }

    displaySurah(arabicData, translationData) {
        const viewer = document.getElementById('quranViewer');
        const textContainer = document.getElementById('quranText');
        const title = document.getElementById('viewerTitle');

        title.textContent = `${arabicData.name} (${arabicData.englishName})`;
        
        const verses = arabicData.ayahs.map((ayah, index) => {
            const transAyah = translationData?.ayahs?.[index] || { text: '' };
            return {
                number: ayah.numberInSurah,
                arabic: ayah.text,
                translation: transAyah.text
            };
        });

        textContainer.innerHTML = `
            <div style="text-align:center;padding:10px 0 20px;border-bottom:1px solid var(--border-color);">
                <p style="color:var(--text-muted);font-size:14px;">
                    ${arabicData.revelationType} · ${arabicData.numberOfAyahs} verses
                </p>
                <button onclick="window.quranModule?.playRecitation(${arabicData.number})" 
                    style="margin-top:8px;padding:8px 20px;background:var(--primary);color:white;border:none;border-radius:var(--radius-full);cursor:pointer;">
                    <i class="fas fa-play"></i> Play Recitation
                </button>
            </div>
            ${verses.map(v => `
                <div class="ayah" onclick="window.quranModule?.bookmarkVerse(${arabicData.number}, ${v.number})">
                    <span class="ayah-number">${v.number}</span>
                    <div class="ayah-text">${v.arabic}</div>
                    <div class="ayah-translation">${v.translation}</div>
                </div>
            `).join('')}
        `;

        viewer.classList.add('active');
        this.currentSurah = arabicData.number;
        this.updateProgress();
    }

    playRecitation(surahNumber) {
        const reciterMap = {
            mishary: 'mishary_rashid_alafasy',
            sudais: 'abdul_rahman_al_sudais',
            ghamdi: 'saad_al_ghamdi',
            muaiqly: 'maher_al_muaiqly',
            dosari: 'yasser_al_dosari'
        };
        const reciter = reciterMap[this.currentReciter] || 'mishary_rashid_alafasy';
        const url = `https://cdn.islamic.network/quran/audio/128/${reciter}/${surahNumber}.mp3`;
        
        const audio = new Audio(url);
        audio.play();
        showToast('🔊 Playing recitation');
    }

    bookmarkVerse(surah, ayah) {
        const surahData = this.surahs.find(s => s.number === surah);
        if (!surahData) return;

        const bookmark = {
            id: Date.now().toString(),
            surah,
            ayah,
            name: surahData.name,
            text: `${surahData.name} ${ayah}`
        };

        if (!this.bookmarks.some(b => b.surah === surah && b.ayah === ayah)) {
            this.bookmarks.push(bookmark);
            localStorage.setItem('quranBookmarks', JSON.stringify(this.bookmarks));
            this.renderBookmarks();
            showToast(`📖 Bookmarked: ${bookmark.text}`);
        } else {
            showToast('Already bookmarked');
        }
    }

    renderBookmarks() {
        const container = document.getElementById('bookmarksList');
        if (!container) return;

        if (this.bookmarks.length === 0) {
            container.innerHTML = '<span style="color:var(--text-muted);font-size:13px;">No bookmarks yet. Click on a verse to bookmark it.</span>';
            return;
        }

        container.innerHTML = this.bookmarks.map(b => `
            <span class="bookmark-item" onclick="window.quranModule?.loadSurah(${b.surah})">
                ${b.name} ${b.ayah ? `:${b.ayah}` : ''}
                <i class="fas fa-times" style="margin-left:8px;font-size:12px;cursor:pointer;" onclick="event.stopPropagation(); window.quranModule?.removeBookmark('${b.id}')"></i>
            </span>
        `).join('');
    }

    removeBookmark(id) {
        this.bookmarks = this.bookmarks.filter(b => b.id !== id);
        localStorage.setItem('quranBookmarks', JSON.stringify(this.bookmarks));
        this.renderBookmarks();
        showToast('Bookmark removed');
    }

    updateProgress() {
        const progress = document.querySelector('.progress-tracker progress');
        if (progress) {
            const readCount = this.surahs.filter(s => this.progress[s.number]).length;
            progress.value = readCount;
            progress.max = this.surahs.length;
        }
    }

    initReciters() {
        const container = document.getElementById('reciterSelector');
        if (!container) return;

        container.querySelectorAll('.reciter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.reciter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentReciter = btn.dataset.reciter;
                localStorage.setItem('selectedReciter', this.currentReciter);
                showToast(`🎙️ Reciter changed to ${btn.textContent.trim()}`);
            });
        });
    }

    setupEventListeners() {
        document.getElementById('closeViewer')?.addEventListener('click', () => {
            document.getElementById('quranViewer').classList.remove('active');
        });

        const searchInput = document.getElementById('quranSearch');
        const searchBtn = document.getElementById('searchBtn');
        
        const performSearch = () => {
            if (searchInput) this.renderSurahList(searchInput.value);
        };

        searchInput?.addEventListener('input', performSearch);
        searchBtn?.addEventListener('click', performSearch);

        document.getElementById('translationSelect')?.addEventListener('change', () => {
            if (this.currentSurah) this.loadSurah(this.currentSurah);
        });

        document.getElementById('readQuran')?.addEventListener('click', () => {
            document.querySelector('.surah-item')?.click();
        });

        document.getElementById('searchQuran')?.addEventListener('click', () => {
            document.getElementById('quranSearch')?.focus();
        });

        document.getElementById('memorizeQuran')?.addEventListener('click', () => {
            this.startMemorization();
        });

        document.getElementById('listenQuran')?.addEventListener('click', () => {
            const surah = this.surahs[Math.floor(Math.random() * this.surahs.length)];
            if (surah) this.playRecitation(surah.number);
        });
    }

    startMemorization() {
        if (this.surahs.length === 0) return;
        
        const randomSurah = this.surahs[Math.floor(Math.random() * this.surahs.length)];
        this.loadSurah(randomSurah.number);
        
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
                showToast('🎯 Focus on this verse for memorization');
            }
        }, 500);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.quranModule = new QuranModule();
});
