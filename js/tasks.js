/**
 * TaskManager Pro - Tasks Module
 * CRUD operations and task management functionality
 */

const Tasks = {
    currentFilters: {
        status: 'all',
        priority: 'all',
        category: 'all',
        sort: 'created-desc',
        search: ''
    },

    editingTaskId: null,

    /**
     * Initialize tasks module
     */
    init() {
        this.setupEventListeners();
        this.setupFilters();
        this.setupGlobalSearch();
        this.render();
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Add task buttons
        const addTaskBtn = document.getElementById('btn-add-task');
        const addTaskEmptyBtn = document.getElementById('btn-add-task-empty');

        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => this.openModal());
        }
        if (addTaskEmptyBtn) {
            addTaskEmptyBtn.addEventListener('click', () => this.openModal());
        }

        // Modal controls
        const modalClose = document.getElementById('modal-close');
        const modalCancel = document.getElementById('modal-cancel');
        const taskForm = document.getElementById('task-form');

        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal());
        }
        if (modalCancel) {
            modalCancel.addEventListener('click', () => this.closeModal());
        }
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Close modal on overlay click
        const modal = document.getElementById('task-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Delete modal controls
        const deleteCancel = document.getElementById('delete-cancel');
        const deleteClose = document.getElementById('delete-modal-close');
        const deleteConfirm = document.getElementById('delete-confirm');
        const deleteModal = document.getElementById('delete-modal');

        if (deleteCancel) {
            deleteCancel.addEventListener('click', () => this.closeDeleteModal());
        }
        if (deleteClose) {
            deleteClose.addEventListener('click', () => this.closeDeleteModal());
        }
        if (deleteConfirm) {
            deleteConfirm.addEventListener('click', () => this.confirmDelete());
        }
        if (deleteModal) {
            deleteModal.addEventListener('click', (e) => {
                if (e.target === deleteModal) {
                    this.closeDeleteModal();
                }
            });
        }

        // Task details modal
        const detailsClose = document.getElementById('details-close');
        const detailsModalClose = document.getElementById('details-modal-close');
        const detailsEdit = document.getElementById('details-edit');
        const detailsModal = document.getElementById('task-details-modal');

        if (detailsClose) {
            detailsClose.addEventListener('click', () => this.closeDetailsModal());
        }
        if (detailsModalClose) {
            detailsModalClose.addEventListener('click', () => this.closeDetailsModal());
        }
        if (detailsEdit) {
            detailsEdit.addEventListener('click', () => {
                this.closeDetailsModal();
                this.openModal(this.viewingTaskId);
            });
        }
        if (detailsModal) {
            detailsModal.addEventListener('click', (e) => {
                if (e.target === detailsModal) {
                    this.closeDetailsModal();
                }
            });
        }
    },

    /**
     * Setup filter controls
     */
    setupFilters() {
        const filterStatus = document.getElementById('filter-status');
        const filterPriority = document.getElementById('filter-priority');
        const filterCategory = document.getElementById('filter-category');
        const filterSort = document.getElementById('filter-sort');
        const clearFilters = document.getElementById('btn-clear-filters');

        if (filterStatus) {
            filterStatus.addEventListener('change', (e) => {
                this.currentFilters.status = e.target.value;
                this.render();
            });
        }

        if (filterPriority) {
            filterPriority.addEventListener('change', (e) => {
                this.currentFilters.priority = e.target.value;
                this.render();
            });
        }

        if (filterCategory) {
            filterCategory.addEventListener('change', (e) => {
                this.currentFilters.category = e.target.value;
                this.render();
            });
        }

        if (filterSort) {
            filterSort.addEventListener('change', (e) => {
                this.currentFilters.sort = e.target.value;
                this.render();
            });
        }

        if (clearFilters) {
            clearFilters.addEventListener('click', () => this.clearFilters());
        }
    },

    /**
     * Setup global search
     */
    setupGlobalSearch() {
        const searchInput = document.getElementById('global-search');
        if (!searchInput) return;

        const debouncedSearch = Utils.debounce((value) => {
            this.currentFilters.search = value;
            this.render();
        }, 300);

        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });
    },

    /**
     * Clear all filters
     */
    clearFilters() {
        this.currentFilters = {
            status: 'all',
            priority: 'all',
            category: 'all',
            sort: 'created-desc',
            search: ''
        };

        // Reset form values
        document.getElementById('filter-status').value = 'all';
        document.getElementById('filter-priority').value = 'all';
        document.getElementById('filter-category').value = 'all';
        document.getElementById('filter-sort').value = 'created-desc';
        document.getElementById('global-search').value = '';

        this.render();
    },

    /**
     * Get all tasks for current user
     * @returns {Array} Tasks array
     */
    getAllTasks() {
        const userId = Auth.getUserId();
        if (!userId) return [];
        return Storage.getTasks(userId);
    },

    /**
     * Get filtered and sorted tasks
     * @returns {Array} Filtered tasks
     */
    getFilteredTasks() {
        let tasks = this.getAllTasks();

        // Apply filters
        tasks = Utils.filterTasks(tasks, this.currentFilters);

        // Apply sorting
        tasks = Utils.sortTasks(tasks, this.currentFilters.sort);

        return tasks;
    },

    /**
     * Render tasks list
     */
    render() {
        const tasksList = document.getElementById('tasks-list');
        const tasksEmpty = document.getElementById('tasks-empty');
        const tasks = this.getFilteredTasks();

        if (!tasksList) return;

        if (tasks.length === 0) {
            tasksList.classList.add('hidden');
            tasksEmpty?.classList.remove('hidden');
        } else {
            tasksList.classList.remove('hidden');
            tasksEmpty?.classList.add('hidden');

            tasksList.innerHTML = tasks.map(task => this.createTaskCard(task)).join('');

            // Setup checkbox listeners
            tasksList.querySelectorAll('.task-checkbox').forEach(checkbox => {
                checkbox.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const taskId = checkbox.closest('.task-card').dataset.taskId;
                    this.toggleComplete(taskId);
                });
            });

            // Setup action button listeners
            tasksList.querySelectorAll('.task-action-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const taskCard = btn.closest('.task-card');
                    const taskId = taskCard.dataset.taskId;
                    const action = btn.dataset.action;

                    if (action === 'edit') {
                        this.openModal(taskId);
                    } else if (action === 'delete') {
                        this.openDeleteModal(taskId);
                    } else if (action === 'duplicate') {
                        this.duplicate(taskId);
                    }
                });
            });

            // Setup card click for details
            tasksList.querySelectorAll('.task-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    if (!e.target.closest('.task-action-btn') && !e.target.closest('.task-checkbox')) {
                        this.openDetailsModal(card.dataset.taskId);
                    }
                });
            });
        }
    },

    /**
     * Create task card HTML
     * @param {object} task - Task object
     * @returns {string} HTML string
     */
    createTaskCard(task) {
        const isCompleted = task.status === 'completed';
        const isOverdue = Utils.isOverdue(task.dueDate) && !isCompleted;

        return `
            <div class="task-card ${isCompleted ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-checkbox-wrapper">
                    <div class="task-checkbox">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
                <div class="task-content">
                    <div class="task-header">
                        <span class="task-title">${Utils.sanitizeHTML(task.title)}</span>
                        <span class="task-priority-badge ${task.priority}">${Utils.formatPriority(task.priority)}</span>
                    </div>
                    ${task.description ? `<p class="task-description">${Utils.sanitizeHTML(task.description)}</p>` : ''}
                    <div class="task-meta">
                        <span class="task-badge category ${task.category}">${Utils.formatCategory(task.category)}</span>
                        <span class="task-badge">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            ${Utils.formatStatus(task.status)}
                        </span>
                        ${task.dueDate ? `
                            <span class="task-badge ${isOverdue ? 'overdue' : ''}">
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                ${Utils.formatDate(task.dueDate)}
                                ${isOverdue ? ' (Overdue)' : ''}
                            </span>
                        ` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-action-btn" data-action="edit" title="Edit">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="task-action-btn" data-action="duplicate" title="Duplicate">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="task-action-btn delete" data-action="delete" title="Delete">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Open task modal for add/edit
     * @param {string} taskId - Task ID for editing (optional)
     */
    openModal(taskId = null) {
        const modal = document.getElementById('task-modal');
        const modalTitle = document.getElementById('modal-title');
        const submitText = document.getElementById('modal-submit-text');
        const form = document.getElementById('task-form');

        this.editingTaskId = taskId;

        if (taskId) {
            // Edit mode
            const task = Storage.getTask(Auth.getUserId(), taskId);
            if (!task) return;

            modalTitle.textContent = 'Edit Task';
            submitText.textContent = 'Update Task';
            document.getElementById('task-id').value = task.id;
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-description').value = task.description || '';
            document.getElementById('task-category').value = task.category;
            document.getElementById('task-priority').value = task.priority;
            document.getElementById('task-status').value = task.status;
            document.getElementById('task-due-date').value = task.dueDate || '';
        } else {
            // Add mode
            modalTitle.textContent = 'Add New Task';
            submitText.textContent = 'Add Task';
            form.reset();
            document.getElementById('task-id').value = '';
        }

        modal.classList.remove('hidden');
        document.getElementById('task-title').focus();
    },

    /**
     * Close task modal
     */
    closeModal() {
        const modal = document.getElementById('task-modal');
        modal.classList.add('hidden');
        this.editingTaskId = null;
        this.clearFormErrors();
    },

    /**
     * Handle form submission
     * @param {Event} e - Submit event
     */
    handleSubmit(e) {
        e.preventDefault();

        const taskId = document.getElementById('task-id').value;
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();
        const category = document.getElementById('task-category').value;
        const priority = document.getElementById('task-priority').value;
        const status = document.getElementById('task-status').value;
        const dueDate = document.getElementById('task-due-date').value;

        // Validate
        if (!this.validateForm()) return;

        const userId = Auth.getUserId();
        let result;

        if (taskId) {
            // Update existing task
            result = Storage.updateTask(userId, taskId, {
                title,
                description,
                category,
                priority,
                status,
                dueDate
            });

            if (result) {
                Notifications.taskUpdated(title);
            }
        } else {
            // Create new task
            result = Storage.addTask(userId, {
                title,
                description,
                category,
                priority,
                status,
                dueDate
            });

            if (result) {
                Notifications.taskCreated(title);
            }
        }

        if (result) {
            this.closeModal();
            this.render();

            // Update other views
            if (window.Dashboard) Dashboard.render();
            if (window.Kanban) Kanban.render();
            if (window.Analytics) Analytics.render();
        } else {
            Notifications.genericError();
        }
    },

    /**
     * Validate form inputs
     * @returns {boolean} True if valid
     */
    validateForm() {
        const title = document.getElementById('task-title').value.trim();
        const category = document.getElementById('task-category').value;
        const priority = document.getElementById('task-priority').value;
        const status = document.getElementById('task-status').value;

        let isValid = true;
        this.clearFormErrors();

        if (!title) {
            this.showFormError('task-title', 'Task title is required');
            isValid = false;
        }

        if (!category) {
            this.showFormError('task-category', 'Please select a category');
            isValid = false;
        }

        if (!priority) {
            this.showFormError('task-priority', 'Please select a priority');
            isValid = false;
        }

        if (!status) {
            this.showFormError('task-status', 'Please select a status');
            isValid = false;
        }

        return isValid;
    },

    /**
     * Show form error
     * @param {string} fieldId - Field ID
     * @param {string} message - Error message
     */
    showFormError(fieldId, message) {
        const errorEl = document.getElementById(fieldId + '-error');
        if (errorEl) {
            errorEl.textContent = message;
        }
    },

    /**
     * Clear all form errors
     */
    clearFormErrors() {
        ['task-title', 'task-category', 'task-priority', 'task-status'].forEach(id => {
            const errorEl = document.getElementById(id + '-error');
            if (errorEl) {
                errorEl.textContent = '';
            }
        });
    },

    /**
     * Toggle task completion
     * @param {string} taskId - Task ID
     */
    toggleComplete(taskId) {
        const task = Storage.getTask(Auth.getUserId(), taskId);
        if (!task) return;

        const newStatus = task.status === 'completed' ? 'todo' : 'completed';
        const result = Storage.updateTask(Auth.getUserId(), taskId, { status: newStatus });

        if (result) {
            if (newStatus === 'completed') {
                Notifications.taskCompleted(task.title);
            }
            this.render();

            // Update other views
            if (window.Dashboard) Dashboard.render();
            if (window.Kanban) Kanban.render();
            if (window.Analytics) Analytics.render();
        }
    },

    /**
     * Open delete confirmation modal
     * @param {string} taskId - Task ID
     */
    openDeleteModal(taskId) {
        this.deletingTaskId = taskId;
        document.getElementById('delete-modal').classList.remove('hidden');
    },

    /**
     * Close delete modal
     */
    closeDeleteModal() {
        document.getElementById('delete-modal').classList.add('hidden');
        this.deletingTaskId = null;
    },

    /**
     * Confirm and execute delete
     */
    confirmDelete() {
        if (!this.deletingTaskId) return;

        const task = Storage.getTask(Auth.getUserId(), this.deletingTaskId);
        const title = task?.title || 'Task';

        const success = Storage.deleteTask(Auth.getUserId(), this.deletingTaskId);

        if (success) {
            Notifications.taskDeleted(title);
            this.closeDeleteModal();
            this.render();

            // Update other views
            if (window.Dashboard) Dashboard.render();
            if (window.Kanban) Kanban.render();
            if (window.Analytics) Analytics.render();
        } else {
            Notifications.genericError('Failed to delete task');
        }
    },

    /**
     * Open task details modal
     * @param {string} taskId - Task ID
     */
    openDetailsModal(taskId) {
        const task = Storage.getTask(Auth.getUserId(), taskId);
        if (!task) return;

        this.viewingTaskId = taskId;
        const content = document.getElementById('task-details-content');

        const isOverdue = Utils.isOverdue(task.dueDate) && task.status !== 'completed';

        content.innerHTML = `
            <div class="task-detail-header">
                <span class="task-priority-badge ${task.priority}">${Utils.formatPriority(task.priority)}</span>
            </div>
            <h3 class="task-detail-title">${Utils.sanitizeHTML(task.title)}</h3>
            ${task.description ? `
                <div class="task-detail-body">
                    <p class="task-detail-description">${Utils.sanitizeHTML(task.description)}</p>
                </div>
            ` : ''}
            <div class="task-detail-grid">
                <div class="task-detail-item">
                    <span class="task-detail-label">Status</span>
                    <span class="task-detail-value status-badge ${task.status}">
                        <svg viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="4" fill="currentColor"/>
                        </svg>
                        ${Utils.formatStatus(task.status)}
                    </span>
                </div>
                <div class="task-detail-item">
                    <span class="task-detail-label">Category</span>
                    <span class="task-detail-value">
                        <span class="task-badge category ${task.category}">${Utils.formatCategory(task.category)}</span>
                    </span>
                </div>
                <div class="task-detail-item">
                    <span class="task-detail-label">Due Date</span>
                    <span class="task-detail-value ${isOverdue ? 'text-error' : ''}">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        ${task.dueDate ? Utils.formatDate(task.dueDate) : 'Not set'}
                        ${isOverdue ? ' (Overdue)' : ''}
                    </span>
                </div>
                <div class="task-detail-item">
                    <span class="task-detail-label">Created</span>
                    <span class="task-detail-value">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        ${Utils.formatDate(task.createdAt, true)}
                    </span>
                </div>
            </div>
        `;

        document.getElementById('task-details-modal').classList.remove('hidden');
    },

    /**
     * Close details modal
     */
    closeDetailsModal() {
        document.getElementById('task-details-modal').classList.add('hidden');
        this.viewingTaskId = null;
    },

    /**
     * Duplicate a task
     * @param {string} taskId - Task ID to duplicate
     */
    duplicate(taskId) {
        const result = Storage.duplicateTask(Auth.getUserId(), taskId);
        if (result) {
            Notifications.taskCreated(result.title);
            this.render();

            // Update other views
            if (window.Dashboard) Dashboard.render();
            if (window.Kanban) Kanban.render();
            if (window.Analytics) Analytics.render();
        }
    },

    /**
     * Refresh tasks display
     */
    refresh() {
        this.render();
    }
};

// Make Tasks available globally
window.Tasks = Tasks;
