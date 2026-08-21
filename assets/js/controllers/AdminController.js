import { apiService } from '../api-service.js';
import { API_CONFIG } from '../api-config.js';
import { authController } from './AuthController.js';
import { Helpers } from '../utils/helpers.js';

class AdminController {
    constructor() {
        this.currentSection = 'dashboard';
        this.dashboardData = null;
        this.users = [];
        this.auctions = [];
        this.products = [];
        this.orders = [];
        this.categories = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filters = {};

        this.currentAuctionFilter = 'all';
        this.currentProductFilter = 'all';
        this.currentOrderFilter = 'all';
    }

    async init() {
        if (!authController.isAdmin()) {
            // Uncomment to enforce auth
            // window.location.href = 'login.html';
            // return;
        }

        await this.loadDashboard();
        this.setupNavigation();

        const section = this.getCurrentSection();
        await this.loadSection(section);
    }

    getCurrentSection() {
        const params = Helpers.getURLParams();
        return params.section || 'dashboard';
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('[data-admin-nav]');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.adminNav;
                this.navigateTo(section);
            });
        });
    }

    async navigateTo(section) {
        this.currentSection = section;
        this.showLoading();

        const url = new URL(window.location);
        url.searchParams.set('section', section);
        window.history.pushState({}, '', url);

        document.querySelectorAll('[data-admin-nav]').forEach(el => {
            if (el.dataset.adminNav === section) {
                el.classList.add('bg-admin-accent/20', 'border-l-4', 'border-admin-accent', 'text-white');
                el.classList.remove('hover:bg-gray-800', 'text-gray-300');
            } else {
                el.classList.remove('bg-admin-accent/20', 'border-l-4', 'border-admin-accent', 'text-white');
                el.classList.add('hover:bg-gray-800', 'text-gray-300');
            }
        });

        await this.loadSection(section);
        this.hideLoading();
    }

    async loadSection(section) {
        const container = document.getElementById('admin-content');
        if (!container) return;

        switch (section) {
            case 'dashboard': await this.renderDashboard(container); break;
            case 'users': await this.renderUsers(container); break;
            case 'auctions': await this.renderAuctions(container); break;
            case 'products': await this.renderProducts(container); break;
            case 'orders': await this.renderOrders(container); break;
            case 'categories': await this.renderCategories(container); break;
            case 'reports': await this.renderReports(container); break;
            case 'settings': await this.renderSettings(container); break;
            default: container.innerHTML = '<div class="text-center py-12"><h2 class="text-2xl font-bold">Section not found</h2></div>';
        }
    }

    showLoading() {
        const container = document.getElementById('admin-content');
        if (container && !container.innerHTML.includes('fa-spinner')) {
            container.innerHTML = '<div class="flex justify-center items-center h-64"><i class="fas fa-spinner fa-spin text-4xl text-primary-red"></i></div>';
        }
    }

    hideLoading() { }

    showError(msg) {
        alert('Error: ' + msg);
    }

    async loadDashboard() {
        try {
            this.dashboardData = await apiService.get(API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD);
        } catch (error) {
            console.warn('Failed to load dashboard data from API, using mock data');
            this.dashboardData = {
                totalUsers: 12450, totalAuctions: 145, totalProducts: 342, totalRevenue: 2450000,
                totalBids: 5230, totalOrders: 850, userGrowth: 5.2, auctionGrowth: -2.4, revenueGrowth: 14.5,
                recentUsers: [{ name: 'Mike Johnson', email: 'mike@example.com', role: 'USER' }, { name: 'Osaka Parts', email: 'contact@osakaparts.jp', role: 'SUPPLIER' }],
                recentAuctions: [{ title: '2019 Audi R8 V10', currentBid: 85000, bidCount: 12, status: 'ACTIVE' }]
            };
        }
    }

    async renderDashboard(container) {
        const stats = this.dashboardData;
        container.innerHTML = `
            <div class="fade-in">
                <h1 class="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
                <!-- Statistics Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="stat-card bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="text-gray-500 text-sm font-semibold uppercase">Total Users</p>
                                <h3 class="text-2xl font-bold mt-1">${stats.totalUsers.toLocaleString()}</h3>
                                <p class="text-sm ${stats.userGrowth >= 0 ? 'text-green-500' : 'text-red-500'} mt-2">
                                    <i class="fas ${stats.userGrowth >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'}"></i> ${Math.abs(stats.userGrowth)}% vs last month
                                </p>
                            </div>
                            <div class="bg-blue-100 p-3 rounded-lg text-blue-600"><i class="fas fa-users text-xl"></i></div>
                        </div>
                    </div>
                    <!-- Other stat cards omitted for brevity, keeping layout similar to provided -->
                    <div class="stat-card bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="text-gray-500 text-sm font-semibold uppercase">Active Auctions</p>
                                <h3 class="text-2xl font-bold mt-1">${stats.totalAuctions.toLocaleString()}</h3>
                                <p class="text-sm ${stats.auctionGrowth >= 0 ? 'text-green-500' : 'text-red-500'} mt-2">
                                    <i class="fas ${stats.auctionGrowth >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'}"></i> ${Math.abs(stats.auctionGrowth)}% vs last month
                                </p>
                            </div>
                            <div class="bg-red-100 p-3 rounded-lg text-red-600"><i class="fas fa-gavel text-xl"></i></div>
                        </div>
                    </div>
                    <div class="stat-card bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="text-gray-500 text-sm font-semibold uppercase">Total Revenue</p>
                                <h3 class="text-2xl font-bold mt-1">${Helpers.formatCurrency(stats.totalRevenue)}</h3>
                                <p class="text-sm ${stats.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'} mt-2">
                                    <i class="fas ${stats.revenueGrowth >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'}"></i> ${Math.abs(stats.revenueGrowth)}% vs last month
                                </p>
                            </div>
                            <div class="bg-green-100 p-3 rounded-lg text-green-600"><i class="fas fa-dollar-sign text-xl"></i></div>
                        </div>
                    </div>
                    <div class="stat-card bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="text-gray-500 text-sm font-semibold uppercase">Pending Approvals</p>
                                <h3 class="text-2xl font-bold mt-1">28</h3>
                                <p class="text-sm text-gray-500 mt-2">Requires attention</p>
                            </div>
                            <div class="bg-yellow-100 p-3 rounded-lg text-yellow-600"><i class="fas fa-clipboard-list text-xl"></i></div>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity & Quick Actions -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <!-- Recent Users -->
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-bold">Recent Users</h3>
                            <button onclick="adminController.navigateTo('users')" class="text-blue-500 hover:underline text-sm">View All</button>
                        </div>
                        <div class="space-y-3">
                            ${stats.recentUsers.map(user => `
                                <div class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                                    <div class="flex items-center">
                                        <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                                            ${user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div class="ml-3">
                                            <p class="font-semibold text-sm">${user.name || 'Unknown'}</p>
                                            <p class="text-xs text-gray-500">${user.email}</p>
                                        </div>
                                    </div>
                                    <span class="px-2 py-1 text-xs rounded-full ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : user.role === 'SUPPLIER' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">
                                        ${user.role}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Quick Actions -->
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 class="text-lg font-bold mb-4">Quick Actions</h3>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button onclick="adminController.navigateTo('auctions')" class="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200 text-center transition">
                                <i class="fas fa-gavel text-2xl text-red-500 mb-2"></i>
                                <p class="font-semibold text-sm">Manage Auctions</p>
                            </button>
                            <button onclick="adminController.navigateTo('users')" class="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200 text-center transition">
                                <i class="fas fa-user-plus text-2xl text-blue-500 mb-2"></i>
                                <p class="font-semibold text-sm">Manage Users</p>
                            </button>
                            <button onclick="adminController.navigateTo('products')" class="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200 text-center transition">
                                <i class="fas fa-box text-2xl text-green-500 mb-2"></i>
                                <p class="font-semibold text-sm">Add Product</p>
                            </button>
                            <button onclick="adminController.navigateTo('reports')" class="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border border-gray-200 text-center transition">
                                <i class="fas fa-chart-line text-2xl text-purple-500 mb-2"></i>
                                <p class="font-semibold text-sm">View Reports</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async renderUsers(container) {
        try {
            try {
                this.users = await apiService.get(API_CONFIG.ENDPOINTS.ADMIN.USERS);
            } catch (e) {
                // Mock fallback
                this.users = [
                    { id: 1, name: 'Mike Johnson', email: 'mike@example.com', role: 'USER', status: 'ACTIVE', createdAt: new Date().toISOString() },
                    { id: 2, name: 'Osaka Parts', email: 'contact@osakaparts.jp', role: 'SUPPLIER', status: 'PENDING', createdAt: new Date().toISOString() }
                ];
            }

            container.innerHTML = `
                <div class="fade-in">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold">Users Management</h2>
                    </div>

                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                        <table class="w-full text-left min-w-[800px]">
                            <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th class="px-6 py-3 font-semibold">User</th>
                                    <th class="px-6 py-3 font-semibold">Email</th>
                                    <th class="px-6 py-3 font-semibold">Role</th>
                                    <th class="px-6 py-3 font-semibold">Status</th>
                                    <th class="px-6 py-3 font-semibold">Joined</th>
                                    <th class="px-6 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm divide-y divide-gray-100">
                                ${this.users.map(user => `
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-6 py-4">
                                            <div class="font-bold text-gray-800">${user.name}</div>
                                            <div class="text-xs text-gray-500">ID: ${user.id}</div>
                                        </td>
                                        <td class="px-6 py-4">${user.email}</td>
                                        <td class="px-6 py-4"><span class="px-2 py-1 rounded text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : user.role === 'SUPPLIER' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">${user.role}</span></td>
                                        <td class="px-6 py-4"><span class="px-2 py-1 rounded text-xs font-semibold ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">${user.status}</span></td>
                                        <td class="px-6 py-4">${Helpers.formatDate(user.createdAt)}</td>
                                        <td class="px-6 py-4 text-right space-x-2">
                                            <button class="text-blue-500 hover:text-blue-700"><i class="fas fa-edit"></i></button>
                                            <button class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            this.showError('Failed to load users');
        }
    }

    async renderAuctions(container) {
        try {
            try {
                this.auctions = await apiService.get(API_CONFIG.ENDPOINTS.ADMIN.AUCTIONS);
            } catch (e) {
                this.auctions = [
                    { id: 101, title: '2019 Audi R8 V10', seller: { name: 'TokyoAuto' }, startingPrice: 75000, currentBid: 85000, bidCount: 12, status: 'ACTIVE' },
                    { id: 102, title: 'Nissan Skyline GT-R R34', seller: { name: 'JDM_Imports' }, startingPrice: 120000, currentBid: 120000, bidCount: 0, status: 'PENDING' }
                ];
            }

            container.innerHTML = `
                <div class="fade-in">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold">Auctions Monitor</h2>
                    </div>

                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                        <table class="w-full text-left min-w-[800px]">
                            <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th class="px-6 py-3 font-semibold">Item</th>
                                    <th class="px-6 py-3 font-semibold">Seller</th>
                                    <th class="px-6 py-3 font-semibold">Starting Price</th>
                                    <th class="px-6 py-3 font-semibold">Current Bid</th>
                                    <th class="px-6 py-3 font-semibold">Status</th>
                                    <th class="px-6 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm divide-y divide-gray-100">
                                ${this.auctions.map(auction => `
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-6 py-4 font-bold text-gray-800">${auction.title}</td>
                                        <td class="px-6 py-4">${auction.seller.name}</td>
                                        <td class="px-6 py-4">${Helpers.formatCurrency(auction.startingPrice)}</td>
                                        <td class="px-6 py-4">${Helpers.formatCurrency(auction.currentBid)} <span class="text-xs text-gray-400">(${auction.bidCount} bids)</span></td>
                                        <td class="px-6 py-4"><span class="px-2 py-1 rounded text-xs font-semibold ${auction.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">${auction.status}</span></td>
                                        <td class="px-6 py-4 text-right space-x-2">
                                            <button class="text-blue-500 hover:text-blue-700"><i class="fas fa-eye"></i></button>
                                            ${auction.status === 'PENDING' ? '<button class="text-green-500 hover:text-green-700"><i class="fas fa-check-circle"></i></button>' : ''}
                                            <button class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            this.showError('Failed to load auctions');
        }
    }

    async renderProducts(container) {
        try {
            try {
                this.products = await apiService.get(API_CONFIG.ENDPOINTS.ADMIN.PRODUCTS || '/admin/products');
            } catch (e) {
                this.products = [
                    { id: 201, name: 'HKS Exhaust System', category: { name: 'Exhaust' }, price: 1200, stock: 5, seller: { name: 'PartsExpressJP' }, status: 'APPROVED', image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=150' },
                    { id: 202, name: 'Brembo Brake Kit', category: { name: 'Brakes' }, price: 850, stock: 12, seller: { name: 'TokyoAuto' }, status: 'PENDING', image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=150' }
                ];
            }

            container.innerHTML = `
                <div class="fade-in">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold">Products Management</h2>
                    </div>
                    
                    <div class="border-b border-gray-200 mb-6">
                        <nav class="flex space-x-8">
                            ${['All', 'Pending', 'Approved', 'Rejected', 'Featured'].map(tab => `
                                <button class="py-2 px-1 border-b-2 hover:border-gray-300 transition ${tab === 'All' ? 'border-primary-red text-primary-red font-bold' : 'border-transparent'}">
                                    ${tab}
                                </button>
                            `).join('')}
                        </nav>
                    </div>

                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                        <table class="w-full text-left min-w-[800px]">
                            <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th class="px-6 py-3 font-semibold">Product</th>
                                    <th class="px-6 py-3 font-semibold">Category</th>
                                    <th class="px-6 py-3 font-semibold">Price</th>
                                    <th class="px-6 py-3 font-semibold">Stock</th>
                                    <th class="px-6 py-3 font-semibold">Seller</th>
                                    <th class="px-6 py-3 font-semibold">Status</th>
                                    <th class="px-6 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm divide-y divide-gray-100">
                                ${this.products.map(p => `
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center">
                                                <img src="${p.image}" class="w-10 h-10 rounded object-cover mr-3">
                                                <div>
                                                    <div class="font-bold text-gray-800">${p.name}</div>
                                                    <div class="text-xs text-gray-500">ID: ${p.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">${p.category.name}</td>
                                        <td class="px-6 py-4">${Helpers.formatCurrency(p.price)}</td>
                                        <td class="px-6 py-4">${p.stock}</td>
                                        <td class="px-6 py-4">${p.seller.name}</td>
                                        <td class="px-6 py-4"><span class="px-2 py-1 rounded text-xs font-semibold ${p.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">${p.status}</span></td>
                                        <td class="px-6 py-4 text-right space-x-2">
                                            <button class="text-blue-500 hover:text-blue-700"><i class="fas fa-edit"></i></button>
                                            ${p.status === 'PENDING' ? '<button class="text-green-500 hover:text-green-700"><i class="fas fa-check-circle"></i></button>' : ''}
                                            <button class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            this.showError('Failed to load products');
        }
    }

    async renderCategories(container) {
        this.categories = [
            { id: 1, name: 'Engine Parts', slug: 'engine-parts', productCount: 145, status: 'Active' },
            { id: 2, name: 'Brakes & Suspension', slug: 'brakes-suspension', productCount: 89, status: 'Active' },
            { id: 3, name: 'Exterior Accessories', slug: 'exterior', productCount: 210, status: 'Active' }
        ];

        container.innerHTML = `
            <div class="fade-in">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">Categories Management</h2>
                    <button class="bg-primary-dark text-white px-4 py-2 rounded shadow hover:bg-gray-800 transition">
                        <i class="fas fa-plus mr-2"></i> Add Category
                    </button>
                </div>

                <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                    <table class="w-full text-left min-w-[800px]">
                        <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th class="px-6 py-3 font-semibold">ID</th>
                                <th class="px-6 py-3 font-semibold">Name</th>
                                <th class="px-6 py-3 font-semibold">Slug</th>
                                <th class="px-6 py-3 font-semibold">Products</th>
                                <th class="px-6 py-3 font-semibold">Status</th>
                                <th class="px-6 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm divide-y divide-gray-100">
                            ${this.categories.map(c => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4">${c.id}</td>
                                    <td class="px-6 py-4 font-bold text-gray-800">${c.name}</td>
                                    <td class="px-6 py-4 text-gray-500">${c.slug}</td>
                                    <td class="px-6 py-4">${c.productCount}</td>
                                    <td class="px-6 py-4"><span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">${c.status}</span></td>
                                    <td class="px-6 py-4 text-right space-x-2">
                                        <button class="text-blue-500 hover:text-blue-700"><i class="fas fa-edit"></i></button>
                                        <button class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    async renderOrders(container) {
        this.orders = [
            { id: 'ORD-8923', customer: 'John Doe', items: 3, total: 450.00, paymentStatus: 'PAID', orderStatus: 'PROCESSING', date: new Date().toISOString() },
            { id: 'ORD-8924', customer: 'Jane Smith', items: 1, total: 1200.00, paymentStatus: 'PENDING', orderStatus: 'PENDING', date: new Date().toISOString() }
        ];

        container.innerHTML = `
            <div class="fade-in">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">Orders Management</h2>
                </div>

                <div class="border-b border-gray-200 mb-6">
                    <nav class="flex space-x-8">
                        ${['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(tab => `
                            <button class="py-2 px-1 border-b-2 hover:border-gray-300 transition ${tab === 'All' ? 'border-primary-red text-primary-red font-bold' : 'border-transparent'}">
                                ${tab}
                            </button>
                        `).join('')}
                    </nav>
                </div>

                <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                    <table class="w-full text-left min-w-[800px]">
                        <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th class="px-6 py-3 font-semibold">Order ID</th>
                                <th class="px-6 py-3 font-semibold">Customer</th>
                                <th class="px-6 py-3 font-semibold">Items</th>
                                <th class="px-6 py-3 font-semibold">Total</th>
                                <th class="px-6 py-3 font-semibold">Payment</th>
                                <th class="px-6 py-3 font-semibold">Status</th>
                                <th class="px-6 py-3 font-semibold">Date</th>
                                <th class="px-6 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm divide-y divide-gray-100">
                            ${this.orders.map(o => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 font-bold text-gray-800">${o.id}</td>
                                    <td class="px-6 py-4">${o.customer}</td>
                                    <td class="px-6 py-4">${o.items}</td>
                                    <td class="px-6 py-4">${Helpers.formatCurrency(o.total)}</td>
                                    <td class="px-6 py-4"><span class="px-2 py-1 rounded text-xs font-semibold ${o.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">${o.paymentStatus}</span></td>
                                    <td class="px-6 py-4"><span class="px-2 py-1 rounded text-xs font-semibold ${o.orderStatus === 'PROCESSING' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}">${o.orderStatus}</span></td>
                                    <td class="px-6 py-4">${Helpers.formatDate(o.date)}</td>
                                    <td class="px-6 py-4 text-right space-x-2">
                                        <button class="text-blue-500 hover:text-blue-700"><i class="fas fa-eye"></i></button>
                                        <button class="text-accent hover:text-accent-dark"><i class="fas fa-truck"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    async renderReports(container) {
        container.innerHTML = `
            <div class="fade-in">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">Financial Reports</h2>
                    <select class="border border-gray-300 rounded px-3 py-2 text-sm bg-white">
                        <option>This Month</option>
                        <option>Last Month</option>
                        <option>This Year</option>
                    </select>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 class="text-lg font-bold mb-4">Revenue Overview</h3>
                        <div class="h-64 flex items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded text-gray-400">
                            [ Chart.js Line Chart Placeholder ]
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 class="text-lg font-bold mb-4">Sales by Category</h3>
                        <div class="h-64 flex items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded text-gray-400">
                            [ Chart.js Pie Chart Placeholder ]
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async renderSettings(container) {
        container.innerHTML = `
            <div class="fade-in">
                <h2 class="text-2xl font-bold mb-6">Site Settings</h2>
                
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                    <div class="flex border-b border-gray-200">
                        <button class="px-6 py-3 border-b-2 border-primary-red text-primary-red font-bold">General</button>
                        <button class="px-6 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">Security</button>
                        <button class="px-6 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">Payment</button>
                        <button class="px-6 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">Email</button>
                    </div>
                    
                    <div class="p-6 max-w-2xl">
                        <form onsubmit="event.preventDefault(); alert('Settings saved!');">
                            <div class="mb-4">
                                <label class="block text-gray-700 font-bold mb-2">Site Name</label>
                                <input type="text" class="w-full border border-gray-300 rounded px-3 py-2" value="A&C Japan Auto Parts">
                            </div>
                            <div class="mb-4">
                                <label class="block text-gray-700 font-bold mb-2">Contact Email</label>
                                <input type="email" class="w-full border border-gray-300 rounded px-3 py-2" value="admin@acjapan.com">
                            </div>
                            <div class="mb-4">
                                <label class="block text-gray-700 font-bold mb-2">Default Currency</label>
                                <select class="w-full border border-gray-300 rounded px-3 py-2">
                                    <option value="USD" selected>USD ($)</option>
                                    <option value="JPY">JPY (¥)</option>
                                </select>
                            </div>
                            <div class="mb-6">
                                <label class="block text-gray-700 font-bold mb-2">Transaction Fee (%)</label>
                                <input type="number" class="w-full border border-gray-300 rounded px-3 py-2" value="5">
                            </div>
                            <button type="submit" class="bg-primary-dark text-white px-6 py-2 rounded hover:bg-gray-800 transition font-bold">
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }
}



export const adminController = new AdminController();
