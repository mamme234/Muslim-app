// ============================================
// PRAYER MODULE
// ============================================

class PrayerModule {
    constructor() {
        this.prayerTimes = {};
        this.prayerNames = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        this.prayerDisplayNames = {
            fajr: 'Fajr',
            dhuhr: 'Dhuhr',
            asr: 'Asr',
            maghrib: 'Maghrib',
            isha: 'Isha'
        };
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
        this.checkFriday();
    }

    async loadPrayerTimes() {
        try {
            const response = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Mecca&country=Saudi%20Arabia&method=4');
            const data = await response.json();
            if (data.code === 200) {
                const timings = data.data.timings;
                this.prayerTimes = {
                    fajr: timings.Fajr,
                    dhuhr: timings.Dhuhr,
                    asr: timings.Asr,
                    maghrib: timings.Maghrib,
                    isha: timings.Isha
                };
            }
        } catch (error) {
            console.warn('Using fallback prayer times', error);
            this.prayerTimes = {
                fajr: '5:12 AM',
                dhuhr: '12:34 PM',
                asr: '3:45 PM',
                maghrib: '6:20 PM',
                isha: '7:56 PM'
            };
        }
    }

    renderPrayerTimes() {
        const container = document.getElementById('prayerTimesList');
        if (!container) return;

        // Find next prayer
        const nextPrayer = this.getNextPrayer();
        const nextName = nextPrayer ? this.prayerDisplayNames[nextPrayer] : '';

        container.innerHTML = this.prayerNames.map(name => {
            const time = this.prayerTimes[name] || '--:--';
            const isActive = name === nextPrayer;
            return `
                <div class="prayer-time-item ${isActive ? 'active' : ''}">
                    <span>${this.prayerDisplayNames[name]}</span>
                    <span class="time">${time}</span>
                </div>
            `;
        }).join('');

        // Update next prayer name
        const nextNameEl = document.getElementById('nextPrayerName');
        if (nextNameEl && nextPrayer) {
            nextNameEl.textContent = this.prayerDisplayNames[nextPrayer];
        }
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
                if (!nextTime || prayerDate < nextTime) {
                    next = name;
                    nextTime = prayerDate;
                }
            }
        }

        // If no prayer found, use Fajr next day
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
        let nextPrayer = this.getNextPrayer();
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

        // If prayer time is in the past, set to next day
        if (prayerDate <= now) {
            prayerDate.setDate(prayerDate.getDate() + 1);
        }

        const diff = Math.floor((prayerDate - now) / 1000);
        if (diff > 0) {
            const h = String(Math.floor(diff / 3600)).padStart(2, '0');
            const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
            const s = String(diff % 60).padStart(2, '0');
            document.getElementById('prayerCountdown').textContent = `${h}:${m}:${s}`;
        } else {
            document.getElementById('prayerCountdown').textContent = '00:00:00';
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

        // Reset button
        document.getElementById('resetPrayerTracker')?.addEventListener('click', () => {
            const today = new Date().toISOString().split('T')[0];
            this.trackedPrayers[today] = [];
            localStorage.setItem('trackedPrayers', JSON.stringify(this.trackedPrayers));
            container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
                cb.parentElement.classList.remove('checked');
            });
            this.updatePrayerProgress();
        });

        this.updatePrayerProgress();
    }

    trackPrayer(name) {
        const today = new Date().toISOString().split('T')[0];
        if (!this.trackedPrayers[today]) {
            this.trackedPrayers[today] = [];
        }
        if (!this.trackedPrayers[today].includes(name)) {
            this.trackedPrayers[today].push(name);
            localStorage.setItem('trackedPrayers', JSON.stringify(this.trackedPrayers));
            
            // Check if all 5 prayers are completed
            if (this.trackedPrayers[today].length === 5) {
                this.showNotification('🎉 All 5 prayers completed today!');
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
                
                document.getElementById('qiblaDirection').textContent = `Qibla: ${bearing.toFixed(0)}° (${this.getDirection(bearing)})`;
                document.getElementById('qiblaNeedle').style.transform = `translate(-50%, -50%) rotate(${bearing}deg)`;
            }, () => {
                document.getElementById('qiblaDirection').textContent = 'Qibla: ~290° (Northwest)';
            });
        }
    }

    getDirection(deg) {
        const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(deg / 45) % 8;
        return dirs[index];
    }

    checkFriday() {
        const today = new Date();
        const day = today.getDay();
        const fridayReminder = document.getElementById('fridayReminder');
        
        if (day === 5) { // Friday
            fridayReminder.style.display = 'block';
        } else {
            fridayReminder.style.display = 'block';
            fridayReminder.querySelector('h4').textContent = 'Next Jumu\'ah: Friday';
            fridayReminder.querySelector('p').textContent = 'Set a reminder for Friday prayer';
        }
    }

    setupEventListeners() {
        // Friday reminder button
        document.getElementById('fridayReminderBtn')?.addEventListener('click', () => {
            this.showNotification('🕌 Friday prayer reminder set for 1:30 PM');
        });

        // Find mosques
        document.getElementById('findMosques')?.addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    this.showNotification('📍 Finding mosques near your location...');
                    // In production, use a mosque API
                }, () => {
                    this.showNotification('⚠️ Please enable location to find nearby mosques');
                });
            } else {
                this.showNotification('⚠️ Location services not available');
            }
        });

        // Check for adhan time
        setInterval(() => {
            const now = new Date();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            
            // Check at the start of each minute
            if (seconds === 0) {
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
        this.showNotification(`🕌 ${displayName} prayer time!`);
        
        // Play adhan sound (in production)
        // const audio = new Audio('adhan.mp3');
        // audio.play();
    }

    showNotification(message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Muslim App', {
                body: message,
                icon: '🕌'
            });
        } else if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        // Also show in UI
        const existing = document.querySelector('.toast-notification');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-card);
            padding: 12px 24px;
            border-radius: var(--radius-full);
            box-shadow: var(--shadow-hover);
            z-index: 9999;
            font-weight: 500;
            border-left: 4px solid var(--primary);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.prayerModule = new PrayerModule();
});
