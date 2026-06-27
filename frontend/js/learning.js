// ============================================
// LEARNING MODULE
// ============================================

class LearningModule {
    constructor() {
        this.courses = [
            {
                id: 'tajweed',
                title: 'Tajweed Course',
                description: 'Learn proper Quran recitation',
                icon: '📖',
                progress: 60,
                lessons: 12,
                completed: 7
            },
            {
                id: 'arabic',
                title: 'Arabic Course',
                description: 'Understand the language of the Quran',
                icon: '📝',
                progress: 35,
                lessons: 20,
                completed: 7
            },
            {
                id: 'seerah',
                title: 'Seerah Course',
                description: 'Life of Prophet Muhammad ﷺ',
                icon: '📜',
                progress: 20,
                lessons: 15,
                completed: 3
            },
            {
                id: 'history',
                title: 'Islamic History',
                description: 'Learn about Islamic civilization',
                icon: '🏛️',
                progress: 15,
                lessons: 10,
                completed: 1.5
            }
        ];
        this.achievements = [
            { icon: '📖', name: 'Quran Reader', earned: true },
            { icon: '🕌', name: '30 Days Prayer', earned: true },
            { icon: '🤲', name: 'Dua Master', earned: false },
            { icon: '📚', name: '50 Hadith', earned: false },
            { icon: '⭐', name: 'Tajweed Beginner', earned: true },
            { icon: '🔥', name: '7 Day Streak', earned: true }
        ];
        this.init();
    }

    init() {
        this.renderCourses();
        this.renderAchievements();
        this.setupEventListeners();
    }

    renderCourses() {
        const container = document.querySelector('.learning-courses');
        if (!container) return;

        container.innerHTML = this.courses.map(course => `
            <div class="course-card card" data-course="${course.id}">
                <div class="course-icon">${course.icon}</div>
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <div class="course-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${course.progress}%;"></div>
                    </div>
                    <span>${course.progress}% Complete (${course.completed}/${course.lessons} lessons)</span>
                </div>
                <button class="btn-primary course-continue" data-course="${course.id}">
                    ${course.progress === 0 ? 'Start Learning' : 'Continue Learning'}
                </button>
            </div>
        `).join('');

        container.querySelectorAll('.course-continue').forEach(btn => {
            btn.addEventListener('click', () => {
                const courseId = btn.dataset.course;
                this.openCourse(courseId);
            });
        });
    }

    openCourse(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        if (!course) return;

        showToast(`📚 Opening ${course.title}...`);
        
        // Simulate lesson content
        const lessonData = {
            tajweed: {
                title: 'Tajweed Lesson 1: Introduction',
                content: 'Tajweed is the science of proper Quran recitation. It involves:
• Correct pronunciation of Arabic letters
• Proper articulation points (Makharij)
• Rules of elongation (Madd)
• Characteristics of letters (Sifaat)'
            },
            arabic: {
                title: 'Arabic Lesson 1: Alphabet',
                content: 'The Arabic alphabet consists of 28 letters. Each letter has:
• A name
• A pronunciation
• Different forms based on position in a word'
            },
            seerah: {
                title: 'Seerah Lesson 1: Early Life',
                content: 'Prophet Muhammad ﷺ was born in 570 CE in Mecca. Key events:
• Orphaned at a young age
• Raised by his grandfather and uncle
• Known as Al-Amin (Trustworthy)
• Married Khadijah at age 25'
            },
            history: {
                title: 'Islamic History Lesson 1: The Golden Age',
                content: 'The Islamic Golden Age (8th-14th centuries) saw:
• Advancements in science and mathematics
• Preservation of knowledge
• Establishment of universities
• Cultural exchange'
            }
        };

        const data = lessonData[courseId] || lessonData.tajweed;
        
        // Create a modal/overlay for the lesson
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 3000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: fadeIn 0.3s ease;
        `;
        
        overlay.innerHTML = `
            <div style="background: var(--bg-card); border-radius: var(--radius); padding: 30px; max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="color: var(--text-primary);">${data.title}</h2>
                    <button onclick="this.closest('div[style]').parentElement.remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-secondary);">✕</button>
                </div>
                <div style="color: var(--text-secondary); line-height: 1.8; white-space: pre-wrap;">${data.content}</div>
                <button onclick="this.closest('div[style]').parentElement.remove(); showToast('📖 Lesson marked as complete!')" style="margin-top: 20px; padding: 12px 28px; background: var(--primary-gradient); color: white; border: none; border-radius: var(--radius-full); cursor: pointer; font-weight: 600; width: 100%;">
                    ✅ Mark as Complete
                </button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    renderAchievements() {
        const container = document.querySelector('.achievement-grid');
        if (!container) return;

        container.innerHTML = this.achievements.map(a => `
            <div class="achievement-item" style="${!a.earned ? 'opacity: 0.5;' : ''}">
                <i class="fas fa-${a.earned ? 'star' : 'star-o'}"></i>
                <span>${a.icon} ${a.name}</span>
                ${a.earned ? '<span style="font-size:11px;color:var(--primary);">✅ Earned</span>' : '<span style="font-size:11px;color:var(--text-muted);">🔒 Locked</span>'}
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Any additional event listeners
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.learningModule = new LearningModule();
});
