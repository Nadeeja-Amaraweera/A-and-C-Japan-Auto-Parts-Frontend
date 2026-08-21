/**
 * Admin Controller
 */
import { apiService } from '../api-service.js';
import { API_CONFIG } from '../api-config.js';

export const AdminController = {
    getDashboardStats: async () => {
        try {
            return await apiService.get(API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD);
        } catch (error) {
            console.error('Failed to get admin dashboard stats', error);
            return null;
        }
    },
    
    approveSupplier: async (userId) => {
        try {
            const endpoint = API_CONFIG.ENDPOINTS.ADMIN.APPROVE_SUPPLIER.replace('{id}', userId);
            return await apiService.post(endpoint);
        } catch (error) {
            console.error(`Failed to approve supplier ${userId}`, error);
            throw error;
        }
    }
};
