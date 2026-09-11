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
    getToken: () => storage.get(API_CONFIG.STORAGE_KEYS.TOKEN) || storage.get('token') || localStorage.getItem('token'),

    setToken: (token) => {
        storage.set(API_CONFIG.STORAGE_KEYS.TOKEN, token);
        storage.set('token', token);
    },

    removeToken: () => {
        storage.remove(API_CONFIG.STORAGE_KEYS.TOKEN);
        storage.remove(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
        storage.remove('token');
        storage.remove('authToken');
        storage.remove('refreshToken');
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
        } catch (_) {}
    },

    // User specific helpers
    getUser: () => storage.get(API_CONFIG.STORAGE_KEYS.USER) || storage.get('user'),
    setUser: (user) => {
        storage.set(API_CONFIG.STORAGE_KEYS.USER, user);
        storage.set('user', user);
    },
    removeUser: () => {
        storage.remove(API_CONFIG.STORAGE_KEYS.USER);
        storage.remove('user');
        storage.remove('userData');
        try {
            localStorage.removeItem('user');
            localStorage.removeItem('userData');
        } catch (_) {}
    },

    // UserDetails specific helpers
    getUserDetails: () => storage.get(API_CONFIG.STORAGE_KEYS.USER_DETAILS) || storage.get('userDetails') || storage.get('userdetails'),
    setUserDetails: (details) => {
        storage.set(API_CONFIG.STORAGE_KEYS.USER_DETAILS, details);
        storage.set('userDetails', details);
    },
    removeUserDetails: () => {
        storage.remove(API_CONFIG.STORAGE_KEYS.USER_DETAILS);
        storage.remove('userDetails');
        storage.remove('userdetails');
        try {
            localStorage.removeItem('userDetails');
            localStorage.removeItem('userdetails');
        } catch (_) {}
    },

    // Comprehensive session cleanup for token, user, userDetails
    clearAuth: () => {
        storage.removeToken();
        storage.removeUser();
        storage.removeUserDetails();
        try {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('user');
            sessionStorage.removeItem('userData');
            sessionStorage.removeItem('userDetails');
            sessionStorage.removeItem('userdetails');
        } catch (_) {}
    }
};
