/**
 * User Controller
 */
import { apiService } from '../api-service.js';
import { API_CONFIG } from '../api-config.js';
import { storage } from '../utils/storage.js';

export const UserController = {
    getProfile: async () => {
        try {
            const user = await apiService.get(API_CONFIG.ENDPOINTS.USERS.GET_PROFILE);
            storage.setUser(user); // Update local cache
            return user;
        } catch (error) {
            console.error('Failed to fetch profile', error);
            throw error;
        }
    },

    updateProfile: async (profileData) => {
        try {
            const user = await apiService.put(API_CONFIG.ENDPOINTS.USERS.UPDATE_PROFILE, profileData);
            storage.setUser(user);
            return user;
        } catch (error) {
            console.error('Failed to update profile', error);
            throw error;
        }
    }
};
