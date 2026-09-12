import { API_CONFIG } from '../api-config.js';
import { apiService } from '../api-service.js';

class ProductController {
    async getAllProducts() {
        try {
            const response = await apiService.get('/products');
            if (response && response.status === 0) {
                return response.body || [];
            }
            return [];
        } catch (error) {
            console.error('getAllProducts error:', error);
            return [];
        }
    }

    async getProductById(id) {
        try {
            const response = await apiService.get(`/products/${id}`);
            if (response && response.status === 0) {
                return response.body;
            }
            return null;
        } catch (error) {
            console.error(`getProductById ${id} error:`, error);
            return null;
        }
    }

    async getProductsByCategory(categoryId) {
        try {
            const response = await apiService.get(`/products/category/${categoryId}`);
            if (response && response.status === 0) {
                return response.body || [];
            }
            return [];
        } catch (error) {
            console.error('getProductsByCategory error:', error);
            return [];
        }
    }

    async searchProducts(query) {
        try {
            const response = await apiService.get(`/products/search?query=${encodeURIComponent(query)}`);
            if (response && response.status === 0) {
                return response.body || [];
            }
            return [];
        } catch (error) {
            console.error('searchProducts error:', error);
            return [];
        }
    }

    async getCategories() {
        try {
            const response = await apiService.get('/categories');
            if (response && response.status === 0) {
                return response.body || [];
            }
            return [];
        } catch (error) {
            console.error('getCategories error:', error);
            return [];
        }
    }
}

export const productController = new ProductController();
