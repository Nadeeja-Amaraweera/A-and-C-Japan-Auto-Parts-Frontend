/**
 * Product Model
 */

export class Product {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.sku = data.sku || '';
        this.description = data.description || '';
        this.price = data.price || 0;
        this.stockQuantity = data.stockQuantity || 0;
        this.categoryId = data.categoryId || null;
        this.images = data.images || [];
        this.supplierId = data.supplierId || null;
        this.isFeatured = data.isFeatured || false;
        this.createdAt = data.createdAt || null;
    }

    get primaryImage() {
        return this.images.length > 0 ? this.images[0] : 'assets/images/placeholder-product.jpg';
    }

    inStock() {
        return this.stockQuantity > 0;
    }
}
