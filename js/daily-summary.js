/**
 * End-of-day Glass Stat Card
 * Shows daily summary with glass styling
 */

class DailySummaryManager {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    init() {
        this.createDailySummaryElement();
        this.setupAutoShow();
        this.isInitialized = true;
    }

    /**
     * Create the daily summary element
     */
    createDailySummaryElement() {
        const summary = document.createElement('div');
        summary.id = 'dailySummary';
        summary.className = 'daily-summary';
        summary.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            background: var(--glass-color);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 25px 50px var(--shadow-color);
            z-index: 10000;
            opacity: 0;
            transition: all 0.3s ease;
            display: none;
        `;

        summary.innerHTML = `
            <div class="daily-summary-header">
                <h2 style="font-size: 28px; margin-bottom: 8px; color: var(--text-color);">Daily Summary</h2>
                <p style="opacity: 0.7; margin-bottom: 30px;">Your achievements for today</p>
            </div>
            
            <div class="daily-summary-stats">
                <div class="stat-row" style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                    <span style="opacity: 0.8;">Tasks Completed</span>
                    <span id="summaryCompleted" style="font-weight: 600; color: var(--glow-color);">0</span>
                </div>
                <div class="stat-row" style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                    <span style="opacity: 0.8;">Tasks Added</span>
                    <span id="summaryAdded" style="font-weight: 600;">0</span>
                </div>
                <div class="stat-row" style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                    <span style="opacity: 0.8;">Karma Earned</span>
                    <span id="summaryKarma" style="font-weight: 600; color: var(--glow-color);">0</span>
                </div>
                <div class="stat-row" style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                    <span style="opacity: 0.8;">Productivity Score</span>
                    <span id="summaryScore" style="font-weight: 600;">0%</span>
                </div>
            </div>
            
            <div class="daily-summary-message" style="margin: 30px 0; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 15px;">
                <p id="summaryMessage" style="font-style: italic; text-align: center;">Keep up the great work!</p>
            </div>
            
            <button class="summary-close-btn" style="
                width: 100%;
                background: var(--accent-color);
                color: white;
                border: none;
                padding: 15px;
                border-radius: 25px;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
            ">Close Summary</button>
        `;

        document.body.appendChild(summary);
    }

    /**
     * Setup automatic showing of daily summary
     */
    setupAutoShow() {
        // Check at 11:59 PM or when user hasn't been active for 4+ hours
        this.checkForDailySummary();
        
        // Also check when page becomes visible after being hidden
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkForDailySummary();
            }
        });
    }

    /**
     * Check if should show daily summary
     */
    checkForDailySummary() {
        const lastShown = storageManager.getLastDailySummary();
        const today = new Date().toDateString();
        
        if (lastShown !== today) {
            const tasks = storageManager.getTasks();
            const todayTasks = tasks.filter(task => 
                new Date(task.createdAt).toDateString() === today
            );
            
            if (todayTasks.length > 0) {
                this.showDailySummary();
            }
        }
    }

    /**
     * Show the daily summary
     */
    showDailySummary() {
        const tasks = storageManager.getTasks();
        const today = new Date().toDateString();
        
        const todayTasks = tasks.filter(task => 
            new Date(task.createdAt).toDateString() === today
        );
        
        const completedToday = todayTasks.filter(task => task.completed).length;
        const addedToday = todayTasks.length;
        const karmaToday = gamificationManager.dailyStats.completed + 
                          (gamificationManager.dailyStats.edited * 2);
        
        // Calculate productivity score
        const productivityScore = addedToday > 0 ? 
            Math.round((completedToday / addedToday) * 100) : 0;
        
        // Update summary content
        document.getElementById('summaryCompleted').textContent = completedToday;
        document.getElementById('summaryAdded').textContent = addedToday;
        document.getElementById('summaryKarma').textContent = karmaToday;
        document.getElementById('summaryScore').textContent = `${productivityScore}%`;
        
        // Set motivational message
        const message = this.getMotivationalMessage(productivityScore, completedToday);
        document.getElementById('summaryMessage').textContent = message;
        
        // Show summary
        const summary = document.getElementById('dailySummary');
        summary.style.display = 'block';
        
        requestAnimationFrame(() => {
            summary.style.opacity = '1';
            summary.style.transform = 'translate(-50%, -50%) scale(1)';
        });
        
        // Save that we've shown it today
        storageManager.setLastDailySummary(today);
        
        // Setup close handler
        summary.querySelector('.summary-close-btn').addEventListener('click', () => {
            this.closeDailySummary();
        });
        
        // Close on outside click
        summary.addEventListener('click', (e) => {
            if (e.target === summary) {
                this.closeDailySummary();
            }
        });
    }

    /**
     * Get motivational message based on performance
     */
    getMotivationalMessage(score, completed) {
        if (completed === 0) {
            return "Tomorrow is a new day to start fresh and make progress!";
        } else if (score === 100) {
            return "Perfect day! You've completed everything you set out to do. Outstanding!";
        } else if (score >= 75) {
            return "Excellent progress! You're building strong productivity habits.";
        } else if (score >= 50) {
            return "Good work! Keep building momentum for tomorrow.";
        } else if (score >= 25) {
            return "Every completed task counts. You're making steady progress!";
        } else {
            return "Small steps lead to big changes. Tomorrow is your day!";
        }
    }

    /**
     * Close the daily summary
     */
    closeDailySummary() {
        const summary = document.getElementById('dailySummary');
        summary.style.opacity = '0';
        summary.style.transform = 'translate(-50%, -50%) scale(0.9)';
        
        setTimeout(() => {
            summary.style.display = 'none';
        }, 300);
    }

    /**
     * Manually trigger daily summary (for testing)
     */
    showSummary() {
        this.showDailySummary();
    }
}

// Extend storage manager for daily summary
StorageManager.prototype.getLastDailySummary = function() {
    if (!this.isReady()) return null;
    
    try {
        return localStorage.getItem('luxury-todo-last-summary');
    } catch (error) {
        console.warn('Failed to get last daily summary:', error);
        return null;
    }
};

StorageManager.prototype.setLastDailySummary = function(date) {
    if (!this.isReady()) return false;
    
    try {
        localStorage.setItem('luxury-todo-last-summary', date);
        return true;
    } catch (error) {
        console.warn('Failed to save last daily summary:', error);
        return false;
    }
};

// Create global daily summary manager
const dailySummaryManager = new DailySummaryManager();

// Export for debugging
if (window.DEV) {
    window.dailySummaryManager = dailySummaryManager;
}
