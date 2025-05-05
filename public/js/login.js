document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const loginToggle = document.getElementById('login-toggle');
  const signupToggle = document.getElementById('signup-toggle');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const errorMessage = document.getElementById('error-message');

  // Toggle between forms
  loginToggle.addEventListener('click', function() {
    loginToggle.classList.add('active');
    signupToggle.classList.remove('active');
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
    clearError();
  });

  signupToggle.addEventListener('click', function() {
    signupToggle.classList.add('active');
    loginToggle.classList.remove('active');
    signupForm.classList.add('active');
    loginForm.classList.remove('active');
    clearError();
  });

  // Handle login form submission
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const submitBtn = this.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
      const formData = new FormData(loginForm);
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password')
        })
      });

      const result = await response.json();

      if (!result.success) {
        showError(result.message || 'Login failed');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Log In';
        return;
      }

      // Redirect based on profile completion
      window.location.href = result.redirect || '/social';
    } catch (error) {
      showError('Network error. Please try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Log In';
    }
  });

  // Handle signup form submission
  signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const submitBtn = this.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    try {
      const formData = new FormData(signupForm);
      const response = await fetch('/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password')
        })
      });

      const result = await response.json();

      if (!result.success) {
        showError(result.message || 'Signup failed');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign Up';
        return;
      }

      // Redirect to create profile page
      window.location.href = '/createprofile';
    } catch (error) {
      showError('Network error. Please try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign Up';
    }
  });

  // Helper functions
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.classList.remove('success');
    errorMessage.classList.add('error');
  }

  function clearError() {
    errorMessage.style.display = 'none';
  }
});