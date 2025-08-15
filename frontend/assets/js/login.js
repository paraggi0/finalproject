/* ================================================
   LOGIN PAGE JAVASCRIPT
   PT. TOPLINE EVERGREEN MANUFACTURING
   ================================================ */

// Global variables
let isSubmitting = false;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page loaded successfully');
    
    // Initialize login functionality
    initializeLogin();
    
    // Check for preferred department from index page
    const preferredDepartment = localStorage.getItem('preferredDepartment');
    const roleSelect = document.getElementById('role');
    if (roleSelect && preferredDepartment) {
        // Map department to role value
        const departmentMapping = {
            'production': 'production',
            'qc': 'qc',
            'warehouse': 'warehouse'
        };
        
        const roleValue = departmentMapping[preferredDepartment];
        if (roleValue) {
            roleSelect.value = roleValue;
        }
        
        // Clear the stored preference
        localStorage.removeItem('preferredDepartment');
    } else if (roleSelect) {
        // Default to production if no preference
        roleSelect.value = 'production';
    }
});

/**
 * Initialize login form and event listeners
 */
function initializeLogin() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error('Login form not found');
        return;
    }
    
    // Add form submission handler
    loginForm.addEventListener('submit', handleFormSubmission);
    
    console.log('Login form initialized');
}

/**
 * Handle form submission
 */
async function handleFormSubmission(event) {
    event.preventDefault();
    
    if (isSubmitting) {
        return;
    }
    
    const formData = getFormData();
    if (!validateFormData(formData)) {
        return;
    }
    
    isSubmitting = true;
    showLoadingState();
    
    try {
        const result = await authenticateUser(formData);
        if (result.success) {
            // Use selected role from form instead of database role
            const userWithSelectedRole = {
                ...result.user,
                role: formData.role // Override with selected role
            };
            handleLoginSuccess(userWithSelectedRole);
        } else {
            handleLoginError(result.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        handleLoginError('Terjadi kesalahan sistem. Silakan coba lagi.');
    } finally {
        isSubmitting = false;
        hideLoadingState();
    }
}

/**
 * Get form data
 */
function getFormData() {
    return {
        username: document.getElementById('username')?.value?.trim() || '',
        password: document.getElementById('password')?.value || '',
        role: document.getElementById('role')?.value || ''
    };
}

/**
 * Validate form data
 */
function validateFormData(data) {
    let isValid = true;
    
    // Clear previous errors
    clearAllErrors();
    
    // Validate username
    if (!data.username) {
        showFieldError('username', 'Username harus diisi');
        isValid = false;
    } else if (data.username.length < 3) {
        showFieldError('username', 'Username minimal 3 karakter');
        isValid = false;
    }
    
    // Validate password
    if (!data.password) {
        showFieldError('password', 'Password harus diisi');
        isValid = false;
    } else if (data.password.length < 6) {
        showFieldError('password', 'Password minimal 6 karakter');
        isValid = false;
    }
    
    // Validate role
    if (!data.role) {
        showFieldError('role', 'Department harus dipilih');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Authenticate user with database (Web platform)
 */
async function authenticateUser(credentials) {
    try {
        // Call backend API for WEB authentication
        const response = await fetch('http://localhost:3001/api/auth/login/web', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: credentials.username,
                password: credentials.password
            })
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: result.message || 'Login gagal'
            };
        }

        // Map department to role for backward compatibility
        const departmentToRole = {
            'PRODUKSI': 'production',
            'QC': 'qc', 
            'WAREHOUSE': 'warehouse'
        };

        const userRole = departmentToRole[result.user.department] || result.user.department.toLowerCase();

        return {
            success: true,
            user: {
                ...result.user,
                role: userRole,
                name: result.user.full_name
            }
        };

    } catch (error) {
        console.error('Authentication error:', error);
        return {
            success: false,
            message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
        };
    }
}

/**
 * Handle successful login
 */
function handleLoginSuccess(user) {
    // Store user data
    const authToken = generateAuthToken();
    const userData = {
        ...user,
        token: authToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
    
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('isAuthenticated', 'true');
    
    // Show success message
    showMessage('Login berhasil! Mengarahkan ke dashboard...', 'success');
    
    // Show redirect overlay
    showRedirectOverlay();
    
    // Redirect after delay
    setTimeout(() => {
        const redirectUrl = localStorage.getItem('redirectAfterLogin') || getRedirectUrl(user.role);
        localStorage.removeItem('redirectAfterLogin');
        window.location.href = redirectUrl;
    }, 1500);
}

/**
 * Handle login error
 */
function handleLoginError(message) {
    showMessage(message, 'error');
    
    // Focus on username field
    const usernameField = document.getElementById('username');
    if (usernameField) {
        usernameField.focus();
    }
}

/**
 * Show loading state
 */
function showLoadingState() {
    const submitBtn = document.querySelector('.login-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span>Memproses...';
    }
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    const submitBtn = document.querySelector('.login-btn');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="button-text">Sign In</span>';
    }
}

/**
 * Show field error
 */
function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    if (!field) return;
    
    // Add error class
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    field.parentNode.appendChild(errorElement);
}

/**
 * Clear all errors
 */
function clearAllErrors() {
    // Remove error classes
    const errorFields = document.querySelectorAll('.form-group input.error, .form-group select.error');
    errorFields.forEach(field => {
        field.classList.remove('error');
    });
    
    // Remove error messages
    const errorMessages = document.querySelectorAll('.field-error');
    errorMessages.forEach(error => {
        error.remove();
    });
    
    // Clear main message
    const messageElement = document.getElementById('message');
    if (messageElement) {
        messageElement.innerHTML = '';
        messageElement.className = 'message';
    }
}

/**
 * Show message
 */
function showMessage(message, type = 'info') {
    const messageElement = document.getElementById('message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
    }
}

/**
 * Show redirect overlay
 */
function showRedirectOverlay() {
    const overlay = document.querySelector('.redirect-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);
    }
}

/**
 * Generate auth token
 */
function generateAuthToken() {
    return 'auth_' + Math.random().toString(36).substr(2, 16) + '_' + Date.now();
}

/**
 * Get redirect URL based on role
 */
function getRedirectUrl(role) {
    const urls = {
        'production': './produksi/dashboard-produksi.html',
        'qc': './qc/dashboard-qc.html',
        'warehouse': './wh/dashboard-wh.html'
    };
    
    return urls[role] || './produksi/dashboard-produksi.html';
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateFormData,
        authenticateUser,
        generateAuthToken,
        getRedirectUrl
    };
}
