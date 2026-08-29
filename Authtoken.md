# 🔑 Auth Token Architecture & Usage Guide

This document explains where and how **Authentication Tokens** (`authToken`) are stored, managed, injected into HTTP requests, and validated throughout this application.

---

## 1. Storage & Key Configuration

- **[api-config.js](file:///home/nadeeja/ThisPC/IJSE/SEM%2002/AAD/A-and-C-Japan-Auto-Parts-Frontend/assets/js/api-config.js)**
  - Defines storage key names in `API_CONFIG.STORAGE_KEYS`:
    ```javascript
    STORAGE_KEYS: {
        TOKEN: 'authToken',
        REFRESH_TOKEN: 'refreshToken',
        USER: 'userData',
        ...
    }
    ```

- **[storage.js](file:///home/nadeeja/ThisPC/IJSE/SEM%2002/AAD/A-and-C-Japan-Auto-Parts-Frontend/assets/js/utils/storage.js)**
  - Wraps `localStorage` with JSON serialization and provides helper functions:
    ```javascript
    getToken: () => storage.get(API_CONFIG.STORAGE_KEYS.TOKEN),
    setToken: (token) => storage.set(API_CONFIG.STORAGE_KEYS.TOKEN, token),
    removeToken: () => storage.remove(API_CONFIG.STORAGE_KEYS.TOKEN),
    ```

---

## 2. Automatic HTTP Request Header Injection

- **[api-service.js](file:///home/nadeeja/ThisPC/IJSE/SEM%2002/AAD/A-and-C-Japan-Auto-Parts-Frontend/assets/js/api-service.js)**
  - **Header Injection**: All outgoing HTTP requests (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) call `storage.getToken()` and automatically attach the `Authorization` HTTP header:
    ```javascript
    const token = storage.getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    ```
  - **401 Unauthorized Interception**: If an API endpoint returns HTTP 401 Unauthorized status (token expired or invalid), `apiService` emits an `auth:unauthorized` event via `EventBus`:
    ```javascript
    if (response.status === API_CONFIG.STATUS.UNAUTHORIZED) {
        eventBus.emit('auth:unauthorized');
        const error = new Error('Unauthorized');
        error.status = 401;
        throw error;
    }
    ```

---

## 3. Authentication Controller & Token Lifecycle

- **[AuthController.js](file:///home/nadeeja/ThisPC/IJSE/SEM%2002/AAD/A-and-C-Japan-Auto-Parts-Frontend/assets/js/controllers/AuthController.js)**
  - **Login**: When login is successful (`response.status === 0`), `response.body.token` is stored:
    ```javascript
    if (response.body.token) {
        storage.setToken(response.body.token);
    }
    ```
  - **Session Restoration**: On application initial load, `restoreSession()` retrieves the persisted token from `localStorage` using `storage.getToken()` to maintain state across page reloads.
  - **State Validation**: `isAuthenticated()` verifies that both active state and stored tokens exist:
    ```javascript
    isAuthenticated() {
        const token = storage.getToken();
        const user = storage.getUser();
        if (token && user && !this.isAuthenticated) {
            this.restoreSession();
        }
        return this.isAuthenticated && !!token && !!user;
    }
    ```
  - **Logout / Session Clearing**: `clearSession()` removes the stored token and resets application state:
    ```javascript
    clearSession() {
        storage.removeToken();
        storage.removeUser();
        this.user = null;
        this.isAuthenticated = false;
    }
    ```

---

## 4. Application Initialization & Route Protection

- **[app.js](file:///home/nadeeja/ThisPC/IJSE/SEM%2002/AAD/A-and-C-Japan-Auto-Parts-Frontend/assets/js/app.js)**
  - During initial startup (`init()`), `authController.init()` and `authController.restoreSession()` run to verify user session.
  - Route handlers check `this.authController.isAuthenticated()` to restrict access or redirect users (e.g., redirecting logged-in users away from `login.html`).
