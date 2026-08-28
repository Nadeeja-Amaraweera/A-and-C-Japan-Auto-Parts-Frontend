/**
 * API Service
 * Central wrapper for all HTTP requests using fetch
 */
import { API_CONFIG } from './api-config.js';
import { storage } from './utils/storage.js';
import { eventBus } from './events/EventBus.js';

class ApiService {
    async request(endpoint, options = {}) {
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${API_CONFIG.VERSION}${endpoint}`;

        const headers = { ...API_CONFIG.HEADERS, ...(options.headers || {}) };

        const token = storage.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            // Optional timeout wrapper could be added here
            const response = await fetch(url, config);

            if (response.status === API_CONFIG.STATUS.UNAUTHORIZED) {
                // Token might be expired
                eventBus.emit('auth:unauthorized');
                const error = new Error('Unauthorized');
                error.status = 401;
                error.data = { message: 'Unauthorized' };
                throw error;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const error = new Error(errorData.message || `HTTP Error ${response.status}`);
                error.status = response.status;
                error.data = errorData;
                throw error;
            }

            // Handle 204 No Content
            if (response.status === API_CONFIG.STATUS.NO_CONTENT) {
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error(`API Request failed for ${endpoint}`, error);
            throw error;
        }
    }

    get(endpoint, headers = {}) {
        return this.request(endpoint, { method: 'GET', headers });
    }

    post(endpoint, body, headers = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
            headers
        });
    }

    put(endpoint, body, headers = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers
        });
    }

    patch(endpoint, body, headers = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body),
            headers
        });
    }

    delete(endpoint, options = {}) {
        const config = { method: 'DELETE', headers: options.headers || {} };
        if (options.data) {
            config.body = JSON.stringify(options.data);
        }
        return this.request(endpoint, config);
    }
}

export const apiService = new ApiService();
