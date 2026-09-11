# Profile Page Loading State Implementation Guide

This guide details how to implement a smooth, modern loading indicator in [profile.html](file:///home/nadeeja/ThisPC/IJSE/SEM%2002/AAD/A-and-C-Japan-Auto-Parts-Frontend/profile.html) while user data is being fetched from the backend API using your existing `authController` and `apiService`.

---

## Table of Contents
1. [Overview & Strategy](#overview--strategy)
2. [Approach 1: Full-Screen Glassmorphic Loading Overlay (Recommended)](#approach-1-full-screen-glassmorphic-loading-overlay-recommended)
3. [Approach 2: Shimmer Skeleton Placeholders](#approach-2-shimmer-skeleton-placeholders)
4. [Integrating Dynamic User Data](#integrating-dynamic-user-data)
5. [Complete JavaScript Implementation](#complete-javascript-implementation)
6. [Best Practices & Error Handling](#best-practices--error-handling)

---

## Overview & Strategy

When a user visits `profile.html`:
1. **Initial State**: Display the loader immediately on page load (or show skeletons).
2. **Data Fetching**: Call `authController.validateUser()` or `apiService.get(API_CONFIG.ENDPOINTS.USERS.GET_PROFILE)`.
3. **Authentication Check**:
   - If user is **not logged in**, redirect to `login.html`.
   - If user is **authenticated**, populate user details into the DOM.
4. **Transition**: Fade out the loader and display the actual profile dashboard.

---

## Approach 1: Full-Screen Glassmorphic Loading Overlay (Recommended)

This approach adds a sleek, dark glassmorphism overlay with a spinner that covers the screen while profile data loads, then smoothly fades out.

### 1. HTML Markup
Add this overlay right after the opening `<body>` tag in `profile.html`:

```html
<!-- Full-Screen Profile Loading Overlay -->
<div id="profile-loader" class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-950/80 backdrop-blur-md transition-opacity duration-500">
  <div class="relative flex items-center justify-center mb-4">
    <!-- Spinning Outer Ring -->
    <div class="w-16 h-16 border-4 border-white/10 border-t-primary-red rounded-full animate-spin"></div>
    <!-- Inner Icon -->
    <div class="absolute text-primary-red">
      <i class="fas fa-car text-lg"></i>
    </div>
  </div>
  <p class="text-white text-sm font-semibold tracking-wider uppercase animate-pulse">
    Loading your profile...
  </p>
  <p class="text-xs text-gray-400 mt-1">Please wait a moment</p>
</div>
```

---

## Approach 2: Shimmer Skeleton Placeholders

If you prefer content skeletons that preserve layout and give a premium feel, wrap your sidebar and personal information in skeleton placeholders.

### Skeleton Example for Sidebar & Info:

```html
<!-- Skeleton State (Active while loading) -->
<div id="profile-skeleton" class="animate-pulse flex flex-col md:flex-row gap-8">
  <!-- Sidebar Skeleton -->
  <div class="w-full md:w-1/4 glass-panel rounded-lg border border-white/10 p-6 space-y-4">
    <div class="flex items-center space-x-4">
      <div class="w-16 h-16 bg-white/10 rounded-full"></div>
      <div class="flex-1 space-y-2">
        <div class="h-4 bg-white/10 rounded w-3/4"></div>
        <div class="h-3 bg-white/10 rounded w-1/2"></div>
      </div>
    </div>
  </div>
  
  <!-- Dashboard Skeleton -->
  <div class="w-full md:w-3/4 glass-panel rounded-lg border border-white/10 p-6 space-y-6">
    <div class="h-6 bg-white/10 rounded w-1/3"></div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="h-24 bg-white/10 rounded-lg"></div>
      <div class="h-24 bg-white/10 rounded-lg"></div>
      <div class="h-24 bg-white/10 rounded-lg"></div>
    </div>
  </div>
</div>
```

---

## Integrating Dynamic User Data

Update the static placeholders in `profile.html` with distinct HTML `id` attributes so JavaScript can populate them:

### Sidebar Elements
```html
<!-- Profile Avatar Circle -->
<div id="profile-avatar"
  class="w-16 h-16 bg-primary-dark text-white rounded-full flex items-center justify-center text-2xl font-bold mr-4">
  --
</div>

<!-- Profile Name & Role -->
<div>
  <h2 id="profile-name" class="text-lg font-bold text-white">Loading...</h2>
  <p id="profile-role" class="text-xs text-gray-400">Loading...</p>
</div>
```

### Personal Information Section
```html
<div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
  <div>
    <p class="text-gray-400 mb-1">Full Name</p>
    <p id="info-fullname" class="font-semibold text-white">--</p>
  </div>
  <div>
    <p class="text-gray-400 mb-1">Email Address</p>
    <p id="info-email" class="font-semibold text-white">--</p>
  </div>
  <div>
    <p class="text-gray-400 mb-1">Phone Number</p>
    <p id="info-phone" class="font-semibold text-white">--</p>
  </div>
  <div>
    <p class="text-gray-400 mb-1">Shipping Address</p>
    <p id="info-address" class="font-semibold text-white">--</p>
  </div>
</div>
```

---

## Complete JavaScript Implementation

You can either add a dedicated `loadUserProfile()` method in `assets/js/app.js` or include it in a `<script type="module">` inside `profile.html`.

### Option: Add to `assets/js/app.js`

```javascript
import { Topbar } from './components/Topbar.js';
import { authController } from './controllers/AuthController.js';
import { apiService } from './api-service.js';
import { API_CONFIG } from './api-config.js';

class App {
    init() {
        Topbar.render();
        this.setupLoginForm();
        this.setupRegisterForm();
        this.updateTopbar();

        // Check if on profile page
        if (window.location.pathname.includes('profile.html')) {
            this.loadProfilePage();
        }
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

            const user = authResult.user;

            // 2. Fetch extended profile details if needed
            let profileData = {};
            try {
                const response = await apiService.get(API_CONFIG.ENDPOINTS.USERS.GET_PROFILE);
                if (response && response.body) {
                    profileData = response.body;
                }
            } catch (err) {
                console.warn('Could not fetch full profile endpoint, falling back to auth user data:', err);
            }

            // 3. Populate DOM elements
            const name = profileData.userName || profileData.name || user.name || 'User';
            const email = profileData.userEmail || profileData.email || 'N/A';
            const phone = profileData.userPhone || profileData.phone || 'N/A';
            const address = profileData.userAddress || profileData.address || 'N/A';
            const role = profileData.role || user.role || 'Member';

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
```

---

## Best Practices & Error Handling

1. **Authentication Guard**: Always verify token validity before rendering sensitive profile sections. If unauthenticated, prevent flashing empty content by keeping the loader active until redirecting.
2. **Smooth Transitions**: Use `transition-opacity duration-500` and `pointer-events-none` so users cannot interact with partially loaded elements.
3. **Fallbacks**: Ensure fallback values (e.g. `'N/A'`) are provided when optional user profile properties (like phone or address) are null or empty.
4. **Logout Handling**: Connect the `#logoutBtn` element to `authController.logout()`:
   ```javascript
   document.getElementById('logoutBtn')?.addEventListener('click', async () => {
       await authController.logout();
       window.location.href = 'login.html';
   });
   ```
