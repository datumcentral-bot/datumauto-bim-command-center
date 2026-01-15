// Tasks JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initTasks();
});

function initTasks() {
    // Initialize task views
    initTaskViews();
    
    // Initialize task filters
    initTaskFilters();
    
    // Initialize task table
    initTaskTable();
    
    // Initialize task board
    initTaskBoard();
    
    // Initialize task actions
    initTaskActions();
    
    // Load tasks data
    loadTasks();
}

function initTaskViews() {
    const viewButtons = document.querySelectorAll('.view-btn');
    const listView = document.getElementById('listView');
    const boardView = document.getElementById('boardView');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            viewButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const view = this.dataset.view;
            
            // Show appropriate view
            if (view === 'list') {
                listView.style.display = 'block';
                boardView.style.display = 'none';
                saveViewPreference('list');
            } else if (view === 'board') {
                listView.style.display = 'none';
                boardView.style.display = 'block';
                initDragAndDrop();
                saveViewPreference('board');
            } else if (view === 'calendar') {
                // Redirect to calendar page or show calendar view
                window.location.href = 'calendar.html';
            }
        });
    });
    
    // Load saved view preference
    const savedView = localStorage.getItem('taskView') || 'list';
    const savedViewButton = document.querySelector(`.view-btn[data-view="${savedView}"]`);
    if (savedViewButton) {
        savedViewButton.click();
    }
}

function saveViewPreference(view) {
    localStorage.setItem('taskView', view);
}

function initTaskFilters() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const filterSelects = document.querySelectorAll('.filter-select');
    
    // Filter tab click handlers
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Update active state
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Filter tasks
            const filter = this.textContent.toLowerCase();
            filterTasks(filter);
        });
    });
    
    // Filter select handlers
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            applyAllFilters();
        });
    });
}

function filterTasks(filter) {
    const taskRows = document.querySelectorAll('.task-row');
    
    taskRows.forEach(row => {
        let show = true;
        
        switch(filter) {
            case 'my tasks':
                // Check if task is assigned to current user
                const assignee = row.querySelector('.assignee span')?.textContent || '';
                show = assignee === 'You' || assignee.includes('John'); // Example
                break;
            case 'assigned':
                const hasAssignee = row.querySelector('.assignee span')?.textContent || '';
                show = hasAssignee && hasAssignee !== 'Unassigned';
                break;
            case 'overdue':
                const dueDate = row.querySelector('.due-date');
                show = dueDate && dueDate.classList.contains('overdue');
                break;
            case 'completed':
                const status = row.querySelector('.status-badge')?.textContent || '';
                show = status.includes('Completed');
                break;
            case 'all tasks':
                show = true;
                break;
        }
        
        row.style.display = show ? 'table-row' : 'none';
    });
}

function applyAllFilters() {
    const activeTab = document.querySelector('.filter-tab.active')?.textContent || 'All Tasks';
    const projectFilter = document.querySelector('.filter-select:nth-child(1)')?.value || 'All Projects';
    const priorityFilter = document.querySelector('.filter-select:nth-child(2)')?.value || 'All Priorities';
    
    const taskRows = document.querySelectorAll('.task-row');
    
    taskRows.forEach(row => {
        let show = true;
        
        // Apply tab filter
        switch(activeTab.toLowerCase()) {
            case 'my tasks':
                const assignee = row.querySelector('.assignee span')?.textContent || '';
                show = assignee === 'You' || assignee.includes('John');
                break;
            case 'assigned':
                const hasAssignee = row.querySelector('.assignee span')?.textContent || '';
                show = hasAssignee && hasAssignee !== 'Unassigned';
                break;
            case 'overdue':
                const dueDate = row.querySelector('.due-date');
                show = dueDate && dueDate.classList.contains('overdue');
                break;
            case 'completed':
                const status = row.querySelector('.status-badge')?.textContent || '';
                show = status.includes('Completed');
                break;
        }
        
        // Apply project filter
        if (show && projectFilter !== 'All Projects') {
            const project = row.querySelector('.project-badge')?.textContent || '';
            show = project === projectFilter;
        }
        
        // Apply priority filter
        if (show && priorityFilter !== 'All Priorities') {
            const priority = row.querySelector('.priority-high, .priority-medium, .priority-low')?.textContent || '';
            show = priority === priorityFilter;
        }
        
        row.style.display = show ? 'table-row' : 'none';
    });
}

function initTaskTable() {
    const checkboxes = document.querySelectorAll('.tasks-table input[type="checkbox"]');
    const table = document.querySelector('.tasks-table');
    
    // Row selection
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const row = this.closest('tr');
            if (row) {
                row.classList.toggle('selected', this.checked);
            }
            updateBulkActions();
        });
    });
    
    // Row click to select
    table.addEventListener('click', function(e) {
        const row = e.target.closest('.task-row');
        if (row && !e.target.closest('input[type="checkbox"]') && !e.target.closest('.task-actions')) {
            const checkbox = row.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        }
    });
}

function updateBulkActions() {
    const selectedCount = document.querySelectorAll('.tasks-table input[type="checkbox"]:checked').length;
    const bulkActions = document.getElementById('bulkActions');
    
    if (!bulkActions) return;
    
    if (selectedCount > 0) {
        bulkActions.style.display = 'flex';
        bulkActions.innerHTML = `
            <span>${selectedCount} task${selectedCount > 1 ? 's' : ''} selected</span>
            <div class="bulk-actions-buttons">
                <button class="btn btn-sm" onclick="bulkChangeStatus()">
                    <i class="fas fa-flag"></i> Change Status
                </button>
                <button class="btn btn-sm" onclick="bulkAssign()">
                    <i class="fas fa-user"></i> Assign
                </button>
                <button class="btn btn-sm btn-danger" onclick="bulkDelete()">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
    } else {
        bulkActions.style.display = 'none';
    }
}

function bulkChangeStatus() {
    const selectedTasks = getSelectedTasks();
    if (selectedTasks.length === 0) return;
    
    // Open status change modal
    app.openModal('bulkStatusModal');
    
    // Populate modal with task count
    const modal = document.getElementById('bulkStatusModal');
    modal.querySelector('.selected-count').textContent = selectedTasks.length;
    
    // Set up form submission
    const form = modal.querySelector('form');
    form.onsubmit = function(e) {
        e.preventDefault();
        const status = form.querySelector('select').value;
        
        // Update tasks (simulated)
        selectedTasks.forEach(taskId => {
            console.log(`Changing task ${taskId} to ${status}`);
        });
        
        app.closeModal(modal);
        
        // Show notification
        if (window.dashboard && window.dashboard.showNotification) {
            window.dashboard.showNotification(`Status updated for ${selectedTasks.length} tasks`, 'success');
        }
        
        // Clear selection
        clearSelection();
    };
}

function bulkAssign() {
    const selectedTasks = getSelectedTasks();
    if (selectedTasks.length === 0) return;
    
    // Similar to bulkChangeStatus, but for assignment
    console.log('Bulk assigning tasks:', selectedTasks);
    
    if (window.dashboard && window.dashboard.showNotification) {
        window.dashboard.showNotification(`Opening assign dialog for ${selectedTasks.length} tasks`, 'info');
    }
}

function bulkDelete() {
    const selectedTasks = getSelectedTasks();
    if (selectedTasks.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedTasks.length} task${selectedTasks.length > 1 ? 's' : ''}? This action cannot be undone.`)) {
        return;
    }
    
    // Delete tasks (simulated)
    selectedTasks.forEach(taskId => {
        const row = document.querySelector(`.task-row[data-task-id="${taskId}"]`);
        if (row) {
            row.style.transition = 'all 0.3s ease';
            row.style.opacity = '0';
            row.style.height = '0';
            row.style.padding = '0';
            
            setTimeout(() => row.remove(), 300);
        }
    });
    
    // Show notification
    if (window.dashboard && window.dashboard.showNotification) {
        window.dashboard.showNotification(`Deleted ${selectedTasks.length} tasks`, 'success');
    }
    
    clearSelection();
}

function getSelectedTasks() {
    const selectedRows = document.querySelectorAll('.tasks-table input[type="checkbox"]:checked');
    return Array.from(selectedRows).map(checkbox => {
        const row = checkbox.closest('.task-row');
        return row ? row.dataset.taskId : null;
    }).filter(id => id !== null);
}

function clearSelection() {
    document.querySelectorAll('.tasks-table input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
        cb.dispatchEvent(new Event('change'));
    });
}

function initTaskBoard() {
    // This will be called when board view is initialized
}

function initDragAndDrop() {
    const taskCards = document.querySelectorAll('.task-card');
    const columns = document.querySelectorAll('.board-column');
    
    taskCards.forEach(task => {
        task.setAttribute('draggable', 'true');
        
        task.addEventListener('dragstart', function(e) {
            this.classList.add('dragging');
            e.dataTransfer.setData('text/plain', this.dataset.taskId);
        });
        
        task.addEventListener('dragend', function() {
            this.classList.remove('dragging');
        });
    });
    
    columns.forEach(column => {
        column.addEventListener('dragover', function(e) {
            e.preventDefault();
            const afterElement = getDragAfterElement(this, e.clientY);
            const draggable = document.querySelector('.dragging');
            
            if (draggable) {
                if (afterElement == null) {
                    this.querySelector('.column-tasks').appendChild(draggable);
                } else {
                    this.querySelector('.column-tasks').insertBefore(draggable, afterElement);
                }
            }
        });
        
        column.addEventListener('drop', function(e) {
            e.preventDefault();
            const taskId = e.dataTransfer.getData('text/plain');
            const task = document.querySelector(`[data-task-id="${taskId}"]`);
            const columnStatus = this.dataset.status;
            
            if (task) {
                // Update task status
                updateTaskStatus(taskId, columnStatus);
                
                // Show notification
                if (window.dashboard && window.dashboard.showNotification) {
                    window.dashboard.showNotification('Task moved successfully', 'success');
                }
            }
        });
    });
}

function getDragAfterElement(column, y) {
    const draggableElements = [...column.querySelectorAll('.task-card:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function updateTaskStatus(taskId, newStatus) {
    // Update task status in the backend
    console.log(`Updating task ${taskId} to status: ${newStatus}`);
    
    // Update UI
    const task = document.querySelector(`[data-task-id="${taskId}"]`);
    if (task) {
        // Update status indicator
        const statusIndicator = task.querySelector('.status-indicator');
        if (statusIndicator) {
            statusIndicator.className = `status-indicator status-${newStatus}`;
            statusIndicator.textContent = newStatus.replace('-', ' ');
        }
    }
}

function initTaskActions() {
    // Edit task buttons
    const editButtons = document.querySelectorAll('.btn-icon .fa-edit');
    editButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const row = this.closest('.task-row');
            const taskId = row?.dataset.taskId;
            if (taskId) {
                editTask(taskId);
            }
        });
    });
    
    // Delete task buttons
    const deleteButtons = document.querySelectorAll('.btn-icon .fa-trash');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const row = this.closest('.task-row');
            const taskId = row?.dataset.taskId;
            if (taskId) {
                deleteTask(taskId, row);
            }
        });
    });
}

function editTask(taskId) {
    // Open task editor modal
    console.log('Editing task:', taskId);
    
    // In a real app, this would open an edit modal or navigate to edit page
    if (window.dashboard && window.dashboard.showNotification) {
        window.dashboard.showNotification('Opening task editor...', 'info');
    }
}

function deleteTask(taskId, row) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    // Show loading state
    row.style.opacity = '0.5';
    
    // Simulate API call
    setTimeout(() => {
        // Remove from DOM
        row.style.transition = 'all 0.3s ease';
        row.style.transform = 'translateX(100%)';
        row.style.opacity = '0';
        
        setTimeout(() => {
            row.remove();
            
            // Show notification
            if (window.dashboard && window.dashboard.showNotification) {
                window.dashboard.showNotification('Task deleted successfully', 'success');
            }
        }, 300);
    }, 1000);
}

function loadTasks() {
    // This would fetch tasks from an API
    // For now, tasks are already in the HTML
    
    // Initialize any dynamic data
    updateTaskCounts();
}

function updateTaskCounts() {
    const totalTasks = document.querySelectorAll('.task-row').length;
    const overdueTasks = document.querySelectorAll('.due-date.overdue').length;
    const inProgressTasks = document.querySelectorAll('.status-badge.status-in-progress').length;
    const completedTasks = document.querySelectorAll('.status-badge.status-completed').length;
    
    // Update summary cards if they exist
    const summaryCards = document.querySelectorAll('.tasks-summary .summary-card');
    if (summaryCards.length === 4) {
        summaryCards[0].querySelector('h3').textContent = totalTasks;
        summaryCards[1].querySelector('h3').textContent = overdueTasks;
        summaryCards[2].querySelector('h3').textContent = inProgressTasks;
        summaryCards[3].querySelector('h3').textContent = completedTasks;
    }
}

// Export for use in other modules
window.tasks = {
    filterTasks,
    applyAllFilters,
    updateTaskStatus,
    editTask,
    deleteTask,
    bulkChangeStatus,
    bulkAssign,
    bulkDelete
};