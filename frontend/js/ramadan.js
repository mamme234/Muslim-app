// ============================================
// RAMADAN MODULE
// ============================================

class RamadanModule {
    constructor() {
        this.ramadanStart = new Date(2026, 2, 1); // March 1, 2026
        this.ramadanEnd = new Date(2026, 2, 30); // March 30, 2026
        this.today = new Date();
        this.fastingDays = JSON.parse(localStorage.getItem('ramadanFastingDays') || '[]');
        this.init();
    }

    init() {
        this.updateRamadanInfo();
        this.setupEventListeners();
        this.renderGoals();
    }

    updateRamadanInfo() {
        const dayDiff = Math.floor((this.today - this.ramadanStart) / (1000 * 60 * 60 * 24));
        const ramadanDay = Math.min(Math.max(dayDiff + 1, 1), 30);
        
        const dayElement = document.querySelector('.ramadan-days-left');
        const fastingDaysElement = document.getElementById('fastingDays');
        const progressBar = document.querySelector('.fasting-tracker .progress-fill');
        const progressText = document.querySelector('.fasting-tracker span');

        // Calculate days fasted
        const daysFasted = this.fastingDays.length;

        if (dayElement) {
            const daysLeft = Math.max(30 - ramadanDay, 0);
            dayElement.textContent = `${daysLeft} Days Left`;
        }

        if (fastingDaysElement) {
            fastingDaysElement.textContent = daysFasted;
        }

        if (progressBar) {
            const progress = Math.min((daysFasted / 30) * 100, 100);
            progressBar.style.width = `${progress}%`;
        }

        if (progressText) {
            progressText.textContent = `${Math.round((daysFasted / 30) * 100)}% Complete`;
        }

        // Update ramadan times
        const suhoorEl = document.querySelector('.ramadan-times div:first-child');
        const iftarEl = document.querySelector('.ramadan-times div:last-child');
        if (suhoorEl) suhoorEl.innerHTML = `<i class="fas fa-utensils"></i> Suhoor: 4:45 AM`;
        if (iftarEl) iftarEl.innerHTML = `<i class="fas fa-moon"></i> Iftar: 6:30 PM`;
    }

    renderGoals() {
        const container = document.querySelector('.ramadan-planner');
        if (!container) return;

        const goals = [
            { icon: '📖', text: 'Read 1 Juz', completed: this.isGoalCompleted('readJuz') },
            { icon: '📿', text: '100 Tasbeeh', completed: this.isGoalCompleted('tasbeeh') },
            { icon: '💧', text: '8 glasses water', completed: this.isGoalCompleted('water') },
            { icon: '🤲', text: 'Dua for forgiveness', completed: this.isGoalCompleted('dua') }
        ];

        const goalList = container.querySelector('.goal-list') || document.createElement('div');
        goalList.className = 'goal-list';
        goalList.innerHTML = goals.map(g => `
            <div class="goal-item" style="display:flex;align-items:center;gap:10px;padding:6px 0;opacity:${g.completed ? '0.7' : '1'};">
                <input type="checkbox" ${g.completed ? 'checked' : ''} onchange="window.ramadanModule?.toggleGoal('${g.text}')" style="width:18px;height:18px;accent-color:var(--primary);cursor:pointer;">
                <span style="${g.completed ? 'text-decoration:line-through;color:var(--text-muted);' : 'color:var(--text-primary);'}">${g.icon} ${g.text}</span>
                ${g.completed ? '<span style="font-size:11px;color:var(--primary);">✅ Done</span>' : ''}
            </div>
        `).join('');

        if (!container.querySelector('.goal-list')) {
            container.appendChild(goalList);
        }
    }

    isGoalCompleted(goalId) {
        const completed = JSON.parse(localStorage.getItem('ramadanGoals') || '{}');
        return completed[goalId] || false;
    }

    toggleGoal(goalText) {
        const goals = {
            'Read 1 Juz': 'readJuz',
            '100 Tasbeeh': 'tasbeeh',
            '8 glasses water': 'water',
            'Dua for forgiveness': 'dua'
        };

        const goalId = goals[goalText];
        if (!goalId) return;

        const completed = JSON.parse(localStorage.getItem('ramadanGoals') || '{}');
        completed[goalId] = !completed[goalId];
        localStorage.setItem('ramadanGoals', JSON.stringify(completed));
        
        showToast(completed[goalId] ? '✅ Goal completed! MashaAllah!' : 'Goal unchecked');
        this.renderGoals();
    }

    toggleFasting() {
        const today = new Date().toISOString().split('T')[0];
        const index = this.fastingDays.indexOf(today);
        
        if (index > -1) {
            this.fastingDays.splice(index, 1);
            showToast('Fasting day unchecked');
        } else {
            this.fastingDays.push(today);
            showToast('✅ Fasting day tracked! May Allah accept it.');
        }
        
        localStorage.setItem('ramadanFastingDays', JSON.stringify(this.fastingDays));
        this.updateRamadanInfo();
    }

    setupEventListeners() {
        // Add click to toggle fasting when clicking on the ramadan card
        const ramadanCard = document.querySelector('.ramadan-card');
        if (ramadanCard) {
            ramadanCard.addEventListener('dblclick', () => {
                this.toggleFasting();
            });
        }

        // Quick toggle button in the header
        const daysLeft = document.querySelector('.ramadan-days-left');
        if (daysLeft) {
            daysLeft.style.cursor = 'pointer';
            daysLeft.title = 'Click to toggle fasting for today';
            daysLeft.addEventListener('click', () => {
                this.toggleFasting();
            });
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.ramadanModule = new RamadanModule();
});
