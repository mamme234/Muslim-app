// ============================================
// AI-ASSISTANT.JS - AI Chat, Voice Assistant
// ============================================

// ============================================
// AI ASSISTANT MODULE
// ============================================

class AIModule {
    constructor() {
        this.messages = [];
        this.conversationHistory = JSON.parse(localStorage.getItem('aiConversation') || '[]');
        this.isProcessing = false;
        this.init();
    }

    init() {
        if (this.conversationHistory.length > 0) {
            this.messages = this.conversationHistory;
            this.renderMessages();
        } else {
            this.addWelcomeMessage();
        }
        this.setupEvents();
    }

    addWelcomeMessage() {
        this.messages.push({
            role: 'bot',
            content: `Assalamu Alaikum! I'm your Islamic AI assistant.

I can help you with:
• 📖 Explaining Quran verses
• 📚 Clarifying Hadith
• 🕌 Islamic rulings and practices
• 🎓 Personalized learning plans

💡 Try asking: "Explain Surah Al-Fatihah"

📚 Sources: Quran, Sahih Hadith, Scholarly Consensus`
        });
        this.saveConversation();
        this.renderMessages();
    }

    setupEvents() {
        document.getElementById('aiSend')?.addEventListener('click', () => {
            this.handleUserInput();
        });

        document.getElementById('aiInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleUserInput();
            }
        });

        document.getElementById('aiVoice')?.addEventListener('click', () => {
            this.startVoiceInput();
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
            this.removeTypingIndicator();
            this.addMessage('bot', 'I apologize, but I encountered an error. Please try again.');
        }

        this.isProcessing = false;
        this.updateSendButton(false);
    }

    addMessage(role, content) {
        this.messages.push({ role, content, timestamp: new Date().toISOString() });
        this.saveConversation();
        this.renderMessages();
    }

    renderMessages() {
        const container = document.getElementById('aiMessages');
        if (!container) return;

        container.innerHTML = this.messages.map(msg => {
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
                        <div style="margin-top:6px;">
                            <button onclick="navigator.clipboard.writeText('${encodeURIComponent(msg.content)}')" 
                                style="background:none;border:none;color:var(--text-muted);font-size:12px;cursor:pointer;">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.scrollTop = container.scrollHeight;
    }

    formatContent(content) {
        return content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/• (.*?)(<br>|$)/g, '• $1$2');
    }

    showTypingIndicator() {
        const container = document.getElementById('aiMessages');
        if (!container) return;
        this.removeTypingIndicator();

        const indicator = document.createElement('div');
        indicator.className = 'ai-message bot';
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
            sendBtn.innerHTML = processing ? '<i class="fas fa-spinner fa-spin"></i>' : '<i class="fas fa-paper-plane"></i>';
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
            response = `The Five Pillars of Islam are:

1. **Shahada** - Declaration of faith
2. **Salah** - Five daily prayers
3. **Zakat** - Charity (2.5%)
4. **Sawm** - Fasting in Ramadan
5. **Hajj** - Pilgrimage to Mecca

📚 Sources: Quran & Sahih Hadith`;
        } else if (lower.includes('fatihah')) {
            response = `**Surah Al-Fatihah** - The Opening

• 7 verses, recited in every prayer
• Key verse: "Guide us to the straight path"

📚 Source: Quran 1:1-7`;
        } else if (lower.includes('patience') || lower.includes('sabr')) {
            response = `**Patience (Sabr)** in Islam:

• "Indeed, Allah is with the patient" (Quran 2:153)
• "And be patient, for your patience is from Allah" (Quran 16:127)

📚 Sources: Quran 2:153, 16:127`;
        } else {
            response = `Thank you for your question.

Please clarify what you'd like to know about:
• Islamic beliefs (Tawhid, Angels, Prophets)
• Acts of worship (Prayer, Fasting, Zakat, Hajj)
• Islamic ethics and morals
• Quranic verses and their meanings

📚 Sources: Quran, Sahih Hadith (Bukhari & Muslim)`;
        }

        return response;
    }

    startVoiceInput() {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.lang = 'en-US';
            recognition.continuous = false;
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('aiInput').value = transcript;
                this.handleUserInput();
            };
            recognition.start();
            showToast('🎤 Listening...', 'info');
        } else {
            showToast('⚠️ Voice input not supported', 'error');
        }
    }
}

// ============================================
// VOICE ASSISTANT MODULE
// ============================================

class VoiceAssistantModule {
    constructor() {
        this.messages = [];
        this.encouragements = [
            '💚 MashaAllah, excellent!',
            '🌟 Beautiful recitation!',
            '💛 Good effort, keep going!',
            '📖 Wonderful! You\'re improving!'
        ];
        this.init();
    }

    init() {
        this.renderMessages();
        this.setupEvents();
    }

    setupEvents() {
        document.getElementById('voiceInputBtn')?.addEventListener('click', () => {
            this.startVoiceInput();
        });

        document.getElementById('voiceSendBtn')?.addEventListener('click', () => {
            const input = document.getElementById('voiceTextInput');
            if (input.value.trim()) {
                this.addMessage('user', input.value.trim());
                this.processText(input.value.trim());
                input.value = '';
            }
        });

        document.getElementById('voiceTextInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('voiceSendBtn')?.click();
            }
        });
    }

    startVoiceInput() {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.lang = 'en-US';
            recognition.continuous = false;
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.addMessage('user', transcript);
                this.processText(transcript);
            };
            recognition.start();
            showToast('🎤 Listening...', 'info');
        } else {
            showToast('⚠️ Voice input not supported', 'error');
        }
    }

    processText(text) {
        const lower = text.toLowerCase();
        let response = '';
        
        if (lower.includes('recite') || lower.includes('read')) {
            response = this.getEncouragement() + ' Let me help you with recitation.';
        } else if (lower.includes('pray')) {
            response = this.getEncouragement() + ' Prayer is the second pillar of Islam.';
        } else if (lower.includes('dua')) {
            response = this.getEncouragement() + ' Duas are a beautiful way to connect with Allah.';
        } else {
            response = this.getEncouragement() + ' I\'m here to help you with your Islamic learning.';
        }
        
        setTimeout(() => {
            this.addMessage('bot', response);
        }, 500);
    }

    getEncouragement() {
        return this.encouragements[Math.floor(Math.random() * this.encouragements.length)];
    }

    addMessage(role, content) {
        this.messages.push({ role, content, timestamp: new Date().toISOString() });
        this.renderMessages();
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

    playYourVoice() {
        showToast('🔊 Playing your voice', 'info');
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    window.aiModule = new AIModule();
    window.voiceAssistantModule = new VoiceAssistantModule();
});
