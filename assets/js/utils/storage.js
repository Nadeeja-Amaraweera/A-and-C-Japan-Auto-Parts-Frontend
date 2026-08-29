/**
 * Storage Utility
 * Wrapper for localStorage with JSON parsing/stringifying
 */
import { API_CONFIG } from '../api-config.js';

export const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage', e);
            return false;
        }
    },

    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage', e);
            return defaultValue;
        }
    },

    remove: (key) => {
        localStorage.removeItem(key);
    },

    clear: () => {
        localStorage.clear();
    },

    // Token specific helpers
    getToken: () => storage.get(API_CONFIG.STORAGE_KEYS.TOKEN),

    setToken: (token) => storage.set(API_CONFIG.STORAGE_KEYS.TOKEN, token),

    removeToken: () => storage.remove(API_CONFIG.STORAGE_KEYS.TOKEN),

    // User specific helpers
    getUser: () => storage.get(API_CONFIG.STORAGE_KEYS.USER),
    setUser: (user) => storage.set(API_CONFIG.STORAGE_KEYS.USER, user),
    removeUser: () => storage.remove(API_CONFIG.STORAGE_KEYS.USER),
};
