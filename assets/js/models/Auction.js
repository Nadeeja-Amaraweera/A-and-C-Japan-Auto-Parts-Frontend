/**
 * Auction Model
 * Represents an auction listing
 */

export class Auction {
    constructor(data = {}) {
        this.id = data.id || data.auctionId || null;
        this.auctionId = data.auctionId || data.id || null;
        this.title = data.title || '';
        this.vehicleId = data.vehicleId || null;
        this.vehicle = data.vehicle || null;
        this.type = data.type || 'VEHICLE'; // VEHICLE, PARTS, COLLECTIBLE
        this.startingPrice = data.startingPrice != null ? data.startingPrice : (data.startPrice || 0);
        this.startPrice = this.startingPrice;
        this.reservePrice = data.reservePrice || null;
        this.currentBid = data.currentBid != null ? data.currentBid : (data.highestBid || this.startingPrice);
        this.highestBid = this.currentBid;
        this.minBidIncrement = data.minBidIncrement || 100;
        this.buyItNowPrice = data.buyItNowPrice || null;
        this.startDate = data.startDate || null;
        this.endDate = data.endDate || data.endTime || null;
        this.endTime = this.endDate;
        this.timeLeftSeconds = data.timeLeftSeconds != null ? data.timeLeftSeconds : null;
        this.serverTime = data.serverTime || null;
        this.extendedEndDate = data.extendedEndDate || null;
        this.status = data.status || 'ACTIVE'; // SCHEDULED, ACTIVE, ENDED, CANCELLED
        this.bidCount = data.bidCount || 0;
        this.bidderCount = data.bidderCount || 0;
        this.views = data.views || 0;
        this.watchCount = data.watchCount || 0;
        this.description = data.description || '';
        this.images = data.images || [];
        this.thumbnail = data.thumbnail || '';
        this.isFeatured = data.isFeatured || false;
        this.isPremium = data.isPremium || false;
        this.tags = data.tags || [];
        this.seller = data.seller || null;
        this.sellerId = data.sellerId || null;
        this.highestBidder = data.highestBidder || null;
        this.bids = data.bids || [];
        this.recentBidders = data.recentBidders || [];
        this.categoryId = data.categoryId || null;
        this.category = data.category || null;
        this.location = data.location || {
            address: '',
            city: '',
            state: '',
            country: 'Japan',
            zipCode: ''
        };
        this.shippingOptions = data.shippingOptions || [];
        this.paymentTerms = data.paymentTerms || '';
        this.termsAndConditions = data.termsAndConditions || '';
        this.autoExtend = data.autoExtend || {
            enabled: true,
            minutes: 10,
            extensionCount: 0
        };
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.endedAt = data.endedAt || null;
        this.approvedAt = data.approvedAt || null;
        this.isApproved = data.isApproved || false;
        this.isPublished = data.isPublished || false;
        this.isDeleted = data.isDeleted || false;
    }


    /**
     * Convert to JSON
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            vehicleId: this.vehicleId,
            vehicle: this.vehicle,
            type: this.type,
            startingPrice: this.startingPrice,
            reservePrice: this.reservePrice,
            currentBid: this.currentBid,
            minBidIncrement: this.minBidIncrement,
            buyItNowPrice: this.buyItNowPrice,
            startDate: this.startDate,
            endDate: this.endDate,
            extendedEndDate: this.extendedEndDate,
            status: this.status,
            bidCount: this.bidCount,
            bidderCount: this.bidderCount,
            views: this.views,
            watchCount: this.watchCount,
            description: this.description,
            images: this.images,
            thumbnail: this.thumbnail,
            isFeatured: this.isFeatured,
            isPremium: this.isPremium,
            tags: this.tags,
            seller: this.seller,
            sellerId: this.sellerId,
            highestBidder: this.highestBidder,
            bids: this.bids,
            recentBidders: this.recentBidders,
            categoryId: this.categoryId,
            category: this.category,
            location: this.location,
            shippingOptions: this.shippingOptions,
            paymentTerms: this.paymentTerms,
            termsAndConditions: this.termsAndConditions,
            autoExtend: this.autoExtend,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            endedAt: this.endedAt,
            approvedAt: this.approvedAt,
            isApproved: this.isApproved,
            isPublished: this.isPublished,
            isDeleted: this.isDeleted
        };
    }

    /**
     * Create from JSON
     */
    static fromJSON(data) {
        return new Auction(data);
    }
}