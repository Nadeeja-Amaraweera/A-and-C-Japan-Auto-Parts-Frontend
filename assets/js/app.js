/**
 * Main Application
 * Initializes and manages the entire application
 */
import { API_CONFIG } from './api-config.js';
import { apiService } from './api-service.js';
import { authController } from './controllers/AuthController.js';
import { auctionController } from './controllers/AuctionController.js';
import { adminController } from './controllers/AdminController.js';
import { eventBus, EVENTS } from './events/EventBus.js';
import { Helpers } from './utils/helpers.js';

// Expose adminController globally for inline onclick handlers in the admin dashboard
window.adminController = adminController;

class App {
    constructor() {
        this.apiService = apiService;
        this.authController = authController;
        this.auctionController = auctionController;
        this.eventBus = eventBus;
        this.theme = localStorage.getItem(API_CONFIG.STORAGE_KEYS.THEME) || 'light';
        this.language = localStorage.getItem(API_CONFIG.STORAGE_KEYS.LANGUAGE) || 'en';
        this.currency = localStorage.getItem(API_CONFIG.STORAGE_KEYS.CURRENCY) || 'USD';
        this.isInitialized = false;
        this.currentPage = this.getCurrentPage();
        this.loading = false;
        this.modals = [];
        this.toasts = [];
    }

    /**
     * Initialize application
     */
    async init() {
        if (this.isInitialized) return;

        try {
            this.showLoading();

            // Initialize auth
            await this.authController.init();

            // Set theme
            this.applyTheme();

            // Set language
            this.applyLanguage();

            // Initialize page
            await this.initializePage();

            // Setup global event listeners
            this.setupGlobalListeners();

            // Load initial data
            await this.loadInitialData();

            this.authController.restoreSession();

            this.isInitialized = true;

            // Emit initialization event
            this.eventBus.emit('app:initialized', {
                user: this.authController.getCurrentUser(),
                page: this.currentPage
            });

            this.hideLoading();

        } catch (error) {
            console.error('App initialization error:', error);
            this.hideLoading();
            this.showError('Failed to initialize application');
        }
    }

    /**
     * Get current page
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '') || 'index';
        return page;
    }

    /**
     * Initialize page specific logic
     */
    async initializePage() {
        // Check if we're on a page that needs to be loaded
        const pageLoader = this.getPageLoader(this.currentPage);
        if (pageLoader) {
            await pageLoader();
        }
    }

    /**
     * Get page loader function
     */
    getPageLoader(page) {

        console.log(page);
        const loaders = {
            'index': () => this.loadHomePage(),
            'auctions': () => this.loadAuctionsPage(),
            'auction-details': () => this.loadAuctionDetailsPage(),
            'add-auction': () => this.loadAddAuctionPage(),
            'profile': () => this.loadProfilePage(),
            'supplier-dashboard': () => this.loadSupplierDashboard(),
            'admin': () => adminController.init(),
            'cart': () => this.loadCartPage(),
            'login': () => this.initLoginPage(),
            'register': () => this.loadRegisterPage(),
            'contact': () => this.loadContactPage(),
            'about': () => this.loadAboutPage(),
            'faq': () => this.loadFAQPage()
        };
        return loaders[page] || null;
    }

    /**
     * Load home page
     */
    async loadHomePage() {
        try {
            // Load featured auctions
            const featuredAuctions = await this.auctionController.loadActiveAuctions();
            this.renderFeaturedAuctions(featuredAuctions.slice(0, 6));

            // Load latest vehicles
            const vehiclesData = await this.apiService.get(API_CONFIG.ENDPOINTS.VEHICLES.GET_ALL + '?limit=8');
            this.renderLatestVehicles(vehiclesData.vehicles || []);

            // Load deals
            const dealsData = await this.apiService.get(API_CONFIG.ENDPOINTS.PRODUCTS.GET_DEALS);
            this.renderDeals(dealsData.deals || []);

        } catch (error) {
            console.error('Home page load error:', error);
        }
    }

    /**
     * Load auctions page
     */
    async loadAuctionsPage() {
        try {
            const params = this.getURLParams();
            const auctions = await this.auctionController.loadAuctions(params);
            this.renderAuctions(auctions);

            // Setup filters
            this.setupAuctionFilters();

        } catch (error) {
            console.error('Auctions page load error:', error);
        }
    }

    /**
     * Load auction details page
     */
    async loadAuctionDetailsPage() {
        const urlParams = this.getURLParams();
        const auctionId = urlParams.id;

        if (!auctionId) {
            this.showError('Auction not found');
            return;
        }

        try {
            const auction = await this.auctionController.getAuction(auctionId);
            if (!auction) {
                this.showError('Auction not found');
                return;
            }

            this.renderAuctionDetails(auction);

            // Load bids
            const bids = await this.auctionController.getBids(auctionId);
            this.renderBids(bids);

            // Load recent bidders
            const bidders = await this.auctionController.getRecentBidders(auctionId);
            this.renderRecentBidders(bidders);

            // Setup bid form
            this.setupBidForm(auction);

            // Start timer
            this.auctionController.startAuctionTimer(
                auctionId,
                (updatedAuction) => this.updateAuctionTimer(updatedAuction),
                (endedAuction) => this.handleAuctionEnd(endedAuction)
            );

        } catch (error) {
            console.error('Auction details load error:', error);
            this.showError('Failed to load auction details');
        }
    }

    // ✅ Login Page Initialization
    async initLoginPage() {
        console.log('🔐 Setting up login page...');

        // Already logged in? Redirect
        if (this.authController.checkIsAuthenticated()) {
            console.log("already logged in")

            window.location.href = 'profile.html';
            return;
        }

        // ---------- LOGIN FORM ----------
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                // 1. Get data
                const userEmail = document.getElementById('loginEmail')?.value?.trim();
                const password = document.getElementById('loginPassword')?.value?.trim();

                // 2. Validate
                if (!userEmail || !password) {
                    this.showError('Please enter email and password');
                    return;
                }

                // 3. Show loading
                const button = document.getElementById('loginButton');
                button.disabled = true;
                button.textContent = 'Logging in...';

                // 4. Call AuthController
                const result = await this.authController.login(userEmail, password);

                // 5. Handle result
                if (result.success) {
                    this.showSuccess('Login successful!');
                    alert('login ok');
                    window.location.href = 'index.html';
                } else {
                    this.showError(result.error || 'Login failed');
                    button.disabled = false;
                    button.textContent = 'Login';
                }
            });
        }

        // ---------- REGISTER FORM ----------
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                // 1. Get data
                const name = document.getElementById('regName')?.value?.trim();
                const email = document.getElementById('regEmail')?.value?.trim();
                const phone = document.getElementById('regPhone')?.value?.trim();
                const address = document.getElementById('regAddress')?.value?.trim();
                const password = document.getElementById('regPassword')?.value;
                const confirmPassword = document.getElementById('regConfirmPassword')?.value;
                const termsChecked = document.getElementById('regTerms')?.checked;



                // 2. Validate
                if (!name || !email || !phone || !address || !password || !confirmPassword) {
                    this.showError('Please fill all required fields');
                    return;
                }

                if (password !== confirmPassword) {
                    this.showError('Passwords do not match!');
                    return;
                }

                if (password.length < 3) {
                    this.showError('Password must be at least 6 characters');
                    return;
                }

                if (!termsChecked) {
                    this.showError('Please accept Terms & Conditions');
                    return;
                }

                // 3. Show loading
                const button = document.getElementById('registerButton');
                // button.disabled = true;
                // button.textContent = 'Creating account...';

                // 4. Prepare data
                const userData = {
                    userName: name,
                    userEmail: email,
                    userPhone: phone,
                    userAddress: address,
                    userPassword: password,
                };

                // 5. Call AuthController
                const result = await this.authController.register(userData);

                // 6. Handle result
                if (result.success) {
                    this.showSuccess('Registration successful! Please login.');
                    document.getElementById('registerForm').reset();
                    const loginEmail = document.getElementById('loginEmail');
                    loginEmail.focus();

                    // window.location.href = 'login.html';
                } else {
                    this.showError(result.error || 'Registration failed');
                    // button.disabled = false;
                    // button.textContent = 'Create Account';
                }
            });
        }
    }

    /**
     * Load profile page
     */
    async loadProfilePage() {
        console.log('👤 Loading profile page...');
        if (!this.authController.checkIsAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }
    }

    /**
     * Setup bid form
     */
    setupBidForm(auction) {
        const form = document.getElementById('bid-form');
        if (!form) return;

        const input = form.querySelector('input[name="bid-amount"]');
        const button = form.querySelector('button[type="submit"]');

        // Set minimum bid
        const minBid = auction.getNextMinimumBid();
        if (input) {
            input.min = minBid;
            input.value = minBid;
            input.placeholder = `Minimum: ${this.formatCurrency(minBid)}`;
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!this.authController.checkIsAuthenticated()) {
                this.showError('Please login to place a bid');
                return;
            }

            const amount = parseFloat(input.value);
            if (amount < minBid) {
                this.showError(`Minimum bid is ${this.formatCurrency(minBid)}`);
                return;
            }

            button.disabled = true;
            button.textContent = 'Placing bid...';

            const result = await this.auctionController.placeBid(auction.id, amount);

            button.disabled = false;
            button.textContent = 'Place Bid';

            if (result.success) {
                this.showSuccess('Bid placed successfully!');
                this.updateBidDisplay(auction.id);
            } else {
                this.showError(result.error || 'Failed to place bid');
            }
        });
    }

    /**
     * Setup global event listeners
     */
    setupGlobalListeners() {
        // Auth state changes
        this.authController.addListener((user, isAuthenticated) => {
            this.updateUIForAuth(user, isAuthenticated);
            this.eventBus.emit(EVENTS.AUTH.UPDATE, { user, isAuthenticated });
        });

        // Bid updates
        this.auctionController.addBidListener((auctionId, bid) => {
            this.updateBidDisplay(auctionId, bid);
        });

        // Theme toggle
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-theme-toggle]')) {
                this.toggleTheme();
            }
        });

        // Logout handling
        document.addEventListener('click', async (e) => {
            const logoutTarget = e.target.closest('#logoutBtn, [data-logout]');
            if (logoutTarget) {
                e.preventDefault();
                console.log('🔴 Log out button clicked');
                await this.authController.logout();
                this.showSuccess('Logged out successfully!');
                window.location.href = 'login.html';
            }
        });

        // Language selector
        document.addEventListener('change', (e) => {
            if (e.target.matches('[data-language]')) {
                this.setLanguage(e.target.value);
            }
        });

        // Currency selector
        document.addEventListener('change', (e) => {
            if (e.target.matches('[data-currency]')) {
                this.setCurrency(e.target.value);
            }
        });

        // Mobile menu toggle
        const menuToggle = document.querySelector('[data-menu-toggle]');
        const mobileMenu = document.querySelector('[data-mobile-menu]');
        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Cart update
        this.eventBus.on(EVENTS.CART.ADDED, () => this.updateCartBadge());
        this.eventBus.on(EVENTS.CART.REMOVED, () => this.updateCartBadge());
        this.eventBus.on(EVENTS.CART.UPDATED, () => this.updateCartBadge());

        // Handle page visibility change (for real-time updates)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // Page became visible, refresh data
                this.refreshPageData();
            }
        });
    }

    /**
     * Load initial data
     */
    async loadInitialData() {
        try {
            // Load categories
            const categoriesData = await this.apiService.get(API_CONFIG.ENDPOINTS.CATEGORIES.GET_ALL);
            this.renderCategories(categoriesData.categories || []);

            // Load cart count
            await this.updateCartBadge();

            // Load notifications if authenticated
            if (this.authController.checkIsAuthenticated()) {
                await this.loadNotifications();
            }

        } catch (error) {
            console.error('Initial data load error:', error);
        }
    }

    /**
     * Update UI based on auth state
     */
    updateUIForAuth(user, isAuthenticated) {
        const authElements = document.querySelectorAll('[data-auth]');
        const guestElements = document.querySelectorAll('[data-guest]');

        if (isAuthenticated && user) {
            authElements.forEach(el => el.style.display = '');
            guestElements.forEach(el => el.style.display = 'none');

            // Update user info
            const nameElements = document.querySelectorAll('[data-user-name]');
            nameElements.forEach(el => el.textContent = user.getDisplayName());

            const avatarElements = document.querySelectorAll('[data-user-avatar]');
            avatarElements.forEach(el => {
                if (user.avatar) {
                    el.src = user.avatar;
                } else {
                    el.textContent = user.getInitials();
                    el.classList.add('bg-primary');
                }
            });

        } else {
            authElements.forEach(el => el.style.display = 'none');
            guestElements.forEach(el => el.style.display = '');
        }
    }

    /**
     * Apply theme
     */
    applyTheme() {
        if (this.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        localStorage.setItem(API_CONFIG.STORAGE_KEYS.THEME, this.theme);
        this.eventBus.emit(EVENTS.UI.THEME_CHANGE, { theme: this.theme });
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
    }

    /**
     * Apply language
     */
    applyLanguage() {
        // Update language selector
        const selects = document.querySelectorAll('[data-language]');
        selects.forEach(select => {
            select.value = this.language;
        });

        // Update HTML lang attribute
        document.documentElement.lang = this.language;

        localStorage.setItem(API_CONFIG.STORAGE_KEYS.LANGUAGE, this.language);
        this.eventBus.emit(EVENTS.UI.LANGUAGE_CHANGE, { language: this.language });
    }

    /**
     * Set language
     */
    setLanguage(language) {
        this.language = language;
        this.applyLanguage();
    }

    /**
     * Set currency
     */
    setCurrency(currency) {
        this.currency = currency;
        localStorage.setItem(API_CONFIG.STORAGE_KEYS.CURRENCY, currency);
        this.eventBus.emit(EVENTS.UI.CURRENCY_CHANGE, { currency });

        // Refresh prices
        this.refreshPrices();
    }

    /**
     * Format currency
     */
    formatCurrency(amount) {
        return Helpers.formatCurrency(amount, this.currency);
    }

    /**
     * Show loading state
     */
    showLoading(message = 'Loading...') {
        this.loading = true;
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            const messageEl = overlay.querySelector('.loading-message');
            if (messageEl) messageEl.textContent = message;
        }
        this.eventBus.emit(EVENTS.UI.LOADING_START, { message });
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        this.loading = false;
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        this.eventBus.emit(EVENTS.UI.LOADING_END);
    }

    /**
     * Show success notification
     */
    showSuccess(message, duration = 5000) {
        let container = document.getElementById('success-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'success-toast-container';
            // Top-center position specifically for success messages
            container.className = 'fixed top-5 left-1/2 transform -translate-x-1/2 z-[10000] flex flex-col items-center space-y-3 pointer-events-none';
            document.body.appendChild(container);
        }

        const toastEl = document.createElement('div');
        toastEl.className = 'bg-green-50 text-green-900 border border-green-200 pointer-events-auto px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-4 min-w-[320px] max-w-lg transform transition-all duration-500 -translate-y-24 opacity-0';

        toastEl.innerHTML = `
            <div class="flex-shrink-0 bg-green-500 rounded-full h-8 w-8 flex items-center justify-center shadow-inner">
                <i class="fas fa-check text-white text-sm"></i>
            </div>
            <div class="font-semibold flex-1 text-sm tracking-wide">${message}</div>
            <button onclick="this.parentElement.style.opacity='0'; this.parentElement.style.transform='translateY(-24px)'; setTimeout(() => this.parentElement.remove(), 500)" class="text-green-600 hover:text-green-800 focus:outline-none transition-colors p-1">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toastEl);

        // Trigger entrance animation
        setTimeout(() => {
            toastEl.classList.remove('-translate-y-24', 'opacity-0');
        }, 10);

        // Auto remove
        setTimeout(() => {
            if (toastEl.parentElement) {
                toastEl.classList.add('-translate-y-24', 'opacity-0');
                setTimeout(() => toastEl.remove(), 500);
            }
        }, duration);
    }

    /**
     * Show error notification
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Show info notification
     */
    showInfo(message) {
        this.showNotification(message, 'info');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = 5000) {
        const toast = {
            id: Date.now(),
            message,
            type,
            duration
        };

        this.toasts.push(toast);
        this.renderToast(toast);

        setTimeout(() => {
            this.removeToast(toast.id);
        }, duration);

        this.eventBus.emit(EVENTS.UI.NOTIFICATION, { message, type });
    }

    /**
     * Render toast
     */
    renderToast(toast) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col items-end space-y-3 pointer-events-none';
            document.body.appendChild(container);
        }

        const styles = {
            success: 'bg-white text-gray-800 border-l-4 border-green-500',
            error: 'bg-white text-gray-800 border-l-4 border-red-500',
            info: 'bg-white text-gray-800 border-l-4 border-blue-500',
            warning: 'bg-white text-gray-800 border-l-4 border-yellow-500'
        };

        const icons = {
            success: '<i class="fas fa-check-circle text-green-500 text-xl"></i>',
            error: '<i class="fas fa-exclamation-circle text-red-500 text-xl"></i>',
            info: '<i class="fas fa-info-circle text-blue-500 text-xl"></i>',
            warning: '<i class="fas fa-exclamation-triangle text-yellow-500 text-xl"></i>'
        };

        const toastEl = document.createElement('div');
        toastEl.id = `toast-${toast.id}`;
        toastEl.className = `${styles[toast.type] || styles.info} pointer-events-auto px-4 py-3 rounded shadow-lg flex items-center space-x-3 min-w-[300px] max-w-md transform transition-all duration-300 translate-x-full opacity-0`;

        toastEl.innerHTML = `
            <div>${icons[toast.type] || icons.info}</div>
            <div class="font-medium flex-1 text-sm">${toast.message}</div>
            <button onclick="this.parentElement.style.opacity='0'; this.parentElement.style.transform='translateX(100%)'; setTimeout(() => this.parentElement.remove(), 300)" class="text-gray-400 hover:text-gray-600 focus:outline-none">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toastEl);

        // Trigger animation
        setTimeout(() => {
            toastEl.classList.remove('translate-x-full', 'opacity-0');
        }, 10);
    }

    /**
     * Remove toast
     */
    removeToast(id) {
        const toast = document.getElementById(`toast-${id}`);
        if (toast) {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }
        this.toasts = this.toasts.filter(t => t.id !== id);
    }

    /**
     * Update cart badge
     */
    async updateCartBadge() {
        try {
            const data = await this.apiService.get(API_CONFIG.ENDPOINTS.CART.GET_COUNT);
            const count = data.count || 0;
            const badges = document.querySelectorAll('[data-cart-badge]');
            badges.forEach(badge => {
                badge.textContent = count || '0';
                badge.style.display = count > 0 ? 'inline' : 'none';
            });
        } catch (error) {
            console.error('Update cart badge error:', error);
        }
    }

    /**
     * Get URL parameters
     */
    getURLParams() {
        return Helpers.getURLParams();
    }

    /**
     * Render methods (placeholder implementations)
     */
    renderFeaturedAuctions(auctions) {
        // Implement rendering logic
    }

    renderLatestVehicles(vehicles) {
        // Implement rendering logic
    }

    renderDeals(deals) {
        // Implement rendering logic
    }

    renderAuctions(auctions) {
        // Implement rendering logic
    }

    renderAuctionDetails(auction) {
        // Implement rendering logic
    }

    renderBids(bids) {
        // Implement rendering logic
    }

    renderRecentBidders(bidders) {
        // Implement rendering logic
    }

    renderCategories(categories) {
        // Implement rendering logic
    }

    updateAuctionTimer(auction) {
        // Implement timer update logic
    }

    handleAuctionEnd(auction) {
        this.showInfo(`Auction ${auction.title} has ended!`);
        this.eventBus.emit(EVENTS.AUCTION.ENDED, { auction });
    }

    updateBidDisplay(auctionId, bid) {
        // Implement bid display update
    }

    setupAuctionFilters() {
        // Implement filter setup
    }

    refreshPageData() {
        // Implement data refresh
    }

    refreshPrices() {
        // Implement price refresh
    }

    loadNotifications() {
        // Implement notification loading
    }


}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();

    // Make app globally accessible
    window.app = app;
});

// Export for module usage
export default App;