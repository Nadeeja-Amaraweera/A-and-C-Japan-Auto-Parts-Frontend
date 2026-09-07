/**
 * API Service
 * Central wrapper for all HTTP requests using fetch
 */
import { API_CONFIG } from './api-config.js';
import { storage } from './utils/storage.js';

class ApiService {
    async request(endpoint, options = {}) {
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${API_CONFIG.VERSION}${endpoint}`;

        const headers = { ...API_CONFIG.HEADERS, ...(options.headers || {}) };

        const skipAuth = options.skipAuth ?? true;

        console.log(`🔑 Skip auth: ${skipAuth}`); // Debug log

        if (!skipAuth) {
            console.log("true")
            const token = storage.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
                console.log('🔑 Token attached to request');
            } else {
                console.warn('⚠️ No token available for protected request');
            }
        } else {
            console.log('🔓 Public request - No token attached');
            delete headers['Authorization'];
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
            if (!error.status) {
                error.status = 500;
            }
            throw error;
        }
    }



    get(endpoint, headers = {}) {
        return this.request(endpoint, { method: 'GET', headers, skipAuth: true });
    }

    postPublic(endpoint, body, headers = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
            headers,
            skipAuth: true
        });
    }

    post(endpoint, body, headers = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
            headers,
            skipAuth: false
        });
    }

    put(endpoint, body, headers = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers,
            skipAuth: false
        });
    }

    patch(endpoint, body, headers = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body),
            headers,
            skipAuth: false
        });
    }

    delete(endpoint, options = {}) {
        const config = { method: 'DELETE', headers: options.headers || {}, skipAuth: false };
        if (options.data) {
            config.body = JSON.stringify(options.data);
        }
        return this.request(endpoint, config);
    }
}

export const apiService = new ApiService();
