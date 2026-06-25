/**
 * TaskManager Pro - Dashboard Module
 * Dashboard statistics and activity tracking
 */

const Dashboard = {
    /**
     * Initialize dashboard
     */
    init() {
        this.render();
    },

    /**
     * Render dashboard data
     */
    render() {
        this.updateStats();
        this.updateCategoryChart();
        this.updateActivityList();
        this.updateCurrentDate();
    },

    /**
     * Update current date display
     */
    updateCurrentDate() {
        const dateEl = document.getElementById('current-date');
        if (dateEl) {
            dateEl.textContent = Utils.getCurrentDateFormatted();
        }
    },

    /**
     * Update all statistics
     */
    updateStats() {
        const tasks = Tasks.getAllTasks();
        const stats = this.calculateStats(tasks);

        // Update stat values
        document.getElementById('stat-total').textContent = stats.total;
        document.getElementById('stat-completed').textContent = stats.completed;
        document.getElementById('stat-in-progress').textContent = stats.inProgress;
        document.getElementById('stat-pending').textContent = stats.pending;
        document.getElementById('stat-high-priority').textContent = stats.highPriority;
        document.getElementById('stat-completion-rate').textContent = stats.completionRate + '%';

        // Update progress bar
        const progressBar = document.getElementById('completion-progress');
        if (progressBar) {
            progressBar.style.width = stats.completionRate + '%';
        }
    },

    /**
     * Calculate statistics from tasks
     * @param {Array} tasks - Tasks array
     * @returns {object} Statistics object
     */
    calculateStats(tasks) {
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const inProgress = tasks.filter(t => t.status === 'in-progress').length;
        const pending = tasks.filter(t => t.status === 'todo').length;
        const highPriority = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            total,
            completed,
            inProgress,
            pending,
            highPriority,
            completionRate
        };
    },

    /**
     * Update category distribution chart
     */
    updateCategoryChart() {
        const tasks = Tasks.getAllTasks();
        const categoryCounts = this.getCategoryCounts(tasks);
        const maxCount = Math.max(...Object.values(categoryCounts), 1);

        const categories = ['personal', 'work', 'study', 'health', 'finance'];

        categories.forEach(category => {
            const count = categoryCounts[category] || 0;
            const percentage = (count / maxCount) * 100;

            const chartFill = document.getElementById(`chart-${category}`);
            const chartValue = document.getElementById(`chart-${category}-value`);

            if (chartFill) {
                chartFill.style.width = percentage + '%';
            }
            if (chartValue) {
                chartValue.textContent = count;
            }
        });
    },

    /**
     * Get count of tasks per category
     * @param {Array} tasks - Tasks array
     * @returns {object} Category counts
     */
    getCategoryCounts(tasks) {
        const counts = {
            personal: 0,
            work: 0,
            study: 0,
            health: 0,
            finance: 0
        };

        tasks.forEach(task => {
            if (counts.hasOwnProperty(task.category)) {
                counts[task.category]++;
            }
        });

        return counts;
    },

    /**
     * Update recent activity list
     */
    updateActivityList() {
        const userId = Auth.getUserId();
        if (!userId) return;

        const activities = Storage.getActivities(userId, 5);
        const activityList = document.getElementById('activity-list');

        if (!activityList) return;

        if (activities.length === 0) {
            activityList.innerHTML = `
                <div class="activity-empty">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p>No recent activity</p>
                </div>
            `;
            return;
        }

        activityList.innerHTML = activities.map(activity => {
            const icon = this.getActivityIcon(activity.type);
            return `
                <div class="activity-item">
                    <div class="activity-icon ${activity.type}">
                        ${icon}
                    </div>
                    <div class="activity-content">
                        <span class="activity-title">${Utils.sanitizeHTML(activity.message)}</span>
                        <span class="activity-time">${Utils.getRelativeTime(activity.timestamp)}</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Get icon for activity type
     * @param {string} type - Activity type
     * @returns {string} SVG icon
     */
    getActivityIcon(type) {
        const icons = {
            add: `<svg viewBox="0 0 24 24" fill="none">
                <path d="M12 4v16m8-8H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            complete: `<svg viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            update: `<svg viewBox="0 0 24 24" fill="none">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
            delete: `<svg viewBox="0 0 24 24" fill="none">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
        };
        return icons[type] || icons.update;
    },

    /**
     * Refresh dashboard
     */
    refresh() {
        this.render();
    }
};

// Make Dashboard available globally
window.Dashboard = Dashboard;
