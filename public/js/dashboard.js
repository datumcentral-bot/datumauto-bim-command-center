// Dashboard-specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
});

function initDashboard() {
    // Initialize dashboard widgets
    initStatsWidgets();
    initCharts();
    initRecentActivity();
    initQuickActions();
    initProjectTimeline();
    
    // Refresh dashboard data every 5 minutes
    setInterval(refreshDashboardData, 300000);
}

function initStatsWidgets() {
    // Update stats with real data (simulated)
    const stats = {
        'total-projects': 24,
        'active-tasks': 142,
        'completed-tasks': 85,
        'team-members': 8
    };
    
    Object.keys(stats).forEach(statId => {
        const element = document.getElementById(statId);
        if (element) {
            animateCounter(element, stats[statId]);
        }
    });
}

function animateCounter(element, targetValue) {
    const duration = 2000; // 2 seconds
    const step = targetValue / (duration / 16); // 60fps
    let currentValue = 0;
    
    const timer = setInterval(() => {
        currentValue += step;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        element.textContent = Math.floor(currentValue);
    }, 16);
}

function initCharts() {
    // Project Progress Chart
    const progressCtx = document.getElementById('projectProgressChart');
    if (progressCtx) {
        new Chart(progressCtx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'In Progress', 'On Hold', 'Planning'],
                datasets: [{
                    data: [12, 8, 3, 1],
                    backgroundColor: [
                        '#4ECDC4',
                        '#4A6FA5',
                        '#FF9F80',
                        '#A7C5EB'
                    ],
                    borderWidth: 2,
                    borderColor: '#131823'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            font: {
                                family: 'Rajdhani, sans-serif'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(19, 24, 35, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#4A6FA5',
                        borderWidth: 1
                    }
                }
            }
        });
    }
    
    // Task Status Chart
    const taskCtx = document.getElementById('taskStatusChart');
    if (taskCtx) {
        new Chart(taskCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Completed',
                    data: [65, 59, 80, 81, 56, 55],
                    backgroundColor: '#4ECDC4',
                    borderColor: '#4ECDC4',
                    borderWidth: 1
                }, {
                    label: 'In Progress',
                    data: [28, 48, 40, 19, 86, 27],
                    backgroundColor: '#4A6FA5',
                    borderColor: '#4A6FA5',
                    borderWidth: 1
                }, {
                    label: 'Overdue',
                    data: [12, 15, 8, 10, 5, 18],
                    backgroundColor: '#FF6B6B',
                    borderColor: '#FF6B6B',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff',
                            font: {
                                family: 'Rajdhani, sans-serif'
                            }
                        }
                    }
                }
            }
        });
    }
}

function initRecentActivity() {
    const activities = [
        {
            user: 'Alice Johnson',
            action: 'completed',
            target: 'Homepage Design',
            project: 'Website Redesign',
            time: '10 minutes ago',
            avatar: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=FF6B6B&color=fff'
        },
        {
            user: 'Bob Smith',
            action: 'commented on',
            target: 'API Integration Task',
            project: 'Mobile App Launch',
            time: '45 minutes ago',
            avatar: 'https://ui-avatars.com/api/?name=Bob+Smith&background=4ECDC4&color=fff'
        },
        {
            user: 'Charlie Brown',
            action: 'uploaded',
            target: 'Marketing Strategy',
            project: 'Q3 Campaign',
            time: '2 hours ago',
            avatar: 'https://ui-avatars.com/api/?name=Charlie+Brown&background=45B7D1&color=fff'
        },
        {
            user: 'David Chen',
            action: 'started',
            target: 'Database Optimization',
            project: 'CRM Migration',
            time: '3 hours ago',
            avatar: 'https://ui-avatars.com/api/?name=David+Chen&background=96CEB4&color=fff'
        }
    ];
    
    const container = document.getElementById('recentActivityList');
    if (container) {
        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <img src="${activity.avatar}" alt="${activity.user}" class="activity-avatar">
                <div class="activity-content">
                    <p>
                        <strong>${activity.user}</strong> ${activity.action} 
                        <span class="activity-target">${activity.target}</span>
                        in <span class="activity-project">${activity.project}</span>
                    </p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }
}

function initQuickActions() {
    const quickActions = document.querySelectorAll('.quick-action');
    quickActions.forEach(action => {
        action.addEventListener('click', function() {
            const actionType = this.dataset.action;
            performQuickAction(actionType);
        });
    });
}

function performQuickAction(action) {
    switch(action) {
        case 'new-project':
            window.location.href = 'project-create.html';
            break;
        case 'new-task':
            // Open new task modal
            app.openModal('newTaskModal');
            break;
        case 'schedule-meeting':
            // Open calendar
            window.location.href = 'calendar.html';
            break;
        case 'generate-report':
            generateQuickReport();
            break;
        default:
            console.log('Action not implemented:', action);
    }
}

function generateQuickReport() {
    // Show loading state
    const button = document.querySelector('[data-action="generate-report"]');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    button.disabled = true;
    
    // Simulate report generation
    setTimeout(() => {
        // Reset button
        button.innerHTML = originalText;
        button.disabled = false;
        
        // Show success message
        showNotification('Report generated successfully! Check your reports section.', 'success');
        
        // In a real app, this would download the report
        // For now, redirect to reports page
        setTimeout(() => {
            window.location.href = 'reports.html';
        }, 1500);
    }, 2000);
}

function initProjectTimeline() {
    const timelineEvents = [
        {
            date: 'June 30, 2023',
            title: 'Website Redesign Launch',
            status: 'upcoming',
            description: 'Final deployment and launch'
        },
        {
            date: 'June 25, 2023',
            title: 'Mobile App Beta Testing',
            status: 'in-progress',
            description: 'User acceptance testing phase'
        },
        {
            date: 'June 20, 2023',
            title: 'Q3 Marketing Strategy Approval',
            status: 'completed',
            description: 'Strategy approved by stakeholders'
        },
        {
            date: 'June 15, 2023',
            title: 'CRM Migration Planning',
            status: 'scheduled',
            description: 'Initial planning meeting'
        }
    ];
    
    const container = document.getElementById('projectTimeline');
    if (container) {
        container.innerHTML = timelineEvents.map(event => `
            <div class="timeline-item ${event.status}">
                <div class="timeline-date">${event.date}</div>
                <div class="timeline-content">
                    <h4>${event.title}</h4>
                    <p>${event.description}</p>
                    <span class="timeline-status">${event.status}</span>
                </div>
            </div>
        `).join('');
    }
}

function refreshDashboardData() {
    // This would fetch fresh data from the server
    console.log('Refreshing dashboard data...');
    
    // Update stats
    initStatsWidgets();
    
    // Show notification
    showNotification('Dashboard data refreshed', 'info');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        </div>
        <div class="notification-content">${message}</div>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
}

// Make functions available globally
window.dashboard = {
    refreshDashboardData,
    showNotification,
    generateQuickReport
};