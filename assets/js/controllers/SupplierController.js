import { API_CONFIG } from '../api-config.js';
import { apiService } from '../api-service.js';
import { storage } from '../utils/storage.js';

class SupplierController {
    async applyToBeSupplier(supplierData) {
        try {
            const user = storage.getUser();
            const userId = supplierData.userId || (user ? (user.id || user.userId) : null);
            if (!userId) {
                return { success: false, error: 'User ID is required' };
            }
            const endpoint = `/users/${userId}/become-supplier`;
            const response = await apiService.post(endpoint, supplierData);
            if (response && response.status === 0) {
                return { success: true, data: response.body, message: response.message || 'Application submitted successfully!' };
            }
            return { success: false, error: response?.message || 'Failed to submit supplier application' };
        } catch (error) {
            console.error('applyToBeSupplier error:', error);
            return { success: false, error: error.message || 'An error occurred' };
        }
    }

    async getSupplierStatus(userId) {
        try {
            const targetId = userId || (storage.getUser() ? (storage.getUser().id || storage.getUser().userId) : null);
            if (!targetId) return null;
            const endpoint = `/users/${targetId}/supplier-status`;
            const response = await apiService.get(endpoint);
            if (response && response.status === 0) {
                return response.body;
            }
            return null;
        } catch (error) {
            console.error('getSupplierStatus error:', error);
            return null;
        }
    }

    async getSupplierVehicles(supplierId) {
        try {
            const targetId = supplierId || (storage.getUser() ? (storage.getUser().id || storage.getUser().userId) : null);
            const endpoint = `/vehicles/supplier/${targetId}`;
            const response = await apiService.get(endpoint);
            if (response && response.status === 0) {
                return response.body || [];
            }
            return [];
        } catch (error) {
            console.error('getSupplierVehicles error:', error);
            return [];
        }
    }

    async getSupplierAuctions(supplierId) {
        try {
            const targetId = supplierId || (storage.getUser() ? (storage.getUser().id || storage.getUser().userId) : null);
            const endpoint = `/auctions/user/${targetId}`;
            const response = await apiService.get(endpoint);
            if (response && response.status === 0) {
                return response.body || [];
            }
            return [];
        } catch (error) {
            console.error('getSupplierAuctions error:', error);
            return [];
        }
    }
}

export const supplierController = new SupplierController();
