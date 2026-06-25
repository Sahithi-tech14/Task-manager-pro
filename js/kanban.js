/**
 * TaskManager Pro - Kanban Module
 * Kanban board with drag-and-drop functionality
 */

const Kanban = {
    draggedCard: null,
    draggedCardData: null,

    /**
     * Initialize Kanban board
     */
    init() {
        this.render();
        this.setupDragAndDrop();
    },

    /**
     * Render Kanban board
     */
    render() {
        const tasks = Tasks.getAllTasks();

        const todoTasks = tasks.filter(t => t.status === 'todo');
        const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
        const completedTasks = tasks.filter(t => t.status === 'completed');

        this.renderColumn('kanban-todo', todoTasks, 'todo');
        this.renderColumn('kanban-in-progress', inProgressTasks, 'in-progress');
        this.renderColumn('kanban-completed', completedTasks, 'completed');

        // Update counts
        document.getElementById('kanban-todo-count').textContent = todoTasks.length;
        document.getElementById('kanban-in-progress-count').textContent = inProgressTasks.length;
        document.getElementById('kanban-completed-count').textContent = completedTasks.length;
    },

    /**
     * Render a single Kanban column
     * @param {string} containerId - Container element ID
     * @param {Array} tasks - Tasks for this column
     * @param {string} status - Column status
     */
    renderColumn(containerId, tasks, status) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="kanban-empty">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p>No tasks</p>
                </div>
            `;
            return;
        }

        container.innerHTML = tasks.map(task => this.createKanbanCard(task)).join('');

        // Setup card click handlers
        container.querySelectorAll('.kanban-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.kanban-card-action')) {
                    Tasks.openDetailsModal(card.dataset.taskId);
                }
            });

            // Setup action buttons
            card.querySelectorAll('.kanban-card-action').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const action = btn.dataset.action;

                    if (action === 'edit') {
                        Tasks.openModal(card.dataset.taskId);
                    } else if (action === 'delete') {
                        Tasks.openDeleteModal(card.dataset.taskId);
                    }
                });
            });
        });
    },

    /**
     * Create Kanban card HTML
     * @param {object} task - Task object
     * @returns {string} HTML string
     */
    createKanbanCard(task) {
        const isOverdue = Utils.isOverdue(task.dueDate) && task.status !== 'completed';

        return `
            <div class="kanban-card" data-task-id="${task.id}" draggable="true">
                <div class="kanban-card-header">
                    <span class="kanban-card-title">${Utils.sanitizeHTML(task.title)}</span>
                    <span class="kanban-card-priority ${task.priority}">${Utils.formatPriority(task.priority)}</span>
                </div>
                ${task.description ? `
                    <div class="kanban-card-body">
                        <p class="kanban-card-description">${Utils.sanitizeHTML(task.description)}</p>
                    </div>
                ` : ''}
                <div class="kanban-card-footer">
                    <span class="kanban-card-category ${task.category}">${Utils.formatCategory(task.category)}</span>
                    ${task.dueDate ? `
                        <span class="kanban-card-date ${isOverdue ? 'overdue' : ''}">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            ${Utils.formatDate(task.dueDate)}
                        </span>
                    ` : ''}
                </div>
                <div class="kanban-card-actions">
                    <button class="kanban-card-action" data-action="edit" title="Edit">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="kanban-card-action" data-action="delete" title="Delete">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Setup drag and drop functionality
     */
    setupDragAndDrop() {
        // Column containers
        const containers = document.querySelectorAll('.kanban-cards');

        containers.forEach(container => {
            // Drag over
            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                container.classList.add('drag-over');
            });

            // Drag leave
            container.addEventListener('dragleave', (e) => {
                if (!container.contains(e.relatedTarget)) {
                    container.classList.remove('drag-over');
                }
            });

            // Drop
            container.addEventListener('drop', (e) => {
                e.preventDefault();
                container.classList.remove('drag-over');

                if (this.draggedCardData) {
                    const newStatus = container.closest('.kanban-column').dataset.status;
                    this.moveTask(this.draggedCardData.id, newStatus);
                }
            });
        });

        // Use event delegation for card drag events
        document.addEventListener('dragstart', (e) => {
            const card = e.target.closest('.kanban-card');
            if (card) {
                this.draggedCard = card;
                this.draggedCardData = {
                    id: card.dataset.taskId
                };
                card.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        document.addEventListener('dragend', (e) => {
            const card = e.target.closest('.kanban-card');
            if (card) {
                card.classList.remove('dragging');
                this.draggedCard = null;
                this.draggedCardData = null;
            }
        });
    },

    /**
     * Move task to new status/column
     * @param {string} taskId - Task ID
     * @param {string} newStatus - New status
     */
    moveTask(taskId, newStatus) {
        const task = Storage.getTask(Auth.getUserId(), taskId);
        if (!task || task.status === newStatus) return;

        const result = Storage.updateTask(Auth.getUserId(), taskId, { status: newStatus });

        if (result) {
            if (newStatus === 'completed') {
                Notifications.taskCompleted(task.title);
            }

            this.render();
            Tasks.render();
            Dashboard.render();
            Analytics.render();
        }
    },

    /**
     * Refresh Kanban board
     */
    refresh() {
        this.render();
    }
};

// Make Kanban available globally
window.Kanban = Kanban;
