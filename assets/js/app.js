import { Topbar } from './components/Topbar.js';

class App {

    init() {
        Topbar.render();
        Topbar.getAccountNavLink().addEventListener('click', () => {
            window.location.href = "login.html";
        });
        this.setupLoginForm();
        this.setupRegisterForm();
    }

    setupLoginForm() {
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            console.log(email, password);
        });
    }

    setupRegisterForm() {
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const phone = document.getElementById('regPhone').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            console.log(name, email, phone, password, confirmPassword);
        });
    }

    logout() {

    }

}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
    window.app = app;
});

export default App;