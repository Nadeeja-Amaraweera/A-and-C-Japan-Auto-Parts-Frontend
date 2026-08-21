/**
 * Validation Utilities
 * Used for form and data validation
 */

export const validators = {
    isEmail: (email) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    },

    isPasswordStrong: (password) => {
        // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
        const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        return re.test(password);
    },

    isRequired: (value) => {
        return value !== null && value !== undefined && String(value).trim() !== '';
    },

    isPhoneNumber: (phone) => {
        const re = /^\+?[\d\s-]{10,}$/;
        return re.test(phone);
    }
};
