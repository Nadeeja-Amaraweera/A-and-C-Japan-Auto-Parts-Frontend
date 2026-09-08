import { API_CONFIG } from '../api-config.js';
import { apiService } from '../api-service.js';
import { User } from '../models/User.js';
import { storage } from '../utils/storage.js';


class AuthController {
    constructor() {
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
        console.log("AuthController: login() method called!")
        try {
            const response = await apiService.postPublic(API_CONFIG.ENDPOINTS.AUTH.LOGIN, { userEmail, password });
            if (response.status === 0) {
                console.log('✅ Login successful!');

                if (response.body.token) {
                    storage.setToken(response.body.token);
                    console.log('✅ Token set to storage:', storage.getToken());
                } else {
                    console.warn('⚠️ No token in response!');
                }

                const user = new User(response.body);

                storage.setUser(user);
                console.log("response.body.token", response.body.token)
                this.user = user;
                this.isAuthenticated = true;

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
            const response = await apiService.postPublic(API_CONFIG.ENDPOINTS.USERS.REGISTER, userData);
            console.log("Raw API response:", response);
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
            if (error.status === 400) {
                return {
                    success: false,
                    error: error.data?.message || 'Invalid registration data. Please check all fields.'
                };
            }

            if (error.status === 401 || error.status === 403) {
                return {
                    success: false,
                    error: 'Authentication error. Please try again.'
                };
            }

            return { success: false, error: error.message };
        }
    }

    async validateUser() {
        try {
            const response = await apiService.get(API_CONFIG.ENDPOINTS.AUTH.VALIDATE, {}, false);
            if (response.status === 0) {
                console.log('✅ User validated successfully!', response.body);
                this.user = new User(response.body);
                this.isAuthenticated = true;
                return {
                    success: true,
                    user: this.user,
                    message: response.message || 'User validated successfully!'
                };
            }
            return { success: false, error: 'User validation failed' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async logout() {
        try {
            storage.removeToken();
            storage.removeUser();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.user = null;
            this.isAuthenticated = false;
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