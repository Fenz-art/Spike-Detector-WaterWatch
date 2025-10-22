/* ===================================
   Authentication JavaScript
   =================================== */

let selectedRole = 'hospital';

// Initialize particles for auth pages
if (document.getElementById('particles-js-auth')) {
    particlesJS('particles-js-auth', {
        particles: {
            number: {
                value: 60,
                density: { enable: true, value_area: 800 }
            },
            color: { value: '#ffffff' },
            shape: { type: 'circle' },
            opacity: {
                value: 0.2,
                random: true,
                anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false }
            },
            size: {
                value: 3,
                random: true,
                anim: { enable: true, speed: 2, size_min: 0.1, sync: false }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#ffffff',
                opacity: 0.15,
                width: 1
            },
            move: {
                enable: true,
                speed: 1.5,
                direction: 'none',
                random: false,
                straight: false,
                out_mode: 'out',
                bounce: false
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: { enable: true, mode: 'grab' },
                onclick: { enable: false },
                resize: true
            },
            modes: {
                grab: {
                    distance: 140,
                    line_linked: { opacity: 0.35 }
                }
            }
        },
        retina_detect: true
    });
}

// Role Selection
function selectRole(role) {
    selectedRole = role;
    
    document.querySelectorAll('.role-option').forEach(option => {
        option.classList.remove('active');
    });
    
    document.querySelector(`[data-role="${role}"]`).classList.add('active');
    
    // Toggle hospital name field visibility
    const hospitalNameGroup = document.getElementById('hospitalNameGroup');
    const organizationGroup = document.getElementById('organizationGroup');
    
    if (hospitalNameGroup && organizationGroup) {
        if (role === 'hospital') {
            hospitalNameGroup.classList.remove('d-none');
            organizationGroup.classList.add('d-none');
            document.getElementById('hospitalName').required = true;
            document.getElementById('organization').required = false;
        } else {
            hospitalNameGroup.classList.add('d-none');
            organizationGroup.classList.remove('d-none');
            document.getElementById('hospitalName').required = false;
            document.getElementById('organization').required = true;
        }
    }
}

// Check URL parameters for role
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    
    if (roleParam && (roleParam === 'hospital' || roleParam === 'municipal')) {
        selectRole(roleParam);
    }
});

// Password Toggle
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.parentElement.querySelector('.password-toggle i');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.classList.remove('fa-eye');
        toggle.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        toggle.classList.remove('fa-eye-slash');
        toggle.classList.add('fa-eye');
    }
}

// Password Strength Checker
const passwordInput = document.getElementById('password');
if (passwordInput) {
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText').querySelector('span');
        
        let strength = 0;
        
        // Length check
        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        
        // Character variety checks
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        
        // Update UI
        strengthFill.classList.remove('weak', 'medium', 'strong');
        strengthText.classList.remove('weak', 'medium', 'strong');
        
        if (strength <= 2) {
            strengthFill.classList.add('weak');
            strengthText.classList.add('weak');
            strengthText.textContent = 'Weak';
        } else if (strength <= 4) {
            strengthFill.classList.add('medium');
            strengthText.classList.add('medium');
            strengthText.textContent = 'Medium';
        } else {
            strengthFill.classList.add('strong');
            strengthText.classList.add('strong');
            strengthText.textContent = 'Strong';
        }
    });
}

// Signup Form Submission
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous validation
        signupForm.classList.remove('was-validated');
        
        // Get form data
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const location = document.getElementById('location').value.trim();
        const hospitalName = selectedRole === 'hospital' 
            ? document.getElementById('hospitalName').value.trim() 
            : document.getElementById('organization').value.trim();
        const terms = document.getElementById('terms').checked;
        
        // Validate passwords match
        if (password !== confirmPassword) {
            document.getElementById('confirmPassword').classList.add('is-invalid');
            document.getElementById('confirmPassword').nextElementSibling.textContent = 'Passwords do not match';
            return;
        }
        
        // Validate terms
        if (!terms) {
            alert('Please agree to the Terms of Service and Privacy Policy');
            return;
        }
        
        // Show loading state
        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        submitBtn.disabled = true;
        btnText.classList.add('d-none');
        btnLoading.classList.remove('d-none');
        
        try {
            // Send signup request
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    role: selectedRole,
                    hospitalName,
                    location
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Success - redirect to appropriate dashboard
                showToast('Account created successfully! Redirecting...', 'success');
                setTimeout(() => {
                    if (selectedRole === 'hospital') {
                        window.location.href = '/hospital-dashboard.html';
                    } else {
                        window.location.href = '/municipal-dashboard.html';
                    }
                }, 1500);
            } else {
                // Error
                showToast(data.message || 'Signup failed. Please try again.', 'error');
                submitBtn.disabled = false;
                btnText.classList.remove('d-none');
                btnLoading.classList.add('d-none');
            }
        } catch (error) {
            console.error('Signup error:', error);
            showToast('An error occurred. Please try again later.', 'error');
            submitBtn.disabled = false;
            btnText.classList.remove('d-none');
            btnLoading.classList.add('d-none');
        }
    });
}

// Login Form Submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous validation
        loginForm.classList.remove('was-validated');
        
        // Get form data
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // Show loading state
        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        submitBtn.disabled = true;
        btnText.classList.add('d-none');
        btnLoading.classList.remove('d-none');
        
        try {
            // Send login request
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    username,
                    password
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Success - redirect to appropriate dashboard
                showToast('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    if (data.user.role === 'hospital') {
                        window.location.href = '/hospital-dashboard.html';
                    } else {
                        window.location.href = '/municipal-dashboard.html';
                    }
                }, 1500);
            } else {
                // Error
                showToast(data.message || 'Invalid credentials. Please try again.', 'error');
                submitBtn.disabled = false;
                btnText.classList.remove('d-none');
                btnLoading.classList.add('d-none');
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast('An error occurred. Please try again later.', 'error');
            submitBtn.disabled = false;
            btnText.classList.remove('d-none');
            btnLoading.classList.add('d-none');
        }
    });
}

// Toast notification styles
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
    }
    
    .toast-notification {
        background: white;
        color: #1f2937;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        min-width: 300px;
        opacity: 0;
        transform: translateX(400px);
        transition: all 0.3s ease;
    }
    
    .toast-notification.show {
        opacity: 1;
        transform: translateX(0);
    }
    
    .toast-notification.toast-success {
        border-left: 4px solid #10b981;
    }
    
    .toast-notification.toast-error {
        border-left: 4px solid #ef4444;
    }
    
    .toast-notification.toast-warning {
        border-left: 4px solid #f59e0b;
    }
    
    .toast-notification.toast-info {
        border-left: 4px solid #06b6d4;
    }
    
    .toast-notification i {
        margin-right: 0.75rem;
        font-size: 1.25rem;
    }
    
    .toast-notification.toast-success i {
        color: #10b981;
    }
    
    .toast-notification.toast-error i {
        color: #ef4444;
    }
    
    .toast-notification.toast-warning i {
        color: #f59e0b;
    }
    
    .toast-notification.toast-info i {
        color: #06b6d4;
    }
    
    .toast-close {
        background: none;
        border: none;
        color: #9ca3af;
        font-size: 1rem;
        cursor: pointer;
        margin-left: auto;
        padding: 0 0 0 1rem;
    }
    
    .toast-close:hover {
        color: #1f2937;
    }
`;
document.head.appendChild(toastStyles);
