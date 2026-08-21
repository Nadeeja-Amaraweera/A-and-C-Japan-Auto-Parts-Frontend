/**
 * CartItem Model
 */

export class CartItem {
    constructor(data = {}) {
        this.id = data.id || null; // Usually combination of cart ID and product ID
        this.productId = data.productId || null;
        this.product = data.product || null; // Nested Product object
        this.quantity = data.quantity || 1;
        this.addedAt = data.addedAt || new Date().toISOString();
    }

    get itemTotal() {
        if (!this.product) return 0;
        return this.product.price * this.quantity;
    }
}
