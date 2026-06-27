// ============================================
// PRAYER MODULE
// ============================================

class PrayerModule {
    constructor() {
        this.prayerTimes = {};
        this.prayerNames = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        this.prayerDisplayNames = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };
        this.trackedPrayers = JSON.parse(localStorage.getItem('trackedPrayers') || '{}');
        this.init();
    }

    async init() {
        await this.loadPrayerTimes();
        this.renderPrayerTimes();
        this.startCountdown();
        this.setupPrayerTracker();
        this.initQibla();
        this.setupEventListeners();
    }

    async loadPrayerTimes() {
        try {
            const data = await API.prayer.getTimes({ city: 'Mecca', country: 'Saudi Arabia', method: 4 });
            if (data.success) {
                this.prayerTimes = {
                    fajr: data.data.fajr,
                    dhuhr: data.data.dhuhr,
                    asr: data.data.asr,
                    maghrib: data.data.maghrib,
                    isha: data.data.isha
                };
            }
        } catch (error) {
            console.warn('Using fallback prayer times', error);
            this.prayerTimes = { fajr: '5:12 AM', dhuhr: '12:34 PM', asr: '3:45 PM', maghrib: '6:20 PM', isha: '7:56 PM' };
        }
        this.renderPrayerTimes();
    }

    renderPrayerTimes() {
        const container = document.getElementById('prayerTimesList');
        if (!container) return;

        const nextPrayer = this.getNextPrayer();

        container.innerHTML = this.prayerNames.map(name => {
            const time = this.prayerTimes[name] || '--:--';
            const isActive = name === nextPrayer;
            return `<div class="prayer-time-item ${isActive ? 'active' : ''}">
                <span>${this.prayerDisplayNames[name]}</span>
                <span class="time">${time}</span>
            </div>`;
        }).join('');
    }

    getNextPrayer() {
        const now = new Date();
        let next = null;
        let nextTime = null;

        for (const name of this.prayerNames) {
            const timeStr = this.prayerTimes[name];
            if (!timeStr) continue;

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
                if (!nextTime || prayerDate < nextTime) { next = name; nextTime = prayerDate; }
            }
        }

        if (!next) {
            const fajrTime = this.prayerTimes.fajr;
            if (fajrTime) {
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
                    next = 'fajr';
                }
            }
        }

        return next;
    }

    startCountdown() {
        this.updateCountdown();
        setInterval(() => this.updateCountdown(), 1000);
    }

    updateCountdown() {
        const now = new Date();
        const nextPrayer = this.getNextPrayer();
        if (!nextPrayer) return;

        const timeStr = this.prayerTimes[nextPrayer];
        if (!timeStr) return;

        const parts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (!parts) return;

        let hours = parseInt(parts[1]);
        const minutes = parseInt(parts[2]);
        const ampm = parts[3]?.toUpperCase();

        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;

        const prayerDate = new Date(now);
        prayerDate.setHours(hours, minutes, 0, 0);

        if (prayerDate <= now) prayerDate.setDate(prayerDate.getDate() + 1);

        const diff = Math.floor((prayerDate - now) / 1000);
        if (diff > 0) {
            const h = String(Math.floor(diff / 3600)).padStart(2, '0');
            const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
            const s = String(diff % 60).padStart(2, '0');
            const countdownEl = document.getElementById('prayerCountdown');
            if (countdownEl) countdownEl.textContent = `${h}:${m}:${s}`;
        }
    }

    setupPrayerTracker() {
        const container = document.getElementById('prayerCheckboxes');
        if (!container) return;

        const today = new Date().toISOString().split('T')[0];
        const todayTracked = this.trackedPrayers[today] || [];

        container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            const name = cb.value;
            if (todayTracked.includes(name)) {
                cb.checked = true;
                cb.parentElement.classList.add('checked');
            }

            cb.addEventListener('change', () => {
                if (cb.checked) {
                    cb.parentElement.classList.add('checked');
                    this.trackPrayer(name);
                } else {
                    cb.parentElement.classList.remove('checked');
                    this.untrackPrayer(name);
                }
                this.updatePrayerProgress();
            });
        });

        document.getElementById('resetPrayerTracker')?.addEventListener('click', () => {
            const today = new Date().toISOString().split('T')[0];
            this.trackedPrayers[today] = [];
            localStorage.setItem('trackedPrayers', JSON.stringify(this.trackedPrayers));
            container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
                cb.parentElement.classList.remove('checked');
            });
            this.updatePrayerProgress();
            showToast('🔄 Prayer tracker reset');
        });

        this.updatePrayerProgress();
    }

    async trackPrayer(name) {
        const today = new Date().toISOString().split('T')[0];
        if (!this.trackedPrayers[today]) this.trackedPrayers[today] = [];
        
        if (!this.trackedPrayers[today].includes(name)) {
            this.trackedPrayers[today].push(name);
            localStorage.setItem('trackedPrayers', JSON.stringify(this.trackedPrayers));
            
            try {
                await API.prayer.track({ prayerName: name, date: today });
            } catch (error) { console.error('Error tracking prayer:', error); }
            
            if (this.trackedPrayers[today].length === 5) {
                showToast('🎉 All 5 prayers completed today! MashaAllah!');
            }
        }
    }

    untrackPrayer(name) {
        const today = new Date().toISOString().split('T')[0];
        if (this.trackedPrayers[today]) {
            this.trackedPrayers[today] = this.trackedPrayers[today].filter(p => p !== name);
            localStorage.setItem('trackedPrayers', JSON.stringify(this.trackedPrayers));
        }
    }

    updatePrayerProgress() {
        const container = document.getElementById('prayerCheckboxes');
        if (!container) return;

        const checked = container.querySelectorAll('input[type="checkbox"]:checked').length;
        const total = container.querySelectorAll('input[type="checkbox"]').length;
        const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;

        document.getElementById('prayerProgress').textContent = percentage;
    }

    initQibla() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const data = await API.prayer.getQibla({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                    if (data.success) {
                        document.getElementById('qiblaDirection').textContent = `Qibla: ${data.data.bearing}° (${data.data.direction})`;
                        document.getElementById('qiblaNeedle').style.transform = `translate(-50%, -50%) rotate(${data.data.bearing}deg)`;
                    }
                } catch (error) {
                    console.error('Error getting qibla:', error);
                    this.setFallbackQibla();
                }
            }, () => { this.setFallbackQibla(); });
        } else {
            this.setFallbackQibla();
        }
    }

    setFallbackQibla() {
        document.getElementById('qiblaDirection').textContent = 'Qibla: ~290° (Northwest)';
    }

    setupEventListeners() {
        document.getElementById('findMosques')?.addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(() => {
                    showToast('📍 Finding mosques near your location...');
                }, () => {
                    showToast('⚠️ Please enable location to find nearby mosques');
                });
            } else {
                showToast('⚠️ Location services not available');
            }
        });

        setInterval(() => {
            const now = new Date();
            if (now.getSeconds() === 0) {
                for (const [name, time] of Object.entries(this.prayerTimes)) {
                    if (time) {
                        const parts = time.match(/(\d+):(\d+)/);
                        if (parts) {
                            const h = parseInt(parts[1]);
                            const m = parseInt(parts[2]);
                            if (now.getHours() === h && now.getMinutes() === m) {
                                this.showAdhan(name);
                            }
                        }
                    }
                }
            }
        }, 1000);
    }

    showAdhan(prayerName) {
        const displayName = this.prayerDisplayNames[prayerName] || prayerName;
        showToast(`🕌 ${displayName} prayer time!`);
        
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Muslim App', { body: `🕌 ${displayName} prayer time!`, icon: '🕌' });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.prayerModule = new PrayerModule();
});
