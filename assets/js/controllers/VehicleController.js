/**
 * Vehicle Controller
 */
import { apiService } from '../api-service.js';
import { API_CONFIG } from '../api-config.js';
import { Vehicle } from '../models/Vehicle.js';

export const VehicleController = {
    searchVehicles: async (query) => {
        try {
            return await apiService.get(API_CONFIG.ENDPOINTS.VEHICLES.SEARCH + '?q=' + encodeURIComponent(query));
        } catch (error) {
            console.error('Failed to search vehicles', error);
            return [];
        }
    },
    
    filterVehicles: async (filters) => {
        try {
            // Convert filters object to query string
            const queryString = new URLSearchParams(filters).toString();
            return await apiService.get(API_CONFIG.ENDPOINTS.VEHICLES.FILTER + '?' + queryString);
        } catch (error) {
            console.error('Failed to filter vehicles', error);
            return [];
        }
    }
};
