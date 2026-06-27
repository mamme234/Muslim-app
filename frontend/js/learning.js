// ============================================
// LEARNING.JS - Quran, Prayer, Duas, Hadith, Learning, Ramadan, Hajj
// ============================================

// ============================================
// QURAN DATA FROM The_Holy_Quran.pdf
// ============================================

// Sample Quran data - you can expand this with full PDF data
const QURAN_DATA = {
    1: { name: 'Al-Fatihah', englishName: 'The Opener', verses: 7, 
        ayahs: [
            { number: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', translation: 'In the name of Allah, the Most Gracious, the Most Merciful' },
            { number: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: 'Praise be to Allah, Lord of all the worlds' },
            { number: 3, text: 'الرَّحْمَٰنِ الرَّحِيمِ', translation: 'The Most Gracious, the Most Merciful' },
            { number: 4, text: 'مَالِكِ يَوْمِ الدِّينِ', translation: 'Master of the Day of Judgment' },
            { number: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', translation: 'You alone we worship, and You alone we ask for help' },
            { number: 6, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', translation: 'Guide us to the straight path' },
            { number: 7, text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', translation: 'The path of those who have received Your grace' }
        ]
    },
    2: { name: 'Al-Baqarah', englishName: 'The Cow', verses: 286,
        ayahs: [
            { number: 1, text: 'الم', translation: 'Alif, Lam, Meem' },
            { number: 2, text: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ', translation: 'This is the Book about which there is no doubt, a guidance for those conscious of Allah' }
        ]
    }
};

// ============================================
// QURAN MODULE
// ============================================

class QuranModule {
    constructor() {
        this.surahs = [];
        this.bookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
        this.currentReciter = localStorage.getItem('selectedReciter') || 'mishary';
        this.init();
    }

    init() {
        this.loadSurahs();
        this.renderSurahList();
        this.setupQuranEvents();
        this.renderBookmarks();
        this.initReciters();
        this.showSurahCount();
    }

    loadSurahs() {
        // Load from QURAN_DATA
        this.surahs = Object.keys(QURAN_DATA).map(num => ({
            number: parseInt(num),
            name: QURAN_DATA[num].name,
            englishName: QURAN_DATA[num].englishName,
            verses: QURAN_DATA[num].verses
        }));
        this.renderSurahList();
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

    loadSurah(number) {
        const viewer = document.getElementById('quranViewer');
        const textContainer = document.getElementById('quranText');
        const title = document.getElementById('viewerTitle');

        const surahData = QURAN_DATA[number];
        if (!surahData) {
            showToast('❌ Surah not found');
            return;
        }

        title.textContent = `${surahData.name} (${surahData.englishName})`;

        textContainer.innerHTML = `
            <div style="text-align:center;padding:10px 0 20px;border-bottom:1px solid var(--border-color);">
                <p style="color:var(--text-muted);font-size:14px;">
                    ${surahData.verses} verses · Click "Play Recitation" to listen
                </p>
                <button onclick="window.quranModule?.playRecitation(${number})" 
                    style="margin-top:8px;padding:8px 20px;background:var(--primary);color:white;border:none;border-radius:var(--radius-full);cursor:pointer;">
                    <i class="fas fa-play"></i> Play Recitation
                </button>
                <button onclick="window.quranModule?.bookmarkSurah(${number})" 
                    style="margin-top:8px;margin-left:8px;padding:8px 20px;background:var(--gold);color:white;border:none;border-radius:var(--radius-full);cursor:pointer;">
                    <i class="fas fa-bookmark"></i> Bookmark
                </button>
            </div>
            ${surahData.ayahs.map(v => `
                <div class="ayah">
                    <span class="ayah-number">${v.number}</span>
                    <div class="ayah-text">${v.text}</div>
                    <div class="ayah-translation">${v.translation}</div>
                </div>
            `).join('')}
        `;

        viewer.classList.add('active');
        this.currentSurah = number;
        showToast(`📖 Opened Surah ${surahData.name}`);
    }

    playRecitation(surahNumber) {
        const reciterMap = {
            mishary: 'mishary_rashid_alafasy',
            sudais: 'abdul_rahman_al_sudais',
            ghamdi: 'saad_al_ghamdi',
            muaiqly: 'maher_al_muaiqly'
        };
        const reciter = reciterMap[this.currentReciter] || 'mishary_rashid_alafasy';
        const url = `https://cdn.islamic.network/quran/audio/128/${reciter}/${surahNumber}.mp3`;
        
        const audio = new Audio(url);
        audio.play().then(() => {
            showToast(`🔊 Playing recitation`);
        }).catch(() => {
            showToast('⚠️ Audio playback failed. Please try again.');
        });
    }

    bookmarkSurah(number) {
        const surahData = QURAN_DATA[number];
        if (!surahData) return;

        const bookmark = {
            id: Date.now().toString(),
            surah: number,
            name: surahData.name,
            text: `${surahData.name} (${surahData.englishName})`
        };

        if (!this.bookmarks.some(b => b.surah === number)) {
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
            container.innerHTML = '<span style="color:var(--text-muted);font-size:13px;">No bookmarks yet.</span>';
            return;
        }

        container.innerHTML = this.bookmarks.map(b => `
            <span class="bookmark-item" onclick="window.quranModule?.loadSurah(${b.surah})">
                ${b.text}
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

    showSurahCount() {
        const count = this.surahs.length;
        const container = document.querySelector('#quran .card h3');
        if (container) {
            container.textContent = `All Surahs (${count})`;
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
                showToast(`🎙️ Reciter changed`);
            });
        });
    }

    setupQuranEvents() {
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

        document.getElementById('readQuran')?.addEventListener('click', () => {
            document.querySelector('.surah-item')?.click();
        });

        document.getElementById('searchQuran')?.addEventListener('click', () => {
            document.getElementById('quranSearch')?.focus();
        });

        document.getElementById('memorizeQuran')?.addEventListener('click', () => {
            if (this.surahs.length > 0) {
                const randomSurah = this.surahs[Math.floor(Math.random() * this.surahs.length)];
                this.loadSurah(randomSurah.number);
                showToast('🎯 Memorization mode activated');
            }
        });

        document.getElementById('listenQuran')?.addEventListener('click', () => {
            if (this.surahs.length > 0) {
                const randomSurah = this.surahs[Math.floor(Math.random() * this.surahs.length)];
                this.playRecitation(randomSurah.number);
            }
        });
    }
}

// ============================================
// PRAYER MODULE
// ============================================

class PrayerModule {
    constructor() {
        this.prayerTimes = {};
        this.prayerNames = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        this.prayerDisplayNames = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };
        this.trackedPrayers = JSON.parse(localStorage.getItem('trackedPrayers') || '{}');
        this.init();
    }

    init() {
        this.loadPrayerTimes();
        this.renderPrayerTimes();
        this.startCountdown();
        this.setupPrayerTracker();
        this.initQibla();
        this.setupPrayerEvents();
    }

    loadPrayerTimes() {
        this.prayerTimes = { 
            fajr: '5:12 AM', 
            dhuhr: '12:34 PM', 
            asr: '3:45 PM', 
            maghrib: '6:20 PM', 
            isha: '7:56 PM' 
        };
        this.renderPrayerTimes();
    }

    renderPrayerTimes() {
        const container = document.getElementById('prayerTimesList');
        if (!container) return;

        const nextPrayer = this.getNextPrayer();

        container.innerHTML = this.prayerNames.map(name => {
            const time = this.prayerTimes[name] || '--:--';
            const isActive = name === nextPrayer;
            return `<div class="prayer-time-item ${isActive ? 'active' : ''}">
                <span>${this.prayerDisplayNames[name]}</span>
                <span class="time">${time}</span>
            </div>`;
        }).join('');
    }

    getNextPrayer() {
        const now = new Date();
        let next = null;
        let nextTime = null;

        for (const name of this.prayerNames) {
            const timeStr = this.prayerTimes[name];
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
                if (!nextTime || prayerDate < nextTime) { next = name; nextTime = prayerDate; }
            }
        }

        if (!next) next = 'fajr';
        return next;
    }

    startCountdown() {
        this.updateCountdown();
        setInterval(() => this.updateCountdown(), 1000);
    }

    updateCountdown() {
        const now = new Date();
        const nextPrayer = this.getNextPrayer();
        if (!nextPrayer) return;

        const timeStr = this.prayerTimes[nextPrayer];
        if (!timeStr) return;

        const parts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (!parts) return;

        let hours = parseInt(parts[1]);
        const minutes = parseInt(parts[2]);
        const ampm = parts[3]?.toUpperCase();

        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;

        const prayerDate = new Date(now);
        prayerDate.setHours(hours, minutes, 0, 0);

        if (prayerDate <= now) prayerDate.setDate(prayerDate.getDate() + 1);

        const diff = Math.floor((prayerDate - now) / 1000);
        if (diff > 0) {
            const h = String(Math.floor(diff / 3600)).padStart(2, '0');
            const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
            const s = String(diff % 60).padStart(2, '0');
            const countdownEl = document.getElementById('prayerCountdown');
            if (countdownEl) countdownEl.textContent = `${h}:${m}:${s}`;
        }
    }

    setupPrayerTracker() {
        const container = document.getElementById('prayerCheckboxes');
        if (!container) return;

        const today = new Date().toISOString().split('T')[0];
        const todayTracked = this.trackedPrayers[today] || [];

        container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            const name = cb.value;
            if (todayTracked.includes(name)) {
                cb.checked = true;
                cb.parentElement.classList.add('checked');
            }

            cb.addEventListener('change', () => {
                if (cb.checked) {
                    cb.parentElement.classList.add('checked');
                    this.trackPrayer(name);
                } else {
                    cb.parentElement.classList.remove('checked');
                    this.untrackPrayer(name);
                }
                this.updatePrayerProgress();
            });
        });

        document.getElementById('resetPrayerTracker')?.addEventListener('click', () => {
            const today = new Date().toISOString().split('T')[0];
            this.trackedPrayers[today] = [];
            localStorage.setItem('trackedPrayers', JSON.stringify(this.trackedPrayers));
            container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
                cb.parentElement.classList.remove('checked');
            });
            this.updatePrayerProgress();
            showToast('🔄 Prayer tracker reset');
        });

        this.updatePrayerProgress();
    }

    trackPrayer(name) {
        const today = new Date().toISOString().split('T')[0];
        if (!this.trackedPrayers[today]) this.trackedPrayers[today] = [];
        
        if (!this.trackedPrayers[today].includes(name)) {
            this.trackedPrayers[today].push(name);
            localStorage.setItem('trackedPrayers', JSON.stringify(this.trackedPrayers));
            
            if (this.trackedPrayers[today].length === 5) {
                showToast('🎉 All 5 prayers completed today! MashaAllah!');
            }
        }
    }

    untrackPrayer(name) {
        const today = new Date().toISOString().split('T')[0];
        if (this.trackedPrayers[today]) {
            this.trackedPrayers[today] = this.trackedPrayers[today].filter(p => p !== name);
            localStorage.setItem('trackedPrayers', JSON.stringify(this.trackedPrayers));
        }
    }

    updatePrayerProgress() {
        const container = document.getElementById('prayerCheckboxes');
        if (!container) return;

        const checked = container.querySelectorAll('input[type="checkbox"]:checked').length;
        const total = container.querySelectorAll('input[type="checkbox"]').length;
        const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;

        document.getElementById('prayerProgress').textContent = percentage;
    }

    initQibla() {
        document.getElementById('qiblaDirection').textContent = 'Qibla: ~290° (Northwest)';
    }

    setupPrayerEvents() {
        document.getElementById('findMosques')?.addEventListener('click', () => {
            showToast('📍 Finding mosques near your location...');
        });
    }
}

// ============================================
// DUAS MODULE
// ============================================

class DuasModule {
    constructor() {
        this.currentCategory = 'all';
        this.favorites = JSON.parse(localStorage.getItem('favoriteDuas') || '[]');
        this.counter = parseInt(localStorage.getItem('adhkarCounter') || '0');
        this.duaData = {
            morning: [
                { arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا', translation: 'O Allah, we have entered the morning with You', reference: 'Sunan Abi Dawud 5068' },
                { arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا', translation: 'O Allah, I ask You for beneficial knowledge', reference: 'Sunan Ibn Majah 925' }
            ],
            evening: [
                { arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا', translation: 'O Allah, we have entered the evening with You', reference: 'Sunan Abi Dawud 5069' }
            ],
            sleep: [
                { arabic: 'اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا', translation: 'O Allah, with Your name I die and I live', reference: 'Sahih Bukhari 7394' }
            ],
            eating: [
                { arabic: 'بِسْمِ اللَّهِ فِي أَوَّلِهِ وَآخِرِهِ', translation: 'In the name of Allah at the beginning and at the end', reference: 'Sunan Abi Dawud 3767' }
            ],
            travel: [
                { arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا', translation: 'Glory to Him who has subjected this to us', reference: 'Surah Az-Zukhruf 43:13' }
            ],
            illness: [
                { arabic: 'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ', translation: 'I ask Allah the Mighty to cure you', reference: 'Sunan Abi Dawud 3106' }
            ],
            daily: [
                { arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: 'Praise be to Allah, Lord of all the worlds', reference: 'Surah Al-Fatihah 1:2' },
                { arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', translation: 'Glory be to Allah and praise Him', reference: 'Sahih Muslim 2693' }
            ]
        };
        this.init();
    }

    init() {
        this.renderCategories();
        this.renderDuas('all');
        this.renderFavorites();
        this.setupCounter();
        this.setupDuasEvents();
    }

    renderCategories() {
        const container = document.getElementById('duaCategories');
        if (!container) return;

        const categories = Object.keys(this.duaData);
        const counts = {};
        categories.forEach(cat => { counts[cat] = this.duaData[cat].length; });
        const total = categories.reduce((sum, cat) => sum + counts[cat], 0);

        container.innerHTML = `
            <button class="dua-cat active" data-cat="all">All <span class="category-count">(${total})</span></button>
            ${categories.map(cat => `
                <button class="dua-cat" data-cat="${cat}">
                    ${cat.charAt(0).toUpperCase() + cat.slice(1)} 
                    <span class="category-count">(${counts[cat]})</span>
                </button>
            `).join('')}
        `;

        container.querySelectorAll('.dua-cat').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.dua-cat').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.cat;
                this.renderDuas(this.currentCategory);
            });
        });
    }

    renderDuas(category, search = '') {
        const container = document.getElementById('duaList');
        if (!container) return;

        let duas = [];
        if (category === 'all') {
            Object.values(this.duaData).forEach(catDuas => { duas = duas.concat(catDuas); });
        } else {
            duas = this.duaData[category] || [];
        }

        if (search) {
            const term = search.toLowerCase();
            duas = duas.filter(d => d.arabic.includes(term) || d.translation.toLowerCase().includes(term));
        }

        if (duas.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);">
                <i class="fas fa-hands-praying" style="font-size:48px;"></i>
                <p>No duas found</p>
            </div>`;
            return;
        }

        container.innerHTML = duas.map((dua, index) => {
            const isFavorite = this.favorites.some(f => f.arabic === dua.arabic);
            return `
                <div class="dua-item ${isFavorite ? 'favorite-dua' : ''}" data-index="${index}">
                    <div class="dua-arabic">${dua.arabic}</div>
                    <div class="dua-translation">"${dua.translation}"</div>
                    ${dua.reference ? `<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">📚 ${dua.reference}</div>` : ''}
                    <div class="dua-actions">
                        <button class="favorite-btn" data-arbic="${encodeURIComponent(dua.arabic)}">
                            <i class="fas ${isFavorite ? 'fa-star' : 'fa-star-o'}"></i>
                            ${isFavorite ? 'Favorited' : 'Add to Favorites'}
                        </button>
                        <button class="copy-btn" data-text="${encodeURIComponent(dua.arabic)}">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const arabic = decodeURIComponent(btn.dataset.arbic);
                this.toggleFavorite(arabic);
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

    toggleFavorite(arabic) {
        const index = this.favorites.findIndex(f => f.arabic === arabic);
        if (index > -1) {
            this.favorites.splice(index, 1);
            showToast('Removed from favorites');
        } else {
            let found = null;
            Object.values(this.duaData).forEach(catDuas => {
                const match = catDuas.find(d => d.arabic === arabic);
                if (match) found = match;
            });
            if (found) { this.favorites.push(found); showToast('⭐ Added to favorites'); }
        }
        localStorage.setItem('favoriteDuas', JSON.stringify(this.favorites));
        this.renderFavorites();
        this.renderDuas(this.currentCategory);
    }

    renderFavorites() {
        const container = document.getElementById('favoriteDuas');
        if (!container) return;

        if (this.favorites.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);">
                <i class="fas fa-star-o" style="font-size:24px;"></i>
                <p>No favorite duas yet.</p>
            </div>`;
            return;
        }

        container.innerHTML = this.favorites.map(dua => `
            <div class="dua-item favorite-dua" style="padding:12px 16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <div class="dua-arabic" style="font-size:18px;">${dua.arabic}</div>
                        <div style="font-size:13px;color:var(--text-secondary);">${dua.translation}</div>
                    </div>
                    <button class="favorite-btn" data-arbic="${encodeURIComponent(dua.arabic)}" style="background:none;border:none;color:var(--gold);font-size:18px;cursor:pointer;">
                        <i class="fas fa-star"></i>
                    </button>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const arabic = decodeURIComponent(btn.dataset.arbic);
                this.toggleFavorite(arabic);
            });
        });
    }

    setupCounter() {
        const number = document.getElementById('counterNumber');
        if (number) number.textContent = this.counter;

        document.getElementById('incrementCounter')?.addEventListener('click', () => {
            this.counter++;
            this.updateCounter();
        });

        document.getElementById('decrementCounter')?.addEventListener('click', () => {
            if (this.counter > 0) { this.counter--; this.updateCounter(); }
        });

        document.getElementById('resetCounter')?.addEventListener('click', () => {
            this.counter = 0;
            this.updateCounter();
            showToast('🔄 Counter reset');
        });

        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.counter = parseInt(btn.dataset.count);
                this.updateCounter();
                showToast(`🔄 Counter set to ${this.counter}`);
            });
        });
    }

    updateCounter() {
        const number = document.getElementById('counterNumber');
        if (number) number.textContent = this.counter;
        localStorage.setItem('adhkarCounter', this.counter.toString());
    }

    setupDuasEvents() {
        const searchInput = document.getElementById('duaSearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.renderDuas(this.currentCategory, searchInput.value);
            });
        }
    }
}

// ============================================
// HADITH MODULE
// ============================================

class HadithModule {
    constructor() {
        this.currentCollection = 'bukhari';
        this.favorites = JSON.parse(localStorage.getItem('favoriteHadith') || '[]');
        this.hadithData = {
            bukhari: [
                { text: '"The best of you are those who are best to their families"', reference: 'Sahih Bukhari, Book 78, Hadith 160', grade: 'sahih' },
                { text: '"Whoever believes in Allah and the Last Day, let him speak good or remain silent"', reference: 'Sahih Bukhari, Book 78, Hadith 113', grade: 'sahih' },
                { text: '"The strong person is not the one who can wrestle, but the one who controls himself at times of anger"', reference: 'Sahih Bukhari, Book 73, Hadith 135', grade: 'sahih' }
            ],
            muslim: [
                { text: '"The best of people are those who are most beneficial to others"', reference: 'Sahih Muslim, Book 45, Hadith 100', grade: 'sahih' },
                { text: '"A good word is charity"', reference: 'Sahih Muslim, Book 5, Hadith 57', grade: 'sahih' }
            ],
            abudawud: [
                { text: '"Whoever guides someone to goodness will have a reward"', reference: 'Sunan Abi Dawud, Book 10, Hadith 20', grade: 'sahih' }
            ],
            tirmidhi: [
                { text: '"The most beloved of deeds to Allah are those done consistently"', reference: 'Sunan Tirmidhi, Book 48, Hadith 1', grade: 'hasan' }
            ]
        };
        this.init();
    }

    init() {
        this.renderCollections();
        this.renderHadith();
        this.renderFavorites();
        this.setupHadithEvents();
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
            hadiths = hadiths.filter(h => h.text.toLowerCase().includes(term));
        }

        if (hadiths.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);">
                <i class="fas fa-scroll" style="font-size:48px;"></i>
                <p>No hadith found</p>
            </div>`;
            return;
        }

        container.innerHTML = hadiths.map((hadith) => {
            const isFavorite = this.favorites.some(f => f.text === hadith.text);
            return `
                <div class="hadith-item ${isFavorite ? 'favorite-hadith' : ''}">
                    <div class="hadith-text">${hadith.text}</div>
                    <div class="hadith-reference">
                        <span>📚 ${hadith.reference}</span>
                        <span style="margin-left:12px;padding:2px 12px;border-radius:var(--radius-full);font-size:11px;background:#d4edda;color:#155724;">
                            ${hadith.grade.toUpperCase()}
                        </span>
                    </div>
                    <div style="margin-top:8px;display:flex;gap:10px;">
                        <button class="favorite-btn" data-text="${encodeURIComponent(hadith.text)}" style="padding:4px 14px;border:none;background:var(--primary-bg);color:var(--primary);border-radius:var(--radius-full);font-size:12px;cursor:pointer;">
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
                this.toggleFavorite(text);
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

    toggleFavorite(text) {
        const index = this.favorites.findIndex(f => f.text === text);
        if (index > -1) {
            this.favorites.splice(index, 1);
            showToast('Removed from favorites');
        } else {
            this.favorites.push({ text });
            showToast('⭐ Added to favorites');
        }
        localStorage.setItem('favoriteHadith', JSON.stringify(this.favorites));
        this.renderFavorites();
        this.renderHadith();
    }

    renderFavorites() {
        const container = document.getElementById('favoriteHadith');
        if (!container) return;

        if (this.favorites.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);">
                <i class="fas fa-star-o" style="font-size:24px;"></i>
                <p>No favorite hadith yet.</p>
            </div>`;
            return;
        }

        container.innerHTML = this.favorites.map(h => `
            <div class="hadith-item favorite-hadith" style="padding:12px 16px;">
                <div style="display:flex;justify-content:space-between;">
                    <div>
                        <div style="font-size:15px;font-style:italic;color:var(--text-secondary);">${h.text}</div>
                    </div>
                    <button class="favorite-btn" data-text="${encodeURIComponent(h.text)}" style="background:none;border:none;color:var(--gold);font-size:18px;cursor:pointer;">
                        <i class="fas fa-star"></i>
                    </button>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = decodeURIComponent(btn.dataset.text);
                this.toggleFavorite(text);
            });
        });
    }

    setupHadithEvents() {
        const searchInput = document.getElementById('hadithSearch');
        const searchBtn = document.querySelector('#hadithSearch + button');

        const performSearch = () => {
            if (searchInput) this.renderHadith(searchInput.value);
        };

        searchInput?.addEventListener('input', performSearch);
        searchBtn?.addEventListener('click', performSearch);
    }
}

// ============================================
// RAMADAN MODULE
// ============================================

class RamadanModule {
    constructor() {
        this.fastingDays = JSON.parse(localStorage.getItem('ramadanFastingDays') || '[]');
        this.init();
    }

    init() {
        this.updateRamadanInfo();
    }

    updateRamadanInfo() {
        const today = new Date();
        const ramadanStart = new Date(2026, 2, 1);
        const dayDiff = Math.floor((today - ramadanStart) / (1000 * 60 * 60 * 24));
        const ramadanDay = Math.min(Math.max(dayDiff + 1, 1), 30);
        
        const dayElement = document.querySelector('.ramadan-days-left');
        const fastingDaysElement = document.getElementById('fastingDays');
        const progressBar = document.querySelector('.fasting-tracker .progress-fill');
        const progressText = document.querySelector('.fasting-tracker span');

        const daysFasted = this.fastingDays.length;

        if (dayElement) {
            const daysLeft = Math.max(30 - ramadanDay, 0);
            dayElement.textContent = `${daysLeft} Days Left`;
        }

        if (fastingDaysElement) {
            fastingDaysElement.textContent = daysFasted;
        }

        if (progressBar) {
            const progress = Math.min((daysFasted / 30) * 100, 100);
            progressBar.style.width = `${progress}%`;
        }

        if (progressText) {
            progressText.textContent = `${Math.round((daysFasted / 30) * 100)}% Complete`;
        }
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    window.quranModule = new QuranModule();
    window.prayerModule = new PrayerModule();
    window.duasModule = new DuasModule();
    window.hadithModule = new HadithModule();
    window.ramadanModule = new RamadanModule();
});
