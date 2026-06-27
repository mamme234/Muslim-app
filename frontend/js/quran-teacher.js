// ============================================
// QURAN TEACHER WITH API INTEGRATION
// ============================================

// At the top of your class, add:
async loadVersesFromAPI() {
    try {
        const surahs = await API.quran.getSurahs();
        // Get first 5 surahs for practice
        const verses = [];
        for (let i = 1; i <= 5; i++) {
            const surahData = await API.quran.getSurah(i, 'en');
            if (surahData.success && surahData.data.surah.ayahs) {
                const ayahs = surahData.data.surah.ayahs.slice(0, 3);
                ayahs.forEach(ayah => {
                    verses.push({
                        arabic: ayah.text,
                        translation: ayah.translation || '',
                        surah: `${surahData.data.surah.name} ${ayah.numberInSurah}`,
                        id: `${i}:${ayah.numberInSurah}`
                    });
                });
            }
        }
        this.verses = verses;
        this.showVerse();
    } catch (error) {
        console.error('Error loading verses:', error);
        // Use fallback verses
        this.useFallbackVerses();
    }
}

useFallbackVerses() {
    this.verses = [
        { arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', translation: 'In the name of Allah, the Most Gracious, the Most Merciful', surah: 'Al-Fatihah 1:1', id: '1:1' },
        { arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: 'Praise be to Allah, Lord of all the worlds', surah: 'Al-Fatihah 1:2', id: '1:2' },
        { arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', translation: 'You alone we worship, and You alone we ask for help', surah: 'Al-Fatihah 1:5', id: '1:5' }
    ];
    this.showVerse();
}

// Update the init method:
async init() {
    this.updateStats();
    await this.loadVersesFromAPI();
    this.setupEventListeners();
    this.initSpeechRecognition();
    this.createVoiceCorrectionUI();
}

// Update processRecitation to save progress to API:
async processRecitation(transcript) {
    const currentVerse = this.verses[this.currentVerseIndex];
    const correctText = currentVerse.arabic;
    
    const similarity = this.calculateSimilarity(transcript, correctText);
    const accuracy = Math.round(similarity * 100);
    
    let feedback = '';
    let feedbackClass = '';
    
    if (accuracy >= 80) {
        feedback = `✅ Excellent! ${accuracy}% accurate. MashaAllah!`;
        feedbackClass = 'correct';
        this.versesMemorized++;
        localStorage.setItem('quranMemorizedCount', this.versesMemorized.toString());
        this.updateStats();
        
        // Save progress to API
        try {
            const surahNum = parseInt(currentVerse.id.split(':')[0]);
            const ayahNum = parseInt(currentVerse.id.split(':')[1]);
            await API.quran.saveProgress({
                surah: surahNum,
                ayah: ayahNum,
                memorized: true,
                accuracy: accuracy
            });
            console.log('✅ Progress saved to server');
        } catch (error) {
            console.error('Error saving progress:', error);
        }
        
        this.playCorrectionVoice('mashaallah');
        
        setTimeout(() => {
            this.currentVerseIndex = (this.currentVerseIndex + 1) % this.verses.length;
            this.showVerse();
        }, 2000);
    } else if (accuracy >= 60) {
        feedback = `📖 Good effort! ${accuracy}% accurate. Let me help you.`;
        feedbackClass = 'hint';
        this.playCorrectionVoice('tryagain');
    } else {
        feedback = `🔄 Let's try again. Focus on the pronunciation.`;
        feedbackClass = 'incorrect';
        this.playCorrectionVoice('mistake');
        
        setTimeout(() => {
            this.playCorrectPronunciation();
            setTimeout(() => {
                this.playCorrectionVoice('repeat');
            }, 1500);
        }, 1000);
    }
    
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
        </div>
    `;
    
    this.accuracy = accuracy;
    this.updateStats();
                        }
