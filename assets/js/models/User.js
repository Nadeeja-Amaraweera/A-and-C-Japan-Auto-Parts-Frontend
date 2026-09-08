/**
 * User Model
 * Represents a user in the system
 */

export class User {
    constructor(data = {}) {
        this.id = data.userId || data.id || null;
        this.name = data.username || data.userName || data.name || '';
        this.token = data.token || null;
    }

    isAdmin() {
        return this.role === 'ADMIN';
    }

    isSupplier() {
        return this.role === 'SUPPLIER' && this.supplierStatus === 'APPROVED';
    }

    canSell() {
        return this.isSupplier() || this.role === 'ADMIN';
    }

    isVerified() {
        return this.isVerified;
    }

    getInitials() {
        if (!this.name) return 'U';
        return this.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    getDisplayName() {
        return this.name || this.email || 'User';
    }

    toJSON() {
        return {
            userId: this.id,
            username: this.name,
            token: this.token
        };
    }

    static fromJSON(data) {
        return new User(data);
    }
}