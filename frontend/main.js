// ============================================
// MUSLIM APP - COMPLETE JAVASCRIPT
// ============================================

// ===== STATE =====
const state = {
    currentSection: 'home',
    darkMode: false,
    prayerTimes: {},
    quranSurahs: [],
    currentSurah: null,
    currentDuaCategory: 'morning',
    currentHadithCollection: 'bukhari',
    aiMessages: [],
    zakatRate: 0.025, // 2.5%
};

// ===== DOM REFS =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ============================================
// 1. SIDEBAR & NAVIGATION
// ============================================
function initNavigation() {
    const menuItems = $$('.menu-item, .bottom-nav-item');
    const sections = $$('.section');
    const pageTitle = $('#pageTitle');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            if (!section) return;

            // Update active states
            menuItems.forEach(el => el.classList.remove('active'));
            item.classList.add('active');

            // Show section
            sections.forEach(s => s.classList.remove('active'));
            const targetSection = document.getElementById(section);
            if (targetSection) targetSection.classList.add('active');

            // Update title
            const titleMap = {
                home: 'Home',
                quran: 'Quran',
                prayer: 'Prayer',
                duas: 'Duas & Adhkar',
                hadith: 'Hadith',
                learn: 'Learn Islam',
                ai: 'AI Assistant',
                videos: 'Videos',
                audio: 'Audio',
                community: 'Community',
                zakat: 'Zakat',
                ramadan: 'Ramadan',
                hajj: 'Hajj & Umrah',
                kids: 'Kids',
                profile: 'Profile',
                settings: 'Settings'
            };
            pageTitle.textContent = titleMap[section] || section;

            state.currentSection = section;

            // Close mobile sidebar
            document.getElementById('sidebar').classList.remove('open');
        });
    });

    // Menu toggle
    $('#menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });

    $('#closeSidebar').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
    });
}

// ============================================
// 2. THEME (DARK MODE)
// ============================================
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    state.darkMode = savedTheme === 'dark';
    applyTheme();

    $('#themeToggle').addEventListener('click', () => {
        state.darkMode = !state.darkMode;
        applyTheme();
        localStorage.setItem('theme', state.darkMode ? 'dark' : 'light');
    });

    const darkToggle = $('#darkModeToggle');
    if (darkToggle) {
        darkToggle.checked = state.darkMode;
        darkToggle.addEventListener('change', () => {
            state.darkMode = darkToggle.checked;
            applyTheme();
            localStorage.setItem('theme', state.darkMode ? 'dark' : 'light');
        });
    }
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.darkMode ? 'dark' : 'light');
    const icon = $('#themeToggle i');
    if (icon) {
        icon.className = state.darkMode ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ============================================
// 3. PRAYER TIMES & COUNTDOWN
// ============================================
async function initPrayerTimes() {
    try {
        // Using Aladhan API for accurate prayer times
        const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Mecca&country=Saudi%20Arabia&method=4');
        const data = await response.json();
        
        if (data.code === 200) {
            const timings = data.data.timings;
            state.prayerTimes = {
                fajr: timings.Fajr,
                dhuhr: timings.Dhuhr,
                asr: timings.Asr,
                maghrib: timings.Maghrib,
                isha: timings.Isha
            };
            updatePrayerTimesDisplay();
            startCountdown();
        }
    } catch (error) {
        console.warn('Using fallback prayer times', error);
        // Fallback times
        state.prayerTimes = {
            fajr: '5:12 AM',
            dhuhr: '12:34 PM',
            asr: '3:45 PM',
            maghrib: '6:20 PM',
            isha: '7:56 PM'
        };
        updatePrayerTimesDisplay();
        startCountdown();
    }
}

function updatePrayerTimesDisplay() {
    const times = state.prayerTimes;
    if (document.getElementById('fajrTime')) {
        document.getElementById('fajrTime').textContent = times.fajr;
        document.getElementById('dhuhrTime').textContent = times.dhuhr;
        document.getElementById('asrTime').textContent = times.asr;
        document.getElementById('maghribTime').textContent = times.maghrib;
        document.getElementById('ishaTime').textContent = times.isha;
    }
}

function startCountdown() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const now = new Date();
    const times = state.prayerTimes;
    const prayerNames = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    let nextPrayer = null;
    let nextTime = null;

    // Parse current time
    const nowHours = now.getHours();
    const nowMinutes = now.getMinutes();

    for (const name of prayerNames) {
        const timeStr = times[name];
        if (!timeStr) continue;
        
        // Parse time (handles both 12h and 24h)
        const parts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (!parts) continue;
        
        let hours = parseInt(parts[1]);
        const minutes = parseInt(parts[2]);
        const ampm = parts[3]?.toUpperCase();

        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;

        const prayerDate = new Date(now);
        prayerDate.setHours(hours, minutes, 0, 0);

        if (prayerDate > now) {
            if (!nextPrayer || prayerDate < nextTime) {
                nextPrayer = name;
                nextTime = prayerDate;
            }
        }
    }

    // If no prayer found, use Fajr next day
    if (!nextPrayer) {
        const fajrTime = times.fajr;
        const parts = fajrTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (parts) {
            let hours = parseInt(parts[1]);
            const minutes = parseInt(parts[2]);
            const ampm = parts[3]?.toUpperCase();
            if (ampm === 'PM' && hours < 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(hours, minutes, 0, 0);
            nextPrayer = 'fajr';
            nextTime = tomorrow;
        }
    }

    if (nextPrayer && nextTime) {
        const diff = Math.floor((nextTime - now) / 1000);
        if (diff > 0) {
            const hours = String(Math.floor(diff / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
            const seconds = String(diff % 60).padStart(2, '0');
            document.getElementById('prayerCountdown').textContent = `${hours}:${minutes}:${seconds}`;
            document.getElementById('nextPrayer').textContent = nextPrayer.charAt(0).toUpperCase() + nextPrayer.slice(1);
        }
    }
}

// ============================================
// 4. QIBLA COMPASS
// ============================================
function initQibla() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            // Mecca coordinates
            const meccaLat = 21.4225;
            const meccaLon = 39.8262;
            
            const dLon = meccaLon - lon;
            const x = Math.sin(dLon * Math.PI / 180) * Math.cos(meccaLat * Math.PI / 180);
            const y = Math.cos(lat * Math.PI / 180) * Math.sin(meccaLat * Math.PI / 180) -
                      Math.sin(lat * Math.PI / 180) * Math.cos(meccaLat * Math.PI / 180) * Math.cos(dLon * Math.PI / 180);
            let bearing = Math.atan2(x, y) * 180 / Math.PI;
            bearing = (bearing + 360) % 360;
            
            document.getElementById('qiblaDirection').textContent = `Qibla: ${bearing.toFixed(0)}° (${getDirection(bearing)})`;
            document.getElementById('qiblaNeedle').style.transform = `translate(-50%, -50%) rotate(${bearing}deg)`;
        }, () => {
            document.getElementById('qiblaDirection').textContent = 'Qibla: ~290° (Northwest)';
        });
    }
}

function getDirection(deg) {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(deg / 45) % 8;
    return dirs[index];
}

// ============================================
// 5. DAILY CONTENT
// ============================================
function initDailyContent() {
    // Daily Verse
    const verses = [
        { arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', translation: '"Indeed, with hardship comes ease"', ref: 'Surah Ash-Sharh 94:6' },
        { arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا', translation: '"And whoever fears Allah, He will make a way out for him"', ref: 'Surah At-Talaq 65:2' },
        { arabic: 'وَالَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ', translation: '"And those who believe and do righteous deeds"', ref: 'Surah Al-Baqarah 2:25' },
    ];
    const verse = verses[Math.floor(Math.random() * verses.length)];
    document.querySelector('#dailyVerse .arabic').textContent = verse.arabic;
    document.querySelector('#dailyVerse .translation').textContent = verse.translation;
    document.querySelector('#dailyVerse .reference').textContent = verse.ref;

    // Daily Hadith
    const hadiths = [
        { text: '"The best of you are those who are best to their families"', ref: 'Sunan Ibn Majah 1977' },
        { text: '"Whoever believes in Allah and the Last Day, let him speak good or remain silent"', ref: 'Sahih Bukhari 6018' },
        { text: '"The strong person is not the one who can wrestle, but the one who controls himself at times of anger"', ref: 'Sahih Bukhari 6114' },
    ];
    const hadith = hadiths[Math.floor(Math.random() * hadiths.length)];
    document.querySelector('#dailyHadith .hadith-text').textContent = hadith.text;
    document.querySelector('#dailyHadith .hadith-reference').textContent = hadith.ref;

    // Daily Dua
    const duas = [
        { arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا', translation: '"O Allah, I ask You for beneficial knowledge"' },
        { arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ', translation: '"O Allah, I ask You for well-being"' },
        { arabic: 'رَبِّ زِدْنِي عِلْمًا', translation: '"My Lord, increase me in knowledge"' },
    ];
    const dua = duas[Math.floor(Math.random() * duas.length)];
    document.querySelector('#dailyDua .dua-arabic').textContent = dua.arabic;
    document.querySelector('#dailyDua .dua-translation').textContent = dua.translation;
}

// ============================================
// 6. QURAN
// ============================================
async function initQuran() {
    try {
        const response = await fetch('https://api.alquran.cloud/v1/meta');
        const data = await response.json();
        if (data.code === 200) {
            state.quranSurahs = data.data.surahs;
            renderSurahList();
        }
    } catch (error) {
        console.warn('Using fallback surah list', error);
        // Fallback surah list
        state.quranSurahs = [
            { number: 1, name: 'Al-Fatihah', englishName: 'The Opener', verses: 7 },
            { number: 2, name: 'Al-Baqarah', englishName: 'The Cow', verses: 286 },
            { number: 3, name: 'Aal-Imran', englishName: 'Family of Imran', verses: 200 },
            { number: 4, name: 'An-Nisa', englishName: 'The Women', verses: 176 },
            { number: 5, name: 'Al-Maidah', englishName: 'The Table', verses: 120 },
        ];
        renderSurahList();
    }
}

function renderSurahList() {
    const container = document.getElementById('surahList');
    if (!container) return;
    
    container.innerHTML = state.quranSurahs.map(surah => `
        <div class="surah-item card" data-surah="${surah.number}">
            <div class="surah-info">
                <span class="surah-number">${surah.number}</span>
                <span class="surah-name">${surah.name}</span>
                <span class="surah-english">${surah.englishName}</span>
            </div>
            <span class="surah-verses">${surah.verses} verses</span>
        </div>
    `).join('');

    container.querySelectorAll('.surah-item').forEach(item => {
        item.addEventListener('click', () => {
            const surahNum = parseInt(item.dataset.surah);
            loadSurah(surahNum);
        });
    });
}

async function loadSurah(number) {
    try {
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${number}`);
        const data = await response.json();
        if (data.code === 200) {
            const surah = data.data;
            displayQuran(surah);
        }
    } catch (error) {
        console.error('Error loading surah:', error);
    }
}

function displayQuran(surah) {
    const viewer = document.getElementById('quranViewer');
    const textContainer = document.getElementById('quranText');
    viewer.style.display = 'block';
    
    textContainer.innerHTML = `
        <h2>${surah.name} (${surah.englishName})</h2>
        <p class="surah-revelation">${surah.revelationType} · ${surah.numberOfAyahs} verses</p>
        ${surah.ayahs.map(ayah => `
            <div class="ayah">
                <span class="ayah-number">${ayah.numberInSurah}</span>
                <span class="ayah-text">${ayah.text}</span>
            </div>
        `).join('')}
    `;

    document.getElementById('closeQuranViewer').addEventListener('click', () => {
        viewer.style.display = 'none';
    });
}

// ============================================
// 7. DUAS
// ============================================
function initDuas() {
    const duaData = {
        morning: [
            { arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا', translation: 'O Allah, we have entered the morning with You' },
            { arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا', translation: 'O Allah, I ask You for beneficial knowledge' },
        ],
        evening: [
            { arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا', translation: 'O Allah, we have entered the evening with You' },
            { arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ', translation: 'O Allah, I ask You for well-being' },
        ],
        sleep: [
            { arabic: 'اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا', translation: 'O Allah, with Your name I die and live' },
            { arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ', translation: 'O Allah, protect me from Your punishment on the day You resurrect Your servants' },
        ],
        eating: [
            { arabic: 'بِسْمِ اللَّهِ', translation: 'In the name of Allah' },
            { arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي', translation: 'Praise be to Allah who fed me' },
        ],
        travel: [
            { arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا', translation: 'Glory to Him who has subjected this to us' },
        ],
        illness: [
            { arabic: 'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ', translation: 'I ask Allah the Mighty, Lord of the Mighty Throne, to cure you' },
        ],
        marriage: [
            { arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا جُبِلَتْ عَلَيْهِ', translation: 'O Allah, I ask You for her goodness and the goodness of what she was created for' },
        ],
        hajj: [
            { arabic: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ', translation: 'Here I am, O Allah, here I am' },
            { arabic: 'اللَّهُمَّ اغْفِرْ لِي وَارْحَمْنِي', translation: 'O Allah, forgive me and have mercy on me' },
        ],
    };

    const categories = $$('.dua-cat');
    const list = document.getElementById('duaList');

    function renderDuas(category) {
        const duas = duaData[category] || duaData.morning;
        list.innerHTML = duas.map(d => `
            <div class="dua-item">
                <div class="dua-arabic">${d.arabic}</div>
                <div class="dua-translation">${d.translation}</div>
            </div>
        `).join('');
    }

    categories.forEach(btn => {
        btn.addEventListener('click', () => {
            categories.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentDuaCategory = btn.dataset.cat;
            renderDuas(state.currentDuaCategory);
        });
    });

    renderDuas('morning');
}

// ============================================
// 8. HADITH
// ============================================
function initHadith() {
    const hadithData = {
        bukhari: [
            { text: '"The best of you are those who are best to their families"', ref: 'Sahih Bukhari' },
            { text: '"Whoever believes in Allah and the Last Day, let him speak good or remain silent"', ref: 'Sahih Bukhari' },
            { text: '"The strong person is not the one who can wrestle, but the one who controls himself at times of anger"', ref: 'Sahih Bukhari' },
        ],
        muslim: [
            { text: '"The best of people are those who are most beneficial to others"', ref: 'Sahih Muslim' },
            { text: '"A good word is charity"', ref: 'Sahih Muslim' },
        ],
        abudawud: [
            { text: '"The best of you are those who are best to their families"', ref: 'Sunan Abi Dawud' },
        ],
        tirmidhi: [
            { text: '"The most beloved of deeds to Allah are those done consistently"', ref: 'Sunan Tirmidhi' },
        ],
    };

    const buttons = $$('.collection-btn');
    const list = document.getElementById('hadithList');

    function renderHadith(collection) {
        const hadiths = hadithData[collection] || hadithData.bukhari;
        list.innerHTML = hadiths.map(h => `
            <div class="hadith-item">
                <div class="hadith-text">${h.text}</div>
                <div class="hadith-reference">${h.ref}</div>
            </div>
        `).join('');
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentHadithCollection = btn.dataset.collection;
            renderHadith(state.currentHadithCollection);
        });
    });

    renderHadith('bukhari');
}

// ============================================
// 9. AI ASSISTANT
// ============================================
function initAI() {
    const input = document.getElementById('aiInput');
    const sendBtn = document.getElementById('aiSend');
    const messages = document.getElementById('aiMessages');

    function addMessage(text, isUser = false) {
        const div = document.createElement('div');
        div.className = `ai-message ${isUser ? 'user' : 'bot'}`;
        div.innerHTML = `<div class="message-content">${text}</div>`;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    function getAIResponse(query) {
        // Simple AI responses - in production, this would call an API
        const responses = {
            'salah': 'Salah (prayer) is the second pillar of Islam. It is obligatory for all Muslims to pray 5 times a day: Fajr, Dhuhr, Asr, Maghrib, and Isha.',
            'zakat': 'Zakat is the third pillar of Islam. It is an obligatory charity of 2.5% of one\'s savings and wealth, given to those in need.',
            'hajj': 'Hajj is the fifth pillar of Islam. It is a pilgrimage to Mecca that every Muslim must perform at least once in their lifetime if they are physically and financially able.',
            'quran': 'The Quran is the holy book of Islam, revealed to Prophet Muhammad ﷺ over 23 years. It contains 114 surahs and is a complete guide for humanity.',
            'default': 'I understand your question. Let me provide a comprehensive answer based on Islamic teachings. Could you please clarify your question so I can give you a more specific response?'
        };

        const lowerQuery = query.toLowerCase();
        let response = responses.default;
        for (const [key, value] of Object.entries(responses)) {
            if (lowerQuery.includes(key)) {
                response = value + '\n\n📚 Source: Quran and Sahih Hadith (Bukhari & Muslim)';
                break;
            }
        }
        return response;
    }

    async function handleAIQuery() {
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, true);
        input.value = '';

        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-message bot';
        typingDiv.innerHTML = `<div class="message-content">⏳ Thinking...</div>`;
        messages.appendChild(typingDiv);
        messages.scrollTop = messages.scrollHeight;

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        // Remove typing indicator
        messages.removeChild(typingDiv);

        const response = getAIResponse(text);
        addMessage(response, false);
    }

    sendBtn.addEventListener('click', handleAIQuery);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAIQuery();
    });
}

// ============================================
// 10. ZAKAT CALCULATOR
// ============================================
function initZakat() {
    const calculateBtn = document.getElementById('calculateZakat');
    if (!calculateBtn) return;

    calculateBtn.addEventListener('click', () => {
        const savings = parseFloat(document.getElementById('zakatSavings').value) || 0;
        const gold = parseFloat(document.getElementById('zakatGold').value) || 0;
        const silver = parseFloat(document.getElementById('zakatSilver').value) || 0;

        // Nisab values (approximate)
        const goldNisab = 85; // grams
        const silverNisab = 595; // grams
        const goldPrice = 60; // $ per gram (approx)
        const silverPrice = 0.75; // $ per gram (approx)

        const goldValue = gold * goldPrice;
        const silverValue = silver * silverPrice;
        const totalWealth = savings + goldValue + silverValue;

        // Check if wealth reaches Nisab
        const nisabValue = goldNisab * goldPrice;
        let zakatDue = 0;
        let message = '';

        if (totalWealth >= nisabValue) {
            zakatDue = totalWealth * state.zakatRate;
            message = `✅ You are eligible to pay Zakat. Your Zakat is: <strong>$${zakatDue.toFixed(2)}</strong>`;
        } else {
            const shortfall = (nisabValue - totalWealth).toFixed(2);
            message = `⚠️ Your wealth ($${totalWealth.toFixed(2)}) is below the Nisab threshold ($${nisabValue.toFixed(2)}). You are not required to pay Zakat this year.`;
        }

        document.getElementById('zakatResult').innerHTML = `
            <div class="zakat-details">
                <p>Total Wealth: $${totalWealth.toFixed(2)}</p>
                <p>Nisab Threshold: $${nisabValue.toFixed(2)}</p>
                <p>${message}</p>
            </div>
        `;
    });
}

// ============================================
// 11. VIDEO & AUDIO
// ============================================
function initVideos() {
    const videos = [
        { title: 'Beautiful Quran Recitation', channel: 'Quran Central', thumbnail: '📖' },
        { title: 'Learn Surah Al-Fatihah', channel: 'Islamic Academy', thumbnail: '🕌' },
        { title: 'Duas for Daily Life', channel: 'Dua Channel', thumbnail: '🤲' },
        { title: 'Stories of the Prophets', channel: 'Islamic History', thumbnail: '📜' },
    ];

    const grid = document.getElementById('videoGrid');
    if (!grid) return;

    grid.innerHTML = videos.map(v => `
        <div class="video-item">
            <div class="video-thumbnail">${v.thumbnail}</div>
            <div class="video-info">
                <h4>${v.title}</h4>
                <p>${v.channel}</p>
            </div>
        </div>
    `).join('');
}

function initAudio() {
    const audioItems = [
        { title: 'Quran Recitation - Surah Al-Baqarah', duration: '45:20' },
        { title: 'Islamic Lecture - Tawhid', duration: '32:15' },
        { title: 'Morning Adhkar', duration: '08:30' },
        { title: 'Dua for Protection', duration: '05:45' },
        { title: 'Seerah of Prophet ﷺ', duration: '28:00' },
    ];

    const list = document.getElementById('audioList');
    if (!list) return;

    list.innerHTML = audioItems.map(item => `
        <div class="audio-item">
            <span>${item.title}</span>
            <span style="color: var(--text-muted);">${item.duration}</span>
        </div>
    `).join('');
}

// ============================================
// 12. RAMADAN TRACKER
// ============================================
function initRamadan() {
    // Simulate Ramadan tracking
    const today = new Date();
    const ramadanStart = new Date(2026, 2, 1); // March 1, 2026
    const dayDiff = Math.floor((today - ramadanStart) / (1000 * 60 * 60 * 24));
    const ramadanDay = Math.min(Math.max(dayDiff + 1, 1), 30);
    
    const dayElement = document.querySelector('.day-number');
    const fastingDays = document.querySelector('#fastingDays');
    const progressBar = document.querySelector('.fasting-tracker progress');

    if (dayElement) dayElement.textContent = ramadanDay;
    if (fastingDays) fastingDays.textContent = Math.min(ramadanDay, 30);
    if (progressBar) progressBar.value = Math.min(ramadanDay, 30);
}

// ============================================
// 13. SETTINGS - COLOR THEME
// ============================================
function initColorThemes() {
    const colorOptions = $$('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            const color = option.dataset.color;
            document.documentElement.style.setProperty('--primary', color);
            document.documentElement.style.setProperty('--primary-light', color + 'cc');
            document.documentElement.style.setProperty('--primary-dark', color + '99');
            localStorage.setItem('primaryColor', color);
        });
    });

    const savedColor = localStorage.getItem('primaryColor');
    if (savedColor) {
        document.documentElement.style.setProperty('--primary', savedColor);
        document.documentElement.style.setProperty('--primary-light', savedColor + 'cc');
        document.documentElement.style.setProperty('--primary-dark', savedColor + '99');
    }
}

// ============================================
// 14. NOTIFICATIONS
// ============================================
function initNotifications() {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    // Simulate notifications for prayer times
    setInterval(() => {
        const now = new Date();
        const minutes = now.getMinutes();
        // Check every 5 minutes
        if (minutes % 5 === 0 && minutes !== 0) {
            const times = state.prayerTimes;
            for (const [name, time] of Object.entries(times)) {
                if (time) {
                    const parts = time.match(/(\d+):(\d+)/);
                    if (parts) {
                        const h = parseInt(parts[1]);
                        const m = parseInt(parts[2]);
                        if (now.getHours() === h && now.getMinutes() === m) {
                            showNotification(`🕌 ${name.charAt(0).toUpperCase() + name.slice(1)} prayer time!`);
                        }
                    }
                }
            }
        }
    }, 60000);
}

function showNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Muslim App Reminder', {
            body: message,
            icon: '🕌',
        });
    }
}

// ============================================
// 15. PRAYER TRACKER
// ============================================
function initPrayerTracker() {
    const checkboxes = document.querySelectorAll('.prayer-checkboxes input');
    const trackerKey = 'prayerTracker';
    
    // Load saved state
    const saved = JSON.parse(localStorage.getItem(trackerKey) || '{}');
    checkboxes.forEach((cb, index) => {
        const prayerName = cb.parentElement.textContent.trim();
        if (saved[prayerName]) {
            cb.checked = true;
        }
        cb.addEventListener('change', () => {
            const state = {};
            checkboxes.forEach(c => {
                const name = c.parentElement.textContent.trim();
                state[name] = c.checked;
            });
            localStorage.setItem(trackerKey, JSON.stringify(state));
            updatePrayerProgress();
        });
    });
    updatePrayerProgress();
}

function updatePrayerProgress() {
    const checkboxes = document.querySelectorAll('.prayer-checkboxes input');
    const total = checkboxes.length;
    const checked = document.querySelectorAll('.prayer-checkboxes input:checked').length;
    const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;
    
    // Update streak or progress display if needed
    const statItems = document.querySelectorAll('.stat-item .stat-number');
    if (statItems.length > 0 && statItems[2]) {
        statItems[2].textContent = `${percentage}%`;
    }
}

// ============================================
// 16. SEARCH FUNCTIONALITY
// ============================================
function initSearch() {
    // Quran search
    const quranSearch = document.getElementById('quranSearch');
    if (quranSearch) {
        quranSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const items = document.querySelectorAll('.surah-item');
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(query) ? 'flex' : 'none';
            });
        });
    }

    // Hadith search
    const hadithSearch = document.getElementById('hadithSearch');
    if (hadithSearch) {
        hadithSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const items = document.querySelectorAll('.hadith-item');
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(query) ? 'block' : 'none';
            });
        });
    }
}

// ============================================
// 17. KEYBOARD SHORTCUTS
// ============================================
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl + / to focus AI input
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            const aiInput = document.getElementById('aiInput');
            if (aiInput) {
                aiInput.focus();
                // Switch to AI section
                document.querySelector('[data-section="ai"]')?.click();
            }
        }
        // Esc to close sidebar
        if (e.key === 'Escape') {
            document.getElementById('sidebar')?.classList.remove('open');
        }
    });
}

// ============================================
// 18. INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌙 Muslim App starting...');

    // Initialize all modules
    initNavigation();
    initTheme();
    initColorThemes();
    initDailyContent();
    await initPrayerTimes();
    initQibla();
    await initQuran();
    initDuas();
    initHadith();
    initAI();
    initZakat();
    initVideos();
    initAudio();
    initRamadan();
    initNotifications();
    initPrayerTracker();
    initSearch();
    initKeyboardShortcuts();

    console.log('✅ Muslim App ready!');
});
