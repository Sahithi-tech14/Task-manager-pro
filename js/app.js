/**
 * TaskManager Pro - Main Application Module
 * Application initialization and navigation management
 */

const App = {
    currentView: 'dashboard',

    /**
     * Initialize the application
     */
    init() {
        this.setupNavigation();
        this.setupLogoutHandlers();
        this.setupUserDropdown();
        this.setupMobileMenu();

        // Initialize modules if logged in
        if (Auth.isLoggedIn()) {
            this.onLogin();
        }
    },

    /**
     * Called when user logs in
     */
    onLogin() {
        this.switchView('dashboard');

        // Initialize all modules
        Tasks.init();
        Dashboard.init();
        Kanban.init();
        Analytics.init();

        // Update current date
        this.updateDate();
    },

    /**
     * Setup navigation
     */
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.dataset.view;
                if (view) {
                    this.switchView(view);
                }
            });
        });

        // Setup view all links
        const viewAllLinks = document.querySelectorAll('.view-all');
        viewAllLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.dataset.view;
                if (view) {
                    this.switchView(view);
                }
            });
        });
    },

    /**
     * Switch between views
     * @param {string} viewName - View to switch to
     */
    switchView(viewName) {
        // Update nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.toggle('active', view.id === `view-${viewName}`);
        });

        this.currentView = viewName;

        // Close mobile menu if open
        this.closeMobileMenu();

        // Refresh the view
        this.refreshCurrentView();
    },

    /**
     * Refresh current view data
     */
    refreshCurrentView() {
        switch (this.currentView) {
            case 'dashboard':
                Dashboard.refresh();
                break;
            case 'tasks':
                Tasks.refresh();
                break;
            case 'kanban':
                Kanban.refresh();
                break;
            case 'analytics':
                Analytics.refresh();
                break;
        }
    },

    /**
     * Setup logout handlers
     */
    setupLogoutHandlers() {
        const logoutBtns = [
            document.getElementById('btn-logout'),
            document.getElementById('dropdown-logout')
        ];

        logoutBtns.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    Auth.logout();
                });
            }
        });
    },

    /**
     * Setup user dropdown menu
     */
    setupUserDropdown() {
        const menuBtn = document.getElementById('user-menu-btn');
        const dropdown = document.getElementById('user-dropdown');

        if (menuBtn && dropdown) {
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('hidden');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target) && !menuBtn.contains(e.target)) {
                    dropdown.classList.add('hidden');
                }
            });

            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    dropdown.classList.add('hidden');
                }
            });
        }
    },

    /**
     * Setup mobile menu
     */
    setupMobileMenu() {
        const toggleBtn = document.getElementById('mobile-menu-toggle');
        const sidebar = document.getElementById('sidebar');

        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });

            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 991) {
                    if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
                        sidebar.classList.remove('open');
                    }
                }
            });

            // Close sidebar on nav item click (mobile)
            sidebar.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', () => {
                    if (window.innerWidth <= 991) {
                        sidebar.classList.remove('open');
                    }
                });
            });
        }
    },

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && window.innerWidth <= 991) {
            sidebar.classList.remove('open');
        }
    },

    /**
     * Update current date display
     */
    updateDate() {
        const dateEl = document.getElementById('current-date');
        if (dateEl) {
            dateEl.textContent = Utils.getCurrentDateFormatted();
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Make App available globally
window.App = App;
