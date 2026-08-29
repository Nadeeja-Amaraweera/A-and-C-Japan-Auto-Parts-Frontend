/**
 * Auction Controller
 * Handles auction management logic
 */
import { API_CONFIG } from '../api-config.js';
import { apiService } from '../api-service.js';
import { Auction } from '../models/Auction.js';
import { storage } from '../utils/storage.js';

class AuctionController {
    constructor() {
        this.currentAuction = null;
        this.bids = [];
        this.watchlist = [];
        this.activeAuctions = [];
        this.upcomingAuctions = [];
        this.endedAuctions = [];
        this.bidUpdateListeners = [];
        this.timerIntervals = {};
    }

    /**
     * Load auctions
     */
    async loadAuctions(params = {}) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const endpoint = queryString ? `${API_CONFIG.ENDPOINTS.AUCTIONS.GET_ALL}?${queryString}` : API_CONFIG.ENDPOINTS.AUCTIONS.GET_ALL;
            const data = await apiService.get(endpoint);
            return data.auctions ? data.auctions.map(a => new Auction(a)) : [];
        } catch (error) {
            console.error('Load auctions error:', error);
            return [];
        }
    }



    /**
     * Load active auctions
     */
    async loadActiveAuctions() {
        try {
            const data = await apiService.get(API_CONFIG.ENDPOINTS.AUCTIONS.GET_ACTIVE);
            this.activeAuctions = data.auctions ? data.auctions.map(a => new Auction(a)) : [];
            return this.activeAuctions;
        } catch (error) {
            console.error('Load active auctions error:', error);
            return [];
        }
    }

    /**
     * Load upcoming auctions
     */
    async loadUpcomingAuctions() {
        try {
            const data = await apiService.get(API_CONFIG.ENDPOINTS.AUCTIONS.GET_UPCOMING);
            this.upcomingAuctions = data.auctions ? data.auctions.map(a => new Auction(a)) : [];
            return this.upcomingAuctions;
        } catch (error) {
            console.error('Load upcoming auctions error:', error);
            return [];
        }
    }

    /**
     * Load ended auctions
     */
    async loadEndedAuctions() {
        try {
            const data = await apiService.get(API_CONFIG.ENDPOINTS.AUCTIONS.GET_ENDED);
            this.endedAuctions = data.auctions ? data.auctions.map(a => new Auction(a)) : [];
            return this.endedAuctions;
        } catch (error) {
            console.error('Load ended auctions error:', error);
            return [];
        }
    }

    /**
     * Get auction by ID
     */
    async getAuction(id) {
        try {
            const endpoint = API_CONFIG.ENDPOINTS.AUCTIONS.GET_BY_ID.replace('{id}', id);
            const data = await apiService.get(endpoint);
            this.currentAuction = new Auction(data);
            return this.currentAuction;
        } catch (error) {
            console.error('Get auction error:', error);
            return null;
        }
    }

    /**
     * Create auction
     */
    async createAuction(auctionData) {
        try {
            const response = await apiService.post(API_CONFIG.ENDPOINTS.AUCTIONS.CREATE, auctionData);
            if (response.auction) {
                return { success: true, auction: new Auction(response.auction) };
            }
            return { success: false, error: 'Failed to create auction' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Update auction
     */
    async updateAuction(id, auctionData) {
        try {
            const endpoint = API_CONFIG.ENDPOINTS.AUCTIONS.UPDATE.replace('{id}', id);
            const response = await apiService.put(endpoint, auctionData);
            if (response.auction) {
                this.currentAuction = new Auction(response.auction);
                return { success: true, auction: this.currentAuction };
            }
            return { success: false, error: 'Failed to update auction' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete auction
     */
    async deleteAuction(id) {
        try {
            const endpoint = API_CONFIG.ENDPOINTS.AUCTIONS.DELETE.replace('{id}', id);
            await apiService.delete(endpoint);
            if (this.currentAuction && this.currentAuction.id === id) {
                this.currentAuction = null;
            }
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Place bid
     */
    async placeBid(auctionId, amount) {
        try {
            const endpoint = API_CONFIG.ENDPOINTS.AUCTIONS.PLACE_BID.replace('{id}', auctionId);
            const response = await apiService.post(endpoint, { amount });
            if (response.bid) {
                // Update local data
                if (this.currentAuction && this.currentAuction.id === auctionId) {
                    this.currentAuction.currentBid = response.bid.amount;
                    this.currentAuction.highestBidder = response.bid.user;
                    this.currentAuction.bidCount++;
                    this.currentAuction.bids.push(response.bid);
                    this.currentAuction.recentBidders.unshift(response.bid.user);
                    this.currentAuction.recentBidders = this.currentAuction.recentBidders.slice(0, 10);
                }
                this.notifyBidUpdate(auctionId, response.bid);
                return { success: true, bid: response.bid };
            }
            return { success: false, error: 'Failed to place bid' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get bids for auction
     */
    async getBids(auctionId) {
        try {
            const endpoint = API_CONFIG.ENDPOINTS.AUCTIONS.GET_BIDS.replace('{id}', auctionId);
            const data = await apiService.get(endpoint);
            this.bids = data.bids || [];
            return this.bids;
        } catch (error) {
            console.error('Get bids error:', error);
            return [];
        }
    }

    /**
     * Get recent bidders
     */
    async getRecentBidders(auctionId) {
        try {
            const endpoint = API_CONFIG.ENDPOINTS.AUCTIONS.GET_RECENT_BIDDERS.replace('{id}', auctionId);
            const data = await apiService.get(endpoint);
            return data.bidders || [];
        } catch (error) {
            console.error('Get recent bidders error:', error);
            return [];
        }
    }

    /**
     * Load watchlist
     */
    async loadWatchlist() {
        try {
            const data = await apiService.get(API_CONFIG.ENDPOINTS.AUCTIONS.GET_WATCHLIST);
            this.watchlist = data.auctions ? data.auctions.map(a => new Auction(a)) : [];
            return this.watchlist;
        } catch (error) {
            console.error('Load watchlist error:', error);
            return [];
        }
    }

    /**
     * Add to watchlist
     */
    async addToWatchlist(auctionId) {
        try {
            const endpoint = API_CONFIG.ENDPOINTS.AUCTIONS.ADD_TO_WATCHLIST.replace('{id}', auctionId);
            await apiService.post(endpoint, {});
            if (!this.watchlist.some(a => a.id === auctionId)) {
                const auction = await this.getAuction(auctionId);
                if (auction) {
                    this.watchlist.push(auction);
                }
            }
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Remove from watchlist
     */
    async removeFromWatchlist(auctionId) {
        try {
            const endpoint = API_CONFIG.ENDPOINTS.AUCTIONS.REMOVE_FROM_WATCHLIST.replace('{id}', auctionId);
            await apiService.delete(endpoint);
            this.watchlist = this.watchlist.filter(a => a.id !== auctionId);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Check if in watchlist
     */
    isInWatchlist(auctionId) {
        return this.watchlist.some(a => a.id === auctionId);
    }

    /**
     * Start auction timer
     */
    startAuctionTimer(auctionId, onUpdate, onEnd) {
        if (this.timerIntervals[auctionId]) {
            clearInterval(this.timerIntervals[auctionId]);
        }

        this.timerIntervals[auctionId] = setInterval(async () => {
            try {
                const auction = await this.getAuction(auctionId);
                if (!auction || !auction.isActive()) {
                    clearInterval(this.timerIntervals[auctionId]);
                    delete this.timerIntervals[auctionId];
                    if (onEnd) onEnd(auction);
                    return;
                }
                if (onUpdate) onUpdate(auction);
            } catch (error) {
                console.error('Timer update error:', error);
            }
        }, 10000); // Update every 10 seconds

        return this.timerIntervals[auctionId];
    }

    /**
     * Stop auction timer
     */
    stopAuctionTimer(auctionId) {
        if (this.timerIntervals[auctionId]) {
            clearInterval(this.timerIntervals[auctionId]);
            delete this.timerIntervals[auctionId];
        }
    }

    /**
     * Add bid update listener
     */
    addBidListener(callback) {
        this.bidUpdateListeners.push(callback);
    }

    /**
     * Notify bid update
     */
    notifyBidUpdate(auctionId, bid) {
        this.bidUpdateListeners.forEach(callback => {
            try {
                callback(auctionId, bid);
            } catch (error) {
                console.error('Bid listener error:', error);
            }
        });
    }

    /**
     * Get user auctions
     */
    async getUserAuctions() {
        try {
            const data = await apiService.get(API_CONFIG.ENDPOINTS.AUCTIONS.GET_USER_AUCTIONS);
            return data.auctions ? data.auctions.map(a => new Auction(a)) : [];
        } catch (error) {
            console.error('Get user auctions error:', error);
            return [];
        }
    }

    /**
     * Get highest bid for auction
     */
    async getHighestBid(auctionId) {
        try {
            const endpoint = API_CONFIG.ENDPOINTS.AUCTIONS.GET_HIGHEST_BID.replace('{id}', auctionId);
            const data = await apiService.get(endpoint);
            return data.highestBid || 0;
        } catch (error) {
            console.error('Get highest bid error:', error);
            return 0;
        }
    }
}

// Export singleton
export const auctionController = new AuctionController();