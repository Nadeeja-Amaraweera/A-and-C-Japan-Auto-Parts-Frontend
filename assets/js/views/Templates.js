/**
 * Templates Generator
 * Functions that return complex HTML strings for specific models
 */
import { formatters } from '../utils/formatters.js';

export const Templates = {
    /**
     * Generate HTML for a product card
     */
    productCard: (product) => {
        return `
            <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover-lift flex flex-col group">
                <div class="relative pt-[70%] bg-gray-100 overflow-hidden">
                    <img src="${product.primaryImage}" alt="${product.name}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500">
                </div>
                <div class="p-4 flex flex-col flex-grow">
                    <div class="text-xs text-gray-500 mb-1">SKU: ${product.sku}</div>
                    <h3 class="font-bold text-gray-800 mb-2 leading-tight flex-grow"><a href="#" class="hover:text-primary-red transition">${product.name}</a></h3>
                    <div class="flex justify-between items-center mt-2">
                        <span class="font-bold text-lg text-primary-dark">${formatters.currency(product.price)}</span>
                        <button class="bg-gray-100 hover:bg-primary-red hover:text-white text-gray-700 w-8 h-8 rounded flex items-center justify-center transition" onclick="app.cart.addItem(${product.id})">
                            <i class="fas fa-cart-plus"></i>
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
            <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover-lift flex flex-col group relative">
                <div class="absolute top-2 left-2 z-10 bg-primary-red text-white text-xs font-bold px-2 py-1 rounded flex items-center shadow">
                    <i class="fas fa-clock mr-1"></i> <span class="countdown-timer" data-end="${auction.endTime}">Ending Soon</span>
                </div>
                <div class="relative pt-[65%] bg-gray-100 overflow-hidden">
                    <img src="${vehicle.primaryImage}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500">
                </div>
                <div class="p-4 flex flex-col flex-grow">
                    <h3 class="font-bold text-gray-800 text-lg leading-tight mb-2"><a href="auction-details.html?id=${auction.id}" class="hover:text-primary-red transition">${vehicle.title}</a></h3>
                    <div class="flex items-center text-xs text-gray-500 mb-3 space-x-3">
                        <span><i class="fas fa-tachometer-alt mr-1"></i> ${vehicle.mileage}</span>
                        <span><i class="fas fa-cog mr-1"></i> ${vehicle.transmission}</span>
                    </div>
                    <div class="mt-auto pt-3 border-t border-gray-100 flex justify-between items-end">
                        <div>
                            <p class="text-xs text-gray-500 mb-1">Current Bid</p>
                            <p class="font-bold text-xl text-primary-dark">${formatters.currency(auction.highestBid || auction.startPrice)}</p>
                        </div>
                        <a href="auction-details.html?id=${auction.id}" class="text-primary-red font-semibold text-sm hover:underline">Bid Now <i class="fas fa-arrow-right ml-1"></i></a>
                    </div>
                </div>
            </div>
        `;
    }
};
