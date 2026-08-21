/**
 * DOM Renderer Engine
 * Handles safe insertion of HTML into the DOM
 */

export const Renderer = {
    /**
     * Render HTML string into a target element safely
     */
    render: (targetSelector, htmlString, append = false) => {
        const target = document.querySelector(targetSelector);
        if (!target) {
            console.warn(`Target element ${targetSelector} not found for rendering`);
            return;
        }

        if (append) {
            target.insertAdjacentHTML('beforeend', htmlString);
        } else {
            target.innerHTML = htmlString;
        }
    },

    /**
     * Bind events to elements after rendering
     */
    bindEvents: (selector, eventType, handler) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.addEventListener(eventType, handler);
        });
    },

    /**
     * Show/Hide elements
     */
    toggleVisibility: (selector, show) => {
        const el = document.querySelector(selector);
        if (el) {
            if (show) el.classList.remove('hidden');
            else el.classList.add('hidden');
        }
    }
};
