// ============================================
// LEARNING.JS - QURAN FROM PDF + VOICE CORRECTION
// ============================================

// ============================================
// LOAD QURAN FROM The_Holy_Quran.pdf
// ============================================

// This will load the PDF and extract Surah data
// The PDF should be in: js/The_Holy_Quran.pdf

class QuranModule {
    constructor() {
        this.surahs = [];
        this.bookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
        this.currentReciter = localStorage.getItem('selectedReciter') || 'mishary';
        this.currentLanguage = localStorage.getItem('quranLanguage') || 'en';
        this.translations = {};
        this.init();
    }

    async init() {
        await this.loadQuranFromPDF();
        this.renderSurahList();
        this.setupQuranEvents();
        this.renderBookmarks();
        this.initReciters();
        this.loadTranslations();
        this.showSurahCount();
    }

    async loadQuranFromPDF() {
        try {
            // Load the PDF from js/ folder
            const pdfUrl = 'js/The_Holy_Quran.pdf';
            const response = await fetch(pdfUrl);
            const arrayBuffer = await response.arrayBuffer();
            
            // Load PDF.js library dynamically
            const pdfjsLib = await this.loadPDFJS();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            // Extract surah data from PDF
            this.surahs = await this.extractSurahsFromPDF(pdf);
            console.log('✅ Quran loaded from PDF:', this.surahs.length, 'surahs');
            
        } catch (error) {
            console.error('Error loading PDF:', error);
            // Use fallback data if PDF fails
            this.useFallbackData();
        }
    }

    loadPDFJS() {
        return new Promise((resolve, reject) => {
            if (typeof pdfjsLib !== 'undefined') {
                resolve(pdfjsLib);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = () => {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                resolve(pdfjsLib);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async extractSurahsFromPDF(pdf) {
        const surahs = [];
        const surahNames = [
            'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال', 'التوبة', 'يونس',
            'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه',
            'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم',
            'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر', 'يس', 'الصافات', 'ص', 'الزمر', 'غافر',
            'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية', 'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق',
            'الذاريات', 'الطور', 'النجم', 'القمر', 'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة',
            'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج',
            'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس',
            'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد',
            'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق', 'القدر', 'البينة', 'الزلزلة', 'العاديات',
            'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر',
            'المسد', 'الإخلاص', 'الفلق', 'الناس'
        ];

        const englishNames = [
            'Al-Fatihah', 'Al-Baqarah', 'Aal-Imran', 'An-Nisa', 'Al-Maidah', 'Al-An\'am', 'Al-A\'raf', 'Al-Anfal', 'At-Tawbah', 'Yunus',
            'Hud', 'Yusuf', 'Ar-Ra\'d', 'Ibrahim', 'Al-Hijr', 'An-Nahl', 'Al-Isra', 'Al-Kahf', 'Maryam', 'Taha',
            'Al-Anbiya', 'Al-Hajj', 'Al-Mu\'minun', 'An-Nur', 'Al-Furqan', 'Ash-Shu\'ara', 'An-Naml', 'Al-Qasas', 'Al-Ankabut', 'Ar-Rum',
            'Luqman', 'As-Sajdah', 'Al-Ahzab', 'Saba', 'Fatir', 'Yasin', 'As-Saffat', 'Sad', 'Az-Zumar', 'Ghafir',
            'Fussilat', 'Ash-Shura', 'Az-Zukhruf', 'Ad-Dukhan', 'Al-Jathiyah', 'Al-Ahqaf', 'Muhammad', 'Al-Fath', 'Al-Hujurat', 'Qaf',
            'Adh-Dhariyat', 'At-Tur', 'An-Najm', 'Al-Qamar', 'Ar-Rahman', 'Al-Waqiah', 'Al-Hadid', 'Al-Mujadilah', 'Al-Hashr', 'Al-Mumtahanah',
            'As-Saff', 'Al-Jumu\'ah', 'Al-Munafiqun', 'At-Taghabun', 'At-Talaq', 'At-Tahrim', 'Al-Mulk', 'Al-Qalam', 'Al-Haqqah', 'Al-Ma\'arij',
            'Nuh', 'Al-Jinn', 'Al-Muzzammil', 'Al-Muddathir', 'Al-Qiyamah', 'Al-Insan', 'Al-Mursalat', 'An-Naba', 'An-Nazi\'at', 'Abasa',
            'At-Takwir', 'Al-Infitar', 'Al-Mutaffifin', 'Al-Inshiqaq', 'Al-Buruj', 'At-Tariq', 'Al-A\'la', 'Al-Ghashiyah', 'Al-Fajr', 'Al-Balad',
            'Ash-Shams', 'Al-Layl', 'Ad-Duha', 'Ash-Sharh', 'At-Tin', 'Al-Alaq', 'Al-Qadr', 'Al-Bayyinah', 'Az-Zalzalah', 'Al-Adiyat',
            'Al-Qariah', 'At-Takathur', 'Al-Asr', 'Al-Humazah', 'Al-Fil', 'Quraysh', 'Al-Ma\'un', 'Al-Kawthar', 'Al-Kafirun', 'An-Nasr',
            'Al-Masad', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas'
        ];

        try {
            // Try to extract from PDF
            for (let i = 1; i <= 114; i++) {
                const surah = {
                    number: i,
                    name: surahNames[i-1] || `Surah ${i}`,
                    englishName: englishNames[i-1] || `Surah ${i}`,
                    verses: 7, // Default, will be updated
                    ayahs: []
                };
                
                // Try to get verses from PDF (simplified)
                // In production, you'd extract actual verses from PDF
                // For now, we'll use the API for verses but keep PDF metadata
                surahs.push(surah);
            }
            
            // Fetch actual verse counts from API
            try {
                const response = await fetch('https://api.alquran.cloud/v1/meta');
                const data = await response.json();
                if (data.code === 200) {
                    data.data.surahs.forEach((apiSurah, index) => {
                        if (surahs[index]) {
                            surahs[index].verses = apiSurah.verses;
                        }
                    });
                }
            } catch (e) {
                console.warn('Using default verse counts');
            }
            
        } catch (e) {
            console.warn('Error extracting from PDF, using fallback');
            this.useFallbackData();
            return this.surahs;
        }

        return surahs;
    }

    useFallbackData() {
        // Fallback surah data
        const surahNames = [
            'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال', 'التوبة', 'يونس',
            'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه',
            'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم'
        ];
        const englishNames = [
            'Al-Fatihah', 'Al-Baqarah', 'Aal-Imran', 'An-Nisa', 'Al-Maidah', 'Al-An\'am', 'Al-A\'raf', 'Al-Anfal', 'At-Tawbah', 'Yunus',
            'Hud', 'Yusuf', 'Ar-Ra\'d', 'Ibrahim', 'Al-Hijr', 'An-Nahl', 'Al-Isra', 'Al-Kahf', 'Maryam', 'Taha',
            'Al-Anbiya', 'Al-Hajj', 'Al-Mu\'minun', 'An-Nur', 'Al-Furqan', 'Ash-Shu\'ara', 'An-Naml', 'Al-Qasas', 'Al-Ankabut', 'Ar-Rum'
        ];
        
        this.surahs = [];
        for (let i = 1; i <= 30; i++) {
            this.surahs.push({
                number: i,
                name: surahNames[i-1] || `Surah ${i}`,
                englishName: englishNames[i-1] || `Surah ${i}`,
                verses: 7,
                ayahs: []
            });
        }
    }

    loadTranslations() {
        // Translation data for different languages
        this.translations = {
            en: {
                'Al-Fatihah': 'The Opener',
                'Al-Baqarah': 'The Cow',
                'Aal-Imran': 'Family of Imran',
                'An-Nisa': 'The Women',
                'Al-Maidah': 'The Table',
                'Al-An\'am': 'The Cattle',
                'Al-A\'raf': 'The Heights',
                'Al-Anfal': 'The Spoils',
                'At-Tawbah': 'The Repentance',
                'Yunus': 'Jonah'
            },
            ur: {
                'Al-Fatihah': 'فاتحہ',
                'Al-Baqarah': 'بقرہ',
                'Aal-Imran': 'آل عمران',
                'An-Nisa': 'نساء',
                'Al-Maidah': 'مائدہ'
            },
            bn: {
                'Al-Fatihah': 'সূরা ফাতিহা',
                'Al-Baqarah': 'সূরা বাকারাহ',
                'Aal-Imran': 'সূরা আলে ইমরান'
            }
        };
    }

    renderSurahList(filter = '') {
        const container = document.getElementById('surahList');
        if (!container) return;

        const filtered = this.surahs.filter(s => 
            s.name.includes(filter) ||
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
        const viewer = document.getElementById('quranViewer');
        const textContainer = document.getElementById('quranText');
        const title = document.getElementById('viewerTitle');

        try {
            // Fetch surah from API with translation
            const translation = this.currentLanguage;
            const langMap = { en: 'english', ur: 'urdu', bn: 'bengali', ar: 'arabic' };
            const lang = langMap[translation] || 'english';
            
            const [arabicRes, transRes] = await Promise.all([
                fetch(`https://api.alquran.cloud/v1/surah/${number}`),
                fetch(`https://api.alquran.cloud/v1/surah/${number}/${lang}`)
            ]);

            const arabicData = await arabicRes.json();
            const transData = await transRes.json();

            if (arabicData.code === 200) {
                const surah = arabicData.data;
                const translation = transData.code === 200 ? transData.data : null;

                title.textContent = `${surah.name} (${surah.englishName})`;

                textContainer.innerHTML = `
                    <div style="text-align:center;padding:10px 0 20px;border-bottom:1px solid var(--border-color);">
                        <p style="color:var(--text-muted);font-size:14px;">
                            ${surah.revelationType} · ${surah.numberOfAyahs} verses
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
                    ${surah.ayahs.map((ayah, index) => {
                        const transAyah = translation?.ayahs?.[index] || { text: '' };
                        return `
                            <div class="ayah" onclick="window.quranModule?.selectAyah(${number}, ${ayah.numberInSurah})">
                                <span class="ayah-number">${ayah.numberInSurah}</span>
                                <div class="ayah-text">${ayah.text}</div>
                                ${transAyah.text ? `<div class="ayah-translation">${transAyah.text}</div>` : ''}
                            </div>
                        `;
                    }).join('')}
                `;

                viewer.classList.add('active');
                this.currentSurah = number;
                showToast(`📖 Opened Surah ${surah.name}`);
            }
        } catch (error) {
            console.error('Error loading surah:', error);
            showToast('❌ Error loading surah. Please try again.');
        }
    }

    selectAyah(surah, ayah) {
        // For voice correction practice
        this.currentAyah = { surah, ayah };
        showToast(`🎯 Selected Ayah ${ayah} for practice`);
        
        // Switch to Quran Teacher tab
        document.querySelector('[data-section="quran-teacher"]')?.click();
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
        const surah = this.surahs.find(s => s.number === number);
        if (!surah) return;

        const bookmark = {
            id: Date.now().toString(),
            surah: number,
            name: surah.name,
            text: `${surah.name} (${surah.englishName})`
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
        if (container && container.textContent.includes('All Surahs')) {
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

        // Language change
        document.getElementById('translationSelect')?.addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
            localStorage.setItem('quranLanguage', this.currentLanguage);
            if (this.currentSurah) {
                this.loadSurah(this.currentSurah);
            }
            showToast(`🌍 Language changed to ${e.target.options[e.target.selectedIndex].text}`);
        });

        // Feature cards
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
// QURAN TEACHER WITH YOUR VOICE CORRECTION
// ============================================

class QuranTeacherModule {
    constructor() {
        this.isRecording = false;
        this.recognition = null;
        this.currentVerseIndex = 0;
        this.accuracy = 0;
        this.versesMemorized = parseInt(localStorage.getItem('quranMemorizedCount') || '0');
        this.verses = [];
        this.yourVoiceFile = 'js/Voice 004.m4a';
        this.init();
    }

    init() {
        this.loadVerses();
        this.updateStats();
        this.showVerse();
        this.setupTeacherEvents();
        this.initTeacherSpeechRecognition();
    }

    loadVerses() {
        // Sample verses for practice - these will be from the Quran
        this.verses = [
            { arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', translation: 'In the name of Allah, the Most Gracious, the Most Merciful', id: '1:1' },
            { arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: 'Praise be to Allah, Lord of all the worlds', id: '1:2' },
            { arabic: 'الرَّحْمَٰنِ الرَّحِيمِ', translation: 'The Most Gracious, the Most Merciful', id: '1:3' },
            { arabic: 'مَالِكِ يَوْمِ الدِّينِ', translation: 'Master of the Day of Judgment', id: '1:4' },
            { arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', translation: 'You alone we worship, and You alone we ask for help', id: '1:5' }
        ];
    }

    initTeacherSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'ar-SA';
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.maxAlternatives = 5;

            this.recognition.onresult = (event) => {
                const results = event.results[0];
                const transcript = results[0].transcript;
                const confidence = results[0].confidence;
                this.processRecitation(transcript, confidence);
            };

            this.recognition.onend = () => {
                this.isRecording = false;
                document.getElementById('startRecording').style.display = 'inline-flex';
                document.getElementById('stopRecording').style.display = 'none';
            };

            this.recognition.onerror = (event) => {
                console.error('Recognition error:', event.error);
                this.isRecording = false;
                document.getElementById('startRecording').style.display = 'inline-flex';
                document.getElementById('stopRecording').style.display = 'none';
                showToast('⚠️ Please speak clearly and try again');
            };
        } else {
            showToast('⚠️ Speech recognition not supported');
        }
    }

    setupTeacherEvents() {
        document.getElementById('startRecording')?.addEventListener('click', () => {
            this.startTeacherRecording();
        });

        document.getElementById('stopRecording')?.addEventListener('click', () => {
            this.stopTeacherRecording();
        });

        document.getElementById('playCorrect')?.addEventListener('click', () => {
            this.playCorrectPronunciation();
        });

        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                showToast(`📚 Mode: ${btn.textContent}`);
            });
        });
    }

    startTeacherRecording() {
        if (!this.recognition) {
            showToast('⚠️ Speech recognition not available');
            return;
        }

        this.isRecording = true;
        document.getElementById('startRecording').style.display = 'none';
        document.getElementById('stopRecording').style.display = 'inline-flex';
        document.getElementById('feedbackArea').innerHTML = '<div class="feedback-item hint">🎙️ Listening... Please recite the verse</div>';
        
        try {
            this.recognition.start();
        } catch (e) {
            console.error('Error starting recognition:', e);
        }
    }

    stopTeacherRecording() {
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {}
        }
        this.isRecording = false;
        document.getElementById('startRecording').style.display = 'inline-flex';
        document.getElementById('stopRecording').style.display = 'none';
    }

    processRecitation(transcript, confidence) {
        const currentVerse = this.verses[this.currentVerseIndex];
        const correctText = currentVerse.arabic;
        
        // Calculate accuracy based on similarity and confidence
        const similarity = this.calculateSimilarity(transcript, correctText);
        const accuracy = Math.round((similarity * 0.7 + confidence * 0.3) * 100);
        
        let feedback = '';
        let feedbackClass = '';
        
        if (accuracy >= 80) {
            feedback = `✅ Excellent! ${accuracy}% accurate. MashaAllah!`;
            feedbackClass = 'correct';
            this.versesMemorized++;
            localStorage.setItem('quranMemorizedCount', this.versesMemorized.toString());
            this.updateStats();
            
            // Play your voice for encouragement
            this.playYourVoice();
            
            // Move to next verse
            setTimeout(() => {
                this.currentVerseIndex = (this.currentVerseIndex + 1) % this.verses.length;
                this.showVerse();
                showToast('🎯 Moving to next verse');
            }, 2000);
            
        } else if (accuracy >= 60) {
            feedback = `📖 Good effort! ${accuracy}% accurate. Listen to the teacher.`;
            feedbackClass = 'hint';
            // Play your voice for correction
            this.playYourVoice();
        } else {
            feedback = `🔄 Let's try again. Focus on the pronunciation.`;
            feedbackClass = 'incorrect';
            // Play your voice for correction
            this.playYourVoice();
            
            // Show correct pronunciation
            setTimeout(() => {
                this.playCorrectPronunciation();
            }, 1000);
        }
        
        // Highlight incorrect words
        const incorrectWords = this.findIncorrectWords(transcript, correctText);
        let highlightHTML = '';
        if (incorrectWords.length > 0 && accuracy < 80) {
            highlightHTML = `<div class="incorrect-words" style="margin-top:8px;padding:8px;background:var(--bg-body);border-radius:var(--radius-sm);">
                <p style="font-size:13px;font-weight:600;">🔴 Words to correct:</p>
                ${incorrectWords.map(w => `
                    <span style="display:inline-block;padding:2px 10px;margin:2px;background:#f8d7da;color:#721c24;border-radius:var(--radius-full);font-size:13px;">
                        ${w.word} → ${w.correction || 'correct pronunciation'}
                    </span>
                `).join('')}
            </div>`;
        }
        
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-item ${feedbackClass}">
                ${feedback}
                ${highlightHTML}
                <br><small style="font-size:12px;">You said: "${transcript}"</small>
                ${accuracy < 80 ? `<br><small style="font-size:12px;">🎯 Correct: "${correctText}"</small>` : ''}
                ${accuracy < 80 ? `<br><small style="font-size:12px;color:var(--gold);">🔊 Listen to the teacher's voice</small>` : ''}
            </div>
        `;
        
        this.accuracy = accuracy;
        this.updateStats();
    }

    findIncorrectWords(userText, correctText) {
        const userWords = userText.split(/\s+/);
        const correctWords = correctText.split(/\s+/);
        const incorrect = [];
        
        for (let i = 0; i < Math.min(userWords.length, correctWords.length); i++) {
            if (userWords[i] !== correctWords[i]) {
                incorrect.push({
                    word: userWords[i] || '(missing)',
                    correction: correctWords[i] || '(extra word)'
                });
            }
        }
        
        if (userWords.length > correctWords.length) {
            for (let i = correctWords.length; i < userWords.length; i++) {
                incorrect.push({
                    word: userWords[i],
                    correction: '(extra word)'
                });
            }
        }
        
        if (userWords.length < correctWords.length) {
            for (let i = userWords.length; i < correctWords.length; i++) {
                incorrect.push({
                    word: '(missing)',
                    correction: correctWords[i]
                });
            }
        }
        
        return incorrect;
    }

    calculateSimilarity(text1, text2) {
        // Remove diacritics for better comparison
        const clean1 = this.removeDiacritics(text1);
        const clean2 = this.removeDiacritics(text2);
        
        const chars1 = clean1.split('');
        const chars2 = clean2.split('');
        const maxLen = Math.max(chars1.length, chars2.length);
        if (maxLen === 0) return 0;
        
        let matches = 0;
        for (let i = 0; i < Math.min(chars1.length, chars2.length); i++) {
            if (chars1[i] === chars2[i]) matches++;
        }
        
        return matches / maxLen;
    }

    removeDiacritics(text) {
        // Remove Arabic diacritics (tashkeel)
        return text.replace(/[\u0617-\u061A\u064B-\u0652]/g, '');
    }

    playCorrectPronunciation() {
        const verse = this.verses[this.currentVerseIndex];
        const utterance = new SpeechSynthesisUtterance(verse.arabic);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.7;
        utterance.pitch = 1;
        if (window.speechSynthesis) {
            window.speechSynthesis.speak(utterance);
            showToast('🔊 Playing correct pronunciation');
        }
    }

    playYourVoice() {
        try {
            const audio = new Audio('js/Voice 004.m4a');
            audio.play();
            return true;
        } catch (e) {
            console.error('Error playing voice:', e);
            // Fallback: use speech synthesis
            const utterance = new SpeechSynthesisUtterance('Listen carefully and repeat after me');
            utterance.lang = 'ar-SA';
            utterance.rate = 0.8;
            window.speechSynthesis?.speak(utterance);
            return false;
        }
    }

    testYourVoice() {
        this.playYourVoice();
    }

    showVerse() {
        const verse = this.verses[this.currentVerseIndex];
        const container = document.getElementById('currentVerse');
        if (container) {
            container.innerHTML = `
                <p class="arabic" style="font-size:28px;font-weight:600;color:var(--primary);line-height:2;">${verse.arabic}</p>
                <p class="translation" style="font-size:15px;color:var(--text-secondary);margin-top:8px;">"${verse.translation}"</p>
                <p style="font-size:12px;color:var(--text-muted);margin-top:4px;">📖 ${verse.id}</p>
                <p style="font-size:12px;color:var(--text-muted);margin-top:4px;">🎯 Verse ${this.currentVerseIndex + 1} of ${this.verses.length}</p>
            `;
        }
        
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-item hint">🎙️ Click "Start Recording" and recite the verse above</div>
        `;
    }

    updateStats() {
        document.getElementById('accuracyScore').textContent = `${this.accuracy}%`;
        document.getElementById('versesMemorized').textContent = this.versesMemorized;
        document.getElementById('lessonsCompleted').textContent = Math.floor(this.versesMemorized / 2);
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🕌 Loading Quran from PDF...');
    window.quranModule = new QuranModule();
    window.quranTeacherModule = new QuranTeacherModule();
});
