# A&C Japan Auto Parts - Frontend

Welcome to the frontend repository for **A&C Japan Auto Parts**, a fully functional vehicle auction and auto parts e-commerce website. This project uses a modern frontend tech stack with a Model-View-Controller (MVC) architecture in Vanilla JavaScript (ES6 Modules) and Tailwind CSS, designed to connect to a Java Spring Boot REST API backend.

## 🛠️ Technology Stack
- **HTML5** & **Tailwind CSS** (for responsive, modern UI)
- **Vanilla JavaScript (ES6 Modules)** (for frontend logic and MVC architecture)
- **FontAwesome** (for icons)
- **REST APIs** (communicates with a Java Spring Boot backend)

---

## 🚀 How to Run the Website

Since this is a static frontend application, you do not need Node.js or any build tools to run it. However, because it uses ES6 Modules (`<script type="module">`), you **must** serve it over a local web server (opening the HTML file directly from the file system `file://` will cause CORS errors).

### Option 1: Using VS Code Live Server (Recommended)
1. Open this project folder in Visual Studio Code.
2. Install the **Live Server** extension by Ritwick Dey.
3. Right-click on `index.html` and select **"Open with Live Server"**.
4. The website will automatically open in your browser at `http://localhost:5500`.

### Option 2: Using Python
If you have Python installed, open your terminal in the project directory and run:
```bash
# Python 3
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your browser.

### 🔌 Backend Configuration
By default, the frontend expects the Java Spring Boot backend to be running locally at `http://localhost:8080/api`. 
If your backend is hosted elsewhere, you can update the `BASE_URL` in:
`assets/js/api-config.js`

---

## 🧭 Navigating the Application

The application is structured around a centralized router pattern (`assets/js/app.js`), which initializes page-specific logic based on the current HTML file. Here is a breakdown of the key pages and workflows:

### 1. Core User Flow
- **Home (`index.html`)**: The landing page featuring a hero carousel, featured auctions, deals, and latest vehicle arrivals.
- **Login / Register (`login.html`, `register.html`)**: User authentication. Authentication state is managed via JWT tokens stored in Local Storage.
- **Auctions (`auctions.html`)**: Browse active, upcoming, and ended vehicle auctions with filters.
- **Auction Details (`auction-details.html?id=...`)**: View specific vehicle details, see the live countdown timer, view recent bidders, and place bids.
- **Shopping Cart (`cart.html`)**: Manage auto parts added to the shopping cart.

### 2. User & Supplier Dashboards
- **My Profile (`profile.html`)**: Users can manage their personal details, view order history, track their active bids, and apply to become a Supplier.
- **Supplier Dashboard (`supplier-dashboard.html`)**: Approved suppliers can manage their inventory and track their sales.
- **Sell Vehicle (`add-auction.html`)**: Suppliers can list new vehicles for auction, upload images, and set starting prices.

### 3. Admin Tools
- **Admin Dashboard (`admin-dashboard.html`)**: Platform administrators can manage users, approve supplier applications, manage products/auctions, and view platform statistics.

### 4. Static Pages
- **About Us (`about.html`)**
- **Contact Us (`contact.html`)**
- **FAQ (`faq.html`)**

---

## 🏗️ Architecture Overview

The frontend is built using a custom vanilla JavaScript MVC architecture located in the `assets/js/` directory:

- **`models/`**: Data structures that represent backend entities (e.g., `User.js`, `Vehicle.js`, `Auction.js`). They contain logic for serialization and data validation.
- **`controllers/`**: Classes that handle business logic, UI orchestration, and state management (e.g., `AuthController.js`, `AuctionController.js`).
- **`api-service.js` & `api-config.js`**: Centralized wrappers for `fetch` API calls. They handle JWT injection, error handling, and map all endpoints to the backend.
- **`events/EventBus.js`**: A Pub/Sub event system that allows decoupled communication between controllers (e.g., updating the cart badge when an item is added, or refreshing the UI when the user logs in).
- **`app.js`**: The main application orchestrator. It manages global state (Theme, Language, Currency) and initializes specific controller methods based on the active page.

## 🎨 Theming and Localization
- The website supports dynamic **Dark Mode** and **Light Mode**.
- Multi-currency (USD/JPY) and multi-language (English/Japanese) state is managed globally via Local Storage and triggered via the `EventBus`.
