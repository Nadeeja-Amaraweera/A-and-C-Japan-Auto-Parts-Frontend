/**
 * Auth Controller
 * Handles authentication logic
 */
import { API_CONFIG } from '../api-config.js';
import { apiService } from '../api-service.js';
import { User } from '../models/User.js';

class AuthController {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
        this.authListeners = [];
    }

    /**
     * Initialize auth state
     */
    async init() {
        const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN);
        if (token) {
            try {
                const userData = await apiService.get(API_CONFIG.ENDPOINTS.USERS.GET_PROFILE);
                this.user = new User(userData);
                this.isAuthenticated = true;
                this.notifyListeners();
                return true;
            } catch (error) {
                console.error('Auth init error:', error);
                this.logout();
                return false;
            }
        }
        return false;
    }

    /**
     * Login user
     */
    async login(email, password) {
        try {
            const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, { email, password });
            if (response.user) {
                this.user = new User(response.user);
                this.isAuthenticated = true;
                this.notifyListeners();
                return { success: true, user: this.user };
            }
            return { success: false, error: 'Invalid credentials' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Register user
     */
    async register(userData) {
        try {
            const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
            if (response) {

                if (response.status === 0) {
                    console.log('✅ Registration successful!');
                    return {
                        success: true,
                        user: new User(response.body),
                        message: response.message || 'Registration successful!'
                    };
                }
            }
            return { success: false, error: 'Registration failed' };
        } catch (error) {

            if (error.status === 409) {
                return {
                    success: false,
                    error: error.data?.message || 'User already exists'
                };
            }

            return { success: false, error: error.message };
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {});
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.user = null;
            this.isAuthenticated = false;
            this.notifyListeners();
        }
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.user;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.isAuthenticated;
    }

    /**
     * Check if user is admin
     */
    isAdmin() {
        return this.isAuthenticated && this.user && this.user.isAdmin();
    }

    /**
     * Check if user is supplier
     */
    isSupplier() {
        return this.isAuthenticated && this.user && this.user.isSupplier();
    }

    /**
     * Check if user can sell
     */
    canSell() {
        return this.isAuthenticated && this.user && this.user.canSell();
    }

    /**
     * Update user profile
     */
    async updateProfile(userData) {
        try {
            const response = await apiService.put(API_CONFIG.ENDPOINTS.USERS.UPDATE_PROFILE, userData);
            if (response.user) {
                this.user = new User(response.user);
                this.notifyListeners();
                return { success: true, user: this.user };
            }
            return { success: false, error: 'Profile update failed' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Become supplier
     */
    async becomeSupplier(applicationData) {
        if (!this.user) {
            return { success: false, error: 'User not logged in' };
        }

        try {
            const endpoint = API_CONFIG.ENDPOINTS.USERS.BECOME_SUPPLIER.replace('{id}', this.user.id);
            const response = await apiService.post(endpoint, applicationData);
            if (response.user) {
                this.user = new User(response.user);
                this.notifyListeners();
                return { success: true, user: this.user };
            }
            return { success: false, error: 'Application failed' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Add auth listener
     */
    addListener(callback) {
        this.authListeners.push(callback);
    }

    /**
     * Notify all listeners of auth state change
     */
    notifyListeners() {
        this.authListeners.forEach(callback => {
            try {
                callback(this.user, this.isAuthenticated);
            } catch (error) {
                console.error('Auth listener error:', error);
            }
        });
    }

    /**
     * Require authentication
     */
    requireAuth() {
        if (!this.isAuthenticated) {
            window.location.href = '/pages/login.html';
            return false;
        }
        return true;
    }

    /**
     * Require admin role
     */
    requireAdmin() {
        if (!this.isAdmin()) {
            window.location.href = '/';
            return false;
        }
        return true;
    }

    /**
     * Require supplier role
     */
    requireSupplier() {
        if (!this.isSupplier()) {
            window.location.href = '/pages/profile.html';
            return false;
        }
        return true;
    }
}

// Export singleton
export const authController = new AuthController();