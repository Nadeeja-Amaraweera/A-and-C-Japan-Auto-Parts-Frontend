import { API_CONFIG } from '../api-config.js';
import { apiService } from '../api-service.js';
import { storage } from '../utils/storage.js';

class AuctionController {
    async getActiveAuctions() {
        try {
            const response = await apiService.get('/auctions');
            if (response && response.status === 0) {
                return response.body || [];
            }
            return [];
        } catch (error) {
            console.error('getActiveAuctions error:', error);
            return [];
        }
    }

    async getFeaturedAuctions() {
        try {
            const response = await apiService.get('/auctions/featured');
            if (response && response.status === 0) {
                return response.body || [];
            }
            return [];
        } catch (error) {
            console.error('getFeaturedAuctions error:', error);
            return [];
        }
    }

    async getAllAuctions() {
        try {
            const response = await apiService.get('/auctions/all');
            if (response && response.status === 0) {
                return response.body || [];
            }
            return [];
        } catch (error) {
            console.error('getAllAuctions error:', error);
            return [];
        }
    }

    async getAuctionById(id) {
        try {
            const response = await apiService.get(`/auctions/${id}`);
            if (response && response.status === 0) {
                return response.body;
            }
            return null;
        } catch (error) {
            console.error(`getAuctionById ${id} error:`, error);
            return null;
        }
    }

    async placeBid(auctionId, amount) {
        try {
            const user = storage.getUser();
            if (!user) {
                return { success: false, error: 'Please log in to place a bid' };
            }
            const userId = user.id || user.userId;
            const payload = {
                auctionId: Number(auctionId),
                userId: Number(userId),
                bidAmount: Number(amount),
                amount: Number(amount)
            };
            const response = await apiService.post(`/auctions/${auctionId}/bid`, payload);
            if (response && response.status === 0) {
                return { success: true, data: response.body, message: response.message || 'Bid placed successfully!' };
            }
            return { success: false, error: response?.message || 'Failed to place bid' };
        } catch (error) {
            console.error('placeBid error:', error);
            return { success: false, error: error.message || 'An error occurred while placing bid' };
        }
    }

    async getBids(auctionId) {
        try {
            const response = await apiService.get(`/auctions/${auctionId}/bids`);
            if (response && response.status === 0) {
                return response.body || [];
            }
            return [];
        } catch (error) {
            console.error('getBids error:', error);
            return [];
        }
    }

    async getRecentBidders(auctionId) {
        try {
            const response = await apiService.get(`/auctions/${auctionId}/recent-bidders`);
            if (response && response.status === 0) {
                return response.body || [];
            }
            return [];
        } catch (error) {
            console.error('getRecentBidders error:', error);
            return [];
        }
    }

    async toggleWatchlist(auctionId) {
        try {
            const user = storage.getUser();
            if (!user) return { success: false, error: 'Login required' };
            const userId = user.id || user.userId;

            // Check if already in watchlist
            const watchlist = await this.getWatchlist(userId);
            const isWatching = watchlist.some(w => (w.auctionId === Number(auctionId) || w.id === Number(auctionId)));

            if (isWatching) {
                await apiService.delete(`/auctions/${auctionId}/watchlist?userId=${userId}`);
                return { success: true, watching: false };
            } else {
                await apiService.post(`/auctions/${auctionId}/watchlist?userId=${userId}`, {});
                return { success: true, watching: true };
            }
        } catch (error) {
            console.error('toggleWatchlist error:', error);
            return { success: false, error: error.message };
        }
    }

    async getWatchlist(userId) {
        try {
            const targetId = userId || (storage.getUser() ? (storage.getUser().id || storage.getUser().userId) : null);
            if (!targetId) return [];
            const response = await apiService.get(`/auctions/watchlist/user/${targetId}`);
            if (response && response.status === 0) {
                return response.body || [];
            }
            return [];
        } catch (error) {
            console.error('getWatchlist error:', error);
            return [];
        }
    }

    async createAuctionWithVehicle(vehicleData, auctionData) {
        try {
            const user = storage.getUser();
            if (!user) return { success: false, error: 'Login required' };
            const userId = user.id || user.userId;

            // 1. Create Vehicle
            vehicleData.userId = userId;
            const vehRes = await apiService.post('/vehicles', vehicleData);
            if (!vehRes || vehRes.status !== 0 || !vehRes.body) {
                return { success: false, error: vehRes?.message || 'Failed to create vehicle record' };
            }

            const vehicle = vehRes.body;
            const vehicleId = vehicle.id || vehicle.vehicleId;

            // 2. Create Auction
            auctionData.vehicleId = vehicleId;
            auctionData.sellerId = userId;
            auctionData.status = 'ACTIVE';

            const aucRes = await apiService.post('/auctions', auctionData);
            if (aucRes && aucRes.status === 0) {
                return { success: true, data: aucRes.body, auction: aucRes.body, message: 'Auction created successfully!' };
            }
            return { success: false, error: aucRes?.message || 'Failed to create auction' };
        } catch (error) {
            console.error('createAuctionWithVehicle error:', error);
            return { success: false, error: error.message || 'Error creating auction' };
        }
    }
}

export const auctionController = new AuctionController();
