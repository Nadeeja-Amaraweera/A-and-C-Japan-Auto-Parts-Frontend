import { API_CONFIG } from '../api-config.js';
import { apiService } from '../api-service.js';
import { storage } from '../utils/storage.js';

class OrderController {
    async checkout(shippingAddress, paymentMethod = 'CREDIT_CARD') {
        try {
            const user = storage.getUser();
            if (!user) return { success: false, error: 'Please log in to complete checkout' };
            const userId = user.id || user.userId;
            const endpoint = `/orders/checkout?userId=${userId}&shippingAddress=${encodeURIComponent(shippingAddress || '')}&paymentMethod=${paymentMethod}`;
            const response = await apiService.post(endpoint, {});
            if (response && response.status === 0) {
                return { success: true, order: response.body, message: 'Order placed successfully!' };
            }
            return { success: false, error: response?.message || 'Failed to place order' };
        } catch (error) {
            console.error('checkout error:', error);
            return { success: false, error: error.message || 'Error processing checkout' };
        }
    }

    async getUserOrders() {
        try {
            const user = storage.getUser();
            if (!user) return [];
            const userId = user.id || user.userId;
            const response = await apiService.get(`/orders/user/${userId}`);
            if (response && response.status === 0) {
                return response.body || [];
            }
            return [];
        } catch (error) {
            console.error('getUserOrders error:', error);
            return [];
        }
    }

    async getOrderById(orderId) {
        try {
            const response = await apiService.get(`/orders/${orderId}`);
            if (response && response.status === 0) {
                return response.body;
            }
            return null;
        } catch (error) {
            console.error('getOrderById error:', error);
            return null;
        }
    }

    async getAllOrders() {
        try {
            const response = await apiService.get('/orders');
            if (response && response.status === 0) {
                return response.body || [];
            }
            return [];
        } catch (error) {
            console.error('getAllOrders error:', error);
            return [];
        }
    }

    async updateOrderStatus(orderId, status) {
        try {
            const response = await apiService.put(`/orders/${orderId}/status?status=${status}`, {});
            if (response && response.status === 0) {
                return { success: true, order: response.body };
            }
            return { success: false, error: response?.message || 'Failed to update order status' };
        } catch (error) {
            console.error('updateOrderStatus error:', error);
            return { success: false, error: error.message };
        }
    }
}

export const orderController = new OrderController();
