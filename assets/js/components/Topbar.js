export class Topbar {
    static render() {
        // Exclude admin and supplier dashboard portals from customer store topbar
        const path = window.location.pathname.toLowerCase();
        if (path.includes('admin') || path.includes('supplier-dashboard')) {
            return;
        }

        const topbarHTML = `
            <!-- Topbar -->
            <div class="bg-white/90 backdrop-blur-md text-slate-600 text-xs py-2 border-b border-slate-200/80 z-40 relative w-full" id="dynamic-topbar">
                <div class="container mx-auto px-4 flex justify-between items-center">
                    <div class="flex items-center space-x-4">
                        <span class="flex items-center font-medium"><i class="fas fa-phone-alt mr-2 text-primary-blue"></i> Free call: <span class="font-bold text-slate-800 ml-1">+84 5678 9999</span></span>
                    </div>
                    <div class="flex items-center space-x-6">
                        <div class="hidden sm:flex items-center cursor-pointer hover:text-primary-blue transition font-medium">
                            <i class="fas fa-globe mr-1.5 text-primary-blue"></i> English <i class="fas fa-chevron-down text-[10px] ml-1 text-slate-400"></i>
                        </div>
                        <div class="hidden sm:flex items-center cursor-pointer hover:text-primary-blue transition font-medium">
                            <span class="font-bold">USD</span> <i class="fas fa-chevron-down text-[10px] ml-1 text-slate-400"></i>
                        </div>
                        <a id="myAccountNav" class="hover:text-primary-blue transition cursor-pointer font-bold flex items-center text-slate-700" href="login.html">
                            <i class="far fa-user mr-1.5 text-primary-blue"></i>
                            <span id="topbar-username" class="hidden sm:inline">My Account</span>
                        </a>
                        <a href="cart.html" class="hover:text-primary-blue transition cursor-pointer font-bold flex items-center text-slate-700 relative">
                            <i class="fas fa-shopping-cart mr-1.5 text-primary-blue"></i>
                            <span class="hidden sm:inline">Cart</span>
                            <span id="topbar-cart-count" class="ml-1.5 bg-amber-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full hidden">0</span>
                        </a>
                        <button id="topbarLogoutBtn" data-action="logout" class="hidden text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition font-bold items-center cursor-pointer text-xs" title="Log Out">
                            <i class="fas fa-sign-out-alt mr-1"></i>
                            <span class="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        const hook = document.getElementById('dynamic-topbar');
        if (hook) {
            // Replace the empty hook placeholder with the rendered topbar
            hook.outerHTML = topbarHTML;
        } else {
            // If no hook is present, insert before the first <header> element or at top of body
            const header = document.querySelector('header');
            if (header) {
                header.insertAdjacentHTML('beforebegin', topbarHTML);
            } else {
                document.body.insertAdjacentHTML('afterbegin', topbarHTML);
            }
        }
    }

    static getAccountNavLink() {
        return document.getElementById('myAccountNav');
    }
}
