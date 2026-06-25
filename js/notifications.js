/**
 * TaskManager Pro - Notifications Module
 * Custom toast notification system
 */

const Notifications = {
    container: null,

    /**
     * Initialize the notification system
     */
    init() {
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            document.body.appendChild(this.container);
        }
    },

    /**
     * Show a toast notification
     * @param {object} options - Toast options
     * @param {string} options.title - Toast title
     * @param {string} options.message - Toast message
     * @param {string} options.type - Toast type (success, error, warning, info)
     * @param {number} options.duration - Duration in ms (default 4000)
     */
    show(options) {
        const { title, message, type = 'info', duration = 4000 } = options;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                ${this.getIcon(type)}
            </div>
            <div class="toast-content">
                <div class="toast-title">${Utils.sanitizeHTML(title)}</div>
                ${message ? `<div class="toast-message">${Utils.sanitizeHTML(message)}</div>` : ''}
            </div>
            <button class="toast-close">
                <svg viewBox="0 0 24 24" fill="none">
                    <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        `;

        this.container.appendChild(toast);

        // Close button handler
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.dismiss(toast));

        // Auto dismiss after duration
        if (duration > 0) {
            setTimeout(() => this.dismiss(toast), duration);
        }

        return toast;
    },

    /**
     * Dismiss a toast
     * @param {HTMLElement} toast - Toast element
     */
    dismiss(toast) {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    },

    /**
     * Get icon SVG for toast type
     * @param {string} type - Toast type
     * @returns {string} SVG icon
     */
    getIcon(type) {
        const icons = {
            success: `<svg viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            error: `<svg viewBox="0 0 24 24" fill="none">
                <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            warning: `<svg viewBox="0 0 24 24" fill="none">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            info: `<svg viewBox="0 0 24 24" fill="none">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
        };
        return icons[type] || icons.info;
    },

    // ============================================
    // Convenience Methods
    // ============================================

    /**
     * Show success notification
     * @param {string} title - Title
     * @param {string} message - Message (optional)
     */
    success(title, message = '') {
        return this.show({ title, message, type: 'success' });
    },

    /**
     * Show error notification
     * @param {string} title - Title
     * @param {string} message - Message (optional)
     */
    error(title, message = '') {
        return this.show({ title, message, type: 'error' });
    },

    /**
     * Show warning notification
     * @param {string} title - Title
     * @param {string} message - Message (optional)
     */
    warning(title, message = '') {
        return this.show({ title, message, type: 'warning' });
    },

    /**
     * Show info notification
     * @param {string} title - Title
     * @param {string} message - Message (optional)
     */
    info(title, message = '') {
        return this.show({ title, message, type: 'info' });
    },

    // ============================================
    // Common Application Notifications
    // ============================================

    loginSuccess(name) {
        return this.success(`Welcome back, ${name}!`, 'You have successfully logged in.');
    },

    registerSuccess() {
        return this.success('Account Created!', 'You can now log in with your credentials.');
    },

    taskCreated(title) {
        return this.success('Task Created', `"${Utils.truncateText(title, 30)}" has been added.`);
    },

    taskUpdated(title) {
        return this.success('Task Updated', `"${Utils.truncateText(title, 30)}" has been updated.`);
    },

    taskDeleted(title) {
        return this.warning('Task Deleted', `"${Utils.truncateText(title, 30)}" has been removed.`);
    },

    taskCompleted(title) {
        return this.success('Task Completed!', `Great job! "${Utils.truncateText(title, 30)}" is done.`);
    },

    logoutSuccess() {
        return this.info('Logged Out', 'See you next time!');
    },

    validationError(message) {
        return this.error('Validation Error', message);
    },

    genericError(message = 'Something went wrong. Please try again.') {
        return this.error('Error', message);
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    Notifications.init();
});

// Make Notifications available globally
window.Notifications = Notifications;
