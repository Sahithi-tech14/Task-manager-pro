/**
 * TaskManager Pro - Authentication Module
 * Handles user registration, login, and session management
 */

const Auth = {
    currentUser: null,

    /**
     * Initialize authentication system
     */
    init() {
        // Check for existing session
        this.currentUser = Storage.getCurrentUser();

        // Setup form listeners
        this.setupLoginForm();
        this.setupRegisterForm();
        this.setupFormSwitching();
        this.setupPasswordToggles();
        this.setupPasswordStrength();

        // Check session and redirect
        this.checkSession();
    },

    /**
     * Check if user is logged in and show appropriate view
     */
    checkSession() {
        if (this.currentUser) {
            this.showApp();
        } else {
            this.showAuth();
        }
    },

    /**
     * Show authentication section
     */
    showAuth() {
        document.getElementById('auth-section').classList.remove('hidden');
        document.getElementById('app-section').classList.add('hidden');
    },

    /**
     * Show main application section
     */
    showApp() {
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('app-section').classList.remove('hidden');

        // Update UI with user info
        this.updateUserInterface();
    },

    /**
     * Update UI elements with current user info
     */
    updateUserInterface() {
        if (!this.currentUser) return;

        const { name, email } = this.currentUser;
        const initials = Utils.getInitials(name);

        // Update sidebar user info
        const sidebarName = document.getElementById('sidebar-user-name');
        const sidebarEmail = document.getElementById('sidebar-user-email');
        const sidebarInitials = document.getElementById('user-initials');
        const navInitials = document.getElementById('nav-user-initials');
        const welcomeName = document.getElementById('welcome-user-name');

        if (sidebarName) sidebarName.textContent = name;
        if (sidebarEmail) sidebarEmail.textContent = email;
        if (sidebarInitials) sidebarInitials.textContent = initials;
        if (navInitials) navInitials.textContent = initials;
        if (welcomeName) welcomeName.textContent = name.split(' ')[0];

        // Update dropdown menu
        const dropdownName = document.getElementById('dropdown-user-name');
        const dropdownEmail = document.getElementById('dropdown-user-email');
        if (dropdownName) dropdownName.textContent = name;
        if (dropdownEmail) dropdownEmail.textContent = email;
    },

    /**
     * Setup login form handling
     */
    setupLoginForm() {
        const loginForm = document.getElementById('login-submit-form');
        if (!loginForm) return;

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    },

    /**
     * Handle login form submission
     */
    handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        // Clear previous errors
        this.clearErrors(['login-email', 'login-password']);

        // Validate inputs
        let isValid = true;

        if (!email) {
            this.showError('login-email', 'Email is required');
            isValid = false;
        } else if (!Utils.validateEmail(email)) {
            this.showError('login-email', 'Please enter a valid email address');
            isValid = false;
        }

        if (!password) {
            this.showError('login-password', 'Password is required');
            isValid = false;
        }

        if (!isValid) return;

        // Validate credentials
        const user = Storage.validateCredentials(email, password);

        if (user) {
            this.currentUser = user;
            Storage.setCurrentUser(user, rememberMe);
            Notifications.loginSuccess(user.name.split(' ')[0]);
            this.showApp();

            // Trigger app initialization
            if (window.App && window.App.onLogin) {
                window.App.onLogin();
            }
        } else {
            this.showError('login-password', 'Invalid email or password');
            Notifications.validationError('Invalid email or password');
        }
    },

    /**
     * Setup register form handling
     */
    setupRegisterForm() {
        const registerForm = document.getElementById('register-submit-form');
        if (!registerForm) return;

        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
    },

    /**
     * Handle registration form submission
     */
    handleRegister() {
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        // Clear previous errors
        this.clearErrors(['register-name', 'register-email', 'register-password', 'register-confirm-password']);

        // Validate inputs
        let isValid = true;

        if (!name) {
            this.showError('register-name', 'Full name is required');
            isValid = false;
        } else if (name.length < 2) {
            this.showError('register-name', 'Name must be at least 2 characters');
            isValid = false;
        }

        if (!email) {
            this.showError('register-email', 'Email is required');
            isValid = false;
        } else if (!Utils.validateEmail(email)) {
            this.showError('register-email', 'Please enter a valid email address');
            isValid = false;
        }

        if (!password) {
            this.showError('register-password', 'Password is required');
            isValid = false;
        } else if (password.length < 6) {
            this.showError('register-password', 'Password must be at least 6 characters');
            isValid = false;
        }

        if (!confirmPassword) {
            this.showError('register-confirm-password', 'Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            this.showError('register-confirm-password', 'Passwords do not match');
            isValid = false;
        }

        if (!isValid) return;

        // Check for existing user
        const existingUser = Storage.findUserByEmail(email);
        if (existingUser) {
            this.showError('register-email', 'An account with this email already exists');
            Notifications.validationError('An account with this email already exists');
            return;
        }

        // Create user
        const user = {
            name,
            email,
            password // In production, this should be hashed!
        };

        const success = Storage.addUser(user);

        if (success) {
            Notifications.registerSuccess();
            this.showLoginForm();

            // Clear form
            document.getElementById('register-submit-form').reset();
            this.resetPasswordStrength();
        } else {
            Notifications.genericError('Failed to create account');
        }
    },

    /**
     * Handle user logout
     */
    logout() {
        Storage.logout();
        this.currentUser = null;
        this.showAuth();

        // Reset forms
        document.getElementById('login-submit-form')?.reset();
        document.getElementById('register-submit-form')?.reset();

        Notifications.logoutSuccess();
    },

    /**
     * Setup form switching (login <-> register)
     */
    setupFormSwitching() {
        const showLogin = document.getElementById('show-login');
        const showRegister = document.getElementById('show-register');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginForm();
            });
        }

        if (showRegister) {
            showRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegisterForm();
            });
        }
    },

    /**
     * Show login form
     */
    showLoginForm() {
        document.getElementById('login-form').classList.add('active');
        document.getElementById('register-form').classList.remove('active');
        this.clearErrors(['login-email', 'login-password']);
    },

    /**
     * Show register form
     */
    showRegisterForm() {
        document.getElementById('login-form').classList.remove('active');
        document.getElementById('register-form').classList.add('active');
        this.clearErrors(['register-name', 'register-email', 'register-password', 'register-confirm-password']);
    },

    /**
     * Setup password visibility toggles
     */
    setupPasswordToggles() {
        const toggleBtns = document.querySelectorAll('.toggle-password');

        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const input = btn.parentElement.querySelector('input');
                const type = input.getAttribute('type');

                if (type === 'password') {
                    input.setAttribute('type', 'text');
                    btn.querySelector('.eye-icon').style.opacity = '0.5';
                } else {
                    input.setAttribute('type', 'password');
                    btn.querySelector('.eye-icon').style.opacity = '1';
                }
            });
        });
    },

    /**
     * Setup password strength indicator
     */
    setupPasswordStrength() {
        const passwordInput = document.getElementById('register-password');
        if (!passwordInput) return;

        passwordInput.addEventListener('input', () => {
            this.updatePasswordStrength(passwordInput.value);
        });
    },

    /**
     * Update password strength indicator
     * @param {string} password - Password to evaluate
     */
    updatePasswordStrength(password) {
        const strengthFill = document.getElementById('strength-fill');
        const strengthText = document.getElementById('strength-text');

        if (!password) {
            this.resetPasswordStrength();
            return;
        }

        const result = Utils.validatePassword(password);

        strengthFill.className = 'strength-fill ' + result.strength;
        strengthText.className = 'strength-text ' + result.strength;
        strengthText.textContent = result.label;
    },

    /**
     * Reset password strength indicator
     */
    resetPasswordStrength() {
        const strengthFill = document.getElementById('strength-fill');
        const strengthText = document.getElementById('strength-text');

        if (strengthFill) {
            strengthFill.className = 'strength-fill';
        }
        if (strengthText) {
            strengthText.className = 'strength-text';
            strengthText.textContent = '';
        }
    },

    /**
     * Show error for a field
     * @param {string} fieldId - Input field ID
     * @param {string} message - Error message
     */
    showError(fieldId, message) {
        const errorEl = document.getElementById(fieldId + '-error');
        const inputEl = document.getElementById(fieldId);
        const wrapper = inputEl?.closest('.input-wrapper');

        if (errorEl) {
            errorEl.textContent = message;
        }
        if (wrapper) {
            wrapper.classList.add('error');
        }
    },

    /**
     * Clear errors for given fields
     * @param {Array} fieldIds - Array of field IDs
     */
    clearErrors(fieldIds) {
        fieldIds.forEach(fieldId => {
            const errorEl = document.getElementById(fieldId + '-error');
            const inputEl = document.getElementById(fieldId);
            const wrapper = inputEl?.closest('.input-wrapper');

            if (errorEl) {
                errorEl.textContent = '';
            }
            if (wrapper) {
                wrapper.classList.remove('error', 'success');
            }
        });
    },

    /**
     * Get current user
     * @returns {object|null} Current user
     */
    getUser() {
        return this.currentUser;
    },

    /**
     * Get current user ID
     * @returns {string|null} User ID
     */
    getUserId() {
        return this.currentUser?.id || null;
    }
};

// Initialize auth on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});

// Make Auth available globally
window.Auth = Auth;
