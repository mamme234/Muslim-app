// ============================================
// DUAS & ADHKAR MODULE
// ============================================

class DuasModule {
    constructor() {
        this.currentCategory = 'all';
        this.favorites = JSON.parse(localStorage.getItem('favoriteDuas') || '[]');
        this.counter = parseInt(localStorage.getItem('adhkarCounter') || '0');
        this.duaData = {
            morning: [
                { arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا', translation: 'O Allah, we have entered the morning with You', reference: 'Sunan Abi Dawud 5068' },
                { arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا', translation: 'O Allah, I ask You for beneficial knowledge', reference: 'Sunan Ibn Majah 925' },
                { arabic: 'اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ', translation: 'O Allah, whatever blessing I have received', reference: 'Sunan Abi Dawud 5074' }
            ],
            evening: [
                { arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا', translation: 'O Allah, we have entered the evening with You', reference: 'Sunan Abi Dawud 5069' },
                { arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ', translation: 'We have entered the evening and all sovereignty belongs to Allah', reference: 'Sahih Muslim 2718' }
            ],
            sleep: [
                { arabic: 'اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا', translation: 'O Allah, with Your name I die and I live', reference: 'Sahih Bukhari 7394' },
                { arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ', translation: 'O Allah, protect me from Your punishment', reference: 'Sahih Muslim 2719' }
            ],
            eating: [
                { arabic: 'بِسْمِ اللَّهِ فِي أَوَّلِهِ وَآخِرِهِ', translation: 'In the name of Allah at the beginning and at the end', reference: 'Sunan Abi Dawud 3767' },
                { arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي', translation: 'Praise be to Allah who fed me', reference: 'Sunan Abi Dawud 4023' }
            ],
            travel: [
                { arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا', translation: 'Glory to Him who has subjected this to us', reference: 'Surah Az-Zukhruf 43:13' },
                { arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ', translation: 'O Allah, I seek refuge in You from the difficulties of travel', reference: 'Sahih Muslim 1342' }
            ],
            illness: [
                { arabic: 'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ', translation: 'I ask Allah the Mighty, Lord of the Mighty Throne, to cure you', reference: 'Sunan Abi Dawud 3106' },
                { arabic: 'اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَاسَ', translation: 'O Allah, Lord of mankind, remove the harm', reference: 'Sahih Bukhari 5743' }
            ],
            marriage: [
                { arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا جُبِلَتْ عَلَيْهِ', translation: 'O Allah, I ask You for her goodness', reference: 'Sunan Abi Dawud 2160' }
            ],
            hajj: [
                { arabic: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ', translation: 'Here I am, O Allah, here I am', reference: 'Sahih Muslim 1184' },
                { arabic: 'اللَّهُمَّ اغْفِرْ لِي وَارْحَمْنِي', translation: 'O Allah, forgive me and have mercy on me', reference: 'Hisn al-Muslim' }
            ],
            daily: [
                { arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: 'Praise be to Allah, Lord of all the worlds', reference: 'Surah Al-Fatihah 1:2' },
                { arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', translation: 'Glory be to Allah and praise Him', reference: 'Sahih Muslim 2693' },
                { arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ', translation: 'There is no god but Allah alone', reference: 'Sahih Bukhari 3786' }
            ]
        };
        this.init();
    }

    init() {
        this.renderCategories();
        this.renderDuas('all');
        this.renderFavorites();
        this.setupCounter();
        this.setupEventListeners();
    }

    renderCategories() {
        const container = document.getElementById('duaCategories');
        if (!container) return;

        const categories = Object.keys(this.duaData);
        const counts = {};
        categories.forEach(cat => { counts[cat] = this.duaData[cat].length; });
        const total = categories.reduce((sum, cat) => sum + counts[cat], 0);

        container.innerHTML = `
            <button class="dua-cat active" data-cat="all">All <span class="category-count">(${total})</span></button>
            ${categories.map(cat => `
                <button class="dua-cat" data-cat="${cat}">
                    ${cat.charAt(0).toUpperCase() + cat.slice(1)} 
                    <span class="category-count">(${counts[cat]})</span>
                </button>
            `).join('')}
        `;

        container.querySelectorAll('.dua-cat').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.dua-cat').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.cat;
                this.renderDuas(this.currentCategory);
            });
        });
    }

    renderDuas(category, search = '') {
        const container = document.getElementById('duaList');
        if (!container) return;

        let duas = [];
        if (category === 'all') {
            Object.values(this.duaData).forEach(catDuas => { duas = duas.concat(catDuas); });
        } else {
            duas = this.duaData[category] || [];
        }

        if (search) {
            const term = search.toLowerCase();
            duas = duas.filter(d => d.arabic.includes(term) || d.translation.toLowerCase().includes(term));
        }

        if (duas.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);">
                <i class="fas fa-hands-praying" style="font-size:48px;"></i>
                <p>No duas found in this category</p>
            </div>`;
            return;
        }

        container.innerHTML = duas.map((dua, index) => {
            const isFavorite = this.favorites.some(f => f.arabic === dua.arabic);
            return `
                <div class="dua-item ${isFavorite ? 'favorite-dua' : ''}" data-index="${index}">
                    <div class="dua-arabic">${dua.arabic}</div>
                    <div class="dua-translation">"${dua.translation}"</div>
                    ${dua.reference ? `<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">📚 ${dua.reference}</div>` : ''}
                    <div class="dua-actions">
                        <button class="favorite-btn" data-arbic="${encodeURIComponent(dua.arabic)}">
                            <i class="fas ${isFavorite ? 'fa-star' : 'fa-star-o'}"></i>
                            ${isFavorite ? 'Favorited' : 'Add to Favorites'}
                        </button>
                        <button class="copy-btn" data-text="${encodeURIComponent(dua.arabic)}">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const arabic = decodeURIComponent(btn.dataset.arbic);
                this.toggleFavorite(arabic);
            });
        });

        container.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = decodeURIComponent(btn.dataset.text);
                navigator.clipboard.writeText(text).then(() => {
                    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i> Copy'; }, 2000);
                });
            });
        });
    }

    toggleFavorite(arabic) {
        const index = this.favorites.findIndex(f => f.arabic === arabic);
        if (index > -1) {
            this.favorites.splice(index, 1);
            showToast('Removed from favorites');
        } else {
            let found = null;
            Object.values(this.duaData).forEach(catDuas => {
                const match = catDuas.find(d => d.arabic === arabic);
                if (match) found = match;
            });
            if (found) { this.favorites.push(found); showToast('⭐ Added to favorites'); }
        }
        localStorage.setItem('favoriteDuas', JSON.stringify(this.favorites));
        this.renderFavorites();
        this.renderDuas(this.currentCategory);
    }

    renderFavorites() {
        const container = document.getElementById('favoriteDuas');
        if (!container) return;

        if (this.favorites.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:14px;">
                <i class="fas fa-star-o" style="font-size:24px;"></i>
                <p>No favorite duas yet. Click the star icon on any dua to add it.</p>
            </div>`;
            return;
        }

        container.innerHTML = this.favorites.map(dua => `
            <div class="dua-item favorite-dua" style="padding:12px 16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <div class="dua-arabic" style="font-size:18px;">${dua.arabic}</div>
                        <div style="font-size:13px;color:var(--text-secondary);">${dua.translation}</div>
                    </div>
                    <button class="favorite-btn" data-arbic="${encodeURIComponent(dua.arabic)}" style="background:none;border:none;color:var(--gold);font-size:18px;cursor:pointer;">
                        <i class="fas fa-star"></i>
                    </button>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const arabic = decodeURIComponent(btn.dataset.arbic);
                this.toggleFavorite(arabic);
            });
        });
    }

    setupCounter() {
        const number = document.getElementById('counterNumber');
        if (number) number.textContent = this.counter;

        document.getElementById('incrementCounter')?.addEventListener('click', () => {
            this.counter++;
            this.updateCounter();
        });

        document.getElementById('decrementCounter')?.addEventListener('click', () => {
            if (this.counter > 0) { this.counter--; this.updateCounter(); }
        });

        document.getElementById('resetCounter')?.addEventListener('click', () => {
            this.counter = 0;
            this.updateCounter();
        });

        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.counter = parseInt(btn.dataset.count);
                this.updateCounter();
                showToast(`🔄 Counter set to ${this.counter}`);
            });
        });
    }

    updateCounter() {
        const number = document.getElementById('counterNumber');
        if (number) number.textContent = this.counter;
        localStorage.setItem('adhkarCounter', this.counter.toString());
    }

    setupEventListeners() {
        const searchInput = document.getElementById('duaSearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.renderDuas(this.currentCategory, searchInput.value);
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.duasModule = new DuasModule();
});
