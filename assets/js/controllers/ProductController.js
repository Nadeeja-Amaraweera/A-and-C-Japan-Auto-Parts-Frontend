/**
 * Product Controller
 */
import { apiService } from '../api-service.js';
import { API_CONFIG } from '../api-config.js';
import { Product } from '../models/Product.js';

export const ProductController = {
    getAllProducts: async () => {
        try {
            const response = await apiService.get(API_CONFIG.ENDPOINTS.PRODUCTS.GET_ALL);
            return response.map(item => new Product(item));
        } catch (error) {
            console.error('Failed to fetch products', error);
            return [];
        }
    },
    
    getDeals: async () => {
        try {
            const response = await apiService.get(API_CONFIG.ENDPOINTS.PRODUCTS.GET_DEALS);
            return response.map(item => new Product(item));
        } catch (error) {
            console.error('Failed to fetch deals', error);
            return [];
        }
    }
};
