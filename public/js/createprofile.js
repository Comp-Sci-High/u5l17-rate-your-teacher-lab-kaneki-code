document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const fileUpload = document.getElementById('fileUpload');
    const uploadButton = document.getElementById('uploadButton');
    const profileImagePreview = document.getElementById('profileImagePreview');
    const profilePictureInput = document.getElementById('profilePicture');
    const profileForm = document.getElementById('profileForm');
    const usernameInput = document.getElementById('username');
    const birthDateInput = document.getElementById('birthDate');
    const bioInput = document.getElementById('bio');
    const submitBtn = profileForm.querySelector('.submit-btn');

    // Image Upload Handling
    uploadButton.addEventListener('click', () => fileUpload.click());

    fileUpload.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Validate file type
            if (!file.type.match('image.*')) {
                showError('Please select a valid image file (JPEG, PNG, etc.)');
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                showError('Image must be less than 5MB');
                return;
            }

            // Preview image
            const reader = new FileReader();
            reader.onload = function(event) {
                profileImagePreview.src = event.target.result;
                profilePictureInput.value = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Form Submission
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Disable button during submission
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving Profile...';

        try {
            // Validate required fields
            if (!usernameInput.value.trim()) {
                throw new Error('Username is required');
            }

            if (!birthDateInput.value) {
                throw new Error('Birth date is required');
            }

            // Prepare form data
            const formData = new FormData();
            formData.append('username', usernameInput.value.trim());
            formData.append('birthDate', birthDateInput.value);
            formData.append('bio', bioInput.value.trim());
            
            // Handle image data
            if (fileUpload.files[0]) {
                formData.append('profileImage', fileUpload.files[0]);
            } else if (profilePictureInput.value) {
                formData.append('profilePicture', profilePictureInput.value);
            }

            // Submit to server
            const response = await fetch('/createprofile', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to save profile');
            }

            // Redirect to social page on success
            window.location.href = '/social';
            
        } catch (error) {
            console.error('Profile submission error:', error);
            showError(error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Complete Profile';
        }
    });

    // Error display function
    function showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        
        // Remove existing error if any
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Insert after the form title
        const formTitle = document.querySelector('.section-title');
        formTitle.insertAdjacentElement('afterend', errorElement);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            errorElement.remove();
        }, 5000);
    }

    // Initialize date picker (optional enhancement)
    if (birthDateInput) {
        birthDateInput.max = new Date().toISOString().split('T')[0];
    }
});