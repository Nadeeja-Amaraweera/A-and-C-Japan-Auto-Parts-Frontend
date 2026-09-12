/**
 * User Model
 * Represents a user in the system
 */

export class User {
    constructor(data = {}) {
        this.id = data.userId || data.id || null;
        this.userId = this.id;
        this.name = data.username || data.userName || data.name || '';
        this.email = data.userEmail || data.email || '';
        this.role = data.userRole || data.role || 'CUSTOMER';
        this.supplierStatus = data.supplierStatus || null;
        this.token = data.token || null;
    }

    isAdmin() {
        return this.role === 'ADMIN';
    }

    isSupplier() {
        return this.role === 'SUPPLIER';
    }

    canSell() {
        return this.role === 'SUPPLIER' || this.role === 'ADMIN';
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
            id: this.id,
            userId: this.id,
            name: this.name,
            username: this.name,
            email: this.email,
            userEmail: this.email,
            role: this.role,
            userRole: this.role,
            supplierStatus: this.supplierStatus,
            token: this.token
        };
    }

    static fromJSON(data) {
        return new User(data);
    }
}