/**
 * TaskManager Pro - Storage Module
 * Handles all LocalStorage operations for users, tasks, and settings
 */

const Storage = {
    // Storage keys
    KEYS: {
        USERS: 'taskmanager_users',
        CURRENT_USER: 'taskmanager_current_user',
        TASKS_PREFIX: 'taskmanager_tasks_',
        SETTINGS: 'taskmanager_settings',
        THEME: 'taskmanager_theme',
        ACTIVITY: 'taskmanager_activity_'
    },

    /**
     * Initialize storage with default values
     */
    init() {
        if (!this.get(this.KEYS.USERS)) {
            this.set(this.KEYS.USERS, []);
        }
        if (!this.get(this.KEYS.SETTINGS)) {
            this.set(this.KEYS.SETTINGS, {
                theme: 'light',
                rememberMe: false
            });
        }
        if (!this.get(this.KEYS.THEME)) {
            this.set(this.KEYS.THEME, 'light');
        }
    },

    /**
     * Get item from localStorage
     * @param {string} key - Storage key
     * @returns {any} Parsed value or null
     */
    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Storage get error:', error);
            return null;
        }
    },

    /**
     * Set item in localStorage
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Storage set error:', error);
        }
    },

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Storage remove error:', error);
        }
    },

    /**
     * Clear all app-related storage
     */
    clearAll() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('taskmanager_')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => this.remove(key));
    },

    // ============================================
    // User Management Methods
    // ============================================

    /**
     * Get all registered users
     * @returns {Array} Array of user objects
     */
    getUsers() {
        return this.get(this.KEYS.USERS) || [];
    },

    /**
     * Save users array
     * @param {Array} users - Array of user objects
     */
    saveUsers(users) {
        this.set(this.KEYS.USERS, users);
    },

    /**
     * Add a new user
     * @param {object} user - User object
     * @returns {boolean} Success status
     */
    addUser(user) {
        const users = this.getUsers();

        // Check for duplicate email
        if (users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
            return false;
        }

        users.push({
            id: Utils.generateId(),
            ...user,
            createdAt: new Date().toISOString()
        });

        this.saveUsers(users);
        return true;
    },

    /**
     * Find user by email
     * @param {string} email - User email
     * @returns {object|null} User object or null
     */
    findUserByEmail(email) {
        const users = this.getUsers();
        return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    },

    /**
     * Validate user credentials
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {object|null} User object if valid, null otherwise
     */
    validateCredentials(email, password) {
        const user = this.findUserByEmail(email);
        if (user && user.password === password) {
            return user;
        }
        return null;
    },

    /**
     * Set current logged-in user
     * @param {object} user - User object
     * @param {boolean} remember - Whether to remember session
     */
    setCurrentUser(user, remember = false) {
        const sessionUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            loginTime: new Date().toISOString()
        };
        this.set(this.KEYS.CURRENT_USER, sessionUser);

        const settings = this.get(this.KEYS.SETTINGS) || {};
        settings.rememberMe = remember;
        this.set(this.KEYS.SETTINGS, settings);
    },

    /**
     * Get current logged-in user
     * @returns {object|null} Current user or null
     */
    getCurrentUser() {
        return this.get(this.KEYS.CURRENT_USER);
    },

    /**
     * Check if user is logged in
     * @returns {boolean} True if logged in
     */
    isLoggedIn() {
        return !!this.getCurrentUser();
    },

    /**
     * Logout current user
     */
    logout() {
        this.remove(this.KEYS.CURRENT_USER);
        const settings = this.get(this.KEYS.SETTINGS) || {};
        settings.rememberMe = false;
        this.set(this.KEYS.SETTINGS, settings);
    },

    // ============================================
    // Task Management Methods
    // ============================================

    /**
     * Get storage key for user's tasks
     * @param {string} userId - User ID
     * @returns {string} Tasks storage key
     */
    getTasksKey(userId) {
        return this.KEYS.TASKS_PREFIX + userId;
    },

    /**
     * Get all tasks for a user
     * @param {string} userId - User ID
     * @returns {Array} Array of tasks
     */
    getTasks(userId) {
        return this.get(this.getTasksKey(userId)) || [];
    },

    /**
     * Save tasks for a user
     * @param {string} userId - User ID
     * @param {Array} tasks - Array of tasks
     */
    saveTasks(userId, tasks) {
        this.set(this.getTasksKey(userId), tasks);
    },

    /**
     * Add a new task
     * @param {string} userId - User ID
     * @param {object} task - Task object
     * @returns {object} Created task
     */
    addTask(userId, task) {
        const tasks = this.getTasks(userId);
        const newTask = {
            id: Utils.generateId(),
            ...task,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        tasks.push(newTask);
        this.saveTasks(userId, tasks);
        this.addActivity(userId, 'add', newTask.id, `Created task "${task.title}"`);
        return newTask;
    },

    /**
     * Update an existing task
     * @param {string} userId - User ID
     * @param {string} taskId - Task ID
     * @param {object} updates - Task updates
     * @returns {object|null} Updated task or null
     */
    updateTask(userId, taskId, updates) {
        const tasks = this.getTasks(userId);
        const index = tasks.findIndex(t => t.id === taskId);

        if (index === -1) return null;

        const oldTask = { ...tasks[index] };
        tasks[index] = {
            ...tasks[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.saveTasks(userId, tasks);

        // Log activity based on what changed
        if (updates.status !== oldTask.status) {
            const statusMsg = updates.status === 'completed' ? 'Completed' : `Status changed to ${Utils.formatStatus(updates.status)}`;
            this.addActivity(userId, updates.status === 'completed' ? 'complete' : 'update', taskId, `${statusMsg} "${tasks[index].title}"`);
        } else if (Object.keys(updates).length > 0) {
            this.addActivity(userId, 'update', taskId, `Updated "${tasks[index].title}"`);
        }

        return tasks[index];
    },

    /**
     * Delete a task
     * @param {string} userId - User ID
     * @param {string} taskId - Task ID
     * @returns {boolean} Success status
     */
    deleteTask(userId, taskId) {
        const tasks = this.getTasks(userId);
        const task = tasks.find(t => t.id === taskId);

        if (!task) return false;

        const filtered = tasks.filter(t => t.id !== taskId);
        this.saveTasks(userId, filtered);
        this.addActivity(userId, 'delete', taskId, `Deleted "${task.title}"`);
        return true;
    },

    /**
     * Get a single task
     * @param {string} userId - User ID
     * @param {string} taskId - Task ID
     * @returns {object|null} Task or null
     */
    getTask(userId, taskId) {
        const tasks = this.getTasks(userId);
        return tasks.find(t => t.id === taskId) || null;
    },

    /**
     * Duplicate a task
     * @param {string} userId - User ID
     * @param {string} taskId - Task ID to duplicate
     * @returns {object|null} New duplicated task or null
     */
    duplicateTask(userId, taskId) {
        const task = this.getTask(userId, taskId);
        if (!task) return null;

        const duplicated = {
            ...task,
            title: task.title + ' (Copy)',
            status: 'todo',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            id: Utils.generateId()
        };

        return this.addTask(userId, duplicated);
    },

    // ============================================
    // Activity Log Methods
    // ============================================

    /**
     * Get activity key for user
     * @param {string} userId - User ID
     * @returns {string} Activity storage key
     */
    getActivityKey(userId) {
        return this.KEYS.ACTIVITY + userId;
    },

    /**
     * Get activities for a user
     * @param {string} userId - User ID
     * @param {number} limit - Max number of activities
     * @returns {Array} Activity items
     */
    getActivities(userId, limit = 10) {
        const activities = this.get(this.getActivityKey(userId)) || [];
        return activities.slice(0, limit);
    },

    /**
     * Add an activity
     * @param {string} userId - User ID
     * @param {string} type - Activity type (add, update, complete, delete)
     * @param {string} taskId - Related task ID
     * @param {string} message - Activity message
     */
    addActivity(userId, type, taskId, message) {
        const activities = this.get(this.getActivityKey(userId)) || [];

        activities.unshift({
            id: Utils.generateId(),
            type,
            taskId,
            message,
            timestamp: new Date().toISOString()
        });

        // Keep only last 50 activities
        const trimmed = activities.slice(0, 50);
        this.set(this.getActivityKey(userId), trimmed);
    },

    // ============================================
    // Settings Methods
    // ============================================

    /**
     * Get all settings
     * @returns {object} Settings object
     */
    getSettings() {
        return this.get(this.KEYS.SETTINGS) || { theme: 'light', rememberMe: false };
    },

    /**
     * Update settings
     * @param {object} updates - Settings updates
     */
    updateSettings(updates) {
        const settings = this.getSettings();
        this.set(this.KEYS.SETTINGS, { ...settings, ...updates });
    },

    /**
     * Get theme preference
     * @returns {string} Theme name
     */
    getTheme() {
        return this.get(this.KEYS.THEME) || 'light';
    },

    /**
     * Set theme preference
     * @param {string} theme - Theme name
     */
    setTheme(theme) {
        this.set(this.KEYS.THEME, theme);
    }
};

// Initialize storage on load
Storage.init();

// Make Storage available globally
window.Storage = Storage;
