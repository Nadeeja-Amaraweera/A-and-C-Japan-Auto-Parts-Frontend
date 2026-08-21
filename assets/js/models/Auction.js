/**
 * Auction Model
 * Represents an auction listing
 */

export class Auction {
    constructor(data = {}) {
        this.id = data.id || null;
        this.title = data.title || '';
        this.vehicleId = data.vehicleId || null;
        this.vehicle = data.vehicle || null;
        this.type = data.type || 'VEHICLE'; // VEHICLE, PARTS, COLLECTIBLE
        this.startingPrice = data.startingPrice || 0;
        this.reservePrice = data.reservePrice || null;
        this.currentBid = data.currentBid || 0;
        this.minBidIncrement = data.minBidIncrement || 100;
        this.buyItNowPrice = data.buyItNowPrice || null;
        this.startDate = data.startDate || new Date().toISOString();
        this.endDate = data.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        this.extendedEndDate = data.extendedEndDate || null;
        this.status = data.status || 'SCHEDULED'; // SCHEDULED, ACTIVE, ENDED, CANCELLED
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
     * Check if auction is active
     */
    isActive() {
        if (this.status !== 'ACTIVE') return false;
        const now = new Date();
        const end = new Date(this.endDate);
        return now < end && this.status === 'ACTIVE';
    }

    /**
     * Check if auction is ending soon
     */
    isEndingSoon(minutes = 30) {
        if (!this.isActive()) return false;
        const now = new Date();
        const end = new Date(this.endDate);
        const diff = (end - now) / (1000 * 60);
        return diff > 0 && diff < minutes;
    }

    /**
     * Get remaining time
     */
    getRemainingTime() {
        const now = new Date();
        const end = new Date(this.endDate);
        const diff = end - now;

        if (diff <= 0) {
            return {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                total: 0,
                isEnded: true
            };
        }

        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000),
            total: diff,
            isEnded: false
        };
    }

    /**
     * Get formatted remaining time string
     */
    getFormattedRemainingTime() {
        const time = this.getRemainingTime();
        if (time.isEnded) return 'Auction ended';

        if (time.days > 0) {
            return `${time.days}d ${time.hours}h ${time.minutes}m`;
        } else if (time.hours > 0) {
            return `${time.hours}h ${time.minutes}m ${time.seconds}s`;
        } else {
            return `${time.minutes}m ${time.seconds}s`;
        }
    }

    /**
     * Check if reserve price is met
     */
    isReserveMet() {
        if (!this.reservePrice) return true;
        return this.currentBid >= this.reservePrice;
    }

    /**
     * Get next minimum bid
     */
    getNextMinimumBid() {
        return this.currentBid + this.minBidIncrement;
    }

    /**
     * Get bid progress percentage
     */
    getBidProgress() {
        if (!this.reservePrice || this.reservePrice <= 0) return 100;
        const progress = (this.currentBid / this.reservePrice) * 100;
        return Math.min(progress, 100);
    }

    /**
     * Get top bidders
     */
    getTopBidders(limit = 10) {
        return this.bids
            .sort((a, b) => b.amount - a.amount)
            .slice(0, limit);
    }

    /**
     * Check if user is the highest bidder
     */
    isHighestBidder(userId) {
        if (!this.highestBidder) return false;
        return this.highestBidder.id === userId || this.highestBidder === userId;
    }

    /**
     * Check if user can bid
     */
    canBid(userId) {
        if (!this.isActive()) return false;
        if (this.highestBidder && this.highestBidder.id === userId) return false;
        return true;
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

    /**
     * Validate auction data
     */
    validate() {
        const errors = {};

        if (!this.title || this.title.length < 5) {
            errors.title = 'Title must be at least 5 characters';
        }

        if (this.startingPrice <= 0) {
            errors.startingPrice = 'Starting price must be greater than 0';
        }

        if (this.reservePrice && this.reservePrice < this.startingPrice) {
            errors.reservePrice = 'Reserve price must be greater than or equal to starting price';
        }

        const start = new Date(this.startDate);
        const end = new Date(this.endDate);

        if (start >= end) {
            errors.endDate = 'End date must be after start date';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}