document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const errorMessage = document.getElementById('error-message');
  const loginToggle = document.getElementById('login-toggle');
  const signupToggle = document.getElementById('signup-toggle');

  // Initialize form view
  switchForm('login');

  // Form Toggle Functionality
  function switchForm(formType) {
    if (formType === 'login') {
      loginToggle.classList.add('active');
      signupToggle.classList.remove('active');
      if (loginForm) loginForm.classList.add('active');
      if (signupForm) signupForm.classList.remove('active');
    } else {
      signupToggle.classList.add('active');
      loginToggle.classList.remove('active');
      if (signupForm) signupForm.classList.add('active');
      if (loginForm) loginForm.classList.remove('active');
    }
    if (errorMessage) errorMessage.style.display = 'none';
  }

  // Signup Form Submission
  if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const emailInput = this.querySelector('input[type="email"]');
      const passwordInput = this.querySelector('input[type="password"]');
      
      try {
        const response = await fetch('/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailInput.value,
            password: passwordInput.value
          })
        });

        const data = await response.json();

        if (data.success) {
          // Clear form fields
          this.reset();
          
          // Show success and switch to login
          showMessage('Account created successfully! Please log in.', 'success');
          switchForm('login');
        } else {
          showMessage(data.error || 'Registration failed. Please try again.');
        }
      } catch (error) {
        showMessage('Network error. Please check your connection.');
      }
    });
  }

  // Login Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const emailInput = this.querySelector('input[type="email"]');
      const passwordInput = this.querySelector('input[type="password"]');
      
      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: emailInput.value,
            password: passwordInput.value
          })
        });

        const data = await response.json();

        if (data.success) {
          window.location.href = data.redirect; // Redirect to createprofile
        } else {
          showMessage(data.error || 'Login failed. Please try again.');
        }
      } catch (error) {
        showMessage('Network error. Please check your connection.');
      }
    });
  }

  // Toggle Button Event Listeners
  if (loginToggle) {
    loginToggle.addEventListener('click', function() {
      switchForm('login');
    });
  }

  if (signupToggle) {
    signupToggle.addEventListener('click', function() {
      switchForm('signup');
    });
  }

  // Helper Function to Display Messages
  function showMessage(message, type = 'error') {
    if (!errorMessage) return;
    
    errorMessage.textContent = message;
    errorMessage.className = `error-message ${type}`;
    errorMessage.style.display = 'block';
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
      setTimeout(() => {
        errorMessage.style.display = 'none';
      }, 3000);
    }
  }

  // Password Validation Feedback
  const signupPassword = document.getElementById('signup-password');
  if (signupPassword) {
    signupPassword.addEventListener('input', function() {
      const isValid = /^(?=.*[A-Z])(?=.*\d).{6,}$/.test(this.value);
      this.style.borderBottomColor = isValid ? '#4CAF50' : '#F44336';
    });
  }
});