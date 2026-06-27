// ============================================
// VOICE ASSISTANT WITH YOUR VOICE
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
            '📖 Wonderful! You\'re improving!',
            '🤲 May Allah bless your efforts!',
            '⭐ Excellent, continue!',
            '✨ MashaAllah, very good!',
            '🕌 You\'re doing great!'
        ];
        this.init();
    }

    init() {
        this.renderMessages();
        this.setupEventListeners();
        this.initSpeechRecognition();
        this.addWelcomeMessage();
        this.createVoiceStatusUI();
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
                if (event.error === 'not-allowed') {
                    showToast('⚠️ Please allow microphone access');
                }
            };
        }
    }

    setupEventListeners() {
        document.getElementById('voiceInputBtn')?.addEventListener('click', () => {
            this.toggleRecording();
        });

        document.getElementById('voiceSendBtn')?.addEventListener('click', () => {
            const input = document.getElementById('voiceTextInput');
            if (input.value.trim()) {
                this.addMessage('user', input.value.trim());
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

    // ===== YOUR VOICE METHODS =====

    createVoiceStatusUI() {
        const voiceCard = document.querySelector('.voice-assistant-card');
        if (!voiceCard) return;

        const statusDiv = document.createElement('div');
        statusDiv.style.cssText = `
            padding: 12px 16px;
            background: var(--primary-bg);
            border-radius: var(--radius-sm);
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
        `;
        statusDiv.innerHTML = `
            <span>
                <i class="fas fa-check-circle" style="color:var(--primary);"></i> 
                ✅ Your voice is loaded: <strong>Voice 004.m4a</strong>
            </span>
            <button onclick="window.voiceAssistantModule?.playYourVoice()" style="padding:6px 16px;background:var(--primary);color:white;border:none;border-radius:50px;cursor:pointer;">
                <i class="fas fa-play"></i> Test Voice
            </button>
        `;
        
        const chatDiv = voiceCard.querySelector('.voice-chat');
        if (chatDiv) {
            voiceCard.insertBefore(statusDiv, chatDiv);
        }
    }

    // Play your voice
    playYourVoice() {
        try {
            const audio = new Audio('js/Voice 004.m4a');
            audio.play();
            showToast('🔊 Playing your voice');
            return true;
        } catch (e) {
            console.error('Error playing voice:', e);
            this.speakWithYourVoice();
            return false;
        }
    }

    // Fallback
    speakWithYourVoice() {
        if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance('Bismillah, repeat after me');
            utterance.lang = 'ar-SA';
            utterance.rate = 0.8;
            window.speechSynthesis.speak(utterance);
        }
    }

    // Use your voice for corrections
    correctWithYourVoice() {
        this.playYourVoice();
        this.addMessage('bot', '🔊 Listen to the teacher\'s voice for correct pronunciation.');
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
            try {
                this.recognition.stop();
            } catch (e) {
                console.error('Error stopping recognition:', e);
            }
        }
        this.isRecording = false;
        const btn = document.getElementById('voiceInputBtn');
        btn.innerHTML = '<i class="fas fa-microphone"></i> Speak';
        btn.style.background = '';
        showToast('⏹️ Listening stopped');
    }

    processVoiceInput(transcript) {
        if (transcript.trim()) {
            this.addMessage('user', transcript);
            this.processTextInput(transcript);
        }
    }

    processTextInput(text) {
        const lower = text.toLowerCase();
        let response = '';
        
        if (lower.includes('recite') || lower.includes('read') || lower.includes('quran')) {
            response = this.getRandomEncouragement() + ' Let me help you with recitation. Listen to the teacher.';
            this.correctWithYourVoice();
        } else if (lower.includes('pray') || lower.includes('salah')) {
            response = this.getRandomEncouragement() + ' Prayer is the second pillar of Islam.';
        } else if (lower.includes('dua') || lower.includes('supplication')) {
            response = this.getRandomEncouragement() + ' Duas are a beautiful way to connect with Allah.';
        } else if (lower.includes('mistake') || lower.includes('wrong')) {
            response = this.getRandomEncouragement() + ' Let me help you correct that.';
            this.correctWithYourVoice();
        } else {
            response = this.getRandomEncouragement() + ' I\'m here to help you with your Islamic learning journey.';
        }
        
        setTimeout(() => {
            this.addMessage('bot', response);
        }, 500);
    }

    getRandomEncouragement() {
        return this.encouragements[Math.floor(Math.random() * this.encouragements.length)];
    }

    addMessage(role, content) {
        const message = { role, content, timestamp: new Date().toISOString() };
        this.messages.push(message);
        this.renderMessages();
        
        if (role === 'bot') {
            this.speakResponse(content);
        }
    }

    renderMessages() {
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

    speakResponse(text) {
        if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            utterance.pitch = 1.1;
            window.speechSynthesis.speak(utterance);
        }
    }

    addWelcomeMessage() {
        this.addMessage('bot', 'Assalamu Alaikum! I\'m your voice assistant. Your teacher\'s voice is loaded and ready to help you with recitation. 🎙️');
        
        setTimeout(() => {
            this.addMessage('bot', '💡 You can say: "Recite Quran", "Teach me a Dua", "Help me with prayer", or "Correct my recitation"');
        }, 1000);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.voiceAssistantModule = new VoiceAssistantModule();
});
