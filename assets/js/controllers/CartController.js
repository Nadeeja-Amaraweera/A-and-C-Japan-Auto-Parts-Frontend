/**
 * Cart Controller
 */
import { apiService } from '../api-service.js';
import { API_CONFIG } from '../api-config.js';
import { eventBus } from '../events/EventBus.js';

export const CartController = {
    getCart: async () => {
        try {
            return await apiService.get(API_CONFIG.ENDPOINTS.CART.GET);
        } catch (error) {
            console.error('Failed to get cart', error);
            return { items: [], total: 0 };
        }
    },

    addItem: async (productId, quantity = 1) => {
        try {
            const response = await apiService.post(API_CONFIG.ENDPOINTS.CART.ADD, { productId, quantity });
            eventBus.emit('cart:updated', response);
            return response;
        } catch (error) {
            console.error('Failed to add item to cart', error);
            throw error;
        }
    },
    
    removeItem: async (cartItemId) => {
        try {
            const response = await apiService.delete(API_CONFIG.ENDPOINTS.CART.REMOVE, { data: { cartItemId } });
            eventBus.emit('cart:updated', response);
            return response;
        } catch (error) {
            console.error('Failed to remove item from cart', error);
            throw error;
        }
    }
};
