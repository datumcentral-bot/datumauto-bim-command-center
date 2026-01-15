// Setup Wizard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initSetupWizard();
});

function initSetupWizard() {
    // Initialize wizard steps
    initWizardSteps();
    
    // Initialize navigation
    initWizardNavigation();
    
    // Initialize form validation
    initWizardForms();
    
    // Initialize progress tracking
    initWizardProgress();
    
    // Load saved data
    loadWizardData();
}

function initWizardSteps() {
    const steps = document.querySelectorAll('.setup-step');
    let currentStep = 1;
    
    // Load saved step
    const savedStep = localStorage.getItem('setupStep');
    if (savedStep) {
        currentStep = parseInt(savedStep);
    }
    
    // Show current step
    showStep(currentStep);
}

function showStep(stepNumber) {
    const steps = document.querySelectorAll('.setup-step');
    const stepElements = document.querySelectorAll('.step');
    
    // Hide all steps
    steps.forEach(step => {
        step.classList.remove('active');
    });
    
    // Deactivate all step indicators
    stepElements.forEach(stepEl => {
        stepEl.classList.remove('active');
    });
    
    // Show current step
    const currentStepElement = document.getElementById(`step-${stepNumber}`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
        
        // Update step indicator
        const stepIndicator = document.querySelector(`.step[data-step="${stepNumber}"]`);
        if (stepIndicator) {
            stepIndicator.classList.add('active');
        }
        
        // Update progress bar
        updateProgressBar(stepNumber, steps.length);
        
        // Save current step
        localStorage.setItem('setupStep', stepNumber);
        
        // Update navigation buttons
        updateNavigationButtons(stepNumber, steps.length);
    }
}

function updateProgressBar(currentStep, totalSteps) {
    const progressBar = document.querySelector('.progress-fill');
    if (progressBar) {
        const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressBar.style.width = `${percentage}%`;
    }
}

function initWizardNavigation() {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const skipBtn = document.querySelector('.skip-btn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', goToPreviousStep);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', goToNextStep);
    }
    
    if (skipBtn) {
        skipBtn.addEventListener('click', skipSetup);
    }
    
    // Step indicator clicks
    const stepIndicators = document.querySelectorAll('.step');
    stepIndicators.forEach(indicator => {
        indicator.addEventListener('click', function() {
            const stepNumber = parseInt(this.dataset.step);
            if (stepNumber) {
                // Only allow going to completed steps
                const currentStep = parseInt(localStorage.getItem('setupStep') || 1);
                if (stepNumber <= currentStep) {
                    showStep(stepNumber);
                }
            }
        });
    });
}

function goToPreviousStep() {
    const currentStep = parseInt(localStorage.getItem('setupStep') || 1);
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}

function goToNextStep() {
    const currentStep = parseInt(localStorage.getItem('setupStep') || 1);
    const totalSteps = document.querySelectorAll('.setup-step').length;
    
    // Validate current step before proceeding
    if (validateCurrentStep(currentStep)) {
        if (currentStep < totalSteps) {
            showStep(currentStep + 1);
        } else {
            completeSetup();
        }
    }
}

function validateCurrentStep(stepNumber) {
    const currentStepElement = document.getElementById(`step-${stepNumber}`);
    if (!currentStepElement) return true;
    
    // Get all required fields in current step
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
            
            // Create error message if not exists
            if (!field.parentElement.querySelector('.error-message')) {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'This field is required';
                field.parentElement.appendChild(errorMsg);
            }
        } else {
            field.classList.remove('error');
            const errorMsg = field.parentElement.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        }
    });
    
    if (!isValid) {
        // Scroll to first error
        const firstError = currentStepElement.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
        
        // Show error notification
        showWizardNotification('Please fill in all required fields', 'error');
    }
    
    return isValid;
}

function skipSetup() {
    if (confirm('Are you sure you want to skip setup? You can always complete it later from settings.')) {
        localStorage.removeItem('setupStep');
        localStorage.setItem('setupCompleted', 'true');
        window.location.href = 'dashboard.html';
    }
}

function updateNavigationButtons(currentStep, totalSteps) {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (prevBtn) {
        prevBtn.disabled = currentStep === 1;
    }
    
    if (nextBtn) {
        if (currentStep === totalSteps) {
            nextBtn.innerHTML = '<i class="fas fa-check"></i> Complete Setup';
        } else {
            nextBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Next';
        }
    }
}

function initWizardForms() {
    // Real-time validation
    const inputs = document.querySelectorAll('.setup-step input, .setup-step select, .setup-step textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateWizardField(this);
        });
        
        input.addEventListener('input', function() {
            // Clear error on input
            this.classList.remove('error');
            const errorMsg = this.parentElement.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        });
    });
    
    // Company logo upload
    const logoUpload = document.getElementById('companyLogoUpload');
    if (logoUpload) {
        logoUpload.addEventListener('change', handleLogoUpload);
    }
    
    // Team member addition
    const addMemberBtn = document.querySelector('.add-member-btn');
    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', addTeamMember);
    }
    
    // Template selection
    const templateOptions = document.querySelectorAll('.template-option input');
    templateOptions.forEach(option => {
        option.addEventListener('change', function() {
            updateTemplatePreview(this.value);
        });
    });
}

function validateWizardField(field) {
    const value = field.value.trim();
    let error = '';
    
    // Clear previous error
    field.classList.remove('error');
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
    
    // URL validation
    if (field.type === 'url' && value && !isValidUrl(value)) {
        error = 'Please enter a valid URL';
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
    
    return true;
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
        showWizardNotification('Please upload a valid image file (JPEG, PNG, GIF, SVG)', 'error');
        event.target.value = '';
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showWizardNotification('File size must be less than 5MB', 'error');
        event.target.value = '';
        return;
    }
    
    // Preview image
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('logoPreview');
        if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        
        // Update remove button
        const removeBtn = document.getElementById('removeLogo');
        if (removeBtn) {
            removeBtn.style.display = 'block';
        }
    };
    reader.readAsDataURL(file);
}

function removeLogo() {
    const uploadInput = document.getElementById('companyLogoUpload');
    const preview = document.getElementById('logoPreview');
    const removeBtn = document.getElementById('removeLogo');
    
    if (uploadInput) uploadInput.value = '';
    if (preview) {
        preview.src = '';
        preview.style.display = 'none';
    }
    if (removeBtn) removeBtn.style.display = 'none';
}

function addTeamMember() {
    const memberList = document.querySelector('.team-members-list');
    if (!memberList) return;
    
    const memberCount = memberList.querySelectorAll('.team-member-item').length;
    
    // Create new member item
    const newMember = document.createElement('div');
    newMember.className = 'team-member-item';
    newMember.innerHTML = `
        <div class="member-info">
            <input type="text" placeholder="Name" class="member-name" required>
            <input type="text" placeholder="Role" class="member-role" required>
            <input type="email" placeholder="Email" class="member-email" required>
        </div>
        <input type="number" placeholder="Weekly Hours" class="member-hours" min="0" max="40" value="40">
        <button type="button" class="btn-icon btn-danger remove-member" onclick="removeTeamMember(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    memberList.appendChild(newMember);
    
    // Add validation
    const inputs = newMember.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateWizardField(this);
        });
    });
}

function removeTeamMember(button) {
    const memberItem = button.closest('.team-member-item');
    if (memberItem) {
        memberItem.remove();
    }
}

function updateTemplatePreview(templateId) {
    const previewContainer = document.getElementById('templatePreview');
    if (!previewContainer) return;
    
    const templates = {
        'basic': {
            name: 'Basic Project Template',
            description: 'Simple project structure with basic task tracking',
            features: ['Task Management', 'File Sharing', 'Basic Reports']
        },
        'agile': {
            name: 'Agile Development Template',
            description: 'Optimized for software development teams using Agile methodology',
            features: ['Sprint Planning', 'Backlog Management', 'Burn-down Charts', 'User Stories']
        },
        'marketing': {
            name: 'Marketing Campaign Template',
            description: 'Designed for marketing teams running campaigns',
            features: ['Campaign Tracking', 'Content Calendar', 'ROI Analysis', 'Social Media Integration']
        },
        'construction': {
            name: 'Construction Project Template',
            description: 'For construction and engineering projects with phases and milestones',
            features: ['Phase Management', 'Milestone Tracking', 'Resource Allocation', 'Safety Checklists']
        }
    };
    
    const template = templates[templateId] || templates.basic;
    
    previewContainer.innerHTML = `
        <div class="template-preview-card">
            <h3>${template.name}</h3>
            <p>${template.description}</p>
            <div class="template-features">
                <h4>Included Features:</h4>
                <ul>
                    ${template.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

function initWizardProgress() {
    // Save form data as user types
    const inputs = document.querySelectorAll('.setup-step input, .setup-step select, .setup-step textarea');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            saveWizardData();
        });
        
        input.addEventListener('change', function() {
            saveWizardData();
        });
    });
}

function saveWizardData() {
    const formData = {};
    
    // Collect all form data
    const inputs = document.querySelectorAll('.setup-step input, .setup-step select, .setup-step textarea');
    inputs.forEach(input => {
        const name = input.name || input.id;
        if (name) {
            formData[name] = input.value;
        }
    });
    
    // Save to localStorage
    localStorage.setItem('setupFormData', JSON.stringify(formData));
}

function loadWizardData() {
    const savedData = localStorage.getItem('setupFormData');
    if (!savedData) return;
    
    try {
        const formData = JSON.parse(savedData);
        
        // Populate form fields
        Object.keys(formData).forEach(key => {
            const input = document.querySelector(`[name="${key}"], #${key}`);
            if (input && formData[key]) {
                input.value = formData[key];
                
                // Trigger change event for selects
                if (input.tagName === 'SELECT') {
                    input.dispatchEvent(new Event('change'));
                }
            }
        });
    } catch (e) {
        console.error('Error loading saved data:', e);
    }
}

function completeSetup() {
    // Validate all steps
    const totalSteps = document.querySelectorAll('.setup-step').length;
    let allValid = true;
    
    for (let i = 1; i <= totalSteps; i++) {
        if (!validateCurrentStep(i)) {
            allValid = false;
            showStep(i); // Go to the step with error
            break;
        }
    }
    
    if (!allValid) return;
    
    // Show loading state
    const nextBtn = document.querySelector('.next-btn');
    const originalText = nextBtn.innerHTML;
    nextBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Completing Setup...';
    nextBtn.disabled = true;
    
    // Collect all form data
    const formData = {};
    const inputs = document.querySelectorAll('.setup-step input, .setup-step select, .setup-step textarea');
    inputs.forEach(input => {
        const name = input.name || input.id;
        if (name) {
            formData[name] = input.value;
        }
    });
    
    // Simulate API call
    setTimeout(() => {
        // Save setup as completed
        localStorage.setItem('setupCompleted', 'true');
        localStorage.removeItem('setupStep');
        localStorage.removeItem('setupFormData');
        
        // Show success message
        showWizardNotification('Setup completed successfully! Redirecting to dashboard...', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    }, 1500);
}

function showWizardNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.wizard-notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `wizard-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        </div>
        <div class="notification-content">${message}</div>
        <button class="notification-close">&times;</button>
    `;
    
    document.querySelector('.setup-container').appendChild(notification);
    
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

// Export for use in other modules
window.setup = {
    showStep,
    goToNextStep,
    goToPreviousStep,
    completeSetup,
    validateCurrentStep
};