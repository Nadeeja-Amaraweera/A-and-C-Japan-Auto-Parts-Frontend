/**
 * Supplier Controller
 */
import { apiService } from '../api-service.js';
import { API_CONFIG } from '../api-config.js';

export const SupplierController = {
    applyForSupplier: async (userId, applicationData) => {
        try {
            const endpoint = API_CONFIG.ENDPOINTS.USERS.BECOME_SUPPLIER.replace('{id}', userId);
            return await apiService.post(endpoint, applicationData);
        } catch (error) {
            console.error('Failed to apply for supplier status', error);
            throw error;
        }
    },

    getDashboardStats: async () => {
        // Example combined endpoint or call multiple ones
        return { sales: 0, activeListings: 0, pendingOrders: 0 };
    }
};
