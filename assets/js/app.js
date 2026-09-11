import { Topbar } from './components/Topbar.js';
import { authController } from './controllers/AuthController.js';
import { userController } from './controllers/UserController.js';
import { apiService } from './api-service.js';
import { API_CONFIG } from './api-config.js';

class App {

    init() {
        Topbar.render();

        this.setupLoginForm();
        this.setupRegisterForm();
        this.updateTopbar();

        if (window.location.pathname.includes('profile.html')) {
            this.loadProfilePage();
        }
    }



    // Show Toast
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
        const icon = type === 'success' ? '<i class="fas fa-check-circle mr-2"></i>' : '<i class="fas fa-exclamation-circle mr-2"></i>';

        toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded shadow-lg transform transition-all duration-300 -translate-y-full opacity-0 z-[9999] flex items-center`;
        toast.innerHTML = `${icon} <span>${message}</span>`;

        document.body.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.classList.remove('-translate-y-full', 'opacity-0');
                toast.classList.add('translate-y-0', 'opacity-100');
            });
        });

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('-translate-y-full', 'opacity-0');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
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
                        setTimeout(() => window.location.href = "index.html", 1000);
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
                const confirmPassword = document.getElementById('regConfirmPassword').value;
                console.log(name, email, phone, password, address, confirmPassword);

                const userData = {
                    userName: name,
                    userEmail: email,
                    userPassword: password,
                    userPhone: phone,
                    userAddress: address
                }

                try {
                    const response = await authController.register(userData);
                    if (response.success) {
                        console.log('✅ Registration successful!');
                        this.showToast(response.message || 'Registration successful!', 'success');
                        setTimeout(() => window.location.href = "index.html", 1500);
                    } else {
                        const errorMsg = response.message || response.error || 'Registration failed';
                        console.error('❌ Registration failed:', errorMsg);
                        this.showToast(errorMsg, 'error');
                    }
                } catch (error) {
                    console.error('❌ Registration error:', error);
                    this.showToast('An unexpected error occurred during registration', 'error');
                }
            });
        }
    }

    async updateTopbar() {
        console.log('Updating topbar...');
        const accountNavLink = Topbar.getAccountNavLink();
        const usernameSpan = document.getElementById('topbar-username');

        const result = await authController.validateUser();

        if (result.success) {
            console.log("User is validated successfully!!!!");

            if (usernameSpan) {
                usernameSpan.textContent = result.user.name;
                console.log('Username:', usernameSpan.textContent);
            }
            accountNavLink.href = "profile.html";
        } else {
            console.log("User validation failed:", result.error);
            accountNavLink.href = "login.html";
            if (usernameSpan) {
                usernameSpan.textContent = 'Login';
            }
        }
    }

    logout() {

    }

    async loadProfilePage() {

        const loader = document.getElementById('profile-loader');

        try {
            // 1. Validate session
            const authResult = await authController.validateUser();

            if (!authResult.success) {
                // If not logged in, redirect to login page
                this.showToast('Please log in to view your profile', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
                return;
            }

            const userDetails = await userController.getUserDetails(authResult.user.id);

            const user = authResult.user;

            // 2. Extract profile details from UserDetails instance
            const details = userDetails?.userdetails || userDetails?.userDetails;

            // 3. Populate DOM elements
            const name = details?.getUserName?.() || details?.userName || user?.name || 'User';
            const email = details?.getUserEmail?.() || details?.userEmail || 'N/A';
            const phone = details?.getUserPhone?.() || details?.userPhone || 'N/A';
            const address = details?.getUserAddress?.() || details?.userAddress || 'N/A';
            const role = details?.getUserRole?.() || details?.userRole || 'Member';

            // Calculate initials
            const initials = name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || 'U';

            // Update DOM
            const avatarEl = document.getElementById('profile-avatar');
            const nameEl = document.getElementById('profile-name');
            const roleEl = document.getElementById('profile-role');
            const fullNameEl = document.getElementById('info-fullname');
            const emailEl = document.getElementById('info-email');
            const phoneEl = document.getElementById('info-phone');
            const addressEl = document.getElementById('info-address');

            if (avatarEl) avatarEl.textContent = initials;
            if (nameEl) nameEl.textContent = name;
            if (roleEl) roleEl.textContent = role;
            if (fullNameEl) fullNameEl.textContent = name;
            if (emailEl) emailEl.textContent = email;
            if (phoneEl) phoneEl.textContent = phone;
            if (addressEl) addressEl.textContent = address;

            if (window.updateProfileDashboardCache) {
                window.updateProfileDashboardCache();
            }

        } catch (error) {
            console.error('Error loading profile:', error);
            this.showToast('Failed to load profile data', 'error');
        } finally {
            // 4. Hide Loader with smooth fade-out
            if (loader) {
                loader.classList.add('opacity-0', 'pointer-events-none');
                setTimeout(() => {
                    loader.remove(); // or loader.classList.add('hidden');
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
});

export default App;