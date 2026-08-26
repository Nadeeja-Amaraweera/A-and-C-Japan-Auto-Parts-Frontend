/**
 * API Configuration File
 * Contains all API endpoints and base configuration
 */

export const API_CONFIG = {
    // Base URL for all API calls
    BASE_URL: 'http://localhost:8080/api',

    // API version
    VERSION: 'v1',

    // Timeout in milliseconds
    TIMEOUT: 30000,

    // Endpoints grouped by module
    ENDPOINTS: {
        // Authentication endpoints
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            LOGOUT: '/auth/logout',
            REFRESH_TOKEN: '/auth/refresh',
            FORGOT_PASSWORD: '/auth/forgot-password',
            RESET_PASSWORD: '/auth/reset-password',
            VERIFY_EMAIL: '/auth/verify-email'
        },

        // User management endpoints
        USERS: {
            GET_ALL: '/users',
            GET_BY_ID: '/users/{id}',
            CREATE: '/users',
            UPDATE: '/users/{id}',
            DELETE: '/users/{id}',
            GET_PROFILE: '/users/profile',
            UPDATE_PROFILE: '/users/profile',
            BECOME_SUPPLIER: '/users/{id}/become-supplier',
            GET_SUPPLIER_STATUS: '/users/{id}/supplier-status',
            UPLOAD_DOCUMENTS: '/users/{id}/documents'
        },

        // Vehicle management endpoints
        VEHICLES: {
            GET_ALL: '/vehicles',
            GET_BY_ID: '/vehicles/{id}',
            CREATE: '/vehicles',
            UPDATE: '/vehicles/{id}',
            DELETE: '/vehicles/{id}',
            SEARCH: '/vehicles/search',
            FILTER: '/vehicles/filter',
            GET_BY_AUCTION: '/vehicles/auction/{auctionId}',
            GET_BY_USER: '/vehicles/user/{userId}',
            UPLOAD_IMAGES: '/vehicles/{id}/images'
        },

        // Auction management endpoints
        AUCTIONS: {
            GET_ALL: '/auctions',
            GET_ACTIVE: '/auctions/active',
            GET_UPCOMING: '/auctions/upcoming',
            GET_ENDED: '/auctions/ended',
            GET_BY_ID: '/auctions/{id}',
            CREATE: '/auctions',
            UPDATE: '/auctions/{id}',
            DELETE: '/auctions/{id}',
            PLACE_BID: '/auctions/{id}/bids',
            GET_BIDS: '/auctions/{id}/bids',
            GET_RECENT_BIDDERS: '/auctions/{id}/recent-bidders',
            GET_BIDDER_COUNT: '/auctions/{id}/bidder-count',
            GET_WATCHLIST: '/auctions/watchlist',
            ADD_TO_WATCHLIST: '/auctions/{id}/watch',
            REMOVE_FROM_WATCHLIST: '/auctions/{id}/unwatch',
            GET_USER_AUCTIONS: '/auctions/user',
            GET_HIGHEST_BID: '/auctions/{id}/highest-bid'
        },

        // Product management endpoints
        PRODUCTS: {
            GET_ALL: '/products',
            GET_BY_ID: '/products/{id}',
            CREATE: '/products',
            UPDATE: '/products/{id}',
            DELETE: '/products/{id}',
            FILTER: '/products/filter',
            SEARCH: '/products/search',
            GET_BY_CATEGORY: '/products/category/{categoryId}',
            GET_UNDER_PRICE: '/products/under/{price}',
            GET_DEALS: '/products/deals',
            UPLOAD_IMAGES: '/products/{id}/images'
        },

        // Category management endpoints
        CATEGORIES: {
            GET_ALL: '/categories',
            GET_BY_ID: '/categories/{id}',
            CREATE: '/categories',
            UPDATE: '/categories/{id}',
            DELETE: '/categories/{id}',
            GET_TREE: '/categories/tree'
        },

        // Cart management endpoints
        CART: {
            GET: '/cart',
            ADD: '/cart/add',
            UPDATE: '/cart/update',
            REMOVE: '/cart/remove',
            CLEAR: '/cart/clear',
            GET_COUNT: '/cart/count',
            GET_TOTAL: '/cart/total'
        },

        // Order management endpoints
        ORDERS: {
            CREATE: '/orders',
            GET_ALL: '/orders',
            GET_BY_ID: '/orders/{id}',
            GET_BY_USER: '/orders/user',
            UPDATE_STATUS: '/orders/{id}/status',
            CANCEL: '/orders/{id}/cancel',
            GET_INVOICE: '/orders/{id}/invoice'
        },

        // Payment endpoints
        PAYMENT: {
            CREATE_SESSION: '/payment/create-session',
            VERIFY: '/payment/verify',
            GET_STATUS: '/payment/status/{id}'
        },

        // Admin endpoints
        ADMIN: {
            DASHBOARD: '/admin/dashboard',
            USERS: '/admin/users',
            APPROVE_SUPPLIER: '/admin/users/{id}/approve-supplier',
            REJECT_SUPPLIER: '/admin/users/{id}/reject-supplier',
            PRODUCTS: '/admin/products',
            APPROVE_PRODUCT: '/admin/products/{id}/approve',
            REJECT_PRODUCT: '/admin/products/{id}/reject',
            AUCTIONS: '/admin/auctions',
            APPROVE_AUCTION: '/admin/auctions/{id}/approve',
            REJECT_AUCTION: '/admin/auctions/{id}/reject',
            FEATURED: '/admin/featured',
            STATISTICS: '/admin/statistics',
            REPORTS: '/admin/reports'
        },

        // Notification endpoints
        NOTIFICATIONS: {
            GET_ALL: '/notifications',
            MARK_READ: '/notifications/{id}/read',
            MARK_ALL_READ: '/notifications/mark-all-read',
            DELETE: '/notifications/{id}',
            GET_COUNT: '/notifications/count'
        }
    },

    // HTTP status codes
    STATUS: {
        OK: 200,
        CREATED: 201,
        ACCEPTED: 202,
        NO_CONTENT: 204,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        CONFLICT: 409,
        INTERNAL_ERROR: 500
    },

    // Local storage keys
    STORAGE_KEYS: {
        TOKEN: 'authToken',
        REFRESH_TOKEN: 'refreshToken',
        USER: 'userData',
        CART: 'cartData',
        THEME: 'themePreference',
        LANGUAGE: 'languagePreference',
        CURRENCY: 'currencyPreference',
        RECENT_SEARCHES: 'recentSearches',
        WISHLIST: 'wishlist'
    },

    // Default headers
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// Freeze to prevent modifications
Object.freeze(API_CONFIG);
