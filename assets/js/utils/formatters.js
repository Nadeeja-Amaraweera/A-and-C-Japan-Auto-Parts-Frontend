/**
 * Data Formatters
 * Used for formatting data for display
 */

export const formatters = {
    /**
     * Format a number as currency
     */
    currency: (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount);
    },

    /**
     * Format date string to local string
     */
    date: (dateString, options = { year: 'numeric', month: 'short', day: 'numeric' }) => {
        return new Date(dateString).toLocaleDateString('en-US', options);
    },

    /**
     * Format large numbers (e.g. 1500 to 1.5k)
     */
    compactNumber: (num) => {
        return new Intl.NumberFormat('en-US', {
            notation: 'compact',
            compactDisplay: 'short'
        }).format(num);
    }
};
