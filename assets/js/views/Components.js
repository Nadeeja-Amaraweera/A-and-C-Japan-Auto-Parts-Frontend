/**
 * UI Components
 * Reusable functional components returning HTML strings
 */

export const Components = {
    /**
     * Toast notification component
     */
    toast: (message, type = 'info') => {
        let icon = '<i class="fas fa-info-circle mr-2 text-primary-blue"></i>';
        let borderColor = 'border-blue-200';
        let textColor = 'text-[#0b1f3a]';
        
        if (type === 'success') {
            icon = '<i class="fas fa-check-circle mr-2 text-emerald-600"></i>';
            borderColor = 'border-emerald-200';
        } else if (type === 'error') {
            icon = '<i class="fas fa-exclamation-circle mr-2 text-rose-600"></i>';
            borderColor = 'border-rose-200';
        } else if (type === 'warning') {
            icon = '<i class="fas fa-exclamation-triangle mr-2 text-amber-500"></i>';
            borderColor = 'border-amber-200';
        }

        return `
            <div class="fixed bottom-6 right-6 bg-white/95 backdrop-blur-xl ${textColor} ${borderColor} border px-6 py-4 rounded-2xl shadow-2xl z-[10000] flex items-center font-bold text-sm transform transition-all duration-300 translate-y-0 opacity-100">
                ${icon}
                <span>${message}</span>
            </div>
        `;
    },

    /**
     * Loading spinner component
     */
    spinner: () => {
        return `
            <div class="flex justify-center items-center p-8">
                <div class="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#02316e]"></div>
            </div>
        `;
    },

    /**
     * Empty state component
     */
    emptyState: (message, icon = 'fas fa-inbox') => {
        return `
            <div class="flex flex-col items-center justify-center p-12 text-slate-400">
                <div class="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-primary-blue mb-4">
                    <i class="${icon} text-3xl"></i>
                </div>
                <p class="text-base font-bold text-[#0b1f3a]">${message}</p>
            </div>
        `;
    }
};
