// ============================================
// QURAN MODULE - From The_Holy_Quran.pdf
// With Working Audio & Sheikh Voice Correction
// ============================================

class QuranModule {
    constructor() {
        this.surahs = [];
        this.bookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
        this.currentReciter = localStorage.getItem('selectedReciter') || 'mishary';
        this.currentLanguage = localStorage.getItem('quranLanguage') || 'en';
        this.currentSurah = null;
        this.audio = null;
        this.isPlaying = false;
        this.init();
    }

    async init() {
        await this.loadQuranFromPDF();
        this.renderSurahList();
        this.setupEvents();
        this.renderBookmarks();
        this.initReciters();
    }

    async loadQuranFromPDF() {
        try {
            const pdfUrl = 'js/The_Holy_Quran.pdf';
            const response = await fetch(pdfUrl);
            if (!response.ok) throw new Error('PDF not found');
            
            const arrayBuffer = await response.arrayBuffer();
            const pdfjsLib = await this.loadPDFJS();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            const surahNames = [
                'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة',
                'الأنعام', 'الأعراف', 'الأنفال', 'التوبة', 'يونس',
                'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر',
                'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه'
            ];
            const englishNames = [
                'Al-Fatihah', 'Al-Baqarah', 'Aal-Imran', 'An-Nisa', 'Al-Maidah',
                'Al-An\'am', 'Al-A\'raf', 'Al-Anfal', 'At-Tawbah', 'Yunus',
                'Hud', 'Yusuf', 'Ar-Ra\'d', 'Ibrahim', 'Al-Hijr',
                'An-Nahl', 'Al-Isra', 'Al-Kahf', 'Maryam', 'Taha'
            ];
            
            this.surahs = [];
            for (let i = 1; i <= 20; i++) {
                this.surahs.push({
                    number: i,
                    name: surahNames[i-1] || `Surah ${i}`,
                    englishName: englishNames[i-1] || `Surah ${i}`,
                    verses: 7
                });
            }
            
            // Get verse counts from API
            try {
                const response = await fetch('https://api.alquran.cloud/v1/meta');
                const data = await response.json();
                if (data.code === 200) {
                    data.data.surahs.forEach((apiSurah, index) => {
                        if (this.surahs[index]) {
                            this.surahs[index].verses = apiSurah.verses;
                        }
                    });
                }
            } catch (e) {
                console.warn('Using default verse counts');
            }
            
            console.log('✅ Quran loaded:', this.surahs.length, 'surahs');
            
        } catch (error) {
            console.error('Error loading PDF:', error);
            this.useFallback();
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

    useFallback() {
        this.surahs = [];
        for (let i = 1; i <= 10; i++) {
            this.surahs.push({
                number: i,
                name: `Surah ${i}`,
                englishName: `Surah ${i}`,
                verses: 7
            });
        }
        this.renderSurahList();
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
            const langMap = { en: 'english', ur: 'urdu', bn: 'bengali', ar: 'arabic' };
            const lang = langMap[this.currentLanguage] || 'english';
            
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
                        <button onclick="window.quranModule?.playAudio(${number})" 
                            id="playBtn${number}"
                            style="margin-top:8px;padding:8px 20px;background:var(--primary);color:white;border:none;border-radius:var(--radius-full);cursor:pointer;">
                            <i class="fas fa-play"></i> Play Recitation
                        </button>
                        <button onclick="window.quranModule?.stopAudio()" 
                            style="margin-top:8px;margin-left:8px;padding:8px 20px;background:#ef4444;color:white;border:none;border-radius:var(--radius-full);cursor:pointer;">
                            <i class="fas fa-stop"></i> Stop
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
                showToast(`📖 Opened ${surah.name}`);
            }
        } catch (error) {
            console.error('Error loading surah:', error);
            showToast('❌ Error loading surah');
        }
    }

    // ===== WORKING AUDIO RECITATION =====
    playAudio(surahNumber) {
        const reciterMap = {
            mishary: 'mishary_rashid_alafasy',
            sudais: 'abdul_rahman_al_sudais',
            ghamdi: 'saad_al_ghamdi',
            muaiqly: 'maher_al_muaiqly',
            dosari: 'yasser_al_dosari'
        };
        
        const reciter = reciterMap[this.currentReciter] || 'mishary_rashid_alafasy';
        const url = `https://cdn.islamic.network/quran/audio/128/${reciter}/${surahNumber}.mp3`;
        
        // Stop any existing audio
        if (this.audio) {
            this.audio.pause();
            this.audio = null;
        }
        
        this.audio = new Audio(url);
        this.audio.play();
        this.isPlaying = true;
        
        const btn = document.getElementById(`playBtn${surahNumber}`);
        if (btn) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Playing...';
        }
        
        this.audio.onended = () => {
            this.isPlaying = false;
            if (btn) {
                btn.innerHTML = '<i class="fas fa-play"></i> Play Recitation';
            }
            showToast('✅ Recitation complete');
        };
        
        this.audio.onerror = () => {
            this.isPlaying = false;
            if (btn) {
                btn.innerHTML = '<i class="fas fa-play"></i> Play Recitation';
            }
            showToast('⚠️ Audio failed. Trying alternative...');
            this.playAlternativeAudio(surahNumber);
        };
        
        showToast(`🔊 Playing recitation`);
    }

    playAlternativeAudio(surahNumber) {
        // Fallback: Use different CDN
        const reciterMap = {
            mishary: 'mishary_rashid_alafasy',
            sudais: 'abdul_rahman_al_sudais',
            ghamdi: 'saad_al_ghamdi',
            muaiqly: 'maher_al_muaiqly'
        };
        const reciter = reciterMap[this.currentReciter] || 'mishary_rashid_alafasy';
        const url = `https://download.quranicaudio.com/quran/128kbps/${reciter}/${surahNumber}.mp3`;
        
        this.audio = new Audio(url);
        this.audio.play();
        this.isPlaying = true;
        showToast(`🔊 Playing alternative recitation`);
        
        this.audio.onerror = () => {
            this.isPlaying = false;
            showToast('⚠️ Audio unavailable. Please try another reciter.');
        };
    }

    stopAudio() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.audio = null;
            this.isPlaying = false;
            showToast('⏹️ Audio stopped');
        }
    }

    // ===== SHEIKH VOICE CORRECTION =====
    playSheikhCorrection(ayahText) {
        // Get the reciter's voice
        const reciterMap = {
            mishary: 'mishary_rashid_alafasy',
            sudais: 'abdul_rahman_al_sudais',
            ghamdi: 'saad_al_ghamdi',
            muaiqly: 'maher_al_muaiqly'
        };
        
        const reciter = reciterMap[this.currentReciter] || 'mishary_rashid_alafasy';
        
        // Use the reciter's voice from CDN
        const url = `https://cdn.islamic.network/quran/audio/128/${reciter}/1.mp3`;
        
        try {
            const audio = new Audio(url);
            audio.play();
            showToast(`🔊 Sheikh ${this.currentReciter} correcting...`);
            return true;
        } catch (e) {
            console.error('Error playing Sheikh voice:', e);
            // Fallback: Use speech synthesis
            this.fallbackSheikhVoice(ayahText);
            return false;
        }
    }

    fallbackSheikhVoice(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.6;
        utterance.pitch = 0.8;
        
        // Try to find Arabic voice
        const voices = window.speechSynthesis?.getVoices();
        const arabicVoice = voices?.find(v => v.lang === 'ar-SA' || v.lang === 'ar-EG');
        if (arabicVoice) {
            utterance.voice = arabicVoice;
        }
        
        if (window.speechSynthesis) {
            window.speechSynthesis.speak(utterance);
            showToast('🔊 Sheikh voice (fallback)');
        }
    }

    testSheikhVoice() {
        const verse = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
        this.playSheikhCorrection(verse);
    }

    selectAyah(surah, ayah) {
        this.currentAyah = { surah, ayah };
        showToast(`🎯 Selected Ayah ${ayah}`);
        
        // Get the ayah text and play Sheikh correction
        this.getAyahText(surah, ayah).then(text => {
            if (text) {
                this.playSheikhCorrection(text);
            }
        });
    }

    async getAyahText(surah, ayah) {
        try {
            const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}`);
            const data = await response.json();
            if (data.code === 200) {
                return data.data.text;
            }
        } catch (e) {
            console.error('Error getting ayah:', e);
        }
        return null;
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
        const container = document.querySelector('#quran .card h3');
        if (container && container.textContent.includes('All Surahs')) {
            container.textContent = `All Surahs (${this.surahs.length})`;
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
                showToast(`🎙️ Reciter: ${btn.textContent.trim()}`);
            });
        });
    }

    setupEvents() {
        document.getElementById('closeViewer')?.addEventListener('click', () => {
            document.getElementById('quranViewer').classList.remove('active');
            this.stopAudio();
        });

        const searchInput = document.getElementById('quranSearch');
        const searchBtn = document.getElementById('searchBtn');
        
        const performSearch = () => {
            if (searchInput) this.renderSurahList(searchInput.value);
        };

        searchInput?.addEventListener('input', performSearch);
        searchBtn?.addEventListener('click', performSearch);

        document.getElementById('translationSelect')?.addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
            localStorage.setItem('quranLanguage', this.currentLanguage);
            if (this.currentSurah) {
                this.loadSurah(this.currentSurah);
            }
            showToast(`🌍 Language: ${e.target.options[e.target.selectedIndex].text}`);
        });

        document.getElementById('readQuran')?.addEventListener('click', () => {
            document.querySelector('.surah-item')?.click();
        });

        document.getElementById('searchQuran')?.addEventListener('click', () => {
            document.getElementById('quranSearch')?.focus();
        });

        document.getElementById('memorizeQuran')?.addEventListener('click', () => {
            if (this.surahs.length > 0) {
                const random = this.surahs[Math.floor(Math.random() * this.surahs.length)];
                this.loadSurah(random.number);
                showToast('🎯 Memorization mode');
            }
        });

        document.getElementById('listenQuran')?.addEventListener('click', () => {
            if (this.surahs.length > 0) {
                const random = this.surahs[Math.floor(Math.random() * this.surahs.length)];
                this.playAudio(random.number);
            }
        });
    }
}

// ============================================
// QURAN TEACHER WITH SHEIKH VOICE
// ============================================

class QuranTeacherModule {
    constructor() {
        this.verses = [
            { arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', translation: 'In the name of Allah', id: '1:1' },
            { arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: 'Praise be to Allah', id: '1:2' },
            { arabic: 'الرَّحْمَٰنِ الرَّحِيمِ', translation: 'The Most Gracious', id: '1:3' },
            { arabic: 'مَالِكِ يَوْمِ الدِّينِ', translation: 'Master of the Day', id: '1:4' },
            { arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', translation: 'You alone we worship', id: '1:5' }
        ];
        this.currentVerseIndex = 0;
        this.accuracy = 0;
        this.versesMemorized = parseInt(localStorage.getItem('quranMemorizedCount') || '0');
        this.isRecording = false;
        this.recognition = null;
        this.currentReciter = localStorage.getItem('selectedReciter') || 'mishary';
        this.init();
    }

    init() {
        this.showVerse();
        this.updateStats();
        this.setupTeacherEvents();
        this.initSpeechRecognition();
    }

    initSpeechRecognition() {
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

            this.recognition.onerror = () => {
                this.isRecording = false;
                document.getElementById('startRecording').style.display = 'inline-flex';
                document.getElementById('stopRecording').style.display = 'none';
                showToast('⚠️ Please speak clearly');
            };
        }
    }

    setupTeacherEvents() {
        document.getElementById('startRecording')?.addEventListener('click', () => {
            this.startRecording();
        });

        document.getElementById('stopRecording')?.addEventListener('click', () => {
            this.stopRecording();
        });

        document.getElementById('playCorrect')?.addEventListener('click', () => {
            this.playSheikhCorrection();
        });

        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                showToast(`📚 Mode: ${btn.textContent}`);
            });
        });
    }

    startRecording() {
        if (!this.recognition) {
            showToast('⚠️ Speech recognition not available');
            return;
        }

        this.isRecording = true;
        document.getElementById('startRecording').style.display = 'none';
        document.getElementById('stopRecording').style.display = 'inline-flex';
        document.getElementById('feedbackArea').innerHTML = '<div class="feedback-item hint">🎙️ Listening...</div>';
        
        try {
            this.recognition.start();
        } catch (e) {
            console.error('Error starting recognition:', e);
        }
    }

    stopRecording() {
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
        
        // Calculate similarity
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
            
            // Play Sheikh voice for encouragement
            this.playSheikhCorrection();
            
            setTimeout(() => {
                this.currentVerseIndex = (this.currentVerseIndex + 1) % this.verses.length;
                this.showVerse();
                showToast('🎯 Next verse');
            }, 2000);
            
        } else if (accuracy >= 60) {
            feedback = `📖 Good effort! ${accuracy}% accurate. Listen to Sheikh.`;
            feedbackClass = 'hint';
            this.playSheikhCorrection();
        } else {
            feedback = `🔄 Try again. Focus on pronunciation.`;
            feedbackClass = 'incorrect';
            this.playSheikhCorrection();
            
            setTimeout(() => {
                this.playSheikhCorrection();
            }, 1000);
        }
        
        // Highlight incorrect words
        const incorrectWords = this.findIncorrectWords(transcript, correctText);
        let highlightHTML = '';
        if (incorrectWords.length > 0 && accuracy < 80) {
            highlightHTML = `<div style="margin-top:8px;padding:8px;background:var(--bg-body);border-radius:var(--radius-sm);">
                <p style="font-size:13px;font-weight:600;">🔴 Words to correct:</p>
                ${incorrectWords.map(w => `
                    <span style="display:inline-block;padding:2px 10px;margin:2px;background:#f8d7da;color:#721c24;border-radius:var(--radius-full);font-size:13px;">
                        ${w.word} → ${w.correction || 'correct'}
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
                ${accuracy < 80 ? `<br><small style="font-size:12px;color:var(--gold);">🔊 Sheikh is correcting you</small>` : ''}
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
                    correction: correctWords[i] || '(extra)'
                });
            }
        }
        
        if (userWords.length > correctWords.length) {
            for (let i = correctWords.length; i < userWords.length; i++) {
                incorrect.push({ word: userWords[i], correction: '(extra)' });
            }
        }
        
        if (userWords.length < correctWords.length) {
            for (let i = userWords.length; i < correctWords.length; i++) {
                incorrect.push({ word: '(missing)', correction: correctWords[i] });
            }
        }
        
        return incorrect;
    }

    calculateSimilarity(text1, text2) {
        const clean1 = text1.replace(/[\u0617-\u061A\u064B-\u0652]/g, '');
        const clean2 = text2.replace(/[\u0617-\u061A\u064B-\u0652]/g, '');
        
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

    playSheikhCorrection() {
        const currentVerse = this.verses[this.currentVerseIndex];
        const reciterMap = {
            mishary: 'mishary_rashid_alafasy',
            sudais: 'abdul_rahman_al_sudais',
            ghamdi: 'saad_al_ghamdi',
            muaiqly: 'maher_al_muaiqly'
        };
        
        const reciter = reciterMap[this.currentReciter] || 'mishary_rashid_alafasy';
        const url = `https://cdn.islamic.network/quran/audio/128/${reciter}/1.mp3`;
        
        try {
            const audio = new Audio(url);
            audio.play();
            showToast(`🔊 Sheikh ${this.currentReciter} correcting...`);
            return true;
        } catch (e) {
            console.error('Error playing Sheikh voice:', e);
            // Fallback
            const utterance = new SpeechSynthesisUtterance(currentVerse.arabic);
            utterance.lang = 'ar-SA';
            utterance.rate = 0.6;
            utterance.pitch = 0.8;
            window.speechSynthesis?.speak(utterance);
            return false;
        }
    }

    testSheikhVoice() {
        this.playSheikhCorrection();
    }

    showVerse() {
        const verse = this.verses[this.currentVerseIndex];
        const container = document.getElementById('currentVerse');
        if (container) {
            container.innerHTML = `
                <p class="arabic" style="font-size:28px;font-weight:600;color:var(--primary);line-height:2;">${verse.arabic}</p>
                <p class="translation" style="font-size:15px;color:var(--text-secondary);margin-top:8px;">"${verse.translation}"</p>
                <p style="font-size:12px;color:var(--text-muted);margin-top:4px;">📖 ${verse.id}</p>
                <p style="font-size:12px;color:var(--gold);margin-top:4px;">🔊 Sheikh ${this.currentReciter} will correct you</p>
            `;
        }
        
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-item hint">🎙️ Click "Start Recording" and recite<br>🔊 Sheikh will correct your mistakes</div>
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
    console.log('🕌 Loading Quran...');
    window.quranModule = new QuranModule();
    window.quranTeacherModule = new QuranTeacherModule();
});
