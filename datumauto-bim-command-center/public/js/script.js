// Main Application JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all core functionality
    initSidebar();
    initSearch();
    initNotifications();
    initModals();
    initForms();
    initTheme();
    
    // Initialize page-specific functionality
    const currentPage = getCurrentPage();
    loadPageSpecificScripts(currentPage);
    
    // Initialize smooth scrolling
    initSmoothScroll();
    
    // Initialize tooltips
    initTooltips();
    
    // Initialize animations
    initAnimations();
});

// Get current page name
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page.replace('.html', '');
}

// Load page-specific scripts
function loadPageSpecificScripts(page) {
    const pageScripts = {
        'dashboard': 'js/dashboard.js',
        'projects': 'js/projects.js',
        'project-create': 'js/projects.js',
        'project-edit': 'js/projects.js',
        'tasks': 'js/tasks.js',
        'team': 'js/team.js',
        'setup': 'js/setup.js'
    };
    
    if (pageScripts[page]) {
        const script = document.createElement('script');
        script.src = pageScripts[page];
        document.body.appendChild(script);
    }
}

// Sidebar functionality
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleBtn');
    const mainContent = document.getElementById('mainContent');
    
    if (!sidebar || !toggleBtn) return;
    
    // Toggle sidebar on button click
    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        
        // Store state in localStorage
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });
    
    // Load saved sidebar state
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        mainContent.classList.add('expanded');
    }
    
    // Make sidebar links active based on current page
    const currentPage = getCurrentPage();
    const navLinks = document.querySelectorAll('.nav-item');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes(currentPage)) {
            link.classList.add('active');
        }
    });
}

// Search functionality
function initSearch() {
    const searchBox = document.querySelector('.search-box input');
    if (!searchBox) return;
    
    searchBox.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        
        // Different search logic based on page
        const currentPage = getCurrentPage();
        
        switch(currentPage) {
            case 'projects':
                searchProjects(searchTerm);
                break;
            case 'tasks':
                searchTasks(searchTerm);
                break;
            case 'team':
                searchTeam(searchTerm);
                break;
            default:
                // Generic search
                console.log('Searching for:', searchTerm);
        }
    });
    
    // Add Enter key support
    searchBox.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch(searchBox.value);
        }
    });
}

function performSearch(term) {
    if (!term.trim()) return;
    
    // Show search results
    alert(`Searching for: ${term}`);
    // In a real app, this would navigate to search results page or show results
}

// Notification functionality
function initNotifications() {
    const notificationBell = document.querySelector('.notifications');
    if (!notificationBell) return;
    
    notificationBell.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleNotificationPanel();
    });
    
    // Close notifications when clicking outside
    document.addEventListener('click', function() {
        const panel = document.getElementById('notificationPanel');
        if (panel) {
            panel.style.display = 'none';
        }
    });
}

function toggleNotificationPanel() {
    let panel = document.getElementById('notificationPanel');
    
    if (!panel) {
        panel = createNotificationPanel();
    }
    
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

function createNotificationPanel() {
    const panel = document.createElement('div');
    panel.id = 'notificationPanel';
    panel.className = 'notification-panel';
    
    const notifications = [
        { id: 1, title: 'Project Deadline Approaching', message: 'Website Redesign project deadline in 3 days', time: '10 min ago', read: false },
        { id: 2, title: 'New Task Assigned', message: 'You have been assigned a new task: API Integration', time: '1 hour ago', read: false },
        { id: 3, title: 'Team Meeting Reminder', message: 'Weekly team meeting in 30 minutes', time: '2 hours ago', read: true }
    ];
    
    panel.innerHTML = `
        <div class="notification-header">
            <h3>Notifications</h3>
            <button class="mark-all-read">Mark all as read</button>
        </div>
        <div class="notification-list">
            ${notifications.map(notif => `
                <div class="notification-item ${notif.read ? 'read' : 'unread'}" data-id="${notif.id}">
                    <div class="notification-icon">
                        <i class="fas fa-bell"></i>
                    </div>
                    <div class="notification-content">
                        <h4>${notif.title}</h4>
                        <p>${notif.message}</p>
                        <span class="notification-time">${notif.time}</span>
                    </div>
                    ${!notif.read ? '<span class="notification-dot"></span>' : ''}
                </div>
            `).join('')}
        </div>
        <div class="notification-footer">
            <a href="#">View all notifications</a>
        </div>
    `;
    
    document.body.appendChild(panel);
    
    // Add event listeners
    panel.querySelector('.mark-all-read').addEventListener('click', markAllNotificationsAsRead);
    panel.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', function() {
            markNotificationAsRead(this.dataset.id);
        });
    });
    
    return panel;
}

function markAllNotificationsAsRead() {
    const notificationItems = document.querySelectorAll('.notification-item');
    const badge = document.querySelector('.notifications .badge');
    
    notificationItems.forEach(item => {
        item.classList.remove('unread');
        item.classList.add('read');
        const dot = item.querySelector('.notification-dot');
        if (dot) dot.remove();
    });
    
    if (badge) {
        badge.textContent = '0';
        badge.style.display = 'none';
    }
}

function markNotificationAsRead(id) {
    const item = document.querySelector(`.notification-item[data-id="${id}"]`);
    if (item && item.classList.contains('unread')) {
        item.classList.remove('unread');
        item.classList.add('read');
        const dot = item.querySelector('.notification-dot');
        if (dot) dot.remove();
        
        // Update badge count
        const badge = document.querySelector('.notifications .badge');
        if (badge) {
            const currentCount = parseInt(badge.textContent) || 0;
            const newCount = Math.max(0, currentCount - 1);
            badge.textContent = newCount;
            if (newCount === 0) {
                badge.style.display = 'none';
            }
        }
    }
}

// Modal functionality
function initModals() {
    // Close modal when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal[style*="display: flex"]');
            openModals.forEach(modal => closeModal(modal));
        }
    });
    
    // Close modal buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('close-modal')) {
            const modal = e.target.closest('.modal');
            if (modal) closeModal(modal);
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Form functionality
function initForms() {
    // Form validation
    const forms = document.querySelectorAll('form[data-validate]');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });
    });
    
    // Real-time form validation
    const inputs = document.querySelectorAll('input[data-validate], textarea[data-validate], select[data-validate]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.getAttribute('name') || field.getAttribute('id');
    let error = '';
    
    // Clear previous error
    const existingError = field.parentElement.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    // Required validation
    if (field.hasAttribute('required') && !value) {
        error = 'This field is required';
    }
    
    // Email validation
    if (field.type === 'email' && value && !isValidEmail(value)) {
        error = 'Please enter a valid email address';
    }
    
    // Number validation
    if (field.type === 'number' && field.hasAttribute('min') && parseFloat(value) < parseFloat(field.getAttribute('min'))) {
        error = `Value must be at least ${field.getAttribute('min')}`;
    }
    
    if (field.type === 'number' && field.hasAttribute('max') && parseFloat(value) > parseFloat(field.getAttribute('max'))) {
        error = `Value must be at most ${field.getAttribute('max')}`;
    }
    
    // Show error if exists
    if (error) {
        field.classList.add('error');
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = error;
        field.parentElement.appendChild(errorElement);
        return false;
    }
    
    field.classList.remove('error');
    return true;
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Theme functionality
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', theme);
}

// Smooth scrolling
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Tooltips
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltipText = this.getAttribute('data-tooltip');
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = tooltipText;
    
    document.body.appendChild(tooltip);
    
    const rect = this.getBoundingClientRect();
    tooltip.style.position = 'fixed';
    tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    
    this._tooltip = tooltip;
}

function hideTooltip() {
    if (this._tooltip) {
        this._tooltip.remove();
        delete this._tooltip;
    }
}

// Animations
function initAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Export for use in other modules
window.app = {
    openModal,
    closeModal,
    formatDate,
    formatCurrency,
    validateForm,
    getCurrentPage
};