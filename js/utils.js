/**
 * TaskManager Pro - Utility Functions
 * Common helper functions used throughout the application
 */

const Utils = {
    /**
     * Generate a unique ID
     * @returns {string} Unique identifier
     */
    generateId() {
        return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Format date to readable string
     * @param {string|Date} date - Date to format
     * @param {boolean} includeTime - Whether to include time
     * @returns {string} Formatted date string
     */
    formatDate(date, includeTime = false) {
        if (!date) return '';

        const d = new Date(date);
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };

        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }

        return d.toLocaleDateString('en-US', options);
    },

    /**
     * Get relative time string (e.g., "2 hours ago")
     * @param {string|Date} date - Date to compare
     * @returns {string} Relative time string
     */
    getRelativeTime(date) {
        if (!date) return '';

        const now = new Date();
        const d = new Date(date);
        const diffMs = now - d;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

        return this.formatDate(date);
    },

    /**
     * Check if a date is overdue
     * @param {string|Date} dueDate - Due date to check
     * @returns {boolean} True if overdue
     */
    isOverdue(dueDate) {
        if (!dueDate) return false;

        const now = new Date();
        const due = new Date(dueDate);
        now.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);

        return due < now;
    },

    /**
     * Get date difference in days
     * @param {string|Date} date1 - First date
     * @param {string|Date} date2 - Second date (defaults to now)
     * @returns {number} Number of days difference
     */
    getDaysDiff(date1, date2 = new Date()) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        d1.setHours(0, 0, 0, 0);
        d2.setHours(0, 0, 0, 0);

        return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
    },

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid email
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {object} Strength info with score and label
     */
    validatePassword(password) {
        let score = 0;

        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;

        let strength, label;
        if (score <= 2) {
            strength = 'weak';
            label = 'Weak password';
        } else if (score <= 4) {
            strength = 'medium';
            label = 'Medium strength';
        } else {
            strength = 'strong';
            label = 'Strong password';
        }

        return { score, strength, label };
    },

    /**
     * Check if a date is within this week
     * @param {string|Date} date - Date to check
     * @returns {boolean} True if within this week
     */
    isThisWeek(date) {
        if (!date) return false;

        const now = new Date();
        const d = new Date(date);
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        endOfWeek.setHours(23, 59, 59, 999);

        return d >= startOfWeek && d <= endOfWeek;
    },

    /**
     * Sanitize HTML to prevent XSS
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    sanitizeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Truncate text to max length
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated text
     */
    truncateText(text, maxLength = 50) {
        if (!text || text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    },

    /**
     * Debounce function execution
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Get initials from a name
     * @param {string} name - Full name
     * @returns {string} Initials (max 2 characters)
     */
    getInitials(name) {
        if (!name) return '??';

        const parts = name.trim().split(' ').filter(Boolean);
        if (parts.length === 0) return '??';
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    },

    /**
     * Capitalize first letter of a string
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Format category name for display
     * @param {string} category - Category key
     * @returns {string} Formatted category name
     */
    formatCategory(category) {
        const categories = {
            'personal': 'Personal',
            'work': 'Work',
            'study': 'Study',
            'health': 'Health',
            'finance': 'Finance'
        };
        return categories[category] || this.capitalize(category);
    },

    /**
     * Format priority for display
     * @param {string} priority - Priority key
     * @returns {string} Formatted priority name
     */
    formatPriority(priority) {
        return this.capitalize(priority);
    },

    /**
     * Format status for display
     * @param {string} status - Status key
     * @returns {string} Formatted status name
     */
    formatStatus(status) {
        const statuses = {
            'todo': 'To Do',
            'in-progress': 'In Progress',
            'completed': 'Completed'
        };
        return statuses[status] || this.capitalize(status);
    },

    /**
     * Get current formatted date
     * @returns {string} Current date string
     */
    getCurrentDateFormatted() {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date().toLocaleDateString('en-US', options);
    },

    /**
     * Deep clone an object
     * @param {object} obj - Object to clone
     * @returns {object} Cloned object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Sort tasks by different criteria
     * @param {Array} tasks - Tasks to sort
     * @param {string} sortBy - Sort criteria
     * @returns {Array} Sorted tasks
     */
    sortTasks(tasks, sortBy) {
        const sorted = [...tasks];

        const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };

        switch (sortBy) {
            case 'created-desc':
                return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'created-asc':
                return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            case 'due-asc':
                return sorted.sort((a, b) => {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
            case 'due-desc':
                return sorted.sort((a, b) => {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(b.dueDate) - new Date(a.dueDate);
                });
            case 'priority-desc':
                return sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            case 'priority-asc':
                return sorted.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
            default:
                return sorted;
        }
    },

    /**
     * Filter tasks by criteria
     * @param {Array} tasks - Tasks to filter
     * @param {object} filters - Filter criteria
     * @returns {Array} Filtered tasks
     */
    filterTasks(tasks, filters) {
        let filtered = [...tasks];

        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter(t => t.status === filters.status);
        }

        if (filters.priority && filters.priority !== 'all') {
            filtered = filtered.filter(t => t.priority === filters.priority);
        }

        if (filters.category && filters.category !== 'all') {
            filtered = filtered.filter(t => t.category === filters.category);
        }

        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(search) ||
                (t.description && t.description.toLowerCase().includes(search))
            );
        }

        return filtered;
    },

    /**
     * Escape special characters for CSS
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeCSS(str) {
        return str.replace(/[^\w-]/g, '_');
    }
};

// Make Utils available globally
window.Utils = Utils;
