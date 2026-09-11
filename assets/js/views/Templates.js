/**
 * Templates Generator
 * Functions that return complex HTML strings for specific models
 */
export const Templates = {
    // Local helper
    formatCurrency: (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    },
    /**
     * Generate HTML for a product card
     */
    productCard: (product) => {
        return `
            <div class="glass-panel card-3d rounded-2xl overflow-hidden flex flex-col group border border-white/90 shadow-sm">
                <div class="relative pt-[70%] bg-slate-50/70 overflow-hidden">
                    <img src="${product.primaryImage}" alt="${product.name}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500">
                </div>
                <div class="p-5 flex flex-col flex-grow">
                    <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">SKU: ${product.sku}</div>
                    <h3 class="font-bold text-[#0b1f3a] mb-2 leading-tight flex-grow text-base"><a href="#" class="hover:text-primary-blue transition">${product.name}</a></h3>
                    <div class="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                        <span class="font-black text-lg text-[#0b1f3a] tracking-tight">${Templates.formatCurrency(product.price)}</span>
                        <button class="btn-3d btn-primary-3d text-white w-9 h-9 rounded-xl flex items-center justify-center transition shadow-sm" onclick="app.cart.addItem(${product.id})" title="Add to Cart">
                            <i class="fas fa-cart-plus text-xs"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Generate HTML for a vehicle auction card
     */
    auctionCard: (auction) => {
        const vehicle = auction.vehicle;
        if (!vehicle) return '';

        return `
            <div class="glass-panel card-3d rounded-2xl overflow-hidden flex flex-col group relative border border-white/90 shadow-sm">
                <div class="absolute top-3 left-3 z-10 bg-[#02316e] text-white text-[11px] font-bold px-3 py-1 rounded-lg flex items-center shadow-md">
                    <i class="fas fa-clock mr-1.5 text-blue-200"></i> <span class="countdown-timer" data-end="${auction.endTime}">Ending Soon</span>
                </div>
                <div class="relative pt-[65%] bg-slate-50/70 overflow-hidden">
                    <img src="${vehicle.primaryImage}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500">
                </div>
                <div class="p-5 flex flex-col flex-grow">
                    <h3 class="font-bold text-[#0b1f3a] text-lg leading-tight mb-2"><a href="auction-details.html?id=${auction.id}" class="hover:text-primary-blue transition">${vehicle.title}</a></h3>
                    <div class="flex items-center text-xs text-slate-500 mb-4 space-x-4">
                        <span><i class="fas fa-tachometer-alt mr-1 text-primary-blue"></i> ${vehicle.mileage}</span>
                        <span><i class="fas fa-cog mr-1 text-primary-blue"></i> ${vehicle.transmission}</span>
                    </div>
                    <div class="mt-auto pt-3 border-t border-slate-100 flex justify-between items-end">
                        <div>
                            <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Current Bid</p>
                            <p class="font-black text-xl text-[#0b1f3a] tracking-tight">${Templates.formatCurrency(auction.highestBid || auction.startPrice)}</p>
                        </div>
                        <a href="auction-details.html?id=${auction.id}" class="btn-3d btn-primary-3d px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm">Bid Now <i class="fas fa-arrow-right ml-1 text-[10px]"></i></a>
                    </div>
                </div>
            </div>
        `;
    }
};
