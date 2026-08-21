/**
 * UI Components
 * Reusable functional components returning HTML strings
 */

export const Components = {
    /**
     * Toast notification component
     */
    toast: (message, type = 'info') => {
        let bgColor = 'bg-blue-500';
        if (type === 'success') bgColor = 'bg-green-500';
        if (type === 'error') bgColor = 'bg-red-500';
        if (type === 'warning') bgColor = 'bg-yellow-500';

        return `
            <div class="fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded shadow-lg z-50 transform transition-all duration-300 translate-y-0 opacity-100">
                ${message}
            </div>
        `;
    },

    /**
     * Loading spinner component
     */
    spinner: () => {
        return `
            <div class="flex justify-center items-center p-8">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-red"></div>
            </div>
        `;
    },

    /**
     * Empty state component
     */
    emptyState: (message, icon = 'fas fa-inbox') => {
        return `
            <div class="flex flex-col items-center justify-center p-12 text-gray-400">
                <i class="${icon} text-5xl mb-4 text-gray-300"></i>
                <p class="text-lg font-medium text-gray-500">${message}</p>
            </div>
        `;
    }
};
