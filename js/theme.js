/**
 * TaskManager Pro - Theme Module
 * Dark/Light mode management
 */

const Theme = {
    currentTheme: 'light',

    /**
     * Initialize theme system
     */
    init() {
        // Get saved theme or system preference
        const savedTheme = Storage.getTheme();
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        this.currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        this.apply(this.currentTheme);
        this.setupListeners();
        this.setupSystemThemeListener();
    },

    /**
     * Apply theme to document
     * @param {string} theme - Theme name (light/dark)
     */
    apply(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        Storage.setTheme(theme);
        this.updateToggleButton();
    },

    /**
     * Toggle between light and dark themes
     */
    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.apply(newTheme);
    },

    /**
     * Set specific theme
     * @param {string} theme - Theme to set
     */
    set(theme) {
        this.apply(theme);
    },

    /**
     * Get current theme
     * @returns {string} Current theme name
     */
    get() {
        return this.currentTheme;
    },

    /**
     * Check if dark mode is active
     * @returns {boolean} True if dark mode
     */
    isDark() {
        return this.currentTheme === 'dark';
    },

    /**
     * Update theme toggle button appearance
     */
    updateToggleButton() {
        const lightIcon = document.querySelector('#btn-theme-toggle .icon-light');
        const darkIcon = document.querySelector('#btn-theme-toggle .icon-dark');

        if (lightIcon && darkIcon) {
            if (this.isDark()) {
                lightIcon.classList.add('hidden');
                darkIcon.classList.remove('hidden');
            } else {
                lightIcon.classList.remove('hidden');
                darkIcon.classList.add('hidden');
            }
        }
    },

    /**
     * Setup theme toggle button listener
     */
    setupListeners() {
        const toggleBtn = document.getElementById('btn-theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }
    },

    /**
     * Listen for system theme changes
     */
    setupSystemThemeListener() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        mediaQuery.addEventListener('change', (e) => {
            // Only auto-switch if no theme is saved
            const savedTheme = Storage.getTheme();
            if (!savedTheme) {
                const newTheme = e.matches ? 'dark' : 'light';
                this.apply(newTheme);
            }
        });
    },

    /**
     * Get CSS variable value for current theme
     * @param {string} variable - CSS variable name
     * @returns {string} Variable value
     */
    getCSSVariable(variable) {
        return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    },

    /**
     * Add smooth theme transition class
     */
    enableTransition() {
        document.body.classList.add('theme-transition');
    },

    /**
     * Remove smooth theme transition class
     */
    disableTransition() {
        document.body.classList.remove('theme-transition');
    }
};

// Apply theme immediately to prevent flash
(function() {
    const savedTheme = localStorage.getItem('taskmanager_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme ? savedTheme.replace(/"/g, '') : (systemPrefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    Theme.init();
});

// Make Theme available globally
window.Theme = Theme;
