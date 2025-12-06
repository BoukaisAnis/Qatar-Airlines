// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';
// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const togglePasswordButtons = document.querySelectorAll('.toggle-password');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const passwordStrength = document.getElementById('passwordStrength');
const strengthFill = document.getElementById('strengthFill');
const strengthText = document.getElementById('strengthText');
const passwordRequirements = document.querySelectorAll('.password-requirements li');
const emailFeedback = document.getElementById('emailFeedback');
const confirmFeedback = document.getElementById('confirmFeedback');

// Show/Hide Password
togglePasswordButtons.forEach(button => {
    button.addEventListener('click', function() {
        const input = this.parentElement.querySelector('input');
        const icon = this.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    });
});

// Password Strength Checker
if (passwordInput) {
    passwordInput.addEventListener('input', function() {
        checkPasswordStrength(this.value);
    });
}

function checkPasswordStrength(password) {
    if (!password) {
        if (strengthFill) strengthFill.className = 'strength-fill';
        if (strengthText) strengthText.textContent = 'Password strength';
        updateRequirements([]);
        return;
    }

    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    updateRequirements(requirements);

    const score = Object.values(requirements).filter(Boolean).length;
    let strength = 'weak';
    let strengthClass = 'weak';

    if (score === 5) {
        strength = 'Strong';
        strengthClass = 'strong';
    } else if (score >= 3) {
        strength = 'Good';
        strengthClass = 'good';
    } else if (score >= 2) {
        strength = 'Fair';
        strengthClass = 'fair';
    } else {
        strength = 'Weak';
        strengthClass = 'weak';
    }

    if (strengthFill) {
        strengthFill.className = `strength-fill ${strengthClass}`;
    }
    if (strengthText) {
        strengthText.textContent = `${strength} password`;
    }
}

function updateRequirements(requirements) {
    passwordRequirements.forEach(req => {
        const requirement = req.id.replace('req', '').toLowerCase();
        const isValid = requirements[requirement];
        
        if (isValid) {
            req.classList.add('valid');
            req.querySelector('i').className = 'fas fa-check-circle';
        } else {
            req.classList.remove('valid');
            req.querySelector('i').className = 'fas fa-circle';
        }
    });
}

// Email Validation
if (document.getElementById('email')) {
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('blur', function() {
        validateEmail(this.value);
    });
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
        if (emailFeedback) {
            emailFeedback.textContent = '';
            emailFeedback.className = 'form-feedback';
        }
        return false;
    }
    
    if (!emailRegex.test(email)) {
        if (emailFeedback) {
            emailFeedback.textContent = 'Please enter a valid email address';
            emailFeedback.className = 'form-feedback error';
        }
        return false;
    } else {
        if (emailFeedback) {
            emailFeedback.textContent = 'Email is valid';
            emailFeedback.className = 'form-feedback success';
        }
        return true;
    }
}

// Confirm Password Validation
if (confirmPasswordInput && passwordInput) {
    confirmPasswordInput.addEventListener('input', function() {
        validatePasswordMatch();
    });
    
    passwordInput.addEventListener('input', function() {
        validatePasswordMatch();
    });
}

function validatePasswordMatch() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (!confirmPassword) {
        confirmFeedback.textContent = '';
        confirmFeedback.className = 'form-feedback';
        return;
    }
    
    if (password !== confirmPassword) {
        confirmFeedback.textContent = 'Passwords do not match';
        confirmFeedback.className = 'form-feedback error';
        return false;
    } else {
        confirmFeedback.textContent = 'Passwords match';
        confirmFeedback.className = 'form-feedback success';
        return true;
    }
}

// Show Notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Form Submission - Login
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        const submitBtn = document.getElementById('loginBtn');
        
        // Basic validation
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (!validateEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    remember
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showNotification('Login successful!', 'success');
                
                // Save token to localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Redirect to dashboard after 1 second
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showNotification(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Network error. Please try again.', 'error');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
}

// Form Submission - Signup
if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const country = document.getElementById('country').value;
        const terms = document.getElementById('terms').checked;
        const newsletter = document.getElementById('newsletter').checked;
        const submitBtn = document.getElementById('signupBtn');
        
        // Validation
        if (!firstName || !lastName || !email || !phone || !password || !confirmPassword || !country) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        if (!validateEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        if (!validatePasswordMatch()) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        
        if (!terms) {
            showNotification('You must agree to the Terms of Service', 'error');
            return;
        }
        
        // Check password strength
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        };
        
        const score = Object.values(requirements).filter(Boolean).length;
        if (score < 3) {
            showNotification('Password is too weak. Please use a stronger password.', 'error');
            return;
        }
        
        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    phone,
                    password,
                    country,
                    newsletter,
                    tier: 'Silver', // Default tier for new users
                    avios: 2000 // Bonus Avios on signup
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showNotification('Account created successfully! 2,000 bonus Avios added to your account.', 'success');
                
                // Save token to localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            } else {
                showNotification(data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Signup error:', error);
            showNotification('Network error. Please try again.', 'error');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
}

// Social Login Buttons
document.querySelectorAll('.btn-social').forEach(button => {
    button.addEventListener('click', function() {
        const provider = this.classList.contains('google') ? 'Google' : 'Apple';
        showNotification(`${provider} login is not implemented in this demo`, 'info');
    });
});

// Check if user is already logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        // User is logged in, redirect to dashboard if on auth pages
        if (window.location.pathname.includes('login.html') || 
            window.location.pathname.includes('signup.html')) {
            window.location.href = 'dashboard.html';
        }
    } else {
        // User is not logged in, redirect to login if on dashboard
        if (window.location.pathname.includes('dashboard.html')) {
            window.location.href = 'login.html';
        }
    }
}

// Initialize auth check
checkAuth();

// Logout functionality (to be used in dashboard)
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Forgot Password
document.querySelector('.forgot-password')?.addEventListener('click', function(e) {
    e.preventDefault();
    const email = prompt('Please enter your email address to reset your password:');
    
    if (email) {
        if (validateEmail(email)) {
            showNotification('Password reset instructions have been sent to your email.', 'success');
        } else {
            showNotification('Please enter a valid email address', 'error');
        }
    }
});