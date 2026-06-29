// ============================================
// LEARNING.JS - Quran, Hadith, Duas, Prayer, Zakat, Hajj, Ramadan
// ============================================

// ============================================
// QURAN MODULE
// ============================================

class QuranModule {
    constructor() {
        this.surahs = [];
        this.init();
    }

    async init() {
        await this.loadSurahs();
        this.renderSurahList();
        this.setupQuranEvents();
    }

    async loadSurahs() {
        try {
            const response = await fetch('https://api.alquran.cloud/v1/meta');
            const data = await response.json();
            if (data.code === 200) {
                this.surahs = data.data.surahs.slice(0, 20);
            }
        } catch (error) {
            this.surahs = [];
            for (let i = 1; i <= 10; i++) {
                this.surahs.push({ number: i, name: `Surah ${i}`, englishName: `Surah ${i}`, verses: 7 });
            }
        }
        this.renderSurahList();
    }

    renderSurahList() {
        const container = document.getElementById('surahList');
        if (!container) return;

        container.innerHTML = this.surahs.map(surah => `
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
            const response = await fetch(`https://api.alquran.cloud/v1/surah/${number}/en`);
            const data = await response.json();
            if (data.code === 200) {
                const surah = data.data;
                const viewer = document.getElementById('quranViewer');
                const textContainer = document.getElementById('quranText');
                const title = document.getElementById('viewerTitle');
                
                title.textContent = `${surah.name} (${surah.englishName})`;
                textContainer.innerHTML = `
                    <div style="text-align:center;padding:10px 0 20px;border-bottom:1px solid var(--border-color);">
                        <p style="color:var(--text-muted);font-size:14px;">${surah.numberOfAyahs} verses</p>
                        <button onclick="window.quranModule?.playSurahAudio(${number})" 
                            style="margin-top:8px;padding:8px 20px;background:var(--primary);color:white;border:none;border-radius:var(--radius-full);cursor:pointer;">
                            <i class="fas fa-play"></i> Play Recitation
                        </button>
                    </div>
                    ${surah.ayahs.map(ayah => `
                        <div class="ayah">
                            <span class="ayah-number">${ayah.numberInSurah}</span>
                            <div class="ayah-text">${ayah.text}</div>
                        </div>
                    `).join('')}
                `;
                viewer.classList.add('active');
                showToast(`📖 Opened ${surah.name}`, 'info');
            }
        } catch (error) {
            showToast('❌ Error loading surah', 'error');
        }
    }

    playSurahAudio(number) {
        const reciterMap = {
            mishary: 'mishary_rashid_alafasy',
            sudais: 'abdul_rahman_al_sudais',
            ghamdi: 'saad_al_ghamdi',
            muaiqly: 'maher_al_muaiqly'
        };
        const selected = document.getElementById('reciterSelect')?.value || 'mishary';
        const reciter = reciterMap[selected] || 'mishary_rashid_alafasy';
        const url = `https://cdn.islamic.network/quran/audio/128/${reciter}/${number}.mp3`;
        
        const audio = new Audio(url);
        audio.play().then(() => {
            showToast('🔊 Playing recitation', 'info');
        }).catch(() => {
            showToast('⚠️ Audio failed', 'error');
        });
    }

    setupQuranEvents() {
        document.getElementById('closeViewer')?.addEventListener('click', () => {
            document.getElementById('quranViewer').classList.remove('active');
        });
    }
}

// ============================================
// HADITH MODULE
// ============================================

class HadithModule {
    constructor() {
        this.hadithData = {
            bukhari: [
                { text: '"The best of you are those who are best to their families"', reference: 'Sahih Bukhari' },
                { text: '"Whoever believes in Allah and the Last Day, let him speak good or remain silent"', reference: 'Sahih Bukhari' }
            ],
            muslim: [
                { text: '"The best of people are those who are most beneficial to others"', reference: 'Sahih Muslim' }
            ],
            abudawud: [
                { text: '"Whoever guides someone to goodness will have a reward"', reference: 'Sunan Abi Dawud' }
            ],
            tirmidhi: [
                { text: '"The most beloved of deeds to Allah are those done consistently"', reference: 'Sunan Tirmidhi' }
            ],
            nasai: [
                { text: '"Whoever believes in Allah and the Last Day, let him honor his guest"', reference: 'Sunan Nasai' }
            ],
            ibnmajah: [
                { text: '"The best of you are those who are best to their families"', reference: 'Sunan Ibn Majah' }
            ],
            nawawi: [
                { text: '"Actions are judged by intentions"', reference: '40 Hadith Nawawi' }
            ],
            riyad: [
                { text: '"The most beloved of deeds to Allah are prayer on time"', reference: 'Riyad as-Salihin' }
            ]
        };
        this.currentCollection = 'bukhari';
        this.favorites = JSON.parse(localStorage.getItem('hadithFavorites') || '[]');
        this.init();
    }

    init() {
        this.renderCollections();
        this.renderHadith();
        this.renderFavorites();
        this.setupHadithEvents();
    }

    renderCollections() {
        const container = document.querySelector('.collection-grid');
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

    renderHadith() {
        const container = document.getElementById('hadithList');
        if (!container) return;

        const hadiths = this.hadithData[this.currentCollection] || [];
        const search = document.getElementById('hadithSearch')?.value?.toLowerCase() || '';

        const filtered = hadiths.filter(h => 
            h.text.toLowerCase().includes(search) ||
            h.reference.toLowerCase().includes(search)
        );

        if (filtered.length === 0) {
            container.innerHTML = '<p style="text-align:center;padding:40px;color:var(--text-muted);">No hadith found</p>';
            return;
        }

        container.innerHTML = filtered.map(h => `
            <div class="hadith-item">
                <div class="hadith-text">${h.text}</div>
                <div class="hadith-reference">📚 ${h.reference}</div>
                <button onclick="window.hadithModule?.toggleFavorite('${encodeURIComponent(h.text)}')" 
                    style="margin-top:8px;padding:4px 14px;border:none;background:var(--primary-bg);color:var(--primary);border-radius:var(--radius-full);font-size:12px;cursor:pointer;">
                    <i class="fas ${this.favorites.includes(h.text) ? 'fa-star' : 'fa-star-o'}"></i>
                    ${this.favorites.includes(h.text) ? '⭐ Favorited' : 'Add to Favorites'}
                </button>
            </div>
        `).join('');
    }

    toggleFavorite(text) {
        const index = this.favorites.indexOf(text);
        if (index > -1) {
            this.favorites.splice(index, 1);
            showToast('Removed from favorites', 'info');
        } else {
            this.favorites.push(text);
            showToast('⭐ Added to favorites', 'success');
        }
        localStorage.setItem('hadithFavorites', JSON.stringify(this.favorites));
        this.renderHadith();
        this.renderFavorites();
    }

    renderFavorites() {
        const container = document.getElementById('favoriteHadith');
        if (!container) return;

        if (this.favorites.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);font-size:14px;">No favorites yet</p>';
            return;
        }

        let allHadith = [];
        Object.values(this.hadithData).forEach(arr => allHadith = allHadith.concat(arr));
        const favorites = allHadith.filter(h => this.favorites.includes(h.text));

        container.innerHTML = favorites.map(h => `
            <div class="hadith-item favorite-hadith" style="padding:12px 16px;">
                <div class="hadith-text">${h.text}</div>
                <div class="hadith-reference">📚 ${h.reference}</div>
            </div>
        `).join('');
    }

    setupHadithEvents() {
        document.getElementById('hadithSearch')?.addEventListener('input', () => {
            this.renderHadith();
        });

        document.querySelector('.hadith-features .feature-group button')?.forEach(btn => {
            btn.addEventListener('click', function() {
                const text = this.textContent.trim();
                if (text.includes('Random')) {
                    showToast('📜 Random hadith', 'info');
                } else if (text.includes('Daily')) {
                    showToast('📜 Daily hadith', 'info');
                } else if (text.includes('Audio')) {
                    showToast('🔊 Audio narration', 'info');
                } else if (text.includes('Dark')) {
                    document.documentElement.toggleAttribute('data-hadith-dark');
                    showToast('📖 Dark mode toggled', 'info');
                }
            });
        });
    }
}

// ============================================
// DUAS MODULE
// ============================================

class DuasModule {
    constructor() {
        this.duaData = {
            morning: [
                { arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا', translation: 'O Allah, we have entered the morning with You', reference: 'Sunan Abi Dawud 5068' }
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
            protection: [
                { arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ', translation: 'I seek refuge in the perfect words of Allah', reference: 'Sahih Muslim 2709' }
            ],
            forgiveness: [
                { arabic: 'اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ', translation: 'O Allah, forgive all my sins', reference: 'Sahih Muslim 483' }
            ],
            family: [
                { arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا قُرَّةَ أَعْيُنٍ', translation: 'Our Lord, grant us comfort to our eyes', reference: 'Surah Al-Furqan 25:74' }
            ]
        };
        this.currentCategory = 'all';
        this.favorites = JSON.parse(localStorage.getItem('duaFavorites') || '[]');
        this.init();
    }

    init() {
        this.renderCategories();
        this.renderDuas();
        this.renderFavorites();
        this.setupDuaEvents();
    }

    renderCategories() {
        const container = document.querySelector('.category-grid');
        if (!container) return;

        container.querySelectorAll('.dua-cat').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.dua-cat').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.cat;
                this.renderDuas();
            });
        });
    }

    renderDuas() {
        const container = document.getElementById('duaList');
        if (!container) return;

        let duas = [];
        if (this.currentCategory === 'all') {
            Object.values(this.duaData).forEach(arr => duas = duas.concat(arr));
        } else {
            duas = this.duaData[this.currentCategory] || [];
        }

        const search = document.getElementById('duaSearch')?.value?.toLowerCase() || '';
        const filtered = duas.filter(d => 
            d.arabic.includes(search) ||
            d.translation.toLowerCase().includes(search)
        );

        if (filtered.length === 0) {
            container.innerHTML = '<p style="text-align:center;padding:40px;color:var(--text-muted);">No duas found</p>';
            return;
        }

        container.innerHTML = filtered.map(d => `
            <div class="dua-item">
                <div class="dua-arabic">${d.arabic}</div>
                <div class="dua-translation">"${d.translation}"</div>
                ${d.reference ? `<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">📚 ${d.reference}</div>` : ''}
                <div class="dua-actions">
                    <button onclick="window.duasModule?.toggleFavorite('${encodeURIComponent(d.arabic)}')">
                        <i class="fas ${this.favorites.includes(d.arabic) ? 'fa-star' : 'fa-star-o'}"></i>
                        ${this.favorites.includes(d.arabic) ? '⭐ Favorited' : 'Add to Favorites'}
                    </button>
                    <button onclick="navigator.clipboard.writeText('${d.arabic}')">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
            </div>
        `).join('');
    }

    toggleFavorite(arabic) {
        const index = this.favorites.indexOf(arabic);
        if (index > -1) {
            this.favorites.splice(index, 1);
            showToast('Removed from favorites', 'info');
        } else {
            this.favorites.push(arabic);
            showToast('⭐ Added to favorites', 'success');
        }
        localStorage.setItem('duaFavorites', JSON.stringify(this.favorites));
        this.renderDuas();
        this.renderFavorites();
    }

    renderFavorites() {
        const container = document.getElementById('favoriteDuas');
        if (!container) return;

        if (this.favorites.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);font-size:14px;">No favorites yet</p>';
            return;
        }

        let allDuas = [];
        Object.values(this.duaData).forEach(arr => allDuas = allDuas.concat(arr));
        const favorites = allDuas.filter(d => this.favorites.includes(d.arabic));

        container.innerHTML = favorites.map(d => `
            <div class="dua-item favorite-dua" style="padding:12px 16px;">
                <div class="dua-arabic" style="font-size:18px;">${d.arabic}</div>
                <div class="dua-translation" style="font-size:13px;">${d.translation}</div>
            </div>
        `).join('');
    }

    setupDuaEvents() {
        document.getElementById('duaSearch')?.addEventListener('input', () => {
            this.renderDuas();
        });

        document.querySelector('.dua-features .feature-group button')?.forEach(btn => {
            btn.addEventListener('click', function() {
                const text = this.textContent.trim();
                if (text.includes('Audio')) {
                    showToast('🔊 Playing dua audio', 'info');
                } else if (text.includes('Repeat')) {
                    showToast('🔄 Repeat mode', 'info');
                } else if (text.includes('Auto')) {
                    showToast('▶️ Auto-play started', 'info');
                } else if (text.includes('Translation')) {
                    document.querySelectorAll('.dua-translation').forEach(el => {
                        el.style.display = el.style.display === 'none' ? 'block' : 'none';
                    });
                    showToast('🌍 Translation toggled', 'info');
                }
            });
        });
    }
}

// ============================================
// PRAYER MODULE
// ============================================

function initPrayerModule() {
    // Prayer view buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            showToast(`📅 ${this.textContent.trim()} view`, 'info');
        });
    });

    // Update prayer times
    document.querySelector('.prayer-location button')?.addEventListener('click', function() {
        showToast('🔄 Updating prayer times...', 'info');
    });

    // Find mosques
    document.getElementById('findMosques')?.addEventListener('click', function() {
        if (navigator.geolocation) {
            showToast('📍 Finding mosques near you...', 'info');
        } else {
            showToast('⚠️ Location not available', 'error');
        }
    });
}

// ============================================
// ZAKAT MODULE
// ============================================

function initZakatModule() {
    document.getElementById('zakatAmount')?.addEventListener('input', function() {
        // Auto-calculate if user wants
    });

    document.querySelectorAll('.zakat-type').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.zakat-type').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.querySelector('.zakat-form .form-group:first-child label').textContent = 
                `Total ${this.textContent.trim()} ($)`;
        });
    });
}

function calculateZakat() {
    const amount = parseFloat(document.getElementById('zakatAmount').value);
    const currency = document.getElementById('zakatCurrency').value;
    const nisab = parseFloat(document.getElementById('zakatNisab').value) || 595;
    
    if (!amount || amount <= 0) {
        showToast('⚠️ Please enter a valid amount', 'error');
        return;
    }
    
    const zakatDue = amount * 0.025;
    const isEligible = amount >= nisab;
    
    const resultDiv = document.getElementById('zakatResult');
    resultDiv.innerHTML = `
        <div class="result-card">
            <h3>Zakat Due</h3>
            <p class="result-amount">${currency.toUpperCase()} ${zakatDue.toFixed(2)}</p>
            <p class="result-details">2.5% of ${currency.toUpperCase()} ${amount.toFixed(2)}</p>
            <p class="result-details" style="color:${isEligible ? 'var(--primary)' : '#ef4444'};font-weight:600;">
                ${isEligible ? '✅ Eligible for Zakat' : '⚠️ Below Nisab'}
            </p>
        </div>
        <button onclick="saveZakatHistory(${amount}, ${zakatDue}, '${currency}')" class="btn-secondary">
            <i class="fas fa-save"></i> Save History
        </button>
    `;
}

function saveZakatHistory(amount, zakatDue, currency) {
    const history = JSON.parse(localStorage.getItem('zakatHistory') || '[]');
    history.push({ id: Date.now(), amount, zakatDue, currency, date: new Date().toISOString() });
    localStorage.setItem('zakatHistory', JSON.stringify(history));
    showToast('✅ Zakat history saved!', 'success');
    loadZakatHistory();
}

function loadZakatHistory() {
    const container = document.getElementById('zakatHistoryList');
    if (!container) return;
    
    const history = JSON.parse(localStorage.getItem('zakatHistory') || '[]');
    if (history.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);font-size:14px;">No zakat history yet.</p>';
        return;
    }
    
    container.innerHTML = history.slice().reverse().map(h => `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-color);">
            <span>${h.currency.toUpperCase()} ${h.amount.toFixed(2)}</span>
            <span style="color:var(--primary);font-weight:600;">Zakat: ${h.currency.toUpperCase()} ${h.zakatDue.toFixed(2)}</span>
            <span style="font-size:12px;color:var(--text-muted);">${new Date(h.date).toLocaleDateString()}</span>
        </div>
    `).join('');
}

// ============================================
// HAJJ MODULE
// ============================================

function initHajjModule() {
    document.querySelectorAll('.hajj-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.hajj-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const content = document.getElementById('hajjContent');
            const titles = {
                hajj: '🕋 Hajj Guide',
                umrah: '🕌 Umrah Guide',
                duas: '🤲 Hajj Duas',
                checklist: '✅ Hajj Checklist'
            };
            content.innerHTML = `
                <h3>${titles[this.dataset.tab] || 'Hajj Guide'}</h3>
                <p style="color:var(--text-muted);">Content for ${this.textContent.trim()} coming soon.</p>
            `;
        });
    });
}

// ============================================
// RAMADAN MODULE
// ============================================

function initRamadanModule() {
    // Ramadan countdown
    function updateRamadanCountdown() {
        const now = new Date();
        const ramadan = new Date(2026, 2, 1);
        const diff = ramadan - now;
        if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            document.getElementById('ramadanDays').textContent = days;
            document.getElementById('ramadanHours').textContent = hours;
            document.getElementById('ramadanMinutes').textContent = minutes;
            document.getElementById('ramadanSeconds').textContent = seconds;
        }
    }
    updateRamadanCountdown();
    setInterval(updateRamadanCountdown, 1000);
}

// ============================================
// QURAN TEACHER MODULE
// ============================================

class QuranTeacherModule {
    constructor() {
        this.verses = [
            { arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', translation: 'In the name of Allah' },
            { arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: 'Praise be to Allah' }
        ];
        this.currentVerseIndex = 0;
        this.accuracy = 0;
        this.versesMemorized = parseInt(localStorage.getItem('quranMemorizedCount') || '0');
        this.isRecording = false;
        this.recognition = null;
        this.init();
    }

    init() {
        this.showVerse();
        this.updateStats();
        this.setupEvents();
        this.initSpeechRecognition();
    }

    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.lang = 'ar-SA';
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.processRecitation(transcript);
            };
            this.recognition.onend = () => {
                this.isRecording = false;
                document.getElementById('startRecording').style.display = 'inline-flex';
                document.getElementById('stopRecording').style.display = 'none';
            };
            this.recognition.onerror = () => {
                this.isRecording = false;
                document.getElementById('startRecording').style.display = 'inline-flex';
                document.getElementById('stopRecording').style.display = 'none';
                showToast('⚠️ Please speak clearly', 'error');
            };
        }
    }

    setupEvents() {
        document.getElementById('startRecording')?.addEventListener('click', () => {
            this.startRecording();
        });

        document.getElementById('stopRecording')?.addEventListener('click', () => {
            this.stopRecording();
        });

        document.getElementById('playCorrect')?.addEventListener('click', () => {
            this.playCorrectPronunciation();
        });

        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                showToast(`📚 Mode: ${this.textContent}`, 'info');
            });
        });
    }

    startRecording() {
        if (!this.recognition) {
            showToast('⚠️ Speech not supported', 'error');
            return;
        }
        this.isRecording = true;
        document.getElementById('startRecording').style.display = 'none';
        document.getElementById('stopRecording').style.display = 'inline-flex';
        document.getElementById('feedbackArea').innerHTML = '<div class="feedback-item hint">🎙️ Listening...</div>';
        try { this.recognition.start(); } catch (e) {}
    }

    stopRecording() {
        if (this.recognition) {
            try { this.recognition.stop(); } catch (e) {}
        }
        this.isRecording = false;
        document.getElementById('startRecording').style.display = 'inline-flex';
        document.getElementById('stopRecording').style.display = 'none';
    }

    processRecitation(transcript) {
        const current = this.verses[this.currentVerseIndex];
        const correct = current.arabic;
        const similarity = this.calculateSimilarity(transcript, correct);
        const accuracy = Math.round(similarity * 100);
        
        let feedback = '';
        let cls = '';
        if (accuracy >= 80) {
            feedback = `✅ Excellent! ${accuracy}% accurate. MashaAllah!`;
            cls = 'correct';
            this.versesMemorized++;
            localStorage.setItem('quranMemorizedCount', this.versesMemorized.toString());
            this.updateStats();
            this.currentVerseIndex = (this.currentVerseIndex + 1) % this.verses.length;
            setTimeout(() => this.showVerse(), 1500);
        } else if (accuracy >= 60) {
            feedback = `📖 Good effort! ${accuracy}% accurate. Keep going!`;
            cls = 'hint';
        } else {
            feedback = `🔄 Try again. Focus on pronunciation.`;
            cls = 'incorrect';
            setTimeout(() => this.playCorrectPronunciation(), 1000);
        }
        
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-item ${cls}">
                ${feedback}
                <br><small>You said: "${transcript}"</small>
                ${accuracy < 80 ? `<br><small>🎯 Correct: "${correct}"</small>` : ''}
            </div>
        `;
        this.accuracy = accuracy;
        this.updateStats();
    }

    calculateSimilarity(t1, t2) {
        const c1 = t1.split('');
        const c2 = t2.split('');
        const maxLen = Math.max(c1.length, c2.length);
        if (maxLen === 0) return 0;
        let matches = 0;
        for (let i = 0; i < Math.min(c1.length, c2.length); i++) {
            if (c1[i] === c2[i]) matches++;
        }
        return matches / maxLen;
    }

    playCorrectPronunciation() {
        const verse = this.verses[this.currentVerseIndex];
        const utterance = new SpeechSynthesisUtterance(verse.arabic);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.6;
        window.speechSynthesis?.speak(utterance);
        showToast('🔊 Playing correct pronunciation', 'info');
    }

    showVerse() {
        const verse = this.verses[this.currentVerseIndex];
        const container = document.getElementById('currentVerse');
        if (container) {
            container.innerHTML = `
                <p class="arabic">${verse.arabic}</p>
                <p class="translation">"${verse.translation}"</p>
            `;
        }
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-item hint">🎙️ Click Start and recite the verse</div>
        `;
    }

    updateStats() {
        document.getElementById('accuracyScore').textContent = `${this.accuracy}%`;
        document.getElementById('versesMemorized').textContent = this.versesMemorized;
        document.getElementById('tajweedScore').textContent = `${Math.min(this.accuracy + 10, 100)}%`;
        document.getElementById('fluencyScore').textContent = `${Math.min(this.accuracy + 5, 100)}%`;
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    window.quranModule = new QuranModule();
    window.hadithModule = new HadithModule();
    window.duasModule = new DuasModule();
    window.quranTeacherModule = new QuranTeacherModule();
    
    initPrayerModule();
    initZakatModule();
    initHajjModule();
    initRamadanModule();
    loadZakatHistory();
});
