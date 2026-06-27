// ============================================
// AI QURAN TEACHER MODULE
// ============================================

class QuranTeacherModule {
    constructor() {
        this.isRecording = false;
        this.recognition = null;
        this.verses = [
            { arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', translation: 'In the name of Allah, the Most Gracious, the Most Merciful', surah: 'Al-Fatihah 1:1' },
            { arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: 'Praise be to Allah, Lord of all the worlds', surah: 'Al-Fatihah 1:2' },
            { arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', translation: 'You alone we worship, and You alone we ask for help', surah: 'Al-Fatihah 1:5' },
            { arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', translation: 'Guide us to the straight path', surah: 'Al-Fatihah 1:6' }
        ];
        this.currentVerseIndex = 0;
        this.accuracy = 0;
        this.versesMemorized = parseInt(localStorage.getItem('quranMemorizedCount') || '0');
        this.lessonsCompleted = parseInt(localStorage.getItem('quranLessonsCompleted') || '0');
        this.mode = 'beginner';
        this.init();
    }

    init() {
        this.updateStats();
        this.showVerse();
        this.setupEventListeners();
        this.initSpeechRecognition();
    }

    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
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

            this.recognition.onerror = (event) => {
                console.error('Recognition error:', event.error);
                this.isRecording = false;
                document.getElementById('startRecording').style.display = 'inline-flex';
                document.getElementById('stopRecording').style.display = 'none';
                showToast('⚠️ Please speak clearly and try again');
            };
        } else {
            showToast('⚠️ Speech recognition is not supported in this browser');
        }
    }

    setupEventListeners() {
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
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.mode = btn.dataset.mode;
                showToast(`📚 Mode switched to: ${btn.textContent}`);
                this.showVerse();
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
        document.getElementById('feedbackArea').innerHTML = '<div class="feedback-item hint">🎙️ Listening... Please recite the verse</div>';
        
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
            } catch (e) {
                console.error('Error stopping recognition:', e);
            }
        }
        this.isRecording = false;
        document.getElementById('startRecording').style.display = 'inline-flex';
        document.getElementById('stopRecording').style.display = 'none';
    }

    processRecitation(transcript) {
        const currentVerse = this.verses[this.currentVerseIndex];
        const correctText = currentVerse.arabic;
        
        // Simple comparison (in production, use a more sophisticated method)
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
            
            // Move to next verse after a moment
            setTimeout(() => {
                this.currentVerseIndex = (this.currentVerseIndex + 1) % this.verses.length;
                this.showVerse();
            }, 2000);
        } else if (accuracy >= 60) {
            feedback = `📖 Good effort! ${accuracy}% accurate. Keep practicing!`;
            feedbackClass = 'hint';
        } else {
            feedback = `🔄 Let's try again. Focus on the pronunciation.`;
            feedbackClass = 'incorrect';
        }
        
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-item ${feedbackClass}">
                ${feedback}
                <br><small style="font-size:12px;">You said: "${transcript}"</small>
            </div>
        `;
        
        this.accuracy = accuracy;
        this.updateStats();
    }

    calculateSimilarity(text1, text2) {
        // Simple similarity calculation
        const chars1 = text1.split('');
        const chars2 = text2.split('');
        const maxLen = Math.max(chars1.length, chars2.length);
        if (maxLen === 0) return 0;
        
        let matches = 0;
        for (let i = 0; i < Math.min(chars1.length, chars2.length); i++) {
            if (chars1[i] === chars2[i]) matches++;
        }
        
        return matches / maxLen;
    }

    playCorrectPronunciation() {
        const verse = this.verses[this.currentVerseIndex];
        const utterance = new SpeechSynthesisUtterance(verse.arabic);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        
        if (window.speechSynthesis) {
            window.speechSynthesis.speak(utterance);
            showToast('🔊 Playing correct pronunciation');
        } else {
            showToast('⚠️ Speech synthesis not supported');
        }
    }

    showVerse() {
        const verse = this.verses[this.currentVerseIndex];
        const container = document.getElementById('currentVerse');
        if (container) {
            container.innerHTML = `
                <p class="arabic" style="font-size:28px;font-weight:600;color:var(--primary);line-height:2;">${verse.arabic}</p>
                <p class="translation" style="font-size:15px;color:var(--text-secondary);margin-top:8px;">"${verse.translation}"</p>
                <p style="font-size:12px;color:var(--text-muted);margin-top:4px;">📖 ${verse.surah}</p>
                <p style="font-size:12px;color:var(--text-muted);margin-top:4px;">🎯 Verse ${this.currentVerseIndex + 1} of ${this.verses.length}</p>
            `;
        }
        
        // Reset feedback
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-item hint">🎙️ Click "Start Recording" and recite the verse above</div>
        `;
    }

    updateStats() {
        document.getElementById('accuracyScore').textContent = `${this.accuracy}%`;
        document.getElementById('versesMemorized').textContent = this.versesMemorized;
        
        // Update lessons completed based on memorized verses
        this.lessonsCompleted = Math.floor(this.versesMemorized / 2);
        localStorage.setItem('quranLessonsCompleted', this.lessonsCompleted.toString());
        document.getElementById('lessonsCompleted').textContent = this.lessonsCompleted;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.quranTeacherModule = new QuranTeacherModule();
});
