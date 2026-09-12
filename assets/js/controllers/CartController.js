import { API_CONFIG } from '../api-config.js';
import { apiService } from '../api-service.js';
import { storage } from '../utils/storage.js';

class CartController {
    async getCart() {
        try {
            const user = storage.getUser();
            if (!user) return null;
            const userId = user.id || user.userId;
            const response = await apiService.get(`/cart?userId=${userId}`);
            if (response && response.status === 0) {
                return response.body;
            }
            return null;
        } catch (error) {
            console.error('getCart error:', error);
            return null;
        }
    }

    async addToCart(productId, quantity = 1) {
        try {
            const user = storage.getUser();
            if (!user) {
                return { success: false, error: 'Please log in to add items to cart' };
            }
            const userId = user.id || user.userId;
            const response = await apiService.post(`/cart/items?userId=${userId}&productId=${productId}&quantity=${quantity}`, {});
            if (response && response.status === 0) {
                this.updateCartBadge(response.body);
                return { success: true, cart: response.body, message: 'Item added to cart!' };
            }
            return { success: false, error: response?.message || 'Failed to add item to cart' };
        } catch (error) {
            console.error('addToCart error:', error);
            return { success: false, error: error.message || 'Error adding to cart' };
        }
    }

    async updateQuantity(cartItemId, quantity) {
        try {
            const user = storage.getUser();
            if (!user) return { success: false, error: 'Login required' };
            const userId = user.id || user.userId;
            const response = await apiService.put(`/cart/items/${cartItemId}?userId=${userId}&quantity=${quantity}`, {});
            if (response && response.status === 0) {
                this.updateCartBadge(response.body);
                return { success: true, cart: response.body };
            }
            return { success: false, error: response?.message || 'Failed to update quantity' };
        } catch (error) {
            console.error('updateQuantity error:', error);
            return { success: false, error: error.message };
        }
    }

    async removeItem(cartItemId) {
        try {
            const user = storage.getUser();
            if (!user) return { success: false, error: 'Login required' };
            const userId = user.id || user.userId;
            const response = await apiService.delete(`/cart/items/${cartItemId}?userId=${userId}`);
            if (response && response.status === 0) {
                this.updateCartBadge(response.body);
                return { success: true, cart: response.body };
            }
            return { success: false, error: response?.message || 'Failed to remove item' };
        } catch (error) {
            console.error('removeItem error:', error);
            return { success: false, error: error.message };
        }
    }

    async clearCart() {
        try {
            const user = storage.getUser();
            if (!user) return;
            const userId = user.id || user.userId;
            await apiService.delete(`/cart?userId=${userId}`);
            this.updateCartBadge({ items: [] });
        } catch (error) {
            console.error('clearCart error:', error);
        }
    }

    async updateCartBadge(cart) {
        if (!cart) {
            cart = await this.getCart();
        }
        const count = (cart && cart.items) ? cart.items.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0;
        const badges = [
            document.getElementById('topbar-cart-count'),
            document.getElementById('nav-cart-badge'),
            document.getElementById('cart-badge'),
            document.getElementById('cartBadge'),
            document.querySelector('.cart-badge')
        ];

        badges.forEach(badge => {
            if (badge) {
                badge.textContent = count;
                if (count > 0) {
                    badge.classList.remove('hidden');
                    badge.style.display = 'inline-block';
                } else {
                    badge.classList.add('hidden');
                    badge.style.display = 'none';
                }
            }
        });
    }
}

export const cartController = new CartController();
