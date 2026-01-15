// Team JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initTeam();
});

function initTeam() {
    // Initialize team member cards
    initTeamMemberCards();
    
    // Initialize team search
    initTeamSearch();
    
    // Initialize team filters
    initTeamFilters();
    
    // Initialize department cards
    initDepartmentCards();
    
    // Initialize team actions
    initTeamActions();
    
    // Load team data
    loadTeamData();
}

function initTeamMemberCards() {
    const memberCards = document.querySelectorAll('.team-member-card');
    
    memberCards.forEach(card => {
        // Add click handler for member details
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on action buttons
            if (e.target.closest('.member-actions')) return;
            
            const memberId = this.dataset.memberId;
            if (memberId) {
                showMemberDetails(memberId);
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

function showMemberDetails(memberId) {
    // Fetch member details (simulated)
    const member = {
        id: memberId,
        name: 'John Doe',
        role: 'Project Manager',
        email: 'john.doe@company.com',
        phone: '+1 (555) 123-4567',
        department: 'Management',
        joinDate: '2022-01-15',
        projects: ['Website Redesign', 'Mobile App Launch', 'Q3 Campaign'],
        skills: ['Project Management', 'Agile', 'Budgeting', 'Team Leadership'],
        bio: 'Experienced project manager with 10+ years in software development and digital transformation.'
    };
    
    // Open member details modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Team Member Details</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="member-detail-header">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=4A6FA5&color=fff" alt="${member.name}" class="member-detail-avatar">
                    <div class="member-detail-info">
                        <h2>${member.name}</h2>
                        <p class="member-detail-role">${member.role}</p>
                        <div class="member-detail-contact">
                            <p><i class="fas fa-envelope"></i> ${member.email}</p>
                            <p><i class="fas fa-phone"></i> ${member.phone}</p>
                        </div>
                    </div>
                </div>
                
                <div class="member-detail-section">
                    <h4>Department</h4>
                    <p>${member.department}</p>
                </div>
                
                <div class="member-detail-section">
                    <h4>Joined</h4>
                    <p>${new Date(member.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                
                <div class="member-detail-section">
                    <h4>Current Projects</h4>
                    <div class="project-tags">
                        ${member.projects.map(project => `<span class="project-tag">${project}</span>`).join('')}
                    </div>
                </div>
                
                <div class="member-detail-section">
                    <h4>Skills</h4>
                    <div class="skill-tags">
                        ${member.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </div>
                
                <div class="member-detail-section">
                    <h4>Bio</h4>
                    <p>${member.bio}</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="sendMessage('${member.id}')">
                    <i class="fas fa-comment"></i> Send Message
                </button>
                <button class="btn btn-secondary" onclick="scheduleMeeting('${member.id}')">
                    <i class="fas fa-calendar"></i> Schedule Meeting
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    app.openModal(modal);
    
    // Close button
    modal.querySelector('.close-modal').addEventListener('click', () => {
        app.closeModal(modal);
    });
}

function sendMessage(memberId) {
    console.log('Sending message to:', memberId);
    if (window.dashboard && window.dashboard.showNotification) {
        window.dashboard.showNotification('Opening chat...', 'info');
    }
    // In a real app, this would open a chat window
}

function scheduleMeeting(memberId) {
    console.log('Scheduling meeting with:', memberId);
    if (window.dashboard && window.dashboard.showNotification) {
        window.dashboard.showNotification('Opening calendar...', 'info');
    }
    // In a real app, this would open the calendar with pre-filled invite
}

function initTeamSearch() {
    const searchInput = document.querySelector('input[placeholder*="team members"]');
    if (!searchInput) return;
    
    // Debounced search
    const debouncedSearch = debounce(function(e) {
        searchTeamMembers(e.target.value);
    }, 300);
    
    searchInput.addEventListener('input', debouncedSearch);
}

function searchTeamMembers(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    const memberCards = document.querySelectorAll('.team-member-card');
    
    if (!term) {
        // Show all members
        memberCards.forEach(card => {
            card.style.display = 'flex';
        });
        return;
    }
    
    memberCards.forEach(card => {
        const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const role = card.querySelector('.member-role')?.textContent.toLowerCase() || '';
        const tags = Array.from(card.querySelectorAll('.member-tags .tag'))
                         .map(tag => tag.textContent.toLowerCase())
                         .join(' ');
        
        const matches = name.includes(term) || 
                       role.includes(term) || 
                       tags.includes(term);
        
        card.style.display = matches ? 'flex' : 'none';
    });
}

function initTeamFilters() {
    const viewButtons = document.querySelectorAll('.view-options .btn');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            viewButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Toggle grid/list view
            const isGridView = this.querySelector('.fa-th-large');
            const memberList = document.querySelector('.team-members-list');
            
            if (memberList) {
                if (isGridView) {
                    memberList.classList.add('grid-view');
                } else {
                    memberList.classList.remove('grid-view');
                }
                
                // Save preference
                localStorage.setItem('teamView', isGridView ? 'grid' : 'list');
            }
        });
    });
    
    // Load saved view preference
    const savedView = localStorage.getItem('teamView') || 'list';
    const savedViewButton = document.querySelector(`.view-options .btn${savedView === 'grid' ? ' .fa-th-large' : ' .fa-list'}`)?.closest('.btn');
    if (savedViewButton) {
        savedViewButton.click();
    }
}

function initDepartmentCards() {
    const departmentCards = document.querySelectorAll('.department-card');
    
    departmentCards.forEach(card => {
        card.addEventListener('click', function() {
            const department = this.querySelector('h3').textContent;
            filterByDepartment(department);
        });
    });
}

function filterByDepartment(department) {
    const memberCards = document.querySelectorAll('.team-member-card');
    const departmentMap = {
        'Development': ['Senior Developer', 'Backend Developer', 'Frontend Developer', 'Full Stack Developer'],
        'Design': ['Lead Designer', 'UX Designer', 'UI Designer', 'UX Researcher'],
        'Marketing': ['Content Strategist', 'Marketing Manager', 'SEO Specialist'],
        'Operations': ['Project Manager', 'Operations Manager', 'Product Owner']
    };
    
    const roles = departmentMap[department] || [];
    
    memberCards.forEach(card => {
        const role = card.querySelector('.member-role')?.textContent || '';
        const show = roles.includes(role);
        
        card.style.display = show ? 'flex' : 'none';
    });
    
    // Show notification
    if (window.dashboard && window.dashboard.showNotification) {
        window.dashboard.showNotification(`Filtered by ${department} department`, 'info');
    }
}

function initTeamActions() {
    // Email buttons
    const emailButtons = document.querySelectorAll('.member-actions .fa-envelope');
    emailButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.team-member-card');
            const memberName = card.querySelector('h3')?.textContent || '';
            sendEmailToMember(memberName);
        });
    });
    
    // Phone buttons
    const phoneButtons = document.querySelectorAll('.member-actions .fa-phone');
    phoneButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.team-member-card');
            const memberName = card.querySelector('h3')?.textContent || '';
            callMember(memberName);
        });
    });
    
    // More options buttons
    const moreButtons = document.querySelectorAll('.member-actions .fa-ellipsis-v');
    moreButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.team-member-card');
            toggleMemberOptions(card);
        });
    });
}

function sendEmailToMember(memberName) {
    // Simulate email client opening
    const email = memberName.toLowerCase().replace(' ', '.') + '@company.com';
    window.location.href = `mailto:${email}`;
}

function callMember(memberName) {
    // This would typically use a phone link
    console.log('Calling:', memberName);
    if (window.dashboard && window.dashboard.showNotification) {
        window.dashboard.showNotification(`Initiating call to ${memberName}`, 'info');
    }
}

function toggleMemberOptions(card) {
    // Remove existing menu
    const existingMenu = card.querySelector('.member-options-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }
    
    // Create options menu
    const menu = document.createElement('div');
    menu.className = 'member-options-menu';
    menu.innerHTML = `
        <ul>
            <li><a href="#"><i class="fas fa-eye"></i> View Profile</a></li>
            <li><a href="#"><i class="fas fa-chart-line"></i> View Performance</a></li>
            <li><a href="#"><i class="fas fa-tasks"></i> Assign Tasks</a></li>
            <li class="divider"></li>
            <li><a href="#"><i class="fas fa-edit"></i> Edit Details</a></li>
            <li><a href="#" class="danger"><i class="fas fa-user-minus"></i> Remove from Team</a></li>
        </ul>
    `;
    
    const actionsContainer = card.querySelector('.member-actions');
    actionsContainer.appendChild(menu);
    
    // Position menu
    const rect = actionsContainer.getBoundingClientRect();
    menu.style.position = 'absolute';
    menu.style.right = '0';
    menu.style.top = '100%';
    menu.style.zIndex = '1000';
    
    // Add click handlers
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const action = this.querySelector('i').className;
            const memberId = card.dataset.memberId;
            
            if (action.includes('user-minus')) {
                removeTeamMember(memberId, card);
            } else if (action.includes('eye')) {
                showMemberDetails(memberId);
            } else if (action.includes('edit')) {
                editTeamMember(memberId);
            }
            
            menu.remove();
        });
    });
    
    // Close menu when clicking elsewhere
    setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        });
    }, 0);
}

function removeTeamMember(memberId, card) {
    if (!confirm('Are you sure you want to remove this team member?')) {
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
            
            // Update stats
            updateTeamStats();
            
            // Show notification
            if (window.dashboard && window.dashboard.showNotification) {
                window.dashboard.showNotification('Team member removed', 'success');
            }
        }, 300);
    }, 1000);
}

function editTeamMember(memberId) {
    console.log('Editing team member:', memberId);
    if (window.dashboard && window.dashboard.showNotification) {
        window.dashboard.showNotification('Opening team member editor...', 'info');
    }
    // In a real app, this would open an edit modal
}

function loadTeamData() {
    // Update team stats
    updateTeamStats();
    
    // Load any additional data
    // This would typically fetch from an API
}

function updateTeamStats() {
    const memberCards = document.querySelectorAll('.team-member-card:not([style*="display: none"])');
    const totalMembers = memberCards.length;
    
    // Calculate active projects
    let activeProjects = new Set();
    memberCards.forEach(card => {
        const projectIndicators = card.querySelectorAll('.project-indicator');
        projectIndicators.forEach(indicator => {
            const project = indicator.getAttribute('title');
            if (project) activeProjects.add(project);
        });
    });
    
    // Update stat cards
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length >= 2) {
        statCards[0].querySelector('h3').textContent = totalMembers;
        statCards[1].querySelector('h3').textContent = activeProjects.size;
    }
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
window.team = {
    showMemberDetails,
    searchTeamMembers,
    filterByDepartment,
    removeTeamMember,
    updateTeamStats
};