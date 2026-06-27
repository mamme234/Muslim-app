// ============================================
// AI-ASSISTANT.JS - AI, Voice Assistant, Audio, Video
// ============================================

// ============================================
// AI ASSISTANT MODULE
// ============================================

class AIModule {
    constructor() {
        this.messages = [];
        this.isProcessing = false;
        this.conversationHistory = JSON.parse(localStorage.getItem('aiConversation') || '[]');
        this.init();
    }

    init() {
        if (this.conversationHistory.length > 0) {
            this.messages = this.conversationHistory;
            this.renderMessages();
        } else {
            this.addWelcomeMessage();
        }
        this.setupAIEvents();
    }

    addWelcomeMessage() {
        const welcomeMessage = {
            role: 'bot',
            content: `Assalamu Alaikum! I'm your Islamic AI assistant. I can help you with:

• 📖 Explaining Quran verses
• 📚 Clarifying Hadith
• 🕌 Islamic rulings and practices
• 🎓 Personalized learning plans

💡 Try asking:
• "Explain Surah Al-Fatihah"
• "What does the Quran say about patience?"
• "Tell me about the 5 pillars of Islam"

📚 Sources: Quran, Sahih Hadith, Scholarly Consensus`
        };
        this.messages.push(welcomeMessage);
        this.saveConversation();
        this.renderMessages();
    }

    setupAIEvents() {
        const input = document.getElementById('aiInput');
        const sendBtn = document.getElementById('aiSend');

        sendBtn?.addEventListener('click', () => this.handleUserInput());
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); this.handleUserInput(); }
        });
    }

    async handleUserInput() {
        const input = document.getElementById('aiInput');
        const question = input.value.trim();
        if (!question || this.isProcessing) return;

        this.addMessage('user', question);
        input.value = '';
        this.isProcessing = true;
        this.updateSendButton(true);

        this.showTypingIndicator();

        try {
            const response = await this.getAIResponse(question);
            this.removeTypingIndicator();
            this.addMessage('bot', response);
        } catch (error) {
            console.error('AI Error:', error);
            this.removeTypingIndicator();
            this.addMessage('bot', 'I apologize, but I encountered an error. Please try again later.');
        }

        this.isProcessing = false;
        this.updateSendButton(false);
    }

    addMessage(role, content) {
        const message = { role, content, timestamp: new Date().toISOString() };
        this.messages.push(message);
        this.saveConversation();
        this.renderMessages();
    }

    renderMessages() {
        const container = document.getElementById('aiMessages');
        if (!container) return;

        if (this.messages.length === 0) { this.addWelcomeMessage(); return; }

        container.innerHTML = this.messages.map((msg) => {
            const isUser = msg.role === 'user';
            const content = msg.content || '';
            
            const hasSources = content.includes('📚 Sources:');
            const parts = hasSources ? content.split('📚 Sources:') : [content];
            const mainContent = parts[0] || content;
            const sources = parts[1] || '';

            return `
                <div class="ai-message ${isUser ? 'user' : 'bot'}">
                    <div class="message-content">
                        <div style="white-space:pre-wrap;">${this.formatContent(mainContent)}</div>
                        ${sources ? `<div style="font-size:12px;color:var(--text-muted);margin-top:8px;padding-top:8px;border-top:1px solid var(--border-color);">📚 Sources: ${sources}</div>` : ''}
                        <div style="display:flex;gap:8px;margin-top:8px;">
                            <button class="copy-msg" data-content="${encodeURIComponent(content)}" style="background:none;border:none;color:var(--text-muted);font-size:12px;cursor:pointer;padding:2px 8px;border-radius:4px;">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.copy-msg').forEach(btn => {
            btn.addEventListener('click', () => {
                const content = decodeURIComponent(btn.dataset.content);
                navigator.clipboard.writeText(content).then(() => {
                    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i> Copy'; }, 2000);
                });
            });
        });

        container.scrollTop = container.scrollHeight;
    }

    formatContent(content) {
        let formatted = content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/• (.*?)(<br>|$)/g, '• $1$2');
        formatted = formatted.replace(/"([^"]+)"\s*\(/g, '"<em>$1</em> (');
        return formatted;
    }

    showTypingIndicator() {
        const container = document.getElementById('aiMessages');
        if (!container) return;

        this.removeTypingIndicator();

        const indicator = document.createElement('div');
        indicator.className = 'ai-message bot typing-indicator-container';
        indicator.id = 'typingIndicator';
        indicator.innerHTML = `
            <div class="message-content">
                <div style="display:flex;gap:4px;padding:8px 12px;">
                    <span style="width:8px;height:8px;background:var(--text-muted);border-radius:50%;animation:typing 1.4s infinite;"></span>
                    <span style="width:8px;height:8px;background:var(--text-muted);border-radius:50%;animation:typing 1.4s infinite 0.2s;"></span>
                    <span style="width:8px;height:8px;background:var(--text-muted);border-radius:50%;animation:typing 1.4s infinite 0.4s;"></span>
                </div>
            </div>
        `;
        container.appendChild(indicator);
        container.scrollTop = container.scrollHeight;
    }

    removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }

    updateSendButton(processing) {
        const sendBtn = document.getElementById('aiSend');
        if (sendBtn) {
            sendBtn.disabled = processing;
            sendBtn.innerHTML = processing ? '<i class="fas fa-spinner fa-spin"></i> Thinking...' : '<i class="fas fa-paper-plane"></i> Send';
        }
    }

    saveConversation() {
        if (this.messages.length > 50) this.messages = this.messages.slice(-50);
        localStorage.setItem('aiConversation', JSON.stringify(this.messages));
    }

    async getAIResponse(question) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const lower = question.toLowerCase();
        let response = '';

        if (lower.includes('pillar') || lower.includes('pillars')) {
            response = `The Five Pillars of Islam are the foundation of Muslim life:

1. **Shahada** (Faith) - Declaration of faith: "There is no god but Allah, and Muhammad is the Messenger of Allah"

2. **Salah** (Prayer) - Performing the five daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha)

3. **Zakat** (Charity) - Giving 2.5% of savings to those in need

4. **Sawm** (Fasting) - Fasting during the month of Ramadan

5. **Hajj** (Pilgrimage) - Performing pilgrimage to Mecca at least once in a lifetime

📚 Sources: Quran & Sahih Hadith (Bukhari & Muslim)`;
        } else if (lower.includes('fatihah')) {
            response = `**Surah Al-Fatihah** (The Opening) is the first chapter of the Quran.

**Summary:**
• Verse 1: Praise to Allah, Lord of all worlds
• Verse 2: The Most Gracious, Most Merciful
• Verse 3: Master of the Day of Judgment
• Verse 4: Only You we worship
• Verse 5: Guide us to the straight path

This surah is recited in every prayer and is a powerful dua for guidance.

📚 Source: Quran 1:1-7`;
        } else if (lower.includes('patience')) {
            response = `**Patience (Sabr)** is a fundamental virtue in Islam.

• "Indeed, Allah is with the patient" (Quran 2:153)
• "And be patient, for your patience is but from Allah" (Quran 16:127)
• "And We will surely test you... but give glad tidings to the patient" (Quran 2:155)

📚 Sources: Quran 2:153, 16:127, 2:155`;
        } else {
            response = `Thank you for your question. I will provide an answer based on Islamic sources.

The topic you're asking about is important in Islam. I would recommend:

1. **Quran** - The primary source of guidance
2. **Sunnah** - The teachings of Prophet Muhammad ﷺ
3. **Scholarly Consensus** - The agreement of Islamic scholars

Could you please clarify your question so I can give you a more specific response?

📚 Sources: Quran, Sahih Hadith (Bukhari & Muslim)`;
        }

        return response;
    }
}

// ============================================
// VOICE ASSISTANT MODULE
// ============================================

class VoiceAssistantModule {
    constructor() {
        this.isRecording = false;
        this.recognition = null;
        this.messages = [];
        this.yourVoiceFile = 'Voice 004.m4a';
        this.encouragements = [
            '💚 MashaAllah, excellent!',
            '🌟 Beautiful recitation!',
            '💛 Good effort, keep going!',
            '📖 Wonderful! You\'re improving!'
        ];
        this.init();
    }

    init() {
        this.renderVoiceMessages();
        this.setupVoiceEvents();
        this.initSpeechRecognition();
        this.addWelcomeVoiceMessage();
    }

    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'en-US';
            this.recognition.continuous = true;
            this.recognition.interimResults = true;

            this.recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                this.processVoiceInput(transcript);
            };

            this.recognition.onerror = (event) => {
                console.error('Recognition error:', event.error);
            };
        }
    }

    setupVoiceEvents() {
        document.getElementById('voiceInputBtn')?.addEventListener('click', () => {
            this.toggleRecording();
        });

        document.getElementById('voiceSendBtn')?.addEventListener('click', () => {
            const input = document.getElementById('voiceTextInput');
            if (input.value.trim()) {
                this.addVoiceMessage('user', input.value.trim());
                this.processTextInput(input.value.trim());
                input.value = '';
            }
        });

        document.getElementById('voiceTextInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('voiceSendBtn')?.click();
            }
        });
    }

    toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    startRecording() {
        if (!this.recognition) {
            showToast('⚠️ Speech recognition not available');
            return;
        }

        this.isRecording = true;
        const btn = document.getElementById('voiceInputBtn');
        btn.innerHTML = '<i class="fas fa-stop"></i> Stop';
        btn.style.background = '#ef4444';
        
        try {
            this.recognition.start();
            showToast('🎤 Listening... Speak now');
        } catch (e) {
            console.error('Error starting recognition:', e);
        }
    }

    stopRecording() {
        if (this.recognition) {
            try { this.recognition.stop(); } catch (e) {}
        }
        this.isRecording = false;
        const btn = document.getElementById('voiceInputBtn');
        btn.innerHTML = '<i class="fas fa-microphone"></i> Speak';
        btn.style.background = '';
        showToast('⏹️ Listening stopped');
    }

    processVoiceInput(transcript) {
        if (transcript.trim()) {
            this.addVoiceMessage('user', transcript);
            this.processTextInput(transcript);
        }
    }

    processTextInput(text) {
        const lower = text.toLowerCase();
        let response = '';
        
        if (lower.includes('recite') || lower.includes('read')) {
            response = this.getRandomEncouragement() + ' Let me help you with recitation.';
            this.playYourVoice();
        } else if (lower.includes('pray')) {
            response = this.getRandomEncouragement() + ' Prayer is the second pillar of Islam.';
        } else {
            response = this.getRandomEncouragement() + ' I\'m here to help you with your Islamic learning journey.';
        }
        
        setTimeout(() => {
            this.addVoiceMessage('bot', response);
        }, 500);
    }

    getRandomEncouragement() {
        return this.encouragements[Math.floor(Math.random() * this.encouragements.length)];
    }

    playYourVoice() {
        try {
            const audio = new Audio('js/Voice 004.m4a');
            audio.play();
            showToast('🔊 Playing your voice');
            return true;
        } catch (e) {
            console.error('Error playing voice:', e);
            return false;
        }
    }

    addVoiceMessage(role, content) {
        const message = { role, content, timestamp: new Date().toISOString() };
        this.messages.push(message);
        this.renderVoiceMessages();
    }

    renderVoiceMessages() {
        const container = document.getElementById('voiceMessages');
        if (!container) return;

        container.innerHTML = this.messages.map(msg => `
            <div class="voice-message ${msg.role}">
                <div class="message-content">
                    <p>${msg.content}</p>
                    <small style="font-size:10px;color:var(--text-muted);">${new Date(msg.timestamp).toLocaleTimeString()}</small>
                </div>
            </div>
        `).join('');

        container.scrollTop = container.scrollHeight;
    }

    addWelcomeVoiceMessage() {
        this.addVoiceMessage('bot', 'Assalamu Alaikum! I\'m your voice assistant. Your teacher\'s voice is loaded and ready to help you. 🎙️');
        
        setTimeout(() => {
            this.addVoiceMessage('bot', '💡 You can say: "Recite Quran", "Teach me a Dua", or "Help me with prayer"');
        }, 1000);
    }
}

// ============================================
// QURAN TEACHER MODULE (with your voice)
// ============================================

class QuranTeacherModule {
    constructor() {
        this.isRecording = false;
        this.recognition = null;
        this.verses = [
            { arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', translation: 'In the name of Allah, the Most Gracious, the Most Merciful', id: 'bismillah' },
            { arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: 'Praise be to Allah, Lord of all the worlds', id: 'alhamdulillah' }
        ];
        this.currentVerseIndex = 0;
        this.accuracy = 0;
        this.versesMemorized = parseInt(localStorage.getItem('quranMemorizedCount') || '0');
        this.init();
    }

    init() {
        this.updateStats();
        this.showVerse();
        this.setupTeacherEvents();
        this.initTeacherSpeechRecognition();
    }

    initTeacherSpeechRecognition() {
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

            this.recognition.onerror = () => {
                this.isRecording = false;
                document.getElementById('startRecording').style.display = 'inline-flex';
                document.getElementById('stopRecording').style.display = 'none';
                showToast('⚠️ Please speak clearly and try again');
            };
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
        document.getElementById('feedbackArea').innerHTML = '<div class="feedback-item hint">🎙️ Listening... Please recite</div>';
        
        try { this.recognition.start(); } catch (e) {}
    }

    stopTeacherRecording() {
        if (this.recognition) {
            try { this.recognition.stop(); } catch (e) {}
        }
        this.isRecording = false;
        document.getElementById('startRecording').style.display = 'inline-flex';
        document.getElementById('stopRecording').style.display = 'none';
    }

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
            this.playYourVoice();
        } else {
            feedback = `🔄 Let's try again. Focus on the pronunciation.`;
            feedbackClass = 'incorrect';
            this.playYourVoice();
            
            setTimeout(() => {
                this.playCorrectPronunciation();
            }, 1000);
        }
        
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-item ${feedbackClass}">
                ${feedback}
                <br><small style="font-size:12px;">You said: "${transcript}"</small>
                ${accuracy < 80 ? `<br><small style="font-size:12px;">🎯 Correct: "${correctText}"</small>` : ''}
                ${accuracy < 80 ? `<br><small style="font-size:12px;color:var(--gold);">🔊 Listen to the teacher's voice above</small>` : ''}
            </div>
        `;
        
        this.accuracy = accuracy;
        this.updateStats();
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
                <p style="font-size:12px;color:var(--text-muted);margin-top:4px;">🎯 Verse ${this.currentVerseIndex + 1} of ${this.verses.length}</p>
            `;
        }
        
        document.getElementById('feedbackArea').innerHTML = `
            <div class="feedback-item hint">🎙️ Click "Start Recording" and recite the verse</div>
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
    window.aiModule = new AIModule();
    window.voiceAssistantModule = new VoiceAssistantModule();
    window.quranTeacherModule = new QuranTeacherModule();
});
