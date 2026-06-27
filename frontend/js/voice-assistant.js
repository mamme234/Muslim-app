// ============================================
// VOICE ASSISTANT MODULE
// ============================================

class VoiceAssistantModule {
    constructor() {
        this.isRecording = false;
        this.recognition = null;
        this.voiceProfileSet = false;
        this.messages = [];
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
        this.checkVoiceProfile();
        this.addWelcomeMessage();
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

        document.getElementById('setupVoice')?.addEventListener('click', () => {
            this.setupVoiceProfile();
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
        document.getElementById('voiceInputBtn').innerHTML = '<i class="fas fa-stop"></i> Stop';
        document.getElementById('voiceInputBtn').style.background = '#ef4444';
        
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
        document.getElementById('voiceInputBtn').innerHTML = '<i class="fas fa-microphone"></i> Speak';
        document.getElementById('voiceInputBtn').style.background = '';
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
        
        // Check for Quran recitation requests
        if (lower.includes('recite') || lower.includes('read') || lower.includes('quran')) {
            response = this.getRandomEncouragement() + ' Let me help you with recitation. Would you like to practice a specific verse?';
        }
        // Check for prayer questions
        else if (lower.includes('pray') || lower.includes('salah') || lower.includes('prayer')) {
            response = this.getRandomEncouragement() + ' Prayer is the second pillar of Islam. It connects us with Allah. Would you like me to explain the steps of Wudu or the prayer times?';
        }
        // Check for dua requests
        else if (lower.includes('dua') || lower.includes('supplication')) {
            response = this.getRandomEncouragement() + ' Duas are a beautiful way to connect with Allah. Here\'s a simple dua you can recite: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan waqina azaban-nar."';
        }
        // General response
        else {
            response = this.getRandomEncouragement() + ' Thank you for asking. I\'m here to help you with your Islamic learning journey. Could you clarify your question?';
        }
        
        // Add bot response with delay for natural feel
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
        
        // Speak the response if it's from bot
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

    setupVoiceProfile() {
        if (!this.recognition) {
            showToast('⚠️ Speech recognition not available');
            return;
        }

        showToast('🎙️ Please recite "Bismillah" to set up your voice profile');
        
        // Set up a one-time recording
        const tempRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        tempRecognition.lang = 'en-US';
        tempRecognition.continuous = false;
        
        tempRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (transcript.toLowerCase().includes('bismillah')) {
                this.voiceProfileSet = true;
                document.getElementById('voiceStatus').innerHTML = `
                    <span class="status-dot active"></span>
                    <span style="color:var(--primary);">✅ Voice profile set successfully!</span>
                `;
                document.getElementById('setupVoice').textContent = '✅ Profile Set';
                document.getElementById('setupVoice').style.background = 'var(--primary)';
                showToast('✅ Voice profile created! Your voice will be used for feedback.');
            } else {
                showToast('⚠️ Please say "Bismillah" to set up your profile');
            }
        };
        
        tempRecognition.start();
        setTimeout(() => {
            try { tempRecognition.stop(); } catch (e) {}
        }, 5000);
    }

    checkVoiceProfile() {
        const savedProfile = localStorage.getItem('voiceProfileSet');
        if (savedProfile === 'true') {
            this.voiceProfileSet = true;
            document.getElementById('voiceStatus').innerHTML = `
                <span class="status-dot active"></span>
                <span style="color:var(--primary);">✅ Voice profile active</span>
            `;
            document.getElementById('setupVoice').textContent = '✅ Profile Set';
            document.getElementById('setupVoice').style.background = 'var(--primary)';
        }
    }

    addWelcomeMessage() {
        this.addMessage('bot', 'Assalamu Alaikum! I\'m your voice assistant. I\'ll help you with recitation and provide encouraging feedback. 🎙️');
        
        setTimeout(() => {
            this.addMessage('bot', '💡 You can say: "Recite Quran", "Teach me a Dua", or "Help me with prayer"');
        }, 1000);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.voiceAssistantModule = new VoiceAssistantModule();
});
