/**
 * TaskManager Pro - Analytics Module
 * Visual charts and statistics for task data
 */

const Analytics = {
    /**
     * Initialize analytics module
     */
    init() {
        this.render();
    },

    /**
     * Render all analytics
     */
    render() {
        this.renderPieChart();
        this.renderPriorityChart();
        this.renderCompletionStats();
        this.renderCategoryBreakdown();
    },

    /**
     * Render pie chart for task status distribution
     */
    renderPieChart() {
        const tasks = Tasks.getAllTasks();
        const statusData = this.getStatusDistribution(tasks);
        const total = tasks.length;

        // Update legend values
        document.getElementById('legend-completed').textContent = statusData.completed;
        document.getElementById('legend-in-progress').textContent = statusData.inProgress;
        document.getElementById('legend-todo').textContent = statusData.todo;
        document.getElementById('pie-total').textContent = total;

        // Calculate stroke dash arrays for pie chart
        if (total > 0) {
            const radius = 45;
            const circumference = 2 * Math.PI * radius;
            const completedPercent = statusData.completed / total;
            const inProgressPercent = statusData.inProgress / total;
            const todoPercent = statusData.todo / total;

            // Completed arc
            const completedDash = completedPercent * circumference;
            document.getElementById('pie-completed').style.strokeDasharray = `${completedDash} ${circumference}`;

            // In Progress arc (offset by completed)
            const inProgressDash = inProgressPercent * circumference;
            const inProgressOffset = -completedDash;
            document.getElementById('pie-in-progress').style.strokeDasharray = `${inProgressDash} ${circumference}`;
            document.getElementById('pie-in-progress').style.strokeDashoffset = inProgressOffset;

            // Todo arc (offset by completed + in progress)
            const todoDash = todoPercent * circumference;
            const todoOffset = -(completedDash + inProgressDash);
            document.getElementById('pie-todo').style.strokeDasharray = `${todoDash} ${circumference}`;
            document.getElementById('pie-todo').style.strokeDashoffset = todoOffset;
        } else {
            // Reset when no tasks
            ['pie-completed', 'pie-in-progress', 'pie-todo'].forEach(id => {
                document.getElementById(id).style.strokeDasharray = '0 502';
                document.getElementById(id).style.strokeDashoffset = '0';
            });
        }
    },

    /**
     * Get status distribution
     * @param {Array} tasks - Tasks array
     * @returns {object} Status counts
     */
    getStatusDistribution(tasks) {
        return {
            completed: tasks.filter(t => t.status === 'completed').length,
            inProgress: tasks.filter(t => t.status === 'in-progress').length,
            todo: tasks.filter(t => t.status === 'todo').length
        };
    },

    /**
     * Render priority bar chart
     */
    renderPriorityChart() {
        const tasks = Tasks.getAllTasks();
        const priorityData = this.getPriorityDistribution(tasks);
        const maxCount = Math.max(priorityData.high, priorityData.medium, priorityData.low, 1);

        // Update bars
        const highBar = document.getElementById('bar-high');
        const mediumBar = document.getElementById('bar-medium');
        const lowBar = document.getElementById('bar-low');

        if (highBar) {
            highBar.style.height = (priorityData.high / maxCount * 100) + '%';
        }
        if (mediumBar) {
            mediumBar.style.height = (priorityData.medium / maxCount * 100) + '%';
        }
        if (lowBar) {
            lowBar.style.height = (priorityData.low / maxCount * 100) + '%';
        }

        // Update values
        document.getElementById('bar-high-value').textContent = priorityData.high;
        document.getElementById('bar-medium-value').textContent = priorityData.medium;
        document.getElementById('bar-low-value').textContent = priorityData.low;
    },

    /**
     * Get priority distribution
     * @param {Array} tasks - Tasks array
     * @returns {object} Priority counts
     */
    getPriorityDistribution(tasks) {
        return {
            high: tasks.filter(t => t.priority === 'high').length,
            medium: tasks.filter(t => t.priority === 'medium').length,
            low: tasks.filter(t => t.priority === 'low').length
        };
    },

    /**
     * Render completion statistics
     */
    renderCompletionStats() {
        const tasks = Tasks.getAllTasks();
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const remaining = total - completed;
        const thisWeek = tasks.filter(t =>
            Utils.isThisWeek(t.createdAt) || (t.status === 'completed' && Utils.isThisWeek(t.updatedAt))
        ).length;

        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Update percentage text
        document.getElementById('completion-percentage').textContent = percentage + '%';

        // Update completion circle
        const circumference = 2 * Math.PI * 45; // radius = 45
        const dash = (percentage / 100) * circumference;
        document.getElementById('completion-circle').style.strokeDasharray = `${dash} ${circumference}`;

        // Update details
        document.getElementById('detail-completed').textContent = completed;
        document.getElementById('detail-remaining').textContent = remaining;
        document.getElementById('detail-week').textContent = thisWeek;
    },

    /**
     * Render category breakdown
     */
    renderCategoryBreakdown() {
        const tasks = Tasks.getAllTasks();
        const categoryData = this.getCategoryDistribution(tasks);
        const maxCount = Math.max(...Object.values(categoryData), 1);

        const categories = ['personal', 'work', 'study', 'health', 'finance'];

        categories.forEach(category => {
            const count = categoryData[category] || 0;
            const percentage = (count / maxCount) * 100;

            const countEl = document.getElementById(`cat-${category}-count`);
            const fillEl = document.getElementById(`cat-${category}-fill`);

            if (countEl) {
                countEl.textContent = count;
            }
            if (fillEl) {
                fillEl.style.width = percentage + '%';
                fillEl.className = `category-fill ${category}`;
            }
        });
    },

    /**
     * Get category distribution
     * @param {Array} tasks - Tasks array
     * @returns {object} Category counts
     */
    getCategoryDistribution(tasks) {
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
     * Get completion percentage
     * @returns {number} Completion percentage
     */
    getCompletionPercentage() {
        const tasks = Tasks.getAllTasks();
        if (tasks.length === 0) return 0;

        const completed = tasks.filter(t => t.status === 'completed').length;
        return Math.round((completed / tasks.length) * 100);
    },

    /**
     * Get productivity score (calculated based on various factors)
     * @returns {number} Productivity score 0-100
     */
    getProductivityScore() {
        const tasks = Tasks.getAllTasks();
        if (tasks.length === 0) return 0;

        const completed = tasks.filter(t => t.status === 'completed').length;
        const onTimeTasks = tasks.filter(t =>
            t.status === 'completed' &&
            (!t.dueDate || new Date(t.updatedAt) <= new Date(t.dueDate))
        ).length;
        const inProgress = tasks.filter(t => t.status === 'in-progress').length;

        const completionRate = completed / tasks.length;
        const onTimeRate = completed > 0 ? onTimeTasks / completed : 0;
        const progressRate = inProgress / tasks.length;

        return Math.round(completionRate * 50 + onTimeRate * 30 + progressRate * 20);
    },

    /**
     * Refresh analytics
     */
    refresh() {
        this.render();
    }
};

// Make Analytics available globally
window.Analytics = Analytics;
