export class Topbar {
    static render() {
        const topbarHTML = `
            <!-- Topbar -->
            <div class="bg-primary-dark text-white text-sm py-2" id="dynamic-topbar">
                <div class="container mx-auto px-4 flex justify-between items-center">
                    <div class="flex items-center space-x-4">
                        <span class="flex items-center"><i class="fas fa-phone-alt mr-2 text-primary-gold"></i> Free call: +84 5678 9999</span>
                    </div>
                    <div class="flex items-center space-x-6">
                        <div class="hidden sm:block cursor-pointer hover:text-primary-gold transition">
                            <i class="fas fa-globe mr-1"></i> English <i class="fas fa-chevron-down text-xs ml-1"></i>
                        </div>
                        <div class="hidden sm:block cursor-pointer hover:text-primary-gold transition">
                            USD <i class="fas fa-chevron-down text-xs ml-1"></i>
                        </div>
                        <a id="myAccountNav" class="hover:text-primary-gold transition cursor-pointer">
                            <i class="far fa-user mr-1"></i>
                            <span class="hidden sm:inline">My Account</span>
                        </a>
                    </div>
                </div>
            </div>
        `;

        // Check if topbar is already rendered to avoid duplication
        if (!document.getElementById('dynamic-topbar')) {
            document.body.insertAdjacentHTML('afterbegin', topbarHTML);
        }
    }

    static getAccountNavLink() {
        return document.getElementById('myAccountNav');
    }
}
