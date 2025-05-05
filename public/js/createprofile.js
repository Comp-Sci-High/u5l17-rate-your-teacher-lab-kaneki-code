document.addEventListener('DOMContentLoaded', function() {
    // Image Upload Functionality
    const profileImageContainer = document.getElementById('profileImageContainer');
    const profileImagePreview = document.getElementById('profileImagePreview');
    const fileUpload = document.getElementById('fileUpload');
    const uploadButton = document.getElementById('uploadButton');
    const profilePictureInput = document.getElementById('profilePicture');
    const profileForm = document.getElementById('profileForm');

    // Handle image upload
    profileImageContainer.addEventListener('click', () => fileUpload.click());
    uploadButton.addEventListener('click', (e) => {
        e.preventDefault();
        fileUpload.click();
    });

    fileUpload.addEventListener('change', async function() {
        if (!this.files || !this.files[0]) return;
        
        // Validate file size (max 5MB)
        if (this.files[0].size > 5 * 1024 * 1024) {
            alert('File size exceeds 5MB limit');
            return;
        }
        
        // Preview image
        const reader = new FileReader();
        reader.onload = (e) => {
            profileImagePreview.src = e.target.result;
        };
        reader.readAsDataURL(this.files[0]);
        
        // Upload to server
        const formData = new FormData();
        formData.append('profileImage', this.files[0]);
        
        try {
            uploadButton.innerHTML = 'Uploading...';
            uploadButton.disabled = true;
            
            const response = await fetch('/upload-profile-image', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                profilePictureInput.value = data.imagePath;
                uploadButton.innerHTML = 'Upload Complete';
                setTimeout(() => {
                    uploadButton.innerHTML = 'Change Photo';
                    uploadButton.disabled = false;
                }, 1500);
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert(error.message);
            uploadButton.innerHTML = 'Try Again';
            setTimeout(() => {
                uploadButton.innerHTML = 'Upload Photo';
                uploadButton.disabled = false;
            }, 1500);
        }
    });

    // Form submission - only check for profile picture
    profileForm.addEventListener('submit', function(e) {
        if (!profilePictureInput.value) {
            e.preventDefault();
            alert('Please upload a profile picture before submitting');
            profileImageContainer.style.borderColor = '#e53e3e';
            setTimeout(() => {
                profileImageContainer.style.borderColor = 'white';
            }, 1000);
        }
    });
});