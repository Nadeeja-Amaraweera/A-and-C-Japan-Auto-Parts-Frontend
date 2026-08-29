/**
 * User Model
 * Represents a user in the system
 */

export class User {
    constructor(data = {}) {
        this.id = data.userId || data.id || null;
        this.name = data.userName || data.name || '';
        this.token = data.token || null;
    }

    /**
     * Check if user is admin
     */
    isAdmin() {
        return this.role === 'ADMIN';
    }

    /**
     * Check if user is supplier
     */
    isSupplier() {
        return this.role === 'SUPPLIER' && this.supplierStatus === 'APPROVED';
    }

    /**
     * Check if user can sell items
     */
    canSell() {
        return this.isSupplier() || this.role === 'ADMIN';
    }

    /**
     * Check if user is verified
     */
    isVerified() {
        return this.isVerified;
    }

    /**
     * Get full name with initial
     */
    getInitials() {
        if (!this.name) return 'U';
        return this.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    /**
     * Get user display name
     */
    getDisplayName() {
        return this.name || this.email || 'User';
    }

    /**
     * Convert to JSON
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            phone: this.phone,
            role: this.role,
            supplierStatus: this.supplierStatus,
            avatar: this.avatar,
            address: this.address,
            city: this.city,
            state: this.state,
            country: this.country,
            zipCode: this.zipCode,
            bio: this.bio,
            company: this.company,
            website: this.website,
            socialLinks: this.socialLinks,
            preferences: this.preferences,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            lastLogin: this.lastLogin,
            isActive: this.isActive,
            isVerified: this.isVerified,
            twoFactorEnabled: this.twoFactorEnabled,
            documents: this.documents,
            rating: this.rating,
            reviewCount: this.reviewCount,
            totalAuctions: this.totalAuctions,
            totalBids: this.totalBids,
            totalPurchases: this.totalPurchases,
            wishlist: this.wishlist,
            watchlist: this.watchlist,
            recentlyViewed: this.recentlyViewed,
            searchHistory: this.searchHistory
        };
    }

    /**
     * Create from JSON
     */
    static fromJSON(data) {
        return new User(data);
    }

    /**
     * Validate user data
     */
    validate() {
        const errors = {};

        if (!this.name || this.name.length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }

        if (!this.email || !this.isValidEmail(this.email)) {
            errors.email = 'Valid email is required';
        }

        if (!this.phone || this.phone.length < 10) {
            errors.phone = 'Valid phone number is required';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
}