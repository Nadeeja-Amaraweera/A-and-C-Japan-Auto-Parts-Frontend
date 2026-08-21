/**
 * Global Listeners Setup
 * Initializes global event listeners that persist across views
 */
import { eventBus } from './EventBus.js';

export const setupGlobalListeners = () => {
    // Example global listeners setup
    
    // Listen for auth state changes to update UI
    eventBus.on('auth:login', (user) => {
        console.log('User logged in globally:', user);
        // Can trigger global UI updates here (like header updates)
    });

    eventBus.on('auth:logout', () => {
        console.log('User logged out globally');
        // Can trigger global UI updates here
    });

    // Listen for cart changes
    eventBus.on('cart:updated', (cartData) => {
        console.log('Cart updated globally:', cartData);
        // Can trigger cart icon counter update here
    });
};
