/**
 * Event bus for safe component communication
 * Provides centralized event handling with initialization checks
 */

class EventBus {
    constructor() {
        this.events = new Map();
        this.componentReady = new Map();
        this.resetHandlers = [];
        this.isInitialized = false;
        // Debug flag to trace events in console. Toggle at runtime: bus.debug = true/false
        this.debug = false;
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
        console.log(`[Bus] Adding listener for event: ${type}`);
        
        if (!this.isReady()) {
            console.warn(`Event bus not ready, queuing listener for: ${type}`);
            // Queue the listener for when bus is ready
            if (!this._queuedListeners) this._queuedListeners = [];
            this._queuedListeners.push({ type, listener, options });
            return;
        }

        if (!this.events.has(type)) {
            this.events.set(type, []);
            console.log(`[Bus] Created new event array for type: ${type}`);
        }
        this.events.get(type).push({ listener, options });
        console.log(`[Bus] Total listeners for ${type}: ${this.events.get(type).length}`);
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
        console.log(`[Bus] Dispatching event: ${event.type}`, event.detail);
        
        if (!this.isReady()) {
            console.warn(`Event bus not ready, queuing event: ${event.type}`);
            if (!this._queuedEvents) this._queuedEvents = [];
            this._queuedEvents.push(event);
            return false;
        }

        const type = event.type;

        // Debug trace: log every dispatched event with safe-cloned detail snapshot
        if (this.debug) {
            let snapshot = undefined;
            try {
                // Avoid cloning large/complex objects; shallow copy only
                if (event && typeof event.detail !== 'undefined') {
                    if (event.detail && typeof event.detail === 'object') {
                        const maxKeys = 12;
                        const keys = Object.keys(event.detail).slice(0, maxKeys);
                        snapshot = {};
                        for (const k of keys) {
                            const v = event.detail[k];
                            snapshot[k] = (typeof v === 'object') ? '[object]' : v;
                        }
                        if (Object.keys(event.detail).length > maxKeys) {
                            snapshot.__truncated = true;
                        }
                    } else {
                        snapshot = event.detail;
                    }
                }
            } catch (_) {
                snapshot = '[unserializable]';
            }
            try {
                console.debug('[bus] dispatch', {
                    type,
                    detail: snapshot,
                    t: new Date().toISOString()
                });
            } catch (_) {}
        }

        if (!this.events.has(type)) {
            console.log(`[Bus] No listeners for event type: ${type}`);
            return true; // No listeners, but not an error
        }

        const listeners = this.events.get(type);
        console.log(`[Bus] Found ${listeners.length} listeners for event: ${type}`);
        
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

            const cleanup = () => {
                if (timeoutId) clearTimeout(timeoutId);
                if (handler) this.removeEventListener('componentReady', handler);
            };

            const timeoutId = setTimeout(() => {
                cleanup();
                reject(new Error(`Timeout waiting for ${componentName}`));
            }, timeout);

            const handler = (event) => {
                try {
                    if (event.detail && event.detail.component === componentName) {
                        cleanup();
                        resolve();
                    }
                } catch (e) {
                    // no-op
                }
            };

            this.addEventListener('componentReady', handler);
        });
    }

    /**
     * Register a reset handler function
     * @param {Function} handler - Reset handler function to call when resetToDefaults event is triggered
     */
    registerResetHandler(handler) {
        console.log('[Bus] Registering reset handler');
        if (typeof handler !== 'function') {
            console.warn('[Bus] Reset handler must be a function');
            return;
        }
        this.resetHandlers.push(handler);
    }

    /**
     * Trigger all registered reset handlers
     */
    triggerReset() {
        console.log('[Bus] Triggering reset handlers, count:', this.resetHandlers.length);
        this.resetHandlers.forEach((handler, index) => {
            try {
                console.log(`[Bus] Executing reset handler ${index + 1}/${this.resetHandlers.length}`);
                handler();
            } catch (error) {
                console.error(`[Bus] Error in reset handler ${index + 1}:`, error);
            }
        });
        console.log('[Bus] All reset handlers completed');
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
