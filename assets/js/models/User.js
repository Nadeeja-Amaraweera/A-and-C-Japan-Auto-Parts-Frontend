/**
 * User Model
 * Represents a user in the system
 */

export class User {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.email = data.email || '';
        this.phone = data.phone || '';
        this.role = data.role || 'USER'; // USER, SUPPLIER, ADMIN
        this.supplierStatus = data.supplierStatus || 'PENDING'; // PENDING, APPROVED, REJECTED
        this.avatar = data.avatar || '';
        this.address = data.address || '';
        this.city = data.city || '';
        this.state = data.state || '';
        this.country = data.country || 'Japan';
        this.zipCode = data.zipCode || '';
        this.bio = data.bio || '';
        this.company = data.company || '';
        this.website = data.website || '';
        this.socialLinks = data.socialLinks || {
            facebook: '',
            twitter: '',
            instagram: '',
            youtube: ''
        };
        this.preferences = data.preferences || {
            language: 'en',
            currency: 'USD',
            notifications: true,
            darkMode: false,
            emailUpdates: true
        };
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.lastLogin = data.lastLogin || null;
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.isVerified = data.isVerified !== undefined ? data.isVerified : false;
        this.twoFactorEnabled = data.twoFactorEnabled || false;
        this.documents = data.documents || [];
        this.rating = data.rating || 0;
        this.reviewCount = data.reviewCount || 0;
        this.totalAuctions = data.totalAuctions || 0;
        this.totalBids = data.totalBids || 0;
        this.totalPurchases = data.totalPurchases || 0;
        this.wishlist = data.wishlist || [];
        this.watchlist = data.watchlist || [];
        this.recentlyViewed = data.recentlyViewed || [];
        this.searchHistory = data.searchHistory || [];
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