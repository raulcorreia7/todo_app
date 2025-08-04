/**
 * Event bus for safe component communication
 * Provides centralized event handling with initialization checks
 */

class EventBus {
    constructor() {
        this.events = new Map();
        this.componentReady = new Map();
        this.isInitialized = false;
    }

    /**
     * Initialize the event bus
     */
    init() {
        this.isInitialized = true;
        console.log('Event bus initialized');
    }

    /**
     * Check if bus is ready
     * @returns {boolean} Bus ready state
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Mark a component as ready
     * @param {string} componentName - Name of the component
     */
    markReady(componentName) {
        this.componentReady.set(componentName, true);
        this.dispatchEvent(new CustomEvent('componentReady', {
            detail: { component: componentName }
        }));
    }

    /**
     * Check if a component is ready
     * @param {string} componentName - Name of the component
     * @returns {boolean} Component ready state
     */
    isComponentReady(componentName) {
        return this.componentReady.get(componentName) || false;
    }

    /**
     * Add event listener with safety checks
     * @param {string} type - Event type
     * @param {Function} listener - Event listener
     * @param {Object} options - Event options
     */
    addEventListener(type, listener, options = {}) {
        if (!this.isReady()) {
            console.warn(`Event bus not ready, queuing listener for: ${type}`);
            // Queue the listener for when bus is ready
            if (!this._queuedListeners) this._queuedListeners = [];
            this._queuedListeners.push({ type, listener, options });
            return;
        }

        if (!this.events.has(type)) {
            this.events.set(type, []);
        }
        this.events.get(type).push({ listener, options });
    }

    /**
     * Remove event listener
     * @param {string} type - Event type
     * @param {Function} listener - Event listener
     */
    removeEventListener(type, listener) {
        if (!this.events.has(type)) return;
        
        const listeners = this.events.get(type);
        const index = listeners.findIndex(l => l.listener === listener);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }

    /**
     * Dispatch event with safety checks
     * @param {Event} event - Event to dispatch
     * @returns {boolean} Whether the event was handled
     */
    dispatchEvent(event) {
        if (!this.isReady()) {
            console.warn(`Event bus not ready, queuing event: ${event.type}`);
            if (!this._queuedEvents) this._queuedEvents = [];
            this._queuedEvents.push(event);
            return false;
        }

        const type = event.type;
        if (!this.events.has(type)) {
            return true; // No listeners, but not an error
        }

        const listeners = this.events.get(type);
        listeners.forEach(({ listener, options }) => {
            try {
                listener.call(this, event);
            } catch (error) {
                console.error(`Error in event listener for ${type}:`, error);
            }
        });

        return true;
    }

    /**
     * Process queued listeners and events
     */
    processQueue() {
        // Process queued listeners
        if (this._queuedListeners) {
            this._queuedListeners.forEach(({ type, listener, options }) => {
                this.addEventListener(type, listener, options);
            });
            delete this._queuedListeners;
        }

        // Process queued events
        if (this._queuedEvents) {
            this._queuedEvents.forEach(event => {
                this.dispatchEvent(event);
            });
            delete this._queuedEvents;
        }
    }

    /**
     * Safe method to get component
     * @param {string} componentName - Name of component
     * @returns {Object|null} Component instance or null
     */
    getComponent(componentName) {
        switch (componentName) {
            case 'storage':
                return typeof storageManager !== 'undefined' ? storageManager : null;
            case 'settings':
                return typeof settingsManager !== 'undefined' ? settingsManager : null;
            case 'audio':
                return typeof audioManager !== 'undefined' ? audioManager : null;
            case 'theme':
                return typeof themeManager !== 'undefined' ? themeManager : null;
            case 'gamification':
                return typeof gamificationManager !== 'undefined' ? gamificationManager : null;
            default:
                return null;
        }
    }

    /**
     * Wait for component to be ready
     * @param {string} componentName - Name of component
     * @param {number} timeout - Timeout in ms
     * @returns {Promise} Promise that resolves when component is ready
     */
    waitForComponent(componentName, timeout = 5000) {
        return new Promise((resolve, reject) => {
            if (this.isComponentReady(componentName)) {
                resolve();
                return;
            }

            const timeoutId = setTimeout(() => {
                reject(new Error(`Timeout waiting for ${componentName}`));
            }, timeout);

            this.addEventListener('componentReady', (event) => {
                if (event.detail.component === componentName) {
                    clearTimeout(timeoutId);
                    resolve();
                }
            });
        });
    }
}

// Create global event bus
const bus = new EventBus();

// Initialize bus immediately
bus.init();

// Export for debugging
if (window.DEV) {
    window.bus = bus;
}

// Process any queued events immediately
bus.processQueue();
