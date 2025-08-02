/**
 * Swipe Gestures for Mobile
 * Enables swipe-to-complete and swipe-to-delete on mobile devices
 */

class SwipeGestures {
    constructor() {
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 50;
        this.isSwiping = false;
        
        this.init();
    }

    init() {
        this.setupTouchListeners();
    }

    setupTouchListeners() {
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    }

    handleTouchStart(e) {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;

        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.currentTaskItem = taskItem;
        this.taskId = taskItem.dataset.taskId;
        this.isSwiping = false;
    }

    handleTouchMove(e) {
        if (!this.currentTaskItem) return;

        this.touchEndX = e.touches[0].clientX;
        this.touchEndY = e.touches[0].clientY;

        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;

        // Only handle horizontal swipes
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
            e.preventDefault();
            this.isSwiping = true;
            this.showSwipeFeedback(deltaX);
        }
    }

    handleTouchEnd(e) {
        if (!this.currentTaskItem || !this.isSwiping) {
            this.resetSwipe();
            return;
        }

        const deltaX = this.touchEndX - this.touchStartX;
        const absDeltaX = Math.abs(deltaX);

        if (absDeltaX >= this.minSwipeDistance) {
            if (deltaX > 0) {
                // Swipe right - complete task
                this.handleSwipeComplete();
            } else {
                // Swipe left - delete task
                this.handleSwipeDelete();
            }
        }

        this.resetSwipe();
    }

    showSwipeFeedback(deltaX) {
        if (!this.currentTaskItem) return;

        const percentage = Math.min(Math.abs(deltaX) / 100, 1);
        const direction = deltaX > 0 ? 1 : -1;
        
        this.currentTaskItem.style.transform = `translateX(${deltaX * 0.3}px)`;
        this.currentTaskItem.style.opacity = 1 - (percentage * 0.3);
        
        // Add visual feedback
        if (!this.feedbackElement) {
            this.feedbackElement = document.createElement('div');
            this.feedbackElement.style.cssText = `
                position: absolute;
                top: 50%;
                ${direction > 0 ? 'right' : 'left'}: 10px;
                transform: translateY(-50%);
                padding: 8px 12px;
                background: var(--accent-color);
                color: white;
                border-radius: 20px;
                font-size: 12px;
                z-index: 1000;
                pointer-events: none;
            `;
            this.currentTaskItem.style.position = 'relative';
            this.currentTaskItem.appendChild(this.feedbackElement);
        }

        this.feedbackElement.textContent = direction > 0 ? 'Complete' : 'Delete';
        this.feedbackElement.style.opacity = percentage;
    }

    handleSwipeComplete() {
        if (this.taskId) {
            todoApp.toggleTask(this.taskId);
            this.showSwipeSuccess('Task completed! 🎉');
        }
    }

    handleSwipeDelete() {
        if (this.taskId) {
            if (confirm('Delete this task?')) {
                todoApp.deleteTask(this.taskId);
                this.showSwipeSuccess('Task deleted');
            }
        }
    }

    showSwipeSuccess(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--glass-color);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 15px;
            padding: 15px 25px;
            color: var(--text-color);
            font-weight: 600;
            z-index: 10000;
            animation: swipeSuccess 0.5s ease;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'swipeSuccessOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 1500);
    }

    resetSwipe() {
        if (this.currentTaskItem) {
            this.currentTaskItem.style.transform = '';
            this.currentTaskItem.style.opacity = '';
            
            if (this.feedbackElement) {
                this.feedbackElement.remove();
                this.feedbackElement = null;
            }
        }
        
        this.currentTaskItem = null;
        this.taskId = null;
        this.isSwiping = false;
    }
}

// Add CSS for swipe animations
const swipeStyles = document.createElement('style');
swipeStyles.textContent = `
    @keyframes swipeSuccess {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    
    @keyframes swipeSuccessOut {
        0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
    
    .task-item {
        transition: transform 0.2s ease, opacity 0.2s ease;
    }
`;
document.head.appendChild(swipeStyles);

// Create global swipe gestures
const swipeGestures = new SwipeGestures();
