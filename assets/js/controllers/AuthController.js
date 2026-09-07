import { API_CONFIG } from '../api-config.js';
import { apiService } from '../api-service.js';
import { User } from '../models/User.js';
import { storage } from '../utils/storage.js';


class AuthController {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
        this.authListeners = []
    }

    clearSession() {
        // storage.removeToken();
        // storage.removeUser();
        this.user = null;
        this.isAuthenticated = false;
    }

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
                // this.logout();
                return false;
            }
        }
        return false;
    }

    async login(userEmail, password) {
        try {
            const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, { userEmail, password });
            if (response.status === 0) {
                console.log('✅ Login successful!');

                if (response.body.token) {
                    storage.setToken(response.body.token);
                    console.log('✅ Token set to storage:', storage.getToken());
                } else {
                    console.warn('⚠️ No token in response!');
                }

                const user = new User(response.body);
                console.log(response.body);
                storage.setUser(user);
                this.user = user;
                this.isAuthenticated = true;
                this.notifyListeners();

                return {
                    success: true,
                    user: user,
                    message: response.message || 'Login successful!'
                };
            }
            return { success: false, error: 'Invalid credentials' };
        } catch (error) {
            if (error.status === 403) {
                return {
                    success: false,
                    error: error.data?.message || 'Invalid credentials'
                };
            }
            return { success: false, error: error.message };
        }
    }

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

    async logout() {
        try {
            // await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {});
            storage.removeToken();
            storage.removeUser();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // this.clearSession();
            this.user = null;
            this.isAuthenticated = false;
            this.notifyListeners();
        }
    }

    getCurrentUser() {
        return this.user;
    }

    isAdmin() {
        return this.isAuthenticated && this.user && this.user.isAdmin();
    }


}

// Export singleton
export const authController = new AuthController();