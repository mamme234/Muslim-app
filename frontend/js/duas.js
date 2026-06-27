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
                { 
                    arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
                    translation: 'O Allah, we have entered the morning with You, and we have entered the evening with You, and we live with You, and we die with You, and to You is the final return',
                    transliteration: 'Allahumma bika asbahna wa bika amsayna wa bika nahya wa bika namutu wa ilayka an-nushur',
                    reference: 'Sunan Abi Dawud 5068'
                },
                {
                    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا',
                    translation: 'O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds',
                    transliteration: 'Allahumma inni as'aluka 'ilman nafi'an wa rizqan tayyiban wa 'amalan mutaqabbalan',
                    reference: 'Sunan Ibn Majah 925'
                },
                {
                    arabic: 'اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ',
                    translation: 'O Allah, whatever blessing I or any of Your creation have received in the morning is from You alone, without any partner',
                    transliteration: 'Allahumma ma asbaha bi min ni'matin aw bi ahadin min khalqika faminka wahdaka la sharika lak',
                    reference: 'Sunan Abi Dawud 5074'
                },
                {
                    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ',
                    translation: 'O Allah, I seek refuge in You from anxiety and grief, and I seek refuge in You from incapacity and laziness',
                    transliteration: 'Allahumma inni a'udhu bika min al-hammi wal-hazani wa a'udhu bika min al-'ajzi wal-kasali',
                    reference: 'Sahih Bukhari 6369'
                }
            ],
            evening: [
                {
                    arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
                    translation: 'O Allah, we have entered the evening with You, and we have entered the morning with You, and we live with You, and we die with You, and to You is the final return',
                    transliteration: 'Allahumma bika amsayna wa bika asbahna wa bika nahya wa bika namutu wa ilayka al-masir',
                    reference: 'Sunan Abi Dawud 5069'
                },
                {
                    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا فِيهَا',
                    translation: 'O Allah, I ask You for the good of this night and the good of what is in it',
                    transliteration: 'Allahumma inni as'aluka khayra hadhihi al-laylati wa khayra ma fiha',
                    reference: 'Hisn al-Muslim'
                },
                {
                    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',
                    translation: 'We have entered the evening and all sovereignty belongs to Allah, and all praise is for Allah',
                    transliteration: 'Amsayna wa amsa al-mulku lillahi wal-hamdu lillah',
                    reference: 'Sahih Muslim 2718'
                },
                {
                    arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي اللَّهُمَّ عَافِنِي فِي سَمْعِي اللَّهُمَّ عَافِنِي فِي بَصَرِي',
                    translation: 'O Allah, grant my body well-being. O Allah, grant my hearing well-being. O Allah, grant my sight well-being',
                    transliteration: 'Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari',
                    reference: 'Sunan Abi Dawud 5090'
                }
            ],
            sleep: [
                {
                    arabic: 'اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا',
                    translation: 'O Allah, with Your name I die and I live',
                    transliteration: 'Allahumma bismika amutu wa ahya',
                    reference: 'Sahih Bukhari 7394'
                },
                {
                    arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
                    translation: 'O Allah, protect me from Your punishment on the day You resurrect Your servants',
                    transliteration: 'Allahumma qini 'adhabaka yawma tab'athu 'ibadak',
                    reference: 'Sahih Muslim 2719'
                },
                {
                    arabic: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ',
                    translation: 'With Your name, my Lord, I lay down my side and with You I raise it',
                    transliteration: 'Bismika Rabbi wada'tu janbi wa bika arfa'uhu',
                    reference: 'Sahih Bukhari 6320'
                }
            ],
            eating: [
                {
                    arabic: 'بِسْمِ اللَّهِ فِي أَوَّلِهِ وَآخِرِهِ',
                    translation: 'In the name of Allah at the beginning and at the end',
                    transliteration: 'Bismillahi fi awwalihi wa akhirihi',
                    reference: 'Sunan Abi Dawud 3767'
                },
                {
                    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
                    translation: 'Praise be to Allah who fed me this and provided it for me without any effort or power from me',
                    transliteration: 'Al-hamdu lillahi alladhi at'amani hadha wa razaqanihi min ghayri hawlin minni wa la quwwa',
                    reference: 'Sunan Abi Dawud 4023'
                }
            ],
            travel: [
                {
                    arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
                    translation: 'Glory to Him who has subjected this to us, and we could never have done it by ourselves. And surely to our Lord we will return',
                    transliteration: 'Subhana alladhi sakhkhara lana hadha wa ma kunna lahu muqrinin wa inna ila rabbina lamunqalibun',
                    reference: 'Surah Az-Zukhruf 43:13-14'
                },
                {
                    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ وَكَآبَةِ الْمَنْظَرِ',
                    translation: 'O Allah, I seek refuge in You from the difficulties of travel and the grief of returning',
                    transliteration: 'Allahumma inni a'udhu bika min wa'tha' as-safari wa ka'abat al-manzar',
                    reference: 'Sahih Muslim 1342'
                },
                {
                    arabic: 'اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ وَالْخَلِيفَةُ فِي الْأَهْلِ',
                    translation: 'O Allah, You are the companion on the journey and the successor for the family',
                    transliteration: 'Allahumma anta as-sahibu fi as-safari wal-khalifatu fi al-ahli',
                    reference: 'Sahih Muslim 1342'
                }
            ],
            illness: [
                {
                    arabic: 'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ',
                    translation: 'I ask Allah the Mighty, Lord of the Mighty Throne, to cure you',
                    transliteration: 'As'alu Allaha al-'azima rabba al-'arshi al-'azimi an yashfiyaka',
                    reference: 'Sunan Abi Dawud 3106'
                },
                {
                    arabic: 'اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَاسَ وَاشْفِ أَنْتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ',
                    translation: 'O Allah, Lord of mankind, remove the harm and heal. You are the Healer, there is no healing except Your healing',
                    transliteration: 'Allahumma rabba an-nasi adhhib al-ba'sa wa ishfi anta ash-shafi la shifa'a illa shifa'uka',
                    reference: 'Sahih Bukhari 5743'
                },
                {
                    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ',
                    translation: 'O Allah, I ask You for well-being in this world and the Hereafter',
                    transliteration: 'Allahumma inni as'aluka al-'afiyata fi ad-dunya wal-akhirah',
                    reference: 'Sunan Ibn Majah 3870'
                }
            ],
            marriage: [
                {
                    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا جُبِلَتْ عَلَيْهِ وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ مَا جُبِلَتْ عَلَيْهِ',
                    translation: 'O Allah, I ask You for her goodness and the goodness of what she was created for, and I seek refuge in You from her evil and the evil of what she was created for',
                    transliteration: 'Allahumma inni as'aluka khayraha wa khayra ma jubilat 'alayhi wa a'udhu bika min sharriha wa sharri ma jubilat 'alayhi',
                    reference: 'Sunan Abi Dawud 2160'
                },
                {
                    arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ',
                    translation: 'O Allah, bless us in what You have provided us and protect us from the punishment of the Fire',
                    transliteration: 'Allahumma barik lana fima razaqtana wa qina 'adhaba an-nar',
                    reference: 'Hisn al-Muslim'
                }
            ],
            hajj: [
                {
                    arabic: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ لَا شَرِيكَ لَكَ',
                    translation: 'Here I am, O Allah, here I am. Here I am, You have no partner, here I am. All praise and grace are Yours, and the kingdom, You have no partner',
                    transliteration: 'Labbayka Allahumma labbayk, labbayka la sharika laka labbayk, inna al-hamda wa an-ni'mata laka wal-mulk, la sharika lak',
                    reference: 'Sahih Muslim 1184'
                },
                {
                    arabic: 'اللَّهُمَّ اغْفِرْ لِي وَارْحَمْنِي وَتَجَاوَزْ عَنْ مَا تَعْلَمُ إِنَّكَ أَنْتَ الْأَعَزُّ الْأَكْرَمُ',
                    translation: 'O Allah, forgive me, have mercy on me, and overlook what You know. Indeed, You are the Most Mighty, the Most Generous',
                    transliteration: 'Allahumma ighfir li wa irhamni wa tajawaz 'amma ta'lamu innaka anta al-a'azzu al-akram',
                    reference: 'Hisn al-Muslim'
                },
                {
                    arabic: 'اللَّهُمَّ حَجَّةً لَا رِيَاءَ فِيهَا وَلَا سُمْعَةً',
                    translation: 'O Allah, a pilgrimage without showing off or seeking reputation',
                    transliteration: 'Allahumma hajjatan la riya'a fiha wa la sum'ah',
                    reference: 'Hisn al-Muslim'
                },
                {
                    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
                    translation: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire',
                    transliteration: 'Rabbana atina fi ad-dunya hasanatan wa fi al-akhirati hasanatan wa qina 'adhaba an-nar',
                    reference: 'Surah Al-Baqarah 2:201'
                }
            ],
            daily: [
                {
                    arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
                    translation: 'Praise be to Allah, Lord of all the worlds',
                    transliteration: 'Al-hamdu lillahi rabbi al-'alamin',
                    reference: 'Surah Al-Fatihah 1:2'
                },
                {
                    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ',
                    translation: 'Glory be to Allah and praise Him, glory be to Allah the Most Great',
                    transliteration: 'Subhana Allah wa bihamdihi, Subhana Allah al-'azim',
                    reference: 'Sahih Muslim 2693'
                },
                {
                    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
                    translation: 'There is no god but Allah alone, without any partner',
                    transliteration: 'La ilaha illa Allah wahdahu la sharika lah',
                    reference: 'Sahih Bukhari 3786'
                },
                {
                    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ',
                    translation: 'O Allah, send blessings upon Muhammad and upon the family of Muhammad',
                    transliteration: 'Allahumma salli 'ala Muhammad wa 'ala ali Muhammad',
                    reference: 'Sahih Bukhari 3370'
                },
                {
                    arabic: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ',
                    translation: 'My Lord, forgive me and accept my repentance, indeed You are the Acceptor of Repentance, the Most Merciful',
                    transliteration: 'Rabbi ighfir li wa tub 'alayya innaka anta at-tawwabu ar-rahim',
                    reference: 'Sunan Abi Dawud 1512'
                },
                {
                    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ',
                    translation: 'O Allah, I ask You for Paradise and I seek refuge in You from the Fire',
                    transliteration: 'Allahumma inni as'aluka al-jannata wa a'udhu bika min an-nar',
                    reference: 'Sunan Abi Dawud 792'
                }
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
        categories.forEach(cat => {
            counts[cat] = this.duaData[cat].length;
        });
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
            Object.values(this.duaData).forEach(catDuas => {
                duas = duas.concat(catDuas);
            });
        } else {
            duas = this.duaData[category] || [];
        }

        if (search) {
            const term = search.toLowerCase();
            duas = duas.filter(d => 
                d.arabic.includes(term) || 
                d.translation.toLowerCase().includes(term) ||
                d.transliteration.toLowerCase().includes(term)
            );
        }

        if (duas.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:40px;color:var(--text-muted);">
                    <i class="fas fa-hands-praying" style="font-size:48px;"></i>
                    <p>No duas found in this category</p>
                </div>
            `;
            return;
        }

        container.innerHTML = duas.map((dua, index) => {
            const isFavorite = this.favorites.some(f => f.arabic === dua.arabic);
            return `
                <div class="dua-item ${isFavorite ? 'favorite-dua' : ''}" data-index="${index}">
                    <div class="dua-arabic">${dua.arabic}</div>
                    <div class="dua-translation">"${dua.translation}"</div>
                    ${dua.transliteration ? `<div class="dua-transliteration">${dua.transliteration}</div>` : ''}
                    ${dua.reference ? `<div class="dua-reference">📚 ${dua.reference}</div>` : ''}
                    <div class="dua-actions">
                        <button class="favorite-btn" data-arbic="${dua.arabic}">
                            <i class="fas ${isFavorite ? 'fa-star' : 'fa-star-o'}"></i>
                            ${isFavorite ? 'Favorited' : 'Add to Favorites'}
                        </button>
                        <button class="copy-btn" data-text="${dua.arabic}">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                        <button class="share-btn" data-text="${dua.arabic} - ${dua.translation}">
                            <i class="fas fa-share-alt"></i> Share
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners
        container.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const arabic = btn.dataset.arbic;
                this.toggleFavorite(arabic);
            });
        });

        container.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.dataset.text;
                navigator.clipboard.writeText(text).then(() => {
                    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => {
                        btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                    }, 2000);
                });
            });
        });

        container.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.dataset.text;
                if (navigator.share) {
                    navigator.share({
                        title: 'Islamic Dua',
                        text: text
                    });
                } else {
                    navigator.clipboard.writeText(text).then(() => {
                        alert('Dua copied to clipboard!');
                    });
                }
            });
        });
    }

    toggleFavorite(arabic) {
        const index = this.favorites.findIndex(f => f.arabic === arabic);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            // Find the dua
            let found = null;
            Object.values(this.duaData).forEach(catDuas => {
                const match = catDuas.find(d => d.arabic === arabic);
                if (match) found = match;
            });
            if (found) {
                this.favorites.push(found);
            }
        }
        localStorage.setItem('favoriteDuas', JSON.stringify(this.favorites));
        this.renderFavorites();
        this.renderDuas(this.currentCategory);
    }

    renderFavorites() {
        const container = document.getElementById('favoriteDuas');
        if (!container) return;

        if (this.favorites.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:20px;color:var(--text-muted);font-size:14px;">
                    <i class="fas fa-star-o" style="font-size:24px;"></i>
                    <p>No favorite duas yet. Click the star icon on any dua to add it.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.favorites.map(dua => `
            <div class="dua-item favorite-dua" style="padding:12px 16px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <div class="dua-arabic" style="font-size:18px;">${dua.arabic}</div>
                        <div style="font-size:13px;color:var(--text-secondary);">${dua.translation}</div>
                    </div>
                    <button class="favorite-btn" data-arbic="${dua.arabic}" style="background:none;border:none;color:var(--gold);font-size:18px;cursor:pointer;">
                        <i class="fas fa-star"></i>
                    </button>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const arabic = btn.dataset.arbic;
                this.toggleFavorite(arabic);
            });
        });
    }

    setupCounter() {
        const number = document.getElementById('counterNumber');
        if (number) {
            number.textContent = this.counter;
        }

        document.getElementById('incrementCounter')?.addEventListener('click', () => {
            this.counter++;
            this.updateCounter();
        });

        document.getElementById('decrementCounter')?.addEventListener('click', () => {
            if (this.counter > 0) {
                this.counter--;
                this.updateCounter();
            }
        });

        document.getElementById('resetCounter')?.addEventListener('click', () => {
            this.counter = 0;
            this.updateCounter();
        });

        document.querySelectorAll('.counter-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const count = parseInt(btn.dataset.count);
                this.counter = count;
                this.updateCounter();
            });
        });
    }

    updateCounter() {
        const number = document.getElementById('counterNumber');
        if (number) {
            number.textContent = this.counter;
        }
        localStorage.setItem('adhkarCounter', this.counter.toString());
    }

    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('duaSearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.renderDuas(this.currentCategory, searchInput.value);
            });
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.duasModule = new DuasModule();
});
