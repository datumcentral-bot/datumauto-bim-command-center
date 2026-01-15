// Projects JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initProjects();
});

function initProjects() {
    // Initialize project filtering
    initProjectFilters();
    
    // Initialize project cards
    initProjectCards();
    
    // Initialize project search
    initProjectSearch();
    
    // Initialize project actions
    initProjectActions();
    
    // Load projects data
    loadProjects();
}

function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortSelect = document.querySelector('.sort-dropdown select');
    
    // Filter button click handlers
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter projects
            const filter = this.textContent.toLowerCase();
            filterProjects(filter);
        });
    });
    
    // Sort select handler
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortBy = this.value;
            sortProjects(sortBy);
        });
    }
}

function filterProjects(filter) {
    const projectCards = document.querySelectorAll('.project-card:not(.add-project)');
    
    projectCards.forEach(card => {
        const statusElement = card.querySelector('.project-status');
        const status = statusElement ? statusElement.textContent.toLowerCase() : '';
        
        let show = true;
        
        switch(filter) {
            case 'active':
                show = status.includes('in progress') || status.includes('planning');
                break;
            case 'completed':
                show = status.includes('completed');
                break;
            case 'on hold':
                show = status.includes('on hold');
                break;
            case 'all projects':
                show = true;
                break;
            default:
                show = status.includes(filter);
        }
        
        card.style.display = show ? 'block' : 'none';
    });
}

function sortProjects(sortBy) {
    const container = document.querySelector('.projects-grid');
    const cards = Array.from(container.querySelectorAll('.project-card:not(.add-project)'));
    
    cards.sort((a, b) => {
        let valueA, valueB;
        
        switch(sortBy) {
            case 'Sort by: Newest':
                // Assuming projects have a data-date attribute
                valueA = new Date(a.dataset.date || 0);
                valueB = new Date(b.dataset.date || 0);
                return valueB - valueA;
                
            case 'Sort by: Oldest':
                valueA = new Date(a.dataset.date || 0);
                valueB = new Date(b.dataset.date || 0);
                return valueA - valueB;
                
            case 'Sort by: Name':
                valueA = a.querySelector('h3').textContent;
                valueB = b.querySelector('h3').textContent;
                return valueA.localeCompare(valueB);
                
            case 'Sort by: Deadline':
                valueA = a.querySelector('.due-date span')?.textContent || '';
                valueB = b.querySelector('.due-date span')?.textContent || '';
                return new Date(valueA) - new Date(valueB);
                
            default:
                return 0;
        }
    });
    
    // Reorder cards
    cards.forEach(card => container.appendChild(card));
}

function initProjectCards() {
    const projectCards = document.querySelectorAll('.project-card:not(.add-project)');
    
    projectCards.forEach(card => {
        // Add click handler for project details
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on action buttons
            if (e.target.closest('.project-actions')) return;
            
            const projectId = this.dataset.projectId;
            if (projectId) {
                window.location.href = `project-details.html?id=${projectId}`;
            }
        });
        
        // Add hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        });
    });
}

function initProjectSearch() {
    const searchInput = document.querySelector('input[placeholder*="projects"]');
    if (!searchInput) return;
    
    // Debounced search
    const debouncedSearch = debounce(function(e) {
        searchProjects(e.target.value);
    }, 300);
    
    searchInput.addEventListener('input', debouncedSearch);
}

function searchProjects(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    const projectCards = document.querySelectorAll('.project-card:not(.add-project)');
    
    if (!term) {
        // Show all projects
        projectCards.forEach(card => {
            card.style.display = 'block';
        });
        return;
    }
    
    projectCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        const tags = card.dataset.tags ? card.dataset.tags.toLowerCase() : '';
        
        const matches = title.includes(term) || 
                       description.includes(term) || 
                       tags.includes(term);
        
        card.style.display = matches ? 'block' : 'none';
    });
}

function initProjectActions() {
    // Project action dropdowns
    const actionButtons = document.querySelectorAll('.project-actions i');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.project-card');
            toggleProjectActions(card);
        });
    });
    
    // Close action menus when clicking elsewhere
    document.addEventListener('click', function() {
        const openMenus = document.querySelectorAll('.project-actions-menu.open');
        openMenus.forEach(menu => menu.remove());
    });
}

function toggleProjectActions(card) {
    // Remove existing menu
    const existingMenu = card.querySelector('.project-actions-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }
    
    // Create new menu
    const menu = document.createElement('div');
    menu.className = 'project-actions-menu open';
    menu.innerHTML = `
        <ul>
            <li><a href="#"><i class="fas fa-edit"></i> Edit Project</a></li>
            <li><a href="#"><i class="fas fa-copy"></i> Duplicate</a></li>
            <li><a href="#"><i class="fas fa-archive"></i> Archive</a></li>
            <li class="divider"></li>
            <li><a href="#" class="danger"><i class="fas fa-trash"></i> Delete</a></li>
        </ul>
    `;
    
    const actionsContainer = card.querySelector('.project-actions');
    actionsContainer.appendChild(menu);
    
    // Add click handlers
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const action = this.querySelector('i').className;
            const projectId = card.dataset.projectId;
            
            if (action.includes('trash')) {
                deleteProject(projectId, card);
            } else if (action.includes('edit')) {
                editProject(projectId);
            } else if (action.includes('copy')) {
                duplicateProject(projectId);
            }
            
            menu.remove();
        });
    });
}

function deleteProject(projectId, card) {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
        return;
    }
    
    // Show loading state
    card.style.opacity = '0.5';
    
    // Simulate API call
    setTimeout(() => {
        // Remove from DOM
        card.style.transition = 'all 0.3s ease';
        card.style.transform = 'translateX(100%)';
        card.style.opacity = '0';
        
        setTimeout(() => {
            card.remove();
            
            // Show notification
            if (window.dashboard && window.dashboard.showNotification) {
                window.dashboard.showNotification('Project deleted successfully', 'success');
            }
        }, 300);
    }, 1000);
}

function editProject(projectId) {
    window.location.href = `project-edit.html?id=${projectId}`;
}

function duplicateProject(projectId) {
    // Show loading state
    if (window.dashboard && window.dashboard.showNotification) {
        window.dashboard.showNotification('Duplicating project...', 'info');
    }
    
    // Simulate API call
    setTimeout(() => {
        if (window.dashboard && window.dashboard.showNotification) {
            window.dashboard.showNotification('Project duplicated successfully', 'success');
        }
        
        // In a real app, this would reload the projects list
        // For now, just log it
        console.log('Duplicating project:', projectId);
    }, 1500);
}

function loadProjects() {
    // This would fetch projects from an API
    // For now, we'll simulate loading
    
    const projectsGrid = document.querySelector('.projects-grid');
    if (!projectsGrid) return;
    
    // Check if projects are already loaded
    if (projectsGrid.querySelector('.project-card')) return;
    
    // Show loading skeleton
    projectsGrid.innerHTML = `
        <div class="project-card skeleton">
            <div class="skeleton-header"></div>
            <div class="skeleton-body">
                <div class="skeleton-title"></div>
                <div class="skeleton-description"></div>
            </div>
            <div class="skeleton-footer"></div>
        </div>
    `.repeat(6);
    
    // Simulate API delay
    setTimeout(() => {
        // In a real app, this would be populated with actual data
        // For now, the HTML already contains project cards
        const skeletonCards = projectsGrid.querySelectorAll('.skeleton');
        skeletonCards.forEach(card => card.remove());
        
        // Re-initialize project cards
        initProjectCards();
    }, 1000);
}

// Debounce function
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

// Export for use in other modules
window.projects = {
    filterProjects,
    sortProjects,
    searchProjects,
    deleteProject,
    editProject,
    duplicateProject
};