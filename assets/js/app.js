import { Topbar } from './components/Topbar.js';
import { authController } from './controllers/AuthController.js';
import { userController } from './controllers/UserController.js';
import { auctionController } from './controllers/AuctionController.js';
import { productController } from './controllers/ProductController.js';
import { cartController } from './controllers/CartController.js';
import { orderController } from './controllers/OrderController.js';
import { supplierController } from './controllers/SupplierController.js';
import { adminController } from './controllers/AdminController.js';
import { apiService } from './api-service.js';
import { API_CONFIG } from './api-config.js';
import { storage } from './utils/storage.js';

class App {

    init() {
        Topbar.render();

        this.setupLoginForm();
        this.setupRegisterForm();
        this.setupLogoutButtons();
        this.updateTopbar();
        this.initPageLoader();
        this.exposeGlobalHelpers();

        const path = window.location.pathname.toLowerCase();
        if (path.includes('profile.html')) {
            this.loadProfilePage();
        } else if (path.includes('auction-details.html')) {
            this.loadAuctionDetailsPage();
        } else if (path.includes('listing.html')) {
            this.loadListingPage();
        } else if (path.includes('buy-now.html')) {
            this.loadBuyNowPage();
        } else if (path.includes('cart.html')) {
            this.loadCartPage();
        } else if (path.includes('add-auction.html')) {
            this.loadAddAuctionPage();
        } else if (path.includes('supplier-dashboard.html')) {
            this.loadSupplierDashboardPage();
        } else if (path.includes('admin.html')) {
            this.loadAdminPage();
        } else {
            // Default home page (index.html or /)
            this.loadHomePage();
        }
    }

    // Expose helpers globally so inline event handlers work seamlessly
    exposeGlobalHelpers() {
        window.addToCart = async (productId, quantity = 1) => {
            const res = await cartController.addToCart(productId, quantity);
            if (res.success) {
                this.showToast(res.message || 'Added to cart!', 'success');
            } else {
                this.showToast(res.error || 'Failed to add to cart', 'error');
            }
        };

        window.toggleWatchlist = async (auctionId, btnEl) => {
            const res = await auctionController.toggleWatchlist(auctionId);
            if (res.success) {
                this.showToast(res.message || 'Watchlist updated', 'success');
                if (btnEl) {
                    const icon = btnEl.querySelector('i');
                    if (icon) {
                        icon.classList.toggle('fas');
                        icon.classList.toggle('far');
                        icon.classList.toggle('text-rose-600');
                    }
                }
            } else {
                this.showToast(res.error || 'Could not update watchlist', 'error');
            }
        };

        window.authController = authController;
        window.userController = userController;
        window.auctionController = auctionController;
        window.productController = productController;
        window.cartController = cartController;
        window.orderController = orderController;
        window.supplierController = supplierController;
        window.adminController = adminController;
    }

    // Auto-dismiss page loader if present
    initPageLoader() {
        const loader = document.getElementById('page-loader');
        if (loader) {
            const dismiss = () => {
                if (loader && !loader.classList.contains('opacity-0')) {
                    loader.classList.add('opacity-0', 'pointer-events-none');
                    setTimeout(() => {
                        try { loader.remove(); } catch (_) {}
                    }, 500);
                }
            };

            if (document.readyState === 'complete') {
                setTimeout(dismiss, 300);
            } else {
                window.addEventListener('load', () => {
                    setTimeout(dismiss, 300);
                });
                setTimeout(dismiss, 1200);
            }
        }
    }

    // Show Toast Notification
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-[#02316e]' : 'bg-red-600';
        const icon = type === 'success' ? '<i class="fas fa-check-circle mr-2 text-blue-200"></i>' : '<i class="fas fa-exclamation-circle mr-2 text-rose-200"></i>';

        toast.className = `fixed bottom-4 right-4 ${bgColor} text-white px-5 py-3 rounded-xl shadow-xl transform transition-all duration-300 translate-y-full opacity-0 z-[9999] flex items-center border border-white/20 text-sm font-medium`;
        toast.innerHTML = `${icon} <span>${message}</span>`;

        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.classList.remove('translate-y-full', 'opacity-0');
                toast.classList.add('translate-y-0', 'opacity-100');
            });
        });

        setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-full', 'opacity-0');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3200);
    }

    getVehicleImageUrl(vehicle, fallback = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop') {
        if (!vehicle) return fallback;
        let img = vehicle.primaryImage;
        if (!img && Array.isArray(vehicle.images) && vehicle.images.length > 0) {
            const first = vehicle.images[0];
            img = (typeof first === 'object' && first !== null) ? (first.imageUrl || first.url) : first;
        }
        if (!img && vehicle.imageUrl) {
            img = vehicle.imageUrl;
        }
        if (!img || typeof img !== 'string') return fallback;
        if (img.startsWith('/')) {
            return `${API_CONFIG.BASE_URL}${img}`;
        }
        return img;
    }

    getVehicleImageUrls(vehicle, fallback = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop') {
        if (!vehicle) return [fallback];
        const urls = [];
        if (vehicle.primaryImage) {
            const img = vehicle.primaryImage.startsWith('/') ? `${API_CONFIG.BASE_URL}${vehicle.primaryImage}` : vehicle.primaryImage;
            urls.push(img);
        }
        if (Array.isArray(vehicle.images)) {
            for (const item of vehicle.images) {
                let img = (typeof item === 'object' && item !== null) ? (item.imageUrl || item.url) : item;
                if (img && typeof img === 'string') {
                    if (img.startsWith('/')) {
                        img = `${API_CONFIG.BASE_URL}${img}`;
                    }
                    if (!urls.includes(img)) {
                        urls.push(img);
                    }
                }
            }
        }
        if (urls.length === 0) {
            urls.push(fallback);
        }
        return urls;
    }

    // Setup Login Form
    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;

                try {
                    const response = await authController.login(email, password);
                    if (response.success) {
                        this.showToast(response.message || "Login successful!", 'success');
                        const role = (response.user?.role || '').toUpperCase();
                        let targetPage = "index.html";
                        if (role === 'ADMIN') {
                            targetPage = "admin.html";
                        } else if (role === 'SUPPLIER') {
                            targetPage = "supplier-dashboard.html";
                        }
                        setTimeout(() => window.location.href = targetPage, 800);
                    } else {
                        const errorMsg = response.message || response.error || 'Login failed';
                        this.showToast(errorMsg, 'error');
                    }
                } catch (error) {
                    console.error('❌ Login error:', error);
                    this.showToast('An unexpected error occurred during login', 'error');
                }
            });
        }
    }

    // Setup Register Form
    setupRegisterForm() {
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('regName').value;
                const email = document.getElementById('regEmail').value;
                const phone = document.getElementById('regPhone').value;
                const password = document.getElementById('regPassword').value;
                const address = document.getElementById('regAddress').value;

                const userData = {
                    userName: name,
                    userEmail: email,
                    userPassword: password,
                    userPhone: phone,
                    userAddress: address
                };

                try {
                    const response = await authController.register(userData);
                    if (response.success) {
                        this.showToast(response.message || 'Registration successful!', 'success');
                        setTimeout(() => window.location.href = "index.html", 1500);
                    } else {
                        const errorMsg = response.message || response.error || 'Registration failed';
                        this.showToast(errorMsg, 'error');
                    }
                } catch (error) {
                    console.error('❌ Registration error:', error);
                    this.showToast('An unexpected error occurred during registration', 'error');
                }
            });
        }
    }

    updateMainMenu(user) {
        const role = ((user?.role || '')).toUpperCase();
        // Target all portal/dashboard navigation links
        const navLinks = document.querySelectorAll(
            '#mobile-nav a[href*="supplier-dashboard"], #mobile-nav a[href*="admin"], #mobile-nav a[data-nav="dashboard"],' +
            '#mobile-nav-listing a[href*="supplier-dashboard"], #mobile-nav-listing a[href*="admin"], #mobile-nav-listing a[data-nav="dashboard"],' +
            'nav a[href="supplier-dashboard.html"], nav a[href="admin.html"], #mobile-header-links a[href="supplier-dashboard.html"]'
        );

        navLinks.forEach(link => {
            if (role === 'ADMIN') {
                link.href = 'admin.html';
                link.textContent = 'ADMIN DASHBOARD';
                link.style.display = '';
            } else if (role === 'SUPPLIER') {
                link.href = 'supplier-dashboard.html';
                link.textContent = 'SUPPLIER DASHBOARD';
                link.style.display = '';
            } else if (role === 'CUSTOMER' || role === 'BUYER' || role === 'MEMBER' || role === 'USER') {
                link.href = 'profile.html';
                link.textContent = 'MY ORDERS';
                link.style.display = '';
            } else {
                link.href = 'supplier-dashboard.html';
                link.textContent = 'SUPPLIER PORTAL';
                link.style.display = '';
            }
        });
    }

    async updateTopbar() {
        const accountNavLink = Topbar.getAccountNavLink();
        const usernameSpan = document.getElementById('topbar-username');
        const topbarLogoutBtn = document.getElementById('topbarLogoutBtn');
        const result = await authController.validateUser();

        if (result.success) {
            if (usernameSpan) {
                usernameSpan.textContent = result.user.name || 'My Account';
            }
            if (accountNavLink) {
                accountNavLink.href = "profile.html";
            }
            if (topbarLogoutBtn) {
                topbarLogoutBtn.classList.remove('hidden');
                topbarLogoutBtn.classList.add('flex');
            }
            this.updateMainMenu(result.user);
        } else {
            if (accountNavLink) accountNavLink.href = "login.html";
            if (usernameSpan) usernameSpan.textContent = 'Login';
            if (topbarLogoutBtn) {
                topbarLogoutBtn.classList.add('hidden');
                topbarLogoutBtn.classList.remove('flex');
            }
            this.updateMainMenu(null);
        }

        // Always sync cart count in topbar
        cartController.updateCartBadge();
    }

    setupLogoutButtons() {
        if (!this._logoutDelegated) {
            this._logoutDelegated = true;
            document.addEventListener('click', async (e) => {
                const btn = e.target.closest('#logoutBtn, .logout-btn, [data-action="logout"], #topbarLogoutBtn, #adminLogoutBtn');
                if (btn) {
                    e.preventDefault();
                    await this.logout();
                }
            });
        }
    }

    async logout() {
        try {
            await authController.logout();
            userController.clearUserDetails();
            storage.removeToken();
            storage.removeUser();
            storage.removeUserDetails();
            storage.clearAuth();

            const usernameSpan = document.getElementById('topbar-username');
            const topbarLogoutBtn = document.getElementById('topbarLogoutBtn');
            const accountNavLink = document.getElementById('myAccountNav');
            if (usernameSpan) usernameSpan.textContent = 'Login';
            if (accountNavLink) accountNavLink.href = 'login.html';
            if (topbarLogoutBtn) {
                topbarLogoutBtn.classList.add('hidden');
                topbarLogoutBtn.classList.remove('flex');
            }

            this.showToast('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 600);
        } catch (error) {
            console.error('Logout error:', error);
            storage.clearAuth();
            window.location.href = 'login.html';
        }
    }

    // ==========================================
    // PAGE 1: HOME PAGE (index.html)
    // ==========================================
    async loadHomePage() {
        const liveAuctionsGrid = document.getElementById('home-live-auctions-grid');
        const productsGrid = document.getElementById('home-products-grid');

        // Load active auctions
        if (liveAuctionsGrid) {
            try {
                const auctions = await auctionController.getActiveAuctions();
                if (auctions && auctions.length > 0) {
                    liveAuctionsGrid.innerHTML = auctions.slice(0, 4).map(auc => {
                        const aucId = auc.auctionId || auc.id;
                        const vehicle = auc.vehicle || {};
                        const img = this.getVehicleImageUrl(vehicle);
                        const make = vehicle.make || vehicle.brand || '';
                        const title = `${vehicle.year || ''} ${make} ${vehicle.model || 'Vehicle'}`.trim();
                        const currentBid = auc.currentBid != null ? auc.currentBid : (auc.startingPrice || 0);
                        const bids = auc.bidCount || 0;
                        const timeLeft = this.formatTimeRemaining(auc.endDate, auc.timeLeftSeconds);

                        return `
                            <div class="glass-panel rounded-2xl card-3d overflow-hidden group border border-white/90 bg-white/85 shadow-sm">
                                <div class="relative overflow-hidden">
                                    <img src="${img}" alt="${title}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop'" class="w-full h-48 object-cover group-hover:scale-105 transition duration-500">
                                    <div class="absolute top-3 left-3 bg-primary-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">HOT AUCTION</div>
                                    <button onclick="window.toggleWatchlist(${aucId}, this)" class="absolute top-3 right-3 bg-white/90 backdrop-blur-md w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 shadow cursor-pointer transition">
                                        <i class="far fa-heart text-sm"></i>
                                    </button>
                                    <div class="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-md text-[#0b1f3a] text-center py-1.5 border-t border-slate-100">
                                        <span class="text-xs font-bold flex items-center justify-center"><i class="far fa-clock text-primary-blue mr-1.5"></i> Ends in: <span class="text-primary-blue ml-1">${timeLeft}</span></span>
                                    </div>
                                </div>
                                <div class="p-5">
                                    <h3 class="text-base font-bold text-[#0b1f3a] mb-1 truncate leading-snug">
                                        <a href="auction-details.html?id=${aucId}" class="hover:text-primary-blue transition">${title}</a>
                                    </h3>
                                    <p class="text-xs text-slate-500 mb-4 truncate">${vehicle.mileage ? vehicle.mileage.toLocaleString() + ' mi • ' : ''}${vehicle.transmission || 'Auto'} • ${vehicle.location || 'Tokyo, JP'}</p>
                                    <div class="flex justify-between items-center mb-4 pb-4 border-t border-slate-100 pt-3">
                                        <div>
                                            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Current Bid</p>
                                            <p class="text-lg font-black text-[#0b1f3a] tracking-tight">$${Number(currentBid).toLocaleString()}</p>
                                        </div>
                                        <div class="text-right">
                                            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Bids</p>
                                            <p class="text-xs font-bold text-primary-blue">${bids}</p>
                                        </div>
                                    </div>
                                    <a href="auction-details.html?id=${aucId}" class="block w-full text-center btn-3d btn-primary-3d font-bold py-2.5 rounded-xl shadow-md transition text-xs">Bid Now</a>
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            } catch (err) {
                console.error('Error rendering live auctions:', err);
            }
        }

        // Load latest products
        if (productsGrid) {
            try {
                const products = await productController.getAllProducts();
                if (products && products.length > 0) {
                    productsGrid.innerHTML = products.slice(0, 5).map(prod => {
                        const img = prod.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1600293144865-950c4bb67f1b?q=80&w=2000&auto=format&fit=crop';
                        return `
                            <div class="glass-panel rounded-2xl card-3d p-4 hover:shadow-md transition group relative border border-white/90 bg-white/85 flex flex-col justify-between">
                                <div>
                                    <div class="h-36 flex items-center justify-center mb-3 bg-slate-50 rounded-xl p-2 overflow-hidden">
                                        <img src="${img}" alt="${prod.name}" class="max-h-full object-contain group-hover:scale-110 transition duration-300">
                                    </div>
                                    <h4 class="text-xs font-bold text-[#0b1f3a] mb-2 hover:text-primary-blue transition line-clamp-2 cursor-pointer" title="${prod.name}">
                                        ${prod.name}
                                    </h4>
                                    <div class="text-base font-black text-[#0b1f3a] mb-2">$${Number(prod.price || 0).toFixed(2)}</div>
                                </div>
                                <button onclick="window.addToCart(${prod.productId})" class="w-full btn-3d btn-primary-3d text-white py-2 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer">
                                    Add to Cart
                                </button>
                            </div>
                        `;
                    }).join('');
                }
            } catch (err) {
                console.error('Error rendering latest products:', err);
            }
        }
    }

    // ==========================================
    // PAGE 2: LISTINGS PAGE (listing.html)
    // ==========================================
    async loadListingPage() {
        const auctionsGrid = document.getElementById('auctions-grid');
        const countEl = document.getElementById('auctions-count');
        const brandFilter = document.getElementById('brand-filter');
        const modelFilter = document.getElementById('model-filter');
        const priceRange = document.getElementById('price-range');
        const priceRangeVal = document.getElementById('price-range-val');
        const sortSelect = document.getElementById('sort-select');
        const applyBtn = document.getElementById('filter-apply-btn');
        const clearBtn = document.getElementById('filter-clear-btn');

        if (!auctionsGrid) return;

        let allAuctions = [];

        try {
            allAuctions = await auctionController.getAllAuctions() || [];
        } catch (e) {
            console.error('Error fetching auctions:', e);
        }

        const renderAuctions = (list) => {
            if (countEl) {
                countEl.innerHTML = `Showing <span class="font-bold text-slate-800">${list.length}</span> results`;
            }

            if (list.length === 0) {
                auctionsGrid.innerHTML = `
                    <div class="col-span-full py-16 text-center text-slate-400">
                        <i class="fas fa-car text-4xl mb-3 text-slate-300"></i>
                        <p class="font-bold text-slate-700">No auctions match your filters</p>
                        <p class="text-xs text-slate-400 mt-1">Try changing or clearing your search criteria</p>
                    </div>
                `;
                return;
            }

            auctionsGrid.innerHTML = list.map(auc => {
                const aucId = auc.auctionId || auc.id;
                const vehicle = auc.vehicle || {};
                const img = this.getVehicleImageUrl(vehicle);
                const make = vehicle.make || vehicle.brand || '';
                const title = `${vehicle.year || ''} ${make} ${vehicle.model || 'Vehicle'}`.trim();
                const currentBid = auc.currentBid != null ? auc.currentBid : (auc.startingPrice || 0);
                const bids = auc.bidCount || 0;
                const timeLeft = this.formatTimeRemaining(auc.endDate, auc.timeLeftSeconds);

                return `
                    <div class="glass-panel card-3d rounded-2xl overflow-hidden group bg-white/85 border border-white/90 shadow-sm">
                        <div class="relative">
                            <img src="${img}" alt="${title}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop'" class="w-full h-48 object-cover group-hover:scale-105 transition duration-500">
                            <button onclick="window.toggleWatchlist(${aucId}, this)" class="absolute top-3 right-3 bg-white/90 backdrop-blur-md w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 shadow cursor-pointer transition">
                                <i class="far fa-heart text-sm"></i>
                            </button>
                            <div class="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-md text-[#0b1f3a] text-center py-2 border-t border-slate-100">
                                <span class="text-xs font-bold flex items-center justify-center"><i class="far fa-clock text-primary-blue mr-1.5"></i> Ends in: <span class="text-primary-blue ml-1">${timeLeft}</span></span>
                            </div>
                        </div>
                        <div class="p-5">
                            <h3 class="text-lg font-bold text-[#0b1f3a] mb-1 truncate leading-snug">
                                <a href="auction-details.html?id=${aucId}" class="hover:text-primary-blue transition">${title}</a>
                            </h3>
                            <p class="text-xs text-slate-500 mb-4 truncate">${vehicle.mileage ? vehicle.mileage.toLocaleString() + ' mi • ' : ''}${vehicle.transmission || 'Auto'} • ${vehicle.location || 'Tokyo, JP'}</p>
                            <div class="flex justify-between items-center mb-4 pb-4 border-t border-slate-100 pt-3">
                                <div>
                                    <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Current Bid</p>
                                    <p class="text-xl font-black text-[#0b1f3a] tracking-tight">$${Number(currentBid).toLocaleString()}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Bids</p>
                                    <p class="text-sm font-bold text-primary-blue">${bids}</p>
                                </div>
                            </div>
                            <a href="auction-details.html?id=${aucId}" class="block w-full text-center btn-3d btn-primary-3d font-bold py-2.5 rounded-xl shadow-md transition text-xs">Bid Now</a>
                        </div>
                    </div>
                `;
            }).join('');
        };

        const filterAndSort = () => {
            let filtered = [...allAuctions];

            const brand = brandFilter ? brandFilter.value.trim().toLowerCase() : '';
            const model = modelFilter ? modelFilter.value.trim().toLowerCase() : '';
            const maxPrice = priceRange ? parseFloat(priceRange.value) : Infinity;

            const selectedConditions = Array.from(document.querySelectorAll('.condition-filter:checked')).map(cb => cb.value.toUpperCase());
            const selectedTransmissions = Array.from(document.querySelectorAll('.transmission-filter:checked')).map(cb => cb.value.toUpperCase());
            const selectedFuels = Array.from(document.querySelectorAll('.fuel-filter:checked')).map(cb => cb.value.toUpperCase());

            if (brand) {
                filtered = filtered.filter(a => a.vehicle?.make?.toLowerCase().includes(brand));
            }
            if (model) {
                filtered = filtered.filter(a => a.vehicle?.model?.toLowerCase().includes(model));
            }
            if (!isNaN(maxPrice)) {
                filtered = filtered.filter(a => (a.currentBid || a.startingPrice || 0) <= maxPrice);
            }
            if (selectedConditions.length > 0) {
                filtered = filtered.filter(a => selectedConditions.includes(a.vehicle?.condition?.toUpperCase()));
            }
            if (selectedTransmissions.length > 0) {
                filtered = filtered.filter(a => selectedTransmissions.includes(a.vehicle?.transmission?.toUpperCase()));
            }
            if (selectedFuels.length > 0) {
                filtered = filtered.filter(a => selectedFuels.includes(a.vehicle?.fuelType?.toUpperCase()));
            }

            const sort = sortSelect ? sortSelect.value : 'ending';
            if (sort === 'price_asc') {
                filtered.sort((a, b) => (a.currentBid || a.startingPrice || 0) - (b.currentBid || b.startingPrice || 0));
            } else if (sort === 'price_desc') {
                filtered.sort((a, b) => (b.currentBid || b.startingPrice || 0) - (a.currentBid || a.startingPrice || 0));
            } else if (sort === 'newest') {
                filtered.sort((a, b) => (b.auctionId || 0) - (a.auctionId || 0));
            }

            renderAuctions(filtered);
        };

        if (priceRange && priceRangeVal) {
            priceRange.addEventListener('input', () => {
                priceRangeVal.textContent = `$${Number(priceRange.value).toLocaleString()}`;
            });
        }

        if (applyBtn) applyBtn.addEventListener('click', filterAndSort);
        if (sortSelect) sortSelect.addEventListener('change', filterAndSort);
        if (brandFilter) brandFilter.addEventListener('change', filterAndSort);
        if (modelFilter) modelFilter.addEventListener('input', filterAndSort);
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (brandFilter) brandFilter.value = '';
                if (modelFilter) modelFilter.value = '';
                if (priceRange) {
                    priceRange.value = 200000;
                    if (priceRangeVal) priceRangeVal.textContent = '$200,000+';
                }
                document.querySelectorAll('.condition-filter, .transmission-filter, .fuel-filter').forEach(cb => cb.checked = false);
                filterAndSort();
            });
        }

        renderAuctions(allAuctions);
    }

    // ==========================================
    // PAGE 3: AUCTION DETAILS (auction-details.html)
    // ==========================================
    async loadAuctionDetailsPage() {
        const urlParams = new URLSearchParams(window.location.search);
        let rawId = urlParams.get('id') || urlParams.get('auctionId');
        let auctionId = null;

        if (rawId && rawId !== 'undefined' && rawId !== 'null') {
            auctionId = rawId;
        }

        const titleEl = document.getElementById('vehicle-title');
        const breadcrumbTitle = document.getElementById('breadcrumb-title');
        const modalTitle = document.getElementById('modal-vehicle-title');
        const sellerNameEl = document.getElementById('seller-name');
        const sellerAvatarEl = document.getElementById('seller-avatar');
        const locEl = document.getElementById('vehicle-location');
        const vinEl = document.getElementById('vehicle-vin');
        const mainImg = document.getElementById('mainImage');
        const thumbsContainer = document.getElementById('imageThumbnails');

        const specMake = document.getElementById('spec-make-model');
        const specYear = document.getElementById('spec-year');
        const specMileage = document.getElementById('spec-mileage');
        const specTransmission = document.getElementById('spec-transmission');
        const specEngine = document.getElementById('spec-engine');
        const specDrivetrain = document.getElementById('spec-drivetrain');
        const specFuel = document.getElementById('spec-fuel');
        const specColor = document.getElementById('spec-color');
        const specInterior = document.getElementById('spec-interior');
        const specDesc = document.getElementById('spec-description');

        const bidsCountLabel = document.getElementById('bids-count-label');
        const currentBidDisplay = document.getElementById('current-bid-display');
        const bidAmountInput = document.getElementById('bidAmount');
        const bidHelperText = document.getElementById('bidHelperText');
        const recentBiddersList = document.getElementById('recent-bidders-list');
        const recentBidsHeader = document.getElementById('recent-bids-count-header');
        const watchlistBtn = document.getElementById('watchlist-toggle-btn');

        if (!auctionId) {
            try {
                const activeList = await auctionController.getActiveAuctions();
                if (activeList && activeList.length > 0) {
                    auctionId = activeList[0].auctionId || activeList[0].id;
                }
            } catch (e) {
                console.error('Error fetching fallback active auction:', e);
            }
        }

        if (!auctionId) {
            if (titleEl) titleEl.textContent = "Auction Not Found";
            return;
        }

        let auction = null;

        const refreshAuction = async () => {
            try {
                auction = await auctionController.getAuctionById(auctionId);
                if (!auction) {
                    if (titleEl) titleEl.textContent = "Auction Not Found";
                    return;
                }

                const realAuctionId = auction.auctionId || auction.id;
                const vehicle = auction.vehicle || {};
                const make = vehicle.make || vehicle.brand || '';
                const fullTitle = `${vehicle.year || ''} ${make} ${vehicle.model || 'Vehicle'}`.trim();

                document.title = `${fullTitle} - A&C Japan Auto Parts`;
                if (titleEl) titleEl.textContent = fullTitle;
                if (breadcrumbTitle) breadcrumbTitle.textContent = fullTitle;
                if (modalTitle) modalTitle.textContent = fullTitle;

                if (locEl) locEl.textContent = vehicle.locationCity ? `${vehicle.locationCity}, ${vehicle.locationCountry || 'Japan'}` : (vehicle.location || 'Tokyo, Japan');
                if (vinEl) vinEl.textContent = vehicle.vin || ('JAP-' + realAuctionId + '8839');

                if (sellerNameEl) sellerNameEl.textContent = auction.sellerName || 'Verified Dealer';
                if (sellerAvatarEl) sellerAvatarEl.textContent = (auction.sellerName || 'VD').slice(0, 2).toUpperCase();

                // Images
                const images = this.getVehicleImageUrls(vehicle);

                if (mainImg) {
                    mainImg.src = images[0];
                    mainImg.onerror = () => { mainImg.src = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop'; };
                }
                if (thumbsContainer) {
                    thumbsContainer.innerHTML = images.map((imgSrc, idx) => `
                        <img src="${imgSrc}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop'" class="w-full h-20 object-cover rounded-xl cursor-pointer ${idx === 0 ? 'border-2 border-primary-blue' : 'opacity-70 hover:opacity-100 transition border-2 border-transparent'}"
                            onclick="window.changeImage(this)">
                    `).join('');
                }

                // Specs
                if (specMake) specMake.textContent = `${make} ${vehicle.model || ''}`.trim() || 'N/A';
                if (specYear) specYear.textContent = vehicle.year || 'N/A';
                if (specMileage) specMileage.textContent = vehicle.mileage ? vehicle.mileage.toLocaleString() + ' mi' : 'N/A';
                if (specTransmission) specTransmission.textContent = vehicle.transmission || 'Automatic';
                if (specEngine) specEngine.textContent = vehicle.engineSize || vehicle.engineCapacity || 'Standard';
                if (specDrivetrain) specDrivetrain.textContent = vehicle.drivetrain || 'AWD / RWD';
                if (specFuel) specFuel.textContent = vehicle.fuelType || 'Petrol / Gasoline';
                if (specColor) specColor.textContent = vehicle.color || 'Standard';
                if (specInterior) specInterior.textContent = vehicle.interiorColor || 'Black';
                if (specDesc) specDesc.textContent = vehicle.description || auction.description || 'Verified Japanese import vehicle in verified auction condition.';

                // Bid details
                const currentBid = auction.currentBid != null ? auction.currentBid : (auction.startingPrice || 0);
                const minIncrement = auction.minBidIncrement || auction.minIncrement || 100;
                const minNextBid = Number(currentBid) + Number(minIncrement);
                const bidCount = auction.bidCount || 0;

                if (bidsCountLabel) bidsCountLabel.textContent = `Current Bid (${bidCount} Bids)`;
                if (currentBidDisplay) currentBidDisplay.textContent = `$${Number(currentBid).toLocaleString()}`;
                if (bidAmountInput) {
                    bidAmountInput.min = minNextBid;
                    bidAmountInput.value = minNextBid;
                    bidAmountInput.step = minIncrement;
                }
                if (bidHelperText) {
                    bidHelperText.textContent = `Enter US $${Number(minNextBid).toLocaleString()} or more (min +$${Number(minIncrement).toLocaleString()})`;
                }

                // Check Expiration & Status
                let isEnded = auction.status === 'ENDED';
                if (!isEnded) {
                    if (auction.timeLeftSeconds != null) {
                        isEnded = auction.timeLeftSeconds <= 0;
                    } else if (auction.endDate) {
                        isEnded = new Date(auction.endDate).getTime() <= Date.now();
                    }
                }

                const placeBidBtn = document.getElementById('placeBidBtn');
                const reserveStatus = document.getElementById('reserve-status');
                const resultAlert = document.getElementById('auction-result-alert');
                const currentUser = storage.getUser();
                const currentUserId = currentUser ? (currentUser.id || currentUser.userId) : null;

                if (isEnded) {
                    if (this._countdownTimer) clearInterval(this._countdownTimer);
                    const daysEl = document.getElementById('timer-days');
                    const hrsEl = document.getElementById('timer-hrs');
                    const minEl = document.getElementById('timer-min');
                    const secEl = document.getElementById('timer-sec');
                    if (daysEl) daysEl.textContent = '00';
                    if (hrsEl) hrsEl.textContent = '00';
                    if (minEl) minEl.textContent = '00';
                    if (secEl) secEl.textContent = '00';

                    if (reserveStatus) {
                        reserveStatus.className = 'text-sm text-slate-500 font-bold';
                        reserveStatus.innerHTML = `<i class="fas fa-flag-checkered mr-1 text-slate-500"></i> Auction Ended`;
                    }
                    if (bidAmountInput) {
                        bidAmountInput.disabled = true;
                        bidAmountInput.classList.add('bg-slate-100', 'cursor-not-allowed');
                    }
                    if (placeBidBtn) {
                        placeBidBtn.disabled = true;
                        placeBidBtn.className = 'w-full bg-slate-400 text-white font-bold py-4 rounded-xl text-lg mb-4 cursor-not-allowed opacity-75';
                        placeBidBtn.textContent = 'Auction Ended';
                    }

                    // Display Winner & Order Details
                    const winnerId = auction.highestBidderId;
                    const winnerName = auction.highestBidderName;
                    const winningBid = auction.currentBid || auction.startingPrice;
                    const orderNumber = auction.orderNumber;

                    let alertHtml = '';
                    if (winnerId) {
                        const isCurrentWinner = currentUserId && String(currentUserId) === String(winnerId);
                        if (isCurrentWinner) {
                            alertHtml = `
                                <div class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-5 rounded-2xl shadow-lg mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">
                                            🏆
                                        </div>
                                        <div>
                                            <h4 class="font-black text-lg">Congratulations! You won this auction!</h4>
                                            <p class="text-xs text-emerald-100">Your winning bid: $${Number(winningBid).toLocaleString()}. ${orderNumber ? `Order #${orderNumber} has been automatically placed for you!` : 'Your winning order has been generated.'}</p>
                                        </div>
                                    </div>
                                    <a href="my-orders.html" class="px-5 py-2.5 bg-white text-emerald-700 font-black rounded-xl text-xs hover:bg-emerald-50 transition shadow-sm whitespace-nowrap">
                                        View My Orders <i class="fas fa-arrow-right ml-1"></i>
                                    </a>
                                </div>
                            `;
                        } else {
                            alertHtml = `
                                <div class="bg-blue-50 border border-blue-200 text-slate-800 p-4 rounded-2xl mb-6 flex items-center space-x-3">
                                    <i class="fas fa-trophy text-amber-500 text-xl flex-shrink-0"></i>
                                    <div>
                                        <h4 class="font-bold text-sm text-[#0b1f3a]">Auction Closed</h4>
                                        <p class="text-xs text-slate-500">Won by <strong>${winnerName || 'Winning Bidder'}</strong> for <strong>$${Number(winningBid).toLocaleString()}</strong> ${orderNumber ? `(Order #${orderNumber})` : ''}</p>
                                    </div>
                                </div>
                            `;
                        }
                    } else {
                        alertHtml = `
                            <div class="bg-slate-100 border border-slate-200 text-slate-600 p-4 rounded-2xl mb-6 text-center text-xs font-semibold">
                                <i class="fas fa-info-circle mr-1"></i> This auction ended with no bids placed.
                            </div>
                        `;
                    }

                    if (resultAlert) {
                        resultAlert.innerHTML = alertHtml;
                    }
                } else {
                    if (resultAlert) resultAlert.innerHTML = '';
                    if (reserveStatus) {
                        reserveStatus.className = 'text-sm text-emerald-600 font-bold';
                        reserveStatus.innerHTML = `<i class="fas fa-check-circle mr-1"></i> Active Auction`;
                    }
                    if (bidAmountInput) {
                        bidAmountInput.disabled = false;
                        bidAmountInput.classList.remove('bg-slate-100', 'cursor-not-allowed');
                    }
                    if (placeBidBtn) {
                        placeBidBtn.disabled = false;
                        placeBidBtn.className = 'w-full btn-3d btn-primary-3d font-bold py-4 rounded-xl text-lg mb-4 cursor-pointer';
                        placeBidBtn.textContent = 'Place Bid Now';
                    }

                    // Start accurate countdown
                    this.startAuctionCountdown(auction.endDate, auction.timeLeftSeconds, () => {
                        this.showToast('Auction time expired! Finalizing auction...', 'info');
                        setTimeout(() => refreshAuction(), 2000);
                    });
                }

                // Load Bidders
                const bidders = await auctionController.getRecentBidders(realAuctionId);
                if (recentBiddersList) {
                    if (bidders && bidders.length > 0) {
                        if (recentBidsHeader) recentBidsHeader.textContent = `${bidders.length} Bids`;
                        recentBiddersList.innerHTML = bidders.slice(0, 5).map(b => {
                            const dateStr = b.placedAt ? new Date(b.placedAt).toLocaleString() : 'Recent';
                            const userName = b.user?.userName ? (b.user.userName.charAt(0) + '***' + b.user.userName.slice(-1)) : 'Bidder';
                            return `
                                <li class="flex justify-between items-center pb-3 border-b border-slate-100">
                                    <div>
                                        <p class="font-semibold text-sm text-slate-800">${userName}</p>
                                        <p class="text-xs text-slate-500">${dateStr}</p>
                                    </div>
                                    <span class="font-bold text-[#0b1f3a]">$${Number(b.bidAmount || 0).toLocaleString()}</span>
                                </li>
                            `;
                        }).join('');
                    } else {
                        recentBiddersList.innerHTML = `<li class="text-sm text-slate-400 text-center py-4">No bids placed yet. Be the first bidder!</li>`;
                    }
                }

            } catch (err) {
                console.error('Error refreshing auction details:', err);
            }
        };

        window.changeImage = (el) => {
            if (mainImg) mainImg.src = el.src;
            if (thumbsContainer) {
                thumbsContainer.querySelectorAll('img').forEach(t => {
                    t.classList.remove('border-2', 'border-primary-blue');
                    t.classList.add('opacity-70', 'border-transparent');
                });
                el.classList.remove('opacity-70', 'border-transparent');
                el.classList.add('border-2', 'border-primary-blue');
            }
        };

        const modal = document.getElementById('bidModal');
        const modalAmount = document.getElementById('modalBidAmount');
        const modalFee = document.getElementById('modalFee');
        const modalTotal = document.getElementById('modalTotal');

        window.openBidModal = () => {
            const user = storage.getUser();
            if (!user) {
                this.showToast('Please log in to place bids', 'error');
                setTimeout(() => window.location.href = 'login.html', 1000);
                return;
            }

            const amount = parseFloat(bidAmountInput.value);
            const currentHighest = (auction?.currentBid != null ? auction.currentBid : (auction?.startingPrice || 0));
            const minInc = (auction?.minBidIncrement || auction?.minIncrement || 100);
            const minAllowed = Number(currentHighest) + Number(minInc);

            if (isNaN(amount) || amount < minAllowed) {
                this.showToast(`Bid must be at least $${minAllowed.toLocaleString()}`, 'error');
                return;
            }

            const fee = amount * 0.05;
            const total = amount + fee;

            if (modalAmount) modalAmount.textContent = `$${amount.toLocaleString()}`;
            if (modalFee) modalFee.textContent = `$${fee.toLocaleString()}`;
            if (modalTotal) modalTotal.textContent = `$${total.toLocaleString()}`;

            if (modal) modal.classList.remove('hidden');
        };

        window.closeBidModal = () => {
            if (modal) modal.classList.add('hidden');
        };

        window.confirmBid = async () => {
            const amount = parseFloat(bidAmountInput.value);
            const realAuctionId = auction ? (auction.auctionId || auction.id) : auctionId;
            const res = await auctionController.placeBid(realAuctionId, amount);
            if (res.success) {
                this.showToast('Bid placed successfully!', 'success');
                window.closeBidModal();
                await refreshAuction();
            } else {
                this.showToast(res.error || 'Failed to place bid', 'error');
            }
        };

        if (watchlistBtn) {
            watchlistBtn.addEventListener('click', () => {
                window.toggleWatchlist(auctionId, watchlistBtn);
            });
        }

        await refreshAuction();
    }

    startAuctionCountdown(endDateStr, timeLeftSeconds, onExpire) {
        const daysEl = document.getElementById('timer-days');
        const hrsEl = document.getElementById('timer-hrs');
        const minEl = document.getElementById('timer-min');
        const secEl = document.getElementById('timer-sec');

        if (this._countdownTimer) clearInterval(this._countdownTimer);

        const fetchTime = Date.now();
        let expiredTriggered = false;

        const updateTimer = () => {
            let remainingSeconds = 0;
            if (timeLeftSeconds != null) {
                const elapsedSec = Math.floor((Date.now() - fetchTime) / 1000);
                remainingSeconds = Math.max(0, timeLeftSeconds - elapsedSec);
            } else if (endDateStr) {
                const diffMs = new Date(endDateStr).getTime() - Date.now();
                remainingSeconds = Math.max(0, Math.floor(diffMs / 1000));
            }

            if (remainingSeconds <= 0) {
                if (daysEl) daysEl.textContent = '00';
                if (hrsEl) hrsEl.textContent = '00';
                if (minEl) minEl.textContent = '00';
                if (secEl) secEl.textContent = '00';
                clearInterval(this._countdownTimer);
                if (!expiredTriggered && typeof onExpire === 'function') {
                    expiredTriggered = true;
                    onExpire();
                }
                return;
            }

            const days = Math.floor(remainingSeconds / 86400);
            const hours = Math.floor((remainingSeconds % 86400) / 3600);
            const minutes = Math.floor((remainingSeconds % 3600) / 60);
            const seconds = Math.floor(remainingSeconds % 60);

            if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
            if (hrsEl) hrsEl.textContent = String(hours).padStart(2, '0');
            if (minEl) minEl.textContent = String(minutes).padStart(2, '0');
            if (secEl) secEl.textContent = String(seconds).padStart(2, '0');
        };

        updateTimer();
        this._countdownTimer = setInterval(updateTimer, 1000);
    }

    formatTimeRemaining(endDateStr, timeLeftSeconds) {
        let remainingSeconds = 0;
        if (timeLeftSeconds != null) {
            remainingSeconds = Math.max(0, timeLeftSeconds);
        } else if (endDateStr) {
            const diffMs = new Date(endDateStr).getTime() - Date.now();
            remainingSeconds = Math.max(0, Math.floor(diffMs / 1000));
        }

        if (remainingSeconds <= 0) return 'Ended';

        const days = Math.floor(remainingSeconds / 86400);
        const hours = Math.floor((remainingSeconds % 86400) / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        const seconds = Math.floor(remainingSeconds % 60);

        if (days > 0) {
            return `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
        }
        return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }

    // ==========================================
    // PAGE 4: BUY NOW / SPARE PARTS (buy-now.html)
    // ==========================================
    async loadBuyNowPage() {
        const partsGrid = document.getElementById('parts-grid');
        const countEl = document.getElementById('parts-count');
        const catSelect = document.getElementById('parts-category-select');
        const searchInput = document.getElementById('parts-search-input');
        const priceRange = document.getElementById('parts-price-range');
        const priceRangeVal = document.getElementById('parts-price-range-val');
        const sortSelect = document.getElementById('parts-sort-select');
        const applyBtn = document.getElementById('parts-apply-filters-btn');
        const clearBtn = document.getElementById('parts-clear-filters-btn');

        if (!partsGrid) return;

        let allProducts = [];

        try {
            // Load Categories
            const categories = await productController.getCategories();
            if (catSelect && categories && categories.length > 0) {
                catSelect.innerHTML = `<option value="">All Categories</option>` +
                    categories.map(c => `<option value="${c.categoryId}">${c.name}</option>`).join('');
            }

            allProducts = await productController.getAllProducts() || [];
        } catch (err) {
            console.error('Error fetching products/categories:', err);
        }

        const renderProducts = (list) => {
            if (countEl) {
                countEl.innerHTML = `Showing <span class="font-bold text-slate-800">${list.length}</span> spare parts`;
            }

            if (list.length === 0) {
                partsGrid.innerHTML = `
                    <div class="col-span-full py-16 text-center text-slate-400">
                        <i class="fas fa-tools text-4xl mb-3 text-slate-300"></i>
                        <p class="font-bold text-slate-700">No spare parts match your filters</p>
                        <p class="text-xs text-slate-400 mt-1">Try another category or clear search filters</p>
                    </div>
                `;
                return;
            }

            partsGrid.innerHTML = list.map(prod => {
                const img = prod.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1600293144865-950c4bb67f1b?q=80&w=2000&auto=format&fit=crop';
                const catName = prod.category?.name || 'Auto Part';

                return `
                    <div class="glass-panel rounded-2xl card-3d overflow-hidden group border border-white/90 bg-white/85 shadow-sm flex flex-col justify-between">
                        <div class="relative overflow-hidden p-4">
                            <div class="h-44 flex items-center justify-center bg-slate-50 rounded-xl overflow-hidden mb-3">
                                <img src="${img}" alt="${prod.name}" class="max-h-full object-contain group-hover:scale-105 transition duration-300">
                            </div>
                            <div class="absolute top-6 left-6 bg-primary-blue text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow">BUY NOW</div>
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">${catName}</p>
                            <h3 class="text-base font-bold text-[#0b1f3a] mb-1 leading-snug line-clamp-2" title="${prod.name}">
                                ${prod.name}
                            </h3>
                            <p class="text-xs text-slate-500 mb-3 truncate">SKU: ${prod.sku || 'AP-00' + prod.productId} • Stock: ${prod.stockQuantity || 'In Stock'}</p>
                            <div class="flex justify-between items-center mb-3 pb-3 border-b border-slate-100">
                                <div>
                                    <p class="text-[10px] text-slate-400 font-semibold uppercase">Price</p>
                                    <p class="text-xl font-black text-[#0b1f3a]">$${Number(prod.price || 0).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                        <div class="p-4 pt-0">
                            <button onclick="window.addToCart(${prod.productId})" class="block w-full text-center btn-3d btn-primary-3d font-bold py-2.5 rounded-xl transition text-sm cursor-pointer shadow-sm">
                                <i class="fas fa-shopping-cart mr-1.5"></i> Add to Cart
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        };

        const filterProducts = () => {
            let filtered = [...allProducts];
            const catId = catSelect ? catSelect.value : '';
            const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
            const maxPrice = priceRange ? parseFloat(priceRange.value) : Infinity;

            if (catId) {
                filtered = filtered.filter(p => p.category?.categoryId == catId);
            }
            if (keyword) {
                filtered = filtered.filter(p =>
                    (p.name && p.name.toLowerCase().includes(keyword)) ||
                    (p.sku && p.sku.toLowerCase().includes(keyword)) ||
                    (p.description && p.description.toLowerCase().includes(keyword))
                );
            }
            if (!isNaN(maxPrice)) {
                filtered = filtered.filter(p => (p.price || 0) <= maxPrice);
            }

            const sort = sortSelect ? sortSelect.value : 'featured';
            if (sort === 'price_asc') {
                filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
            } else if (sort === 'price_desc') {
                filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
            }

            renderProducts(filtered);
        };

        if (priceRange && priceRangeVal) {
            priceRange.addEventListener('input', () => {
                priceRangeVal.textContent = `$${Number(priceRange.value).toLocaleString()}`;
            });
        }

        if (applyBtn) applyBtn.addEventListener('click', filterProducts);
        if (catSelect) catSelect.addEventListener('change', filterProducts);
        if (searchInput) searchInput.addEventListener('input', filterProducts);
        if (sortSelect) sortSelect.addEventListener('change', filterProducts);
        window.showProductDetails = (prodId) => {
            const prod = allProducts.find(p => p.productId == prodId);
            if (!prod) return;

            const filtersAside = document.getElementById('filters-aside');
            const listingsSection = document.getElementById('listings-section');
            const detailsContainer = document.getElementById('product-details-container');

            if (filtersAside) filtersAside.classList.add('hidden');
            if (listingsSection) listingsSection.classList.add('hidden');
            if (detailsContainer) {
                detailsContainer.classList.remove('hidden');
                const img = prod.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1600293144865-950c4bb67f1b?q=80&w=2000&auto=format&fit=crop';
                const catName = prod.category?.name || 'Spare Parts';

                detailsContainer.innerHTML = `
                    <div class="glass-panel card-3d rounded-2xl border border-white/90 bg-white/90 shadow-sm overflow-hidden">
                        <div class="flex flex-col md:flex-row">
                            <div class="w-full md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-slate-200/80">
                                <div class="relative rounded-2xl overflow-hidden mb-4 border border-slate-200/80 bg-slate-50 flex items-center justify-center p-4">
                                    <img id="main-product-image" src="${img}" alt="${prod.name}" class="w-full h-80 object-contain">
                                    <div class="absolute top-3 left-3 bg-primary-blue text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">BUY NOW</div>
                                </div>
                            </div>
                            
                            <div class="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                                <div class="flex items-center space-x-2 text-sm text-slate-500 mb-2">
                                    <a href="index.html" class="hover:text-primary-blue">Home</a>
                                    <span>/</span>
                                    <span>${catName}</span>
                                    <span>/</span>
                                    <span class="text-[#0b1f3a] font-bold truncate">${prod.name}</span>
                                </div>
                                
                                <h2 class="text-3xl font-bold text-[#0b1f3a] mb-2">${prod.name}</h2>
                                <p class="text-slate-500 mb-6 text-sm">SKU: ${prod.sku || 'AP-00' + prod.productId} • Condition: ${prod.quality || 'OEM Quality'}</p>
                                
                                <div class="p-6 rounded-2xl mb-8 bg-blue-50/50 border border-blue-100">
                                    <p class="text-xs text-slate-500 font-bold uppercase mb-1">Price</p>
                                    <p class="text-4xl font-black text-[#0b1f3a] mb-4">$${Number(prod.price || 0).toFixed(2)}</p>
                                    
                                    <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                                        <button onclick="window.addToCart(${prod.productId})" class="flex-1 btn-3d btn-primary-3d font-bold py-3.5 px-6 rounded-xl transition shadow-md flex justify-center items-center cursor-pointer">
                                            <i class="fas fa-shopping-cart mr-2"></i> Add to Cart
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="border-t border-slate-100 pt-6">
                                    <h3 class="font-bold text-lg text-[#0b1f3a] mb-4">Product Details</h3>
                                    <p class="text-sm text-slate-600 mb-4 leading-relaxed">${prod.description || 'Authentic OEM quality Japanese replacement part tested for durability and performance.'}</p>
                                    <ul class="space-y-3 text-sm text-slate-600">
                                        <li class="flex items-center"><i class="fas fa-check text-emerald-500 mr-2.5 w-5"></i> <strong>Quality:</strong>&nbsp;${prod.quality || 'OEM Standard'}</li>
                                        <li class="flex items-center"><i class="fas fa-check text-emerald-500 mr-2.5 w-5"></i> <strong>Availability:</strong>&nbsp;In Stock (${prod.stockQuantity || 10} units)</li>
                                        <li class="flex items-center"><i class="fas fa-check text-emerald-500 mr-2.5 w-5"></i> <strong>Shipping:</strong>&nbsp;Express Global Shipping</li>
                                    </ul>
                                </div>
                                
                                <div class="mt-8">
                                    <button onclick="window.hideProductDetails()" class="text-primary-blue hover:underline font-bold text-sm flex items-center cursor-pointer">
                                        <i class="fas fa-arrow-left mr-2"></i> Back to Products
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        };

        window.hideProductDetails = () => {
            const filtersAside = document.getElementById('filters-aside');
            const listingsSection = document.getElementById('listings-section');
            const detailsContainer = document.getElementById('product-details-container');
            if (detailsContainer) detailsContainer.classList.add('hidden');
            if (filtersAside) filtersAside.classList.remove('hidden');
            if (listingsSection) listingsSection.classList.remove('hidden');
        };

        renderProducts(allProducts);
    }

    // ==========================================
    // PAGE 5: CART PAGE (cart.html)
    // ==========================================
    async loadCartPage() {
        const itemsContainer = document.getElementById('cart-items-container');
        const headingCount = document.getElementById('cart-items-heading');
        const subtotalEl = document.getElementById('subtotal');
        const shippingEl = document.getElementById('shipping-cost');
        const totalEl = document.getElementById('total-amount');
        const addressInput = document.getElementById('checkout-shipping-address');

        if (!itemsContainer) return;

        // Pre-fill shipping address from stored user
        const user = storage.getUser();
        if (user && addressInput && !addressInput.value) {
            addressInput.value = user.address || '';
        }

        const renderCart = async () => {
            const cart = await cartController.getCart();
            const items = cart?.items || [];
            const count = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

            if (headingCount) headingCount.textContent = `Items in Cart (${count})`;

            if (items.length === 0) {
                itemsContainer.innerHTML = `
                    <div class="p-12 text-center text-slate-400">
                        <i class="fas fa-shopping-basket text-4xl mb-3 text-slate-300"></i>
                        <p class="font-bold text-slate-600">Your cart is currently empty</p>
                        <p class="text-xs text-slate-400 mt-1">Browse our auto parts and add items to your cart</p>
                    </div>
                `;
                if (subtotalEl) subtotalEl.textContent = '$0.00';
                if (totalEl) totalEl.textContent = '$0.00';
                return;
            }

            const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const shipping = subtotal > 500 ? 0 : 15;
            const total = subtotal + shipping;

            if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
            if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
            if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

            itemsContainer.innerHTML = items.map(item => {
                const img = item.product?.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1600293144865-950c4bb67f1b?q=80&w=200&auto=format&fit=crop';
                const name = item.product?.name || 'Auto Part';
                const sku = item.product?.sku || 'AP-00' + item.productId;
                const unitPrice = item.price || 0;
                const itemTotal = unitPrice * item.quantity;

                return `
                    <div class="p-6 flex flex-col sm:flex-row items-start sm:items-center">
                        <img src="${img}" alt="${name}" class="w-24 h-24 object-contain rounded-xl border border-slate-200 bg-slate-50 p-2 mr-6 mb-4 sm:mb-0">
                        <div class="flex-1">
                            <h4 class="font-bold text-[#0b1f3a] text-lg mb-1 leading-snug">${name}</h4>
                            <p class="text-xs text-slate-500 mb-3">SKU: ${sku}</p>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                                    <button onclick="window.updateCartQty(${item.cartItemId}, ${item.quantity - 1})" class="px-3 py-1 text-slate-500 hover:bg-slate-100 transition text-sm font-bold cursor-pointer">-</button>
                                    <input type="text" value="${item.quantity}" readonly class="w-10 text-center py-1 outline-none text-xs font-bold text-slate-800 bg-white">
                                    <button onclick="window.updateCartQty(${item.cartItemId}, ${item.quantity + 1})" class="px-3 py-1 text-slate-500 hover:bg-slate-100 transition text-sm font-bold cursor-pointer">+</button>
                                </div>
                                <div class="text-right">
                                    <p class="font-black text-lg text-[#0b1f3a] tracking-tight">$${itemTotal.toFixed(2)}</p>
                                    <p class="text-xs text-slate-400">$${unitPrice.toFixed(2)} / each</p>
                                </div>
                            </div>
                        </div>
                        <button onclick="window.removeCartItem(${item.cartItemId})" class="text-slate-400 hover:text-red-600 transition sm:ml-6 mt-4 sm:mt-0 p-2 cursor-pointer" title="Remove">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
            }).join('');
        };

        window.updateCartQty = async (itemId, newQty) => {
            if (newQty <= 0) {
                await window.removeCartItem(itemId);
                return;
            }
            const res = await cartController.updateQuantity(itemId, newQty);
            if (res.success) {
                renderCart();
            }
        };

        window.removeCartItem = async (itemId) => {
            const res = await cartController.removeItem(itemId);
            if (res.success) {
                this.showToast('Item removed from cart', 'success');
                renderCart();
            }
        };

        window.clearUserCart = async () => {
            await cartController.clearCart();
            this.showToast('Cart cleared', 'success');
            renderCart();
        };

        window.proceedToCheckout = async () => {
            const u = storage.getUser();
            if (!u) {
                this.showToast('Please login to checkout', 'error');
                setTimeout(() => window.location.href = 'login.html', 1000);
                return;
            }

            const address = addressInput ? addressInput.value.trim() : '';
            if (!address) {
                alert('Please provide a shipping address');
                return;
            }

            const btn = document.getElementById('checkoutBtn');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Processing Order...`;
            }

            const res = await orderController.checkout({
                shippingAddress: address,
                shippingPhone: u.phone || 'N/A',
                shippingRecipientName: u.name || 'Customer'
            });

            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `Proceed to Checkout <i class="fas fa-lock ml-2 text-xs opacity-80"></i>`;
            }

            if (res.success) {
                this.showToast(`Order created successfully! Order #: ${res.order.orderNumber || ''}`, 'success');
                await cartController.updateCartBadge();
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1500);
            } else {
                this.showToast(res.error || 'Failed to place order', 'error');
            }
        };

        await renderCart();
    }

    // ==========================================
    // PAGE 6: ADD AUCTION (add-auction.html)
    // ==========================================
    async loadAddAuctionPage() {
        const form = document.getElementById('addAuctionForm');
        if (!form) return;

        const user = storage.getUser();
        if (!user) {
            this.showToast('Please log in to list vehicles for auction', 'error');
            setTimeout(() => window.location.href = 'login.html', 1200);
            return;
        }

        // File upload & preview handling
        let selectedFiles = [];
        const fileInput = document.getElementById('fileInput');
        const dropzone = document.getElementById('dropzone');
        const imagePreview = document.getElementById('imagePreview');

        const renderPreviews = () => {
            if (!imagePreview) return;
            if (selectedFiles.length === 0) {
                imagePreview.innerHTML = '';
                imagePreview.classList.add('hidden');
                return;
            }
            imagePreview.classList.remove('hidden');
            imagePreview.innerHTML = selectedFiles.map((file, index) => {
                const objectUrl = URL.createObjectURL(file);
                return `
                    <div class="relative w-24 h-24 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden group shadow-2xs">
                        <img src="${objectUrl}" class="w-full h-full object-cover">
                        <button type="button" data-index="${index}" class="remove-img-btn absolute top-1 right-1 bg-rose-600/80 hover:bg-rose-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow cursor-pointer transition">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            }).join('');

            imagePreview.querySelectorAll('.remove-img-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idx = parseInt(btn.getAttribute('data-index'));
                    if (!isNaN(idx)) {
                        selectedFiles.splice(idx, 1);
                        renderPreviews();
                    }
                });
            });
        };

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    const files = Array.from(e.target.files);
                    selectedFiles = [...selectedFiles, ...files].slice(0, 10);
                    renderPreviews();
                }
            });
        }

        if (dropzone) {
            dropzone.addEventListener('click', (e) => {
                if (e.target.tagName !== 'BUTTON' && fileInput) {
                    fileInput.click();
                }
            });

            ['dragenter', 'dragover'].forEach(eventName => {
                dropzone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropzone.classList.add('border-primary-blue', 'bg-blue-100/30');
                });
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropzone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropzone.classList.remove('border-primary-blue', 'bg-blue-100/30');
                });
            });

            dropzone.addEventListener('drop', (e) => {
                if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                    selectedFiles = [...selectedFiles, ...files].slice(0, 10);
                    renderPreviews();
                }
            });
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('aucTitle')?.value.trim();
            const make = document.getElementById('aucBrand')?.value;
            const model = document.getElementById('aucModel')?.value.trim();
            const year = parseInt(document.getElementById('aucYear')?.value);
            const mileage = parseInt(document.getElementById('aucMileage')?.value);
            const condition = document.getElementById('aucCondition')?.value;
            const location = document.getElementById('aucLocation')?.value.trim();
            const transmission = document.getElementById('aucTransmission')?.value;
            const fuelType = document.getElementById('aucFuel')?.value;
            const engine = document.getElementById('aucEngine')?.value.trim();
            const color = document.getElementById('aucColor')?.value.trim();
            const description = document.getElementById('aucDescription')?.value.trim();
            const startingPrice = parseFloat(document.getElementById('aucStartingPrice')?.value);
            const reservePrice = parseFloat(document.getElementById('aucReservePrice')?.value) || startingPrice;
            const startDate = document.getElementById('aucStartDate')?.value;
            const endDate = document.getElementById('aucEndDate')?.value;

            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Uploading & Saving...`;
            }

            let finalImageUrls = [];

            // 1. Upload files if any selected
            if (selectedFiles.length > 0) {
                try {
                    const formData = new FormData();
                    selectedFiles.forEach(f => formData.append('images', f));
                    const uploadRes = await apiService.upload('/vehicles/upload-images', formData);
                    if (uploadRes && uploadRes.status === 0 && Array.isArray(uploadRes.body)) {
                        finalImageUrls.push(...uploadRes.body);
                    }
                } catch (uploadErr) {
                    console.error('Image upload error:', uploadErr);
                    this.showToast('Failed to upload image files, using defaults', 'error');
                }
            }

            // 2. Add text input URL if provided
            const inputUrl = document.getElementById('aucImageUrl')?.value.trim();
            if (inputUrl) {
                finalImageUrls.push(inputUrl);
            }

            // 3. Default fallback if no images provided
            if (finalImageUrls.length === 0) {
                finalImageUrls.push('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop');
            }

            const vehicleData = {
                make,
                model,
                year,
                mileage,
                condition,
                transmission,
                fuelType,
                engineCapacity: engine,
                color,
                location,
                description,
                imageUrls: finalImageUrls
            };

            const getLocalISO = (dt = new Date()) => {
                const pad = n => String(n).padStart(2, '0');
                return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
            };

            const auctionData = {
                title,
                startingPrice,
                reservePrice,
                startDate: startDate ? (startDate.length === 16 ? startDate + ':00' : startDate) : getLocalISO(),
                endDate: endDate ? (endDate.length === 16 ? endDate + ':00' : endDate) : getLocalISO(new Date(Date.now() + 7 * 86400000)),
                description
            };

            const result = await auctionController.createAuctionWithVehicle(vehicleData, auctionData);

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `List Vehicle`;
            }

            if (result.success) {
                this.showToast('Vehicle auction created successfully!', 'success');
                const targetAuctionId = result.auction?.auctionId || result.data?.auctionId || result.data?.id || result.auction?.id;
                setTimeout(() => {
                    if (targetAuctionId) {
                        window.location.href = `auction-details.html?id=${targetAuctionId}`;
                    } else {
                        window.location.href = 'supplier-dashboard.html';
                    }
                }, 1500);
            } else {
                this.showToast(result.error || 'Failed to create auction listing', 'error');
            }
        });
    }

    // ==========================================
    // PAGE 7: SUPPLIER DASHBOARD (supplier-dashboard.html)
    // ==========================================
    async loadSupplierDashboardPage() {
        const activeAuctionsEl = document.getElementById('sup-active-auctions-count');
        const vehiclesCountEl = document.getElementById('sup-total-vehicles-count');
        const totalBidsEl = document.getElementById('sup-total-bids-count');
        const totalRevenueEl = document.getElementById('sup-total-revenue');
        const auctionsTbody = document.getElementById('sup-auctions-tbody');
        const supHeaderName = document.getElementById('sup-header-name');
        const supHeaderAvatar = document.getElementById('sup-header-avatar');
        const recentBidsContainer = document.getElementById('sup-recent-bids-container');
        const pendingOrdersContainer = document.getElementById('sup-pending-orders-container');

        if (!auctionsTbody) return;

        const authResult = await authController.validateUser();
        if (!authResult.success) {
            this.showToast('Please log in to access supplier dashboard', 'error');
            setTimeout(() => window.location.href = 'login.html', 1000);
            return;
        }

        const user = authResult.user;
        const role = (user.role || '').toUpperCase();
        if (role !== 'SUPPLIER' && role !== 'ADMIN') {
            this.showToast('Access restricted: Supplier account required', 'error');
            setTimeout(() => window.location.href = 'profile.html', 1200);
            return;
        }

        if (supHeaderName) supHeaderName.textContent = user.name || 'Supplier';
        if (supHeaderAvatar) supHeaderAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Supplier')}&background=02316e&color=fff`;

        try {
            const auctions = await supplierController.getSupplierAuctions(user.id);
            const vehicles = await supplierController.getSupplierVehicles(user.id);

            const activeCount = auctions ? auctions.length : 0;
            const vehCount = vehicles ? vehicles.length : 0;
            const totalBids = (auctions || []).reduce((sum, auc) => sum + (auc.bidCount || 0), 0);
            const totalRevenue = (auctions || [])
                .filter(auc => auc.status === 'ENDED' || auc.status === 'COMPLETED')
                .reduce((sum, auc) => sum + Number(auc.currentBid || 0), 0);

            if (activeAuctionsEl) activeAuctionsEl.textContent = activeCount;
            if (vehiclesCountEl) vehiclesCountEl.textContent = vehCount;
            if (totalBidsEl) totalBidsEl.textContent = totalBids;
            if (totalRevenueEl) totalRevenueEl.textContent = `$${totalRevenue.toLocaleString()}`;

            if (auctions && auctions.length > 0) {
                auctionsTbody.innerHTML = auctions.map(auc => {
                    const aucId = auc.auctionId || auc.id;
                    const vehicle = auc.vehicle || {};
                    const img = this.getVehicleImageUrl(vehicle, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=150&auto=format&fit=crop');
                    const make = vehicle.make || vehicle.brand || '';
                    const title = `${vehicle.year || ''} ${make} ${vehicle.model || 'Vehicle'}`.trim();
                    const timeLeft = this.formatTimeRemaining(auc.endDate, auc.timeLeftSeconds);

                    return `
                        <tr class="border-b border-slate-100 hover:bg-blue-50/30 transition">
                            <td class="py-4 px-5">
                                <div class="flex items-center">
                                    <img src="${img}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=150&auto=format&fit=crop'" class="w-12 h-10 rounded-xl object-cover mr-3 border border-slate-200">
                                    <div>
                                        <p class="font-bold text-[#0b1f3a]">${title}</p>
                                        <p class="text-xs text-slate-400 font-medium">ID: #AUC-${aucId}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="py-4 px-5 font-black text-[#0b1f3a]">$${Number(auc.currentBid != null ? auc.currentBid : (auc.startingPrice || 0)).toLocaleString()}</td>
                            <td class="py-4 px-5"><span class="bg-blue-50 text-primary-blue px-2.5 py-0.5 rounded-full text-xs font-bold">${auc.bidCount || 0}</span></td>
                            <td class="py-4 px-5 font-bold text-primary-blue">${timeLeft}</td>
                            <td class="py-4 px-5 text-right">
                                <a href="auction-details.html?id=${aucId}" class="text-primary-blue hover:underline font-bold text-xs">View</a>
                            </td>
                        </tr>
                    `;
                }).join('');
            } else {
                auctionsTbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-400 font-medium">No active vehicle auctions listed. <a href="add-auction.html" class="text-primary-blue font-bold hover:underline">Add one now</a></td></tr>`;
            }

            // Recent Bids Activity (real activity or empty state)
            if (recentBidsContainer) {
                const auctionsWithBids = (auctions || []).filter(a => a.bidCount > 0);
                if (auctionsWithBids.length > 0) {
                    recentBidsContainer.innerHTML = auctionsWithBids.slice(0, 5).map(auc => {
                        const v = auc.vehicle || {};
                        const vName = `${v.year || ''} ${v.make || ''} ${v.model || ''}`.trim() || `Auction #${auc.auctionId}`;
                        return `
                            <div class="flex items-start">
                                <div class="w-8 h-8 rounded-full bg-blue-100 text-primary-blue flex items-center justify-center font-bold text-xs mr-3 shrink-0"><i class="fas fa-gavel"></i></div>
                                <div>
                                    <p class="text-sm text-slate-800"><span class="font-bold text-[#0b1f3a]">${auc.bidCount} bid(s)</span> current: <span class="font-bold text-emerald-600">$${Number(auc.currentBid || auc.startingPrice || 0).toLocaleString()}</span></p>
                                    <p class="text-xs text-slate-400 mt-0.5 font-medium">on ${vName}</p>
                                </div>
                            </div>
                        `;
                    }).join('');
                } else {
                    recentBidsContainer.innerHTML = `<p class="text-center text-slate-400 text-xs py-4 font-medium">No recent bid activity</p>`;
                }
            }

            // Pending Part Orders
            if (pendingOrdersContainer) {
                pendingOrdersContainer.innerHTML = `<p class="text-center text-slate-400 text-xs py-4 font-medium">No pending part orders</p>`;
            }

        } catch (err) {
            console.error('Error loading supplier dashboard:', err);
            auctionsTbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-rose-500 font-medium">Failed to load supplier auctions.</td></tr>`;
        }
    }

    // ==========================================
    // PAGE 8: ADMIN DASHBOARD (admin.html)
    // ==========================================
    async loadAdminPage() {
        const usersEl = document.getElementById('admin-total-users');
        const auctionsEl = document.getElementById('admin-active-auctions');
        const revenueEl = document.getElementById('admin-gross-revenue');
        const pendingEl = document.getElementById('admin-pending-approvals');
        const pendingTbody = document.getElementById('admin-pending-tbody');
        const pendingSuppliersTbody = document.getElementById('admin-pending-suppliers-tbody');
        const adminSidebarName = document.getElementById('admin-sidebar-name');
        const adminSidebarAvatar = document.getElementById('admin-sidebar-avatar');

        if (!pendingTbody) return;

        const authResult = await authController.validateUser();
        if (!authResult.success) {
            this.showToast('Please log in to access administrator dashboard', 'error');
            setTimeout(() => window.location.href = 'login.html', 1000);
            return;
        }

        const user = authResult.user;
        if (!user || (user.role || '').toUpperCase() !== 'ADMIN') {
            this.showToast('Admin privileges required. Please log in as an administrator.', 'error');
            setTimeout(() => window.location.href = 'login.html', 1200);
            return;
        }

        if (adminSidebarName) adminSidebarName.textContent = user.name || 'Admin User';
        if (adminSidebarAvatar) adminSidebarAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Admin')}&background=02316e&color=fff`;

        let cachedPendingSuppliers = [];

        const refreshAdmin = async () => {
            try {
                const stats = await adminController.getDashboard();
                if (stats) {
                    if (usersEl) usersEl.textContent = stats.totalUsers || 0;
                    if (auctionsEl) auctionsEl.textContent = stats.activeAuctions || 0;
                    if (revenueEl) revenueEl.textContent = `$${Number(stats.grossRevenue || 0).toLocaleString()}`;
                    if (pendingEl) pendingEl.textContent = stats.pendingApprovals || 0;
                }

                // Pending Auctions
                const pendingAuctions = await adminController.getPendingAuctions();
                if (pendingAuctions && pendingAuctions.length > 0) {
                    pendingTbody.innerHTML = pendingAuctions.map(auc => {
                        const vehicle = auc.vehicle || {};
                        const title = `${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || 'Vehicle'}`.trim();
                        const start = auc.startDate ? new Date(auc.startDate).toLocaleDateString() : 'N/A';
                        const end = auc.endDate ? new Date(auc.endDate).toLocaleDateString() : 'N/A';

                        return `
                            <tr class="border-b border-slate-100 hover:bg-blue-50/30 transition">
                                <td class="py-4 px-5 font-bold text-[#0b1f3a]">${title} (#AUC-${auc.auctionId})</td>
                                <td class="py-4 px-5 font-black text-[#0b1f3a]">$${Number(auc.startingPrice || 0).toLocaleString()}</td>
                                <td class="py-4 px-5 text-slate-500 text-xs">${start}</td>
                                <td class="py-4 px-5 text-slate-500 text-xs">${end}</td>
                                <td class="py-4 px-5 text-right space-x-2">
                                    <button onclick="window.approveAuction(${auc.auctionId})" class="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer">Approve</button>
                                    <button onclick="window.rejectAuction(${auc.auctionId})" class="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer">Reject</button>
                                </td>
                            </tr>
                        `;
                    }).join('');
                } else {
                    pendingTbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-slate-400 font-medium">No pending vehicle auctions to approve</td></tr>`;
                }

                // Pending Suppliers
                const pendingSuppliers = await adminController.getPendingSuppliers();
                cachedPendingSuppliers = pendingSuppliers || [];
                if (pendingSuppliersTbody) {
                    if (pendingSuppliers && pendingSuppliers.length > 0) {
                        pendingSuppliersTbody.innerHTML = pendingSuppliers.map(sup => {
                            const supId = sup.supplierId || sup.id;
                            const businessName = sup.businessName || sup.supplierBusinessName || 'N/A';
                            const contactName = sup.contactPerson || sup.supplierName || 'N/A';
                            const email = sup.userEmail || sup.email || 'N/A';
                            const phone = sup.phone || sup.contactNumber || sup.supplierContactNumber || 'N/A';
                            const regDate = sup.createdAt ? new Date(sup.createdAt).toLocaleDateString() : 'Recent';
                            const status = sup.supplierStatus || 'PENDING';

                            const hasDoc = Boolean(sup.hasBusinessDocument || (sup.businessRegistrationDocument && !sup.businessRegistrationDocument.includes('registration_doc.pdf')) || (sup.registrationDocUrl && !sup.registrationDocUrl.includes('registration_doc.pdf')));
                            const docHtml = hasDoc
                                ? `<button onclick="window.viewSupplierDocument(${supId})" class="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold px-2.5 py-1.5 rounded-xl transition cursor-pointer flex items-center space-x-1.5"><i class="fas fa-file-contract text-indigo-600"></i><span>View Document</span></button>`
                                : `<span class="text-xs text-slate-400 italic font-medium">No document</span>`;

                            return `
                                <tr class="border-b border-slate-100 hover:bg-blue-50/30 transition">
                                    <td class="py-4 px-4 font-bold text-[#0b1f3a]">
                                        <div class="flex items-center space-x-2">
                                            <div class="w-8 h-8 rounded-full bg-blue-100 text-primary-blue flex items-center justify-center font-bold text-xs shrink-0">${contactName.charAt(0).toUpperCase()}</div>
                                            <div>
                                                <p class="font-bold text-sm text-[#0b1f3a]">${contactName}</p>
                                                <p class="text-[11px] text-slate-400 font-medium">ID: #SUP-${supId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="py-4 px-4 font-bold text-slate-800 text-sm">${businessName}</td>
                                    <td class="py-4 px-4 text-slate-600 text-xs">${email}</td>
                                    <td class="py-4 px-4 text-slate-600 text-xs font-medium">${phone}</td>
                                    <td class="py-4 px-4 whitespace-nowrap">${docHtml}</td>
                                    <td class="py-4 px-4 text-slate-500 text-xs">${regDate}</td>
                                    <td class="py-4 px-4">
                                        <span class="bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold px-2.5 py-1 rounded-full">${status}</span>
                                    </td>
                                    <td class="py-4 px-4 text-right space-x-1 whitespace-nowrap">
                                        <button onclick="window.viewSupplierDetails(${supId})" class="bg-blue-50 text-primary-blue hover:bg-blue-100 border border-blue-200 text-xs font-bold px-2.5 py-1.5 rounded-xl transition cursor-pointer">View Details</button>
                                        <button onclick="window.approveSupplier(${supId})" class="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold px-2.5 py-1.5 rounded-xl transition cursor-pointer">Approve</button>
                                        <button onclick="window.rejectSupplier(${supId})" class="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold px-2.5 py-1.5 rounded-xl transition cursor-pointer">Reject</button>
                                    </td>
                                </tr>
                            `;
                        }).join('');
                    } else {
                        pendingSuppliersTbody.innerHTML = `<tr><td colspan="8" class="py-8 text-center text-slate-400 font-medium">No supplier requests found</td></tr>`;
                    }
                }

            } catch (err) {
                console.error('Error loading admin page:', err);
            }
        };

        window.viewSupplierDetails = (supplierId) => {
            const sup = cachedPendingSuppliers.find(s => (s.supplierId || s.id) == supplierId);
            if (!sup) {
                this.showToast('Supplier details not found', 'error');
                return;
            }

            const supId = sup.supplierId || sup.id;
            const businessName = sup.businessName || sup.supplierBusinessName || 'N/A';
            const contactName = sup.contactPerson || sup.supplierName || 'N/A';
            const email = sup.userEmail || sup.email || 'N/A';
            const phone = sup.phone || sup.contactNumber || sup.supplierContactNumber || 'N/A';
            const address = sup.address || sup.businessAddress || sup.supplierBusinessAddress || 'N/A';
            const regDate = sup.createdAt ? new Date(sup.createdAt).toLocaleString() : 'N/A';
            const status = sup.supplierStatus || 'PENDING';
            const hasDoc = Boolean(sup.hasBusinessDocument || (sup.businessRegistrationDocument && !sup.businessRegistrationDocument.includes('registration_doc.pdf')) || (sup.registrationDocUrl && !sup.registrationDocUrl.includes('registration_doc.pdf')));

            const modal = document.getElementById('supplierDetailsModal');
            if (!modal) return;

            document.getElementById('modal-supplier-id').textContent = `#SUP-${supId}`;
            document.getElementById('modal-supplier-avatar').textContent = contactName.charAt(0).toUpperCase() || 'S';
            document.getElementById('modal-supplier-contact').textContent = contactName;
            document.getElementById('modal-supplier-email').textContent = email;
            document.getElementById('modal-supplier-status').textContent = status;
            document.getElementById('modal-business-name').textContent = businessName;
            document.getElementById('modal-business-address').textContent = address;
            document.getElementById('modal-business-phone').textContent = phone;
            document.getElementById('modal-registered-date').textContent = regDate;
            document.getElementById('modal-user-id').textContent = sup.userId ? `User #${sup.userId}` : 'N/A';

            const docStatusEl = document.getElementById('modal-document-status');
            const docActionEl = document.getElementById('modal-document-action');
            if (docStatusEl && docActionEl) {
                if (hasDoc) {
                    docStatusEl.textContent = 'Document Uploaded & Available';
                    docStatusEl.className = 'text-xs text-emerald-600 font-bold';
                    docActionEl.innerHTML = `<button type="button" onclick="window.viewSupplierDocument(${supId})" class="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold px-2.5 py-1 rounded-xl transition cursor-pointer flex items-center space-x-1"><i class="fas fa-file-contract"></i><span>View Document</span></button>`;
                } else {
                    docStatusEl.textContent = 'No document uploaded';
                    docStatusEl.className = 'text-xs text-slate-400 italic font-medium';
                    docActionEl.innerHTML = '';
                }
            }

            const approveBtn = document.getElementById('modal-approve-btn');
            const rejectBtn = document.getElementById('modal-reject-btn');
            if (approveBtn) {
                approveBtn.onclick = async () => {
                    await window.approveSupplier(supId);
                    if (window.closeSupplierDetailsModal) window.closeSupplierDetailsModal();
                };
            }
            if (rejectBtn) {
                rejectBtn.onclick = async () => {
                    await window.rejectSupplier(supId);
                    if (window.closeSupplierDetailsModal) window.closeSupplierDetailsModal();
                };
            }

            modal.classList.remove('hidden');
        };

        // Secure Document Preview Handling
        let currentDocBlobUrl = null;

        window.closeDocumentPreviewModal = () => {
            const modal = document.getElementById('documentPreviewModal');
            if (modal) modal.classList.add('hidden');
            if (currentDocBlobUrl) {
                URL.revokeObjectURL(currentDocBlobUrl);
                currentDocBlobUrl = null;
            }
            const pdfFrame = document.getElementById('doc-pdf-frame');
            if (pdfFrame) pdfFrame.src = 'about:blank';
            const imgPreview = document.getElementById('doc-image-preview');
            if (imgPreview) imgPreview.src = '';
        };

        window.viewSupplierDocument = async (supplierId) => {
            const modal = document.getElementById('documentPreviewModal');
            if (!modal) return;

            // Revoke any previously generated blob url
            if (currentDocBlobUrl) {
                URL.revokeObjectURL(currentDocBlobUrl);
                currentDocBlobUrl = null;
            }

            const sup = cachedPendingSuppliers.find(s => (s.supplierId || s.id) == supplierId);
            const titleEl = document.getElementById('doc-preview-title');
            const subtitleEl = document.getElementById('doc-preview-subtitle');
            const loadingEl = document.getElementById('doc-preview-loading');
            const errorEl = document.getElementById('doc-preview-error');
            const errorMsgEl = document.getElementById('doc-preview-error-msg');
            const pdfFrame = document.getElementById('doc-pdf-frame');
            const imgPreview = document.getElementById('doc-image-preview');
            const openTabBtn = document.getElementById('doc-open-tab-btn');
            const downloadBtn = document.getElementById('doc-download-btn');

            if (titleEl) titleEl.textContent = 'Business Registration Document';
            if (subtitleEl) subtitleEl.textContent = sup ? `${sup.businessName || sup.supplierBusinessName || 'Supplier'} (#SUP-${supplierId})` : `Supplier #${supplierId}`;

            // Reset modal states
            loadingEl?.classList.remove('hidden');
            errorEl?.classList.add('hidden');
            pdfFrame?.classList.add('hidden');
            if (pdfFrame) pdfFrame.src = 'about:blank';
            imgPreview?.classList.add('hidden');
            if (imgPreview) imgPreview.src = '';
            openTabBtn?.classList.add('hidden');
            downloadBtn?.classList.add('hidden');

            modal.classList.remove('hidden');

            try {
                const result = await adminController.getSupplierBusinessDocumentBlob(supplierId);
                if (!result.success || !result.blob) {
                    throw new Error(result.error || 'Failed to retrieve supplier business document');
                }

                const blob = result.blob;
                const contentType = result.contentType || blob.type || '';
                const blobUrl = URL.createObjectURL(blob);
                currentDocBlobUrl = blobUrl;

                loadingEl?.classList.add('hidden');

                // Configure Open-in-Tab & Download buttons
                if (openTabBtn) {
                    openTabBtn.href = blobUrl;
                    openTabBtn.classList.remove('hidden');
                }
                if (downloadBtn) {
                    downloadBtn.href = blobUrl;
                    const isPdf = contentType.toLowerCase().includes('pdf') || blob.type === 'application/pdf';
                    const isPng = contentType.toLowerCase().includes('png');
                    const ext = isPdf ? 'pdf' : (isPng ? 'png' : 'jpg');
                    downloadBtn.download = `supplier_${supplierId}_business_document.${ext}`;
                    downloadBtn.classList.remove('hidden');
                }

                if (contentType.toLowerCase().includes('pdf') || blob.type === 'application/pdf') {
                    if (pdfFrame) {
                        pdfFrame.src = blobUrl;
                        pdfFrame.classList.remove('hidden');
                    }
                } else {
                    if (imgPreview) {
                        imgPreview.src = blobUrl;
                        imgPreview.classList.remove('hidden');
                    }
                }
            } catch (err) {
                console.error('Error opening supplier document:', err);
                loadingEl?.classList.add('hidden');
                if (errorEl) {
                    if (errorMsgEl) errorMsgEl.textContent = err.message || 'The document could not be retrieved from secure storage.';
                    errorEl.classList.remove('hidden');
                }
            }
        };


        window.approveAuction = async (id) => {
            const res = await adminController.approveAuction(id);
            if (res.success) {
                this.showToast('Auction approved!', 'success');
                refreshAdmin();
            } else {
                this.showToast(res.error || 'Failed to approve auction', 'error');
            }
        };

        window.rejectAuction = async (id) => {
            const res = await adminController.rejectAuction(id);
            if (res.success) {
                this.showToast('Auction rejected', 'success');
                refreshAdmin();
            } else {
                this.showToast(res.error || 'Failed to reject auction', 'error');
            }
        };

        window.approveSupplier = async (id) => {
            const res = await adminController.approveSupplier(id);
            if (res.success) {
                this.showToast('Supplier approved!', 'success');
                refreshAdmin();
            } else {
                this.showToast(res.error || 'Failed to approve supplier', 'error');
            }
        };

        window.rejectSupplier = async (id) => {
            const res = await adminController.rejectSupplier(id);
            if (res.success) {
                this.showToast('Supplier application rejected', 'success');
                refreshAdmin();
            } else {
                this.showToast(res.error || 'Failed to reject supplier', 'error');
            }
        };

        await refreshAdmin();
    }

    // ==========================================
    // PAGE 9: PROFILE PAGE (profile.html)
    // ==========================================
    async loadProfilePage() {
        const loader = document.getElementById('profile-loader');

        try {
            const authResult = await authController.validateUser();
            if (!authResult.success) {
                this.showToast('Please log in to view your profile', 'error');
                setTimeout(() => window.location.href = 'login.html', 1000);
                return;
            }

            const userDetails = await userController.getUserDetails(authResult.user.id);
            const user = authResult.user;
            const details = userDetails?.userdetails || userDetails?.userDetails || userDetails;

            const name = details?.getUserName?.() || details?.userName || user?.name || 'User';
            const email = details?.getUserEmail?.() || details?.userEmail || user?.email || 'N/A';
            const phone = details?.getUserPhone?.() || details?.userPhone || 'N/A';
            const address = details?.getUserAddress?.() || details?.userAddress || 'N/A';
            const role = (details?.getUserRole?.() || details?.userRole || user?.role || 'Member').toUpperCase();
            const supplier = details?.getSupplier?.() || details?.supplier || null;

            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

            const avatarEl = document.getElementById('profile-avatar');
            const nameEl = document.getElementById('profile-name');
            const roleEl = document.getElementById('profile-role');
            const fullNameEl = document.getElementById('info-fullname');
            const emailEl = document.getElementById('info-email');
            const phoneEl = document.getElementById('info-phone');
            const addressEl = document.getElementById('info-address');

            if (avatarEl) avatarEl.textContent = initials;
            if (nameEl) nameEl.textContent = name;
            if (roleEl) {
                roleEl.textContent = role;
                if (role === 'ADMIN') {
                    roleEl.className = 'text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200';
                } else if (role === 'SUPPLIER') {
                    roleEl.className = 'text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200';
                } else {
                    roleEl.className = 'text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-primary-blue border border-blue-200';
                }
            }
            if (fullNameEl) fullNameEl.textContent = name;
            if (emailEl) emailEl.textContent = email;
            if (phoneEl) phoneEl.textContent = phone;
            if (addressEl) addressEl.textContent = address;

            // Role-specific sidebar card and supplier details
            const sidebarRoleCard = document.getElementById('sidebar-role-card');
            const supplierInfoSection = document.getElementById('supplier-info-section');
            const becomeSupplierBtn = document.getElementById('become-supplier-btn');

            if (role === 'SUPPLIER' || supplier) {
                if (supplierInfoSection) {
                    supplierInfoSection.classList.remove('hidden');
                    const bName = supplier?.businessName || supplier?.supplierBusinessName || 'N/A';
                    const bAddress = supplier?.address || supplier?.businessAddress || supplier?.supplierBusinessAddress || 'N/A';
                    const bPhone = supplier?.phone || supplier?.contactNumber || supplier?.supplierContactNumber || 'N/A';
                    const sStatus = supplier?.supplierStatus || 'PENDING';
                    const sDate = supplier?.createdAt ? new Date(supplier.createdAt).toLocaleDateString() : 'Active';

                    const bNameEl = document.getElementById('info-business-name');
                    const bAddrEl = document.getElementById('info-business-address');
                    const bPhoneEl = document.getElementById('info-business-phone');
                    const sStatusEl = document.getElementById('info-supplier-status');
                    const sDateEl = document.getElementById('info-supplier-date');

                    if (bNameEl) bNameEl.textContent = bName;
                    if (bAddrEl) bAddrEl.textContent = bAddress;
                    if (bPhoneEl) bPhoneEl.textContent = bPhone;
                    if (sStatusEl) {
                        sStatusEl.textContent = sStatus;
                        sStatusEl.className = sStatus === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800 py-1 px-3 rounded-full text-xs font-bold'
                            : (sStatus === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800 py-1 px-3 rounded-full text-xs font-bold'
                                : 'bg-amber-100 text-amber-800 py-1 px-3 rounded-full text-xs font-bold');
                    }
                    if (sDateEl) sDateEl.textContent = sDate;
                }

                if (sidebarRoleCard) {
                    sidebarRoleCard.classList.remove('hidden');
                    sidebarRoleCard.innerHTML = `
                        <div class="glass-panel p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 text-center">
                            <i class="fas fa-store text-2xl text-emerald-600 mb-2"></i>
                            <h4 class="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Supplier Portal</h4>
                            <p class="text-[11px] text-emerald-700 mb-3">Manage inventory, vehicle listings and live auctions.</p>
                            <a href="supplier-dashboard.html" class="block w-full btn-3d btn-primary-3d text-white font-bold py-2 px-3 rounded-xl text-xs transition">Go to Dashboard</a>
                        </div>
                    `;
                }
                if (becomeSupplierBtn) becomeSupplierBtn.style.display = 'none';

            } else if (role === 'ADMIN') {
                if (sidebarRoleCard) {
                    sidebarRoleCard.classList.remove('hidden');
                    sidebarRoleCard.innerHTML = `
                        <div class="glass-panel p-4 rounded-2xl border border-rose-200 bg-rose-50/50 text-center">
                            <i class="fas fa-shield-alt text-2xl text-rose-600 mb-2"></i>
                            <h4 class="text-xs font-bold text-rose-900 uppercase tracking-wider mb-1">Admin Panel</h4>
                            <p class="text-[11px] text-rose-700 mb-3">Manage site settings, supplier applications, and auctions.</p>
                            <a href="admin.html" class="block w-full btn-3d btn-primary-3d text-white font-bold py-2 px-3 rounded-xl text-xs transition">Open Admin Panel</a>
                        </div>
                    `;
                }
                if (becomeSupplierBtn) becomeSupplierBtn.style.display = 'none';
            } else {
                if (becomeSupplierBtn) becomeSupplierBtn.style.display = '';
            }

            // Real Stats
            let orders = [];
            try {
                orders = await orderController.getUserOrders();
            } catch (err) {
                console.error('Error fetching user orders for profile:', err);
            }

            const ordersCountEl = document.getElementById('profile-stat-orders');
            const bidsCountEl = document.getElementById('profile-stat-bids');
            const wishlistCountEl = document.getElementById('profile-stat-wishlist');

            if (ordersCountEl) ordersCountEl.textContent = orders ? orders.length : 0;
            if (bidsCountEl) bidsCountEl.textContent = 0;
            if (wishlistCountEl) wishlistCountEl.textContent = 0;

            // Load user orders into profile recent orders table
            const ordersTbody = document.getElementById('profile-orders-tbody');
            if (ordersTbody) {
                if (orders && orders.length > 0) {
                    ordersTbody.innerHTML = orders.map(ord => {
                        const dateStr = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Recent';
                        const itemsCount = ord.items ? ord.items.length : 1;
                        return `
                            <tr class="border-b border-slate-100 hover:bg-blue-50/30 transition">
                                <td class="py-4 px-6 font-bold text-[#0b1f3a]">${ord.orderNumber || '#ORD-' + ord.orderId}</td>
                                <td class="py-4 px-6 text-slate-500 text-xs">${dateStr}</td>
                                <td class="py-4 px-6 text-slate-700 text-xs">${itemsCount} Item(s)</td>
                                <td class="py-4 px-6 font-bold text-[#0b1f3a]">$${Number(ord.totalAmount || 0).toFixed(2)}</td>
                                <td class="py-4 px-6"><span class="bg-blue-100 text-blue-800 py-1 px-2.5 rounded-full text-xs font-bold">${ord.orderStatus || 'PENDING'}</span></td>
                                <td class="py-4 px-6 text-xs text-primary-blue font-bold">Confirmed</td>
                            </tr>
                        `;
                    }).join('');
                } else {
                    ordersTbody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400 font-medium">No orders found</td></tr>`;
                }
            }

            // Wire Edit Profile Modal
            window.openEditProfileModal = () => {
                const editModal = document.getElementById('editProfileModal');
                const editFullName = document.getElementById('edit-fullname');
                const editEmail = document.getElementById('edit-email');
                const editPhone = document.getElementById('edit-phone');
                const editAddress = document.getElementById('edit-address');
                const editSupplierFields = document.getElementById('edit-supplier-fields');

                if (editFullName) editFullName.value = name !== 'User' ? name : '';
                if (editEmail) editEmail.value = email !== 'N/A' ? email : '';
                if (editPhone) editPhone.value = phone !== 'N/A' ? phone : '';
                if (editAddress) editAddress.value = address !== 'N/A' ? address : '';

                if (supplier || role === 'SUPPLIER') {
                    if (editSupplierFields) {
                        editSupplierFields.classList.remove('hidden');
                        const editBName = document.getElementById('edit-business-name');
                        const editBAddr = document.getElementById('edit-business-address');
                        const editBPhone = document.getElementById('edit-business-phone');

                        if (editBName) editBName.value = supplier?.businessName || supplier?.supplierBusinessName || '';
                        if (editBAddr) editBAddr.value = supplier?.address || supplier?.businessAddress || supplier?.supplierBusinessAddress || '';
                        if (editBPhone) editBPhone.value = supplier?.phone || supplier?.contactNumber || supplier?.supplierContactNumber || '';
                    }
                } else {
                    if (editSupplierFields) editSupplierFields.classList.add('hidden');
                }

                if (editModal) editModal.classList.remove('hidden');
            };

            window.saveProfileChanges = async (event) => {
                event.preventDefault();
                const saveBtn = document.getElementById('save-profile-btn');
                if (saveBtn) saveBtn.disabled = true;

                const updatePayload = {
                    userId: authResult.user.id,
                    userName: document.getElementById('edit-fullname')?.value.trim(),
                    userPhone: document.getElementById('edit-phone')?.value.trim(),
                    userAddress: document.getElementById('edit-address')?.value.trim()
                };

                if (supplier || role === 'SUPPLIER') {
                    updatePayload.supplier = {
                        supplierId: supplier?.supplierId || null,
                        businessName: document.getElementById('edit-business-name')?.value.trim(),
                        address: document.getElementById('edit-business-address')?.value.trim(),
                        phone: document.getElementById('edit-business-phone')?.value.trim(),
                        contactPerson: document.getElementById('edit-fullname')?.value.trim()
                    };
                }

                try {
                    const res = await userController.updateUser(updatePayload);
                    if (res.success) {
                        this.showToast('Profile updated successfully!', 'success');
                        const editModal = document.getElementById('editProfileModal');
                        if (editModal) editModal.classList.add('hidden');
                        await this.loadProfilePage();
                    } else {
                        this.showToast(res.error || 'Failed to update profile', 'error');
                    }
                } catch (err) {
                    console.error('Error saving profile changes:', err);
                    this.showToast('An error occurred while updating profile', 'error');
                } finally {
                    if (saveBtn) saveBtn.disabled = false;
                }
            };

            // Wire Tab Handlers
            window.app.renderProfileData = () => this.loadProfilePage();

            window.app.renderOrderHistoryTab = async () => {
                const dc = document.getElementById('dashboard-content');
                if (!dc) return;
                const userOrders = await orderController.getUserOrders();
                dc.innerHTML = `
                    <h1 class="text-2xl font-bold text-[#0b1f3a] mb-6">Order History</h1>
                    <div class="glass-panel card-3d rounded-2xl border border-white/90 bg-white/85 p-6 shadow-sm overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="text-xs text-slate-400 uppercase font-bold tracking-wider border-b border-slate-100">
                                        <th class="pb-4">Order ID</th>
                                        <th class="pb-4">Date</th>
                                        <th class="pb-4">Items</th>
                                        <th class="pb-4">Total Amount</th>
                                        <th class="pb-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${userOrders && userOrders.length > 0 ? userOrders.map(ord => `
                                        <tr class="border-b border-slate-100 hover:bg-blue-50/30 transition">
                                            <td class="py-4 font-bold text-[#0b1f3a]">${ord.orderNumber || '#ORD-' + ord.orderId}</td>
                                            <td class="py-4 text-slate-500 text-xs">${ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Recent'}</td>
                                            <td class="py-4 text-slate-700 text-xs">${ord.items ? ord.items.length : 1} Item(s)</td>
                                            <td class="py-4 font-bold text-[#0b1f3a]">$${Number(ord.totalAmount || 0).toFixed(2)}</td>
                                            <td class="py-4"><span class="bg-blue-100 text-blue-800 py-1 px-2.5 rounded-full text-xs font-bold">${ord.orderStatus || 'PENDING'}</span></td>
                                        </tr>
                                    `).join('') : '<tr><td colspan="5" class="py-8 text-center text-slate-400 font-medium">No orders found</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            };

            window.app.renderMyBidsTab = async () => {
                const dc = document.getElementById('dashboard-content');
                if (!dc) return;
                dc.innerHTML = `
                    <h1 class="text-2xl font-bold text-[#0b1f3a] mb-6">My Live Bids</h1>
                    <div class="glass-panel card-3d rounded-2xl border border-white/90 bg-white/85 p-6 shadow-sm overflow-hidden">
                        <div class="py-8 text-center text-slate-400 font-medium">
                            <i class="fas fa-gavel text-3xl mb-2 text-slate-300"></i>
                            <p>No active bids found. Explore live vehicle auctions to participate!</p>
                            <a href="listing.html" class="inline-block mt-3 btn-3d btn-primary-3d text-white font-bold py-2 px-4 rounded-xl text-xs">Browse Auctions</a>
                        </div>
                    </div>
                `;
            };

            window.app.renderWishlistTab = async () => {
                const dc = document.getElementById('dashboard-content');
                if (!dc) return;
                dc.innerHTML = `
                    <h1 class="text-2xl font-bold text-[#0b1f3a] mb-6">Saved Wishlist</h1>
                    <div class="glass-panel card-3d rounded-2xl border border-white/90 bg-white/85 p-6 shadow-sm overflow-hidden">
                        <div class="py-8 text-center text-slate-400 font-medium">
                            <i class="far fa-heart text-3xl mb-2 text-slate-300"></i>
                            <p>No saved items in wishlist.</p>
                            <a href="listing.html" class="inline-block mt-3 btn-3d btn-primary-3d text-white font-bold py-2 px-4 rounded-xl text-xs">Explore Parts & Vehicles</a>
                        </div>
                    </div>
                `;
            };

            // Wire Supplier Application in profile
            window.submitSupplierForm = async (event) => {
                event.preventDefault();
                const bName = document.getElementById('businessName')?.value.trim();
                const bAddress = document.getElementById('businessAddress')?.value.trim();
                const contact = document.getElementById('contactPerson')?.value.trim();
                const bPhone = document.getElementById('phoneNumber')?.value.trim();
                const docInput = document.getElementById('businessRegistrationDoc');
                const file = docInput?.files && docInput.files[0];

                const errorContainer = document.getElementById('doc-validation-error');
                const errorMsg = document.getElementById('doc-validation-msg');

                // Validate basic fields
                if (!bName) {
                    this.showToast('Please enter your business name.', 'error');
                    document.getElementById('businessName')?.focus();
                    return;
                }
                if (!bAddress) {
                    this.showToast('Please enter your business address.', 'error');
                    document.getElementById('businessAddress')?.focus();
                    return;
                }
                if (!contact) {
                    this.showToast('Please enter contact person name.', 'error');
                    document.getElementById('contactPerson')?.focus();
                    return;
                }
                if (!bPhone) {
                    this.showToast('Please enter contact phone number.', 'error');
                    document.getElementById('phoneNumber')?.focus();
                    return;
                }

                // Validate required document
                if (!file) {
                    if (errorContainer && errorMsg) {
                        errorMsg.textContent = 'Business registration document is required.';
                        errorContainer.classList.remove('hidden');
                    }
                    this.showToast('Business registration document is required.', 'error');
                    docInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    return;
                }

                // Validate allowed file extensions
                const allowedExts = ['pdf', 'jpg', 'jpeg', 'png'];
                const ext = file.name.split('.').pop().toLowerCase();
                if (!allowedExts.includes(ext)) {
                    if (errorContainer && errorMsg) {
                        errorMsg.textContent = `Unsupported document type '.${ext}'. Allowed formats: PDF, JPG, JPEG, PNG.`;
                        errorContainer.classList.remove('hidden');
                    }
                    this.showToast('Unsupported document type.', 'error');
                    return;
                }

                // Validate max file size (10MB)
                const maxSizeBytes = 10 * 1024 * 1024;
                if (file.size > maxSizeBytes) {
                    if (errorContainer && errorMsg) {
                        errorMsg.textContent = 'Document size exceeds maximum allowed size of 10MB.';
                        errorContainer.classList.remove('hidden');
                    }
                    this.showToast('Document size exceeds maximum 10MB.', 'error');
                    return;
                }

                if (errorContainer) errorContainer.classList.add('hidden');

                const submitBtn = document.getElementById('submitSupplierBtn');
                const submitBtnText = document.getElementById('submitSupplierBtnText');
                if (submitBtn) submitBtn.disabled = true;
                if (submitBtnText) submitBtnText.textContent = 'Uploading & Submitting...';

                try {
                    const formData = new FormData();
                    formData.append('businessName', bName);
                    formData.append('businessAddress', bAddress);
                    formData.append('contactPerson', contact);
                    formData.append('phoneNumber', bPhone);
                    formData.append('businessRegistrationDocument', file);

                    const res = await supplierController.applyToBeSupplier(formData);
                    if (res.success) {
                        this.showToast('Supplier application submitted successfully!', 'success');
                        const dashboardContent = document.getElementById('dashboard-content');
                        if (dashboardContent) {
                            dashboardContent.innerHTML = `
                                <div class="glass-panel card-3d p-8 rounded-2xl border border-emerald-200 bg-emerald-50/60 text-center max-w-xl mx-auto shadow-sm">
                                    <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-4">
                                        <i class="fas fa-check-circle"></i>
                                    </div>
                                    <h2 class="text-2xl font-bold text-emerald-900 mb-2">Application Received!</h2>
                                    <p class="text-sm text-emerald-700 leading-relaxed mb-6">Your business registration document has been securely uploaded and your supplier application is under review by our admin team.</p>
                                    <a href="profile.html" class="inline-block btn-3d btn-primary-3d text-white font-bold py-2.5 px-6 rounded-xl text-xs">Return to Profile</a>
                                </div>
                            `;
                        }
                    } else {
                        const errMsg = res.error || 'Failed to submit supplier application';
                        this.showToast(errMsg, 'error');
                        if (errorContainer && errorMsg) {
                            errorMsg.textContent = errMsg;
                            errorContainer.classList.remove('hidden');
                        }
                    }
                } catch (err) {
                    console.error('Error submitting supplier form:', err);
                    this.showToast(err.message || 'An unexpected error occurred', 'error');
                } finally {
                    if (submitBtn) submitBtn.disabled = false;
                    if (submitBtnText) submitBtnText.textContent = 'Submit Application';
                }
            };

            // Save populated content to dashboard cache
            if (window.updateProfileDashboardCache) {
                window.updateProfileDashboardCache();
            }

        } catch (error) {
            console.error('Error loading profile:', error);
            this.showToast('Failed to load profile data', 'error');
        } finally {
            if (loader) {
                loader.classList.add('opacity-0', 'pointer-events-none');
                setTimeout(() => {
                    loader.remove();
                }, 500);
            }
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
    window.app = app;
    window.logout = () => app.logout();
});

export default App;