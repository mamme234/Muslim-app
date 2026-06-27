// ============================================
// AI QURAN TEACHER WITH YOUR VOICE
// ============================================

class QuranTeacherModule {
    constructor() {
        this.isRecording = false;
        this.recognition = null;
        this.yourVoiceFile = 'Voice 004.m4a'; // Your voice file
        this.verses = [];
        this.currentVerseIndex = 0;
        this.accuracy = 0;
        this.versesMemorized = parseInt(localStorage.getItem('quranMemorizedCount') || '0');
        this.lessonsCompleted = parseInt(localStorage.getItem('quranLessonsCompleted') || '0');
        this.mode = 'beginner';
        this.init();
    }

    init() {
        this.loadQuranData();
        this.updateStats();
        this.showVerse();
        this.setupEventListeners();
        this.initSpeechRecognition();
        this.createVoiceCorrectionUI();
    }

    // Load Quran data from your JS file
    loadQuranData() {
        // This will use the Quran data from your js file
        // Make sure SURAH_DATA is accessible globally
        if (typeof SURAH_DATA !== 'undefined') {
            // Extract first few verses for practice
            this.verses = [
                { 
                    arabic: SURAH_DATA[1]?.verses?.[0]?.text || 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', 
                    translation: 'In the name of Allah, the Most Gracious, the Most Merciful', 
                    surah: 'Al-Fatihah 1:1' 
                },
                { 
                    arabic: SURAH_DATA[1]?.verses?.[1]?.text || 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', 
                    translation: 'Praise be to Allah, Lord of all the worlds', 
                    surah: 'Al-Fatihah 1:2' 
                }
            ];
        } else {
            // Fallback verses
            this.verses = [
                { arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', translation: 'In the name of Allah, the Most Gracious, the Most Merciful', surah: 'Al-Fatihah 1:1' },
                { arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: 'Praise be to Allah, Lord of all the worlds', surah: 'Al-Fatihah 1:2' }
            ];
        }
    }

    // ===== YOUR VOICE CORRECTION =====

    createVoiceCorrectionUI() {
        const dashboard = document.querySelector('.teacher-dashboard');
        if (!dashboard) return;

        const hasVoice = true; // Your voice file is already there
        const ui = document.createElement('div');
        ui.className = 'voice-correction-panel';
        ui.style.cssText = `
            background: var(--bg-card);
            border-radius: var(--radius);
            padding: 20px;
            margin: 20px 0;
            border: 2px solid var(--primary);
            box-shadow: 0 0 20px rgba(15, 138, 109, 0.1);
        `;
        ui.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                <div>
                    <h3><i class="fas fa-microphone-alt" style="color:var(--primary);"></i> Your Voice Correction</h3>
                    <p style="font-size:13px;color:var(--text-muted);">Your voice will be used to correct mistakes</p>
                </div>
                <div style="display:flex;gap:10px;">
                    <span style="padding:4px 16px;border-radius:50px;background:var(--primary-bg);color:var(--primary);font-weight:600;font-size:13px;">
                        <i class="fas fa-check-circle"></i> Voice Loaded: Voice 004.m4a
                    </span>
                    <button onclick="window.quranTeacherModule?.testYourVoice()" style="padding:8px 16px;background:var(--primary);color:white;border:none;border-radius:50px;cursor:pointer;">
                        <i class="fas fa-play"></i> Test Voice
                    </button>
                </div>
            </div>
            <div style="margin-top:12px;padding:12px;background:var(--bg-body);border-radius:var(--radius-sm);">
                <p style="font-size:14px;color:var(--text-secondary);">
                    <i class="fas fa-info-circle" style="color:var(--primary);"></i> 
                    When a user makes a mistake, your voice will say: <strong>"Bismillah, repeat after me"</strong>
                </p>
            </div>
        `;
        
        const recordingArea = dashboard.querySelector('.teacher-recording-area');
        if (recordingArea) {
            dashboard.insertBefore(ui, recordingArea);
        } else {
            dashboard.appendChild(ui);
        }
    }

    // Play your voice for correction
    playYourVoice() {
        try {
            // Your voice file is in the js folder
            const audio = new Audio('js/Voice 004.m4a');
            audio.play();
            showToast('🔊 Playing your voice correction');
            return true;
        } catch (e) {
            console.error('Error playing voice:', e);
            // Fallback: use speech synthesis
            this.speakWithYourVoice();
            return false;
        }
    }

    // Test your voice
    testYourVoice() {
        this.playYourVoice();
    }

    // Fallback if audio file fails
    speakWithYourVoice() {
        if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance('Bismillah, repeat after me');
            utterance.lang = 'ar-SA';
            utterance.rate = 0.8;
            window.speechSynthesis.speak(utterance);
            showToast('🔊 Playing voice (fallback mode)');
        }
    }

    // Correct user with your voice
    correctWithYourVoice(mistakeType = 'general') {
        // Play your voice
        this.playYourVoice();
        
        // Show feedback
        const feedback = document.getElementById('feedbackArea');
        if (feedback) {
            const messages = {
                'mistake': '🔴 Listen to the correct pronunciation from the teacher above.',
                'repeat': '🔄 Please repeat after the teacher.',
                'tryagain': '📖 Try again, focus on the pronunciation.',
                'general': '🎯 Listen carefully and repeat.'
            };
            feedback.innerHTML = `
                <div class="feedback-item incorrect" style="border-left:4px solid var(--gold);">
                    <i class="fas fa-volume-up" style="color:var(--gold);"></i>
                    ${messages[mistakeType] || messages.general}
                    <br><small style="font-size:12px;color:var(--text-muted);">🎤 Teacher is speaking...</small>
                </div>
            `;
        }
    }

    // Override processRecitation to use your voice
    processRecitation(transcript) {
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
            
            // Play your voice for encouragement
            this.playYourVoice();
            
            setTimeout(() => {
                this.currentVerseIndex = (this.currentVerseIndex + 1) % this.verses.length;
                this.showVerse();
            }, 2000);
        } else if (accuracy >= 60) {
            feedback = `📖 Good effort! ${accuracy}% accurate. Listen to the teacher.`;
            feedbackClass = 'hint';
            // Play your voice: "Try again"
            this.correctWithYourVoice('tryagain');
        } else {
            feedback = `🔄 Let's try again. Listen carefully.`;
            feedbackClass = 'incorrect';
            // Play your voice: "Repeat after me"
            this.correctWithYourVoice('mistake');
            
            setTimeout(() => {
                this.playCorrectPronunciation();
                setTimeout(() => {
                    this.correctWithYourVoice('repeat');
                }, 1500);
            }, 1000);
        }
        
        // Find and highlight incorrect words
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
                ${accuracy < 80 ? `<br><small style="font-size:12px;color:var(--gold);">🔊 Listen to the teacher's voice above</small>` : ''}
            </div>
        `;
        
        this.accuracy = accuracy;
        this.updateStats();
    }

    // Other existing methods remain the same...
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
        
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-item hint">🎙️ Click "Start Recording" and recite the verse above</div>
        `;
    }

    updateStats() {
        document.getElementById('accuracyScore').textContent = `${this.accuracy}%`;
        document.getElementById('versesMemorized').textContent = this.versesMemorized;
        this.lessonsCompleted = Math.floor(this.versesMemorized / 2);
        localStorage.setItem('quranLessonsCompleted', this.lessonsCompleted.toString());
        document.getElementById('lessonsCompleted').textContent = this.lessonsCompleted;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.quranTeacherModule = new QuranTeacherModule();
});
