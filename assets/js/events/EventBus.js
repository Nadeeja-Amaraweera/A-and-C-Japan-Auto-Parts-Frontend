/**
 * Event Bus
 * Central event handling system
 */

class EventBus {
    constructor() {
        this.events = {};
        this.onceEvents = {};
    }

    /**
     * Subscribe to an event
     */
    on(event, callback, priority = 0) {
        if (!this.events[event]) {
            this.events[event] = [];
        }

        this.events[event].push({
            callback,
            priority,
            once: false
        });

        // Sort by priority (higher first)
        this.events[event].sort((a, b) => b.priority - a.priority);

        // Return unsubscribe function
        return () => this.off(event, callback);
    }

    /**
     * Subscribe to an event once
     */
    once(event, callback, priority = 0) {
        if (!this.onceEvents[event]) {
            this.onceEvents[event] = [];
        }

        this.onceEvents[event].push({
            callback,
            priority,
            once: true
        });

        this.onceEvents[event].sort((a, b) => b.priority - a.priority);

        return () => this.off(event, callback);
    }

    /**
     * Unsubscribe from an event
     */
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(
                listener => listener.callback !== callback
            );
        }

        if (this.onceEvents[event]) {
            this.onceEvents[event] = this.onceEvents[event].filter(
                listener => listener.callback !== callback
            );
        }
    }

    /**
     * Emit an event
     */
    emit(event, data = null) {
        // Handle regular listeners
        if (this.events[event]) {
            const listeners = [...this.events[event]];
            listeners.forEach(({ callback }) => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for "${event}":`, error);
                }
            });
        }

        // Handle once listeners
        if (this.onceEvents[event]) {
            const listeners = [...this.onceEvents[event]];
            this.onceEvents[event] = [];
            listeners.forEach(({ callback }) => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in once event listener for "${event}":`, error);
                }
            });
        }
    }

    /**
     * Clear all listeners for an event
     */
    clear(event) {
        if (event) {
            delete this.events[event];
            delete this.onceEvents[event];
        } else {
            this.events = {};
            this.onceEvents = {};
        }
    }

    /**
     * Get listener count for an event
     */
    listenerCount(event) {
        const regular = this.events[event] ? this.events[event].length : 0;
        const once = this.onceEvents[event] ? this.onceEvents[event].length : 0;
        return regular + once;
    }

    /**
     * Get all event names
     */
    getEvents() {
        const allEvents = new Set();

        Object.keys(this.events).forEach(key => allEvents.add(key));
        Object.keys(this.onceEvents).forEach(key => allEvents.add(key));

        return Array.from(allEvents);
    }

    /**
     * Check if event has listeners
     */
    hasListeners(event) {
        return this.listenerCount(event) > 0;
    }
}

// Export singleton
export const eventBus = new EventBus();

// Event names constants
export const EVENTS = {
    AUTH: {
        LOGIN: 'auth:login',
        LOGOUT: 'auth:logout',
        REGISTER: 'auth:register',
        UPDATE: 'auth:update',
        BECOME_SUPPLIER: 'auth:become-supplier'
    },
    AUCTION: {
        CREATED: 'auction:created',
        UPDATED: 'auction:updated',
        DELETED: 'auction:deleted',
        BID_PLACED: 'auction:bid-placed',
        ENDED: 'auction:ended',
        WATCHLIST_ADDED: 'auction:watchlist-added',
        WATCHLIST_REMOVED: 'auction:watchlist-removed'
    },
    VEHICLE: {
        CREATED: 'vehicle:created',
        UPDATED: 'vehicle:updated',
        DELETED: 'vehicle:deleted'
    },
    CART: {
        ADDED: 'cart:added',
        REMOVED: 'cart:removed',
        UPDATED: 'cart:updated',
        CLEARED: 'cart:cleared'
    },
    UI: {
        LOADING_START: 'ui:loading-start',
        LOADING_END: 'ui:loading-end',
        NOTIFICATION: 'ui:notification',
        THEME_CHANGE: 'ui:theme-change',
        LANGUAGE_CHANGE: 'ui:language-change'
    }
};