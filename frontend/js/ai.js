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
        this.setupEventListeners();
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
• "How to perform Wudu?"

📚 Sources: Quran, Sahih Hadith (Bukhari & Muslim), Scholarly Consensus`
        };
        this.messages.push(welcomeMessage);
        this.saveConversation();
        this.renderMessages();
    }

    setupEventListeners() {
        const input = document.getElementById('aiInput');
        const sendBtn = document.getElementById('aiSend');

        sendBtn?.addEventListener('click', () => this.handleUserInput());
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleUserInput();
            }
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

        if (this.messages.length === 0) {
            this.addWelcomeMessage();
            return;
        }

        container.innerHTML = this.messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const content = msg.content || '';
            
            const hasSources = content.includes('📚 Sources:');
            const parts = hasSources ? content.split('📚 Sources:') : [content];
            const mainContent = parts[0] || content;
            const sources = parts[1] || '';

            return `
                <div class="ai-message ${isUser ? 'user' : 'bot'}" data-index="${index}">
                    <div class="message-content">
                        <div style="white-space:pre-wrap;">${this.formatContent(mainContent)}</div>
                        ${sources ? `<div class="sources" style="font-size:12px;color:var(--text-muted);margin-top:8px;padding-top:8px;border-top:1px solid var(--border-color);">📚 Sources: ${sources}</div>` : ''}
                        <div class="message-actions" style="display:flex;gap:8px;margin-top:8px;">
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
                    setTimeout(() => {
                        btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                    }, 2000);
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
                <div class="typing-indicator" style="display:flex;gap:4px;padding:8px 12px;">
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
        if (indicator) {
            indicator.remove();
        }
    }

    updateSendButton(processing) {
        const sendBtn = document.getElementById('aiSend');
        if (sendBtn) {
            sendBtn.disabled = processing;
            sendBtn.innerHTML = processing ? 
                '<i class="fas fa-spinner fa-spin"></i> Thinking...' : 
                '<i class="fas fa-paper-plane"></i> Send';
        }
    }

    saveConversation() {
        if (this.messages.length > 50) {
            this.messages = this.messages.slice(-50);
        }
        localStorage.setItem('aiConversation', JSON.stringify(this.messages));
    }

    async getAIResponse(question) {
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

        const lower = question.toLowerCase();
        let response = '';

        if (lower.includes('pillar') || lower.includes('islam') && lower.includes('pillar')) {
            response = `The Five Pillars of Islam are the foundation of Muslim life:

1. **Shahada** (Faith) - Declaration of faith: "There is no god but Allah, and Muhammad is the Messenger of Allah"

2. **Salah** (Prayer) - Performing the five daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha)

3. **Zakat** (Charity) - Giving 2.5% of savings to those in need

4. **Sawm** (Fasting) - Fasting during the month of Ramadan

5. **Hajj** (Pilgrimage) - Performing pilgrimage to Mecca at least once in a lifetime if able

📚 Sources: Quran & Sahih Hadith (Bukhari & Muslim)`;
        }
        else if (lower.includes('fatihah') || lower.includes('al-fatihah')) {
            response = `**Surah Al-Fatihah** (The Opening) is the first chapter of the Quran and consists of 7 verses. It is the most recited surah in daily prayers.

**Summary:**
• Verse 1: Praise to Allah, Lord of all worlds
• Verse 2: The Most Gracious, Most Merciful
• Verse 3: Master of the Day of Judgment
• Verse 4: Only You we worship and only You we ask for help
• Verse 5: Guide us to the straight path
• Verse 6-7: The path of those who received Your favor

This surah is a powerful dua for guidance and is essential in every prayer.

📚 Source: Quran 1:1-7`;
        }
        else if (lower.includes('patience') || lower.includes('sabr')) {
            response = `**Patience (Sabr)** is a fundamental virtue in Islam. The Quran emphasizes patience in many verses:

• **"Indeed, Allah is with the patient"** (Quran 2:153)

• **"And be patient, for your patience is but from Allah"** (Quran 16:127)

• **"And We will surely test you with something of fear, hunger, loss of wealth, lives, and fruits, but give glad tidings to the patient"** (Quran 2:155)

📚 Sources: Quran 2:153, 16:127, 2:155`;
        }
        else if (lower.includes('prophet') && (lower.includes('muhammad') || lower.includes('محمد'))) {
            response = `**Prophet Muhammad ﷺ** (570-632 CE) is the final prophet and messenger of Allah.

**Key Facts:**
• Born in Mecca, Arabia
• Received the first revelation at age 40 in Cave Hira
• Spent 23 years spreading the message of Islam
• Known as Al-Amin (the Trustworthy) even before prophethood
• His character was described as the Quran walking on earth

📚 Sources: Quran, Sahih Bukhari, Sahih Muslim`;
        }
        else if (lower.includes('ramadan')) {
            response = `**Ramadan** is the 9th month of the Islamic calendar and the most sacred month for Muslims.

**Significance:**
• The Quran was first revealed during Ramadan
• Fasting (Sawm) is obligatory for all adult Muslims
• Night prayers (Tarawih) are performed
• Increased charity and good deeds

**Key Dates:**
• Laylat al-Qadr (Night of Power) - better than 1000 months
• Eid al-Fitr - celebration at the end of Ramadan

📚 Source: Quran 2:183-185`;
        }
        else if (lower.includes('wudu') || lower.includes('ablution')) {
            response = `**Wudu** (Ablution) is the ritual purification performed before prayer.

**Steps of Wudu:**

1. **Intention** (Niyyah) - Make the intention in your heart
2. **Say "Bismillah"** - "In the name of Allah"
3. **Wash hands** - 3 times, up to the wrists
4. **Rinse mouth** - 3 times
5. **Rinse nose** - 3 times
6. **Wash face** - 3 times
7. **Wash forearms** - 3 times, up to elbows
8. **Wipe head** - Once, with wet hands
9. **Wipe ears** - Inside and outside
10. **Wash feet** - 3 times, up to ankles

📚 Source: Quran 5:6, Sahih Hadith`;
        }
        else if (lower.includes('zakat')) {
            response = `**Zakat** (Charity) is the third pillar of Islam and an obligatory act of worship.

**Key Points:**
• 2.5% of savings and wealth
• Paid annually on wealth that reaches Nisab (minimum threshold)
• Given to specific categories of people (Quran 9:60)

**Benefits:**
1. Purifies wealth
2. Helps the poor and needy
3. Strengthens community bonds

📚 Sources: Quran 9:60, Sahih Hadith`;
        }
        else {
            response = `Thank you for your question. I will provide a comprehensive answer based on Islamic sources.

The topic you're asking about is important in Islam. I would recommend:

1. **Quran** - The primary source of guidance
2. **Sunnah** - The teachings of Prophet Muhammad ﷺ
3. **Scholarly Consensus** - The agreement of Islamic scholars

Could you please clarify your question so I can give you a more specific response? You can ask about:
• Islamic beliefs (Tawhid, Angels, Prophets)
• Acts of worship (Prayer, Fasting, Zakat, Hajj)
• Islamic ethics and morals
• Quranic verses and their meanings
• Prophetic traditions (Hadith)

📚 Sources: Quran, Sahih Hadith (Bukhari & Muslim)`;
        }

        return response;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.aiModule = new AIModule();
});
