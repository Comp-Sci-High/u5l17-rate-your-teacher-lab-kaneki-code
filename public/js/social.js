document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const createPostBtn = document.getElementById('createPostBtn');
    const createPostModal = document.getElementById('createPostModal');
    const closeModal = document.getElementById('closeModal');
    const postForm = document.getElementById('postForm');
    const postInput = document.getElementById('postInput');
    const postsContainer = document.getElementById('postsContainer');
    const commentsModal = document.getElementById('commentsModal');
    const commentsBody = document.getElementById('commentsBody');
    const commentInput = document.getElementById('commentInput');
    const themeToggle = document.getElementById('themeToggle');
    
    // Current user data from EJS
    const currentUser = {
        id: '<%= user._id %>',
        username: '<%= user.username %>',
        profilePicture: '<%= user.profilePicture %>'
    };
    
    // Sample data for other users (in a real app, this would come from your backend)
    const sampleUsers = [
        { id: 'user2', username: 'AlexJohnson', profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg' },
        { id: 'user3', username: 'SarahSmith', profilePicture: 'https://randomuser.me/api/portraits/women/44.jpg' }
    ];
    
    // Sample posts data (in a real app, this would come from your backend)
    let posts = [
        {
            id: 'post1',
            userId: 'user2',
            content: 'Just finished my final project! So excited to share it with everyone.',
            createdAt: new Date(Date.now() - 3600000),
            comments: [
                { userId: 'user3', content: 'Looks amazing! Great job!', createdAt: new Date(Date.now() - 1800000) }
            ]
        },
        {
            id: 'post2',
            userId: 'user3',
            content: 'Anyone want to study together for the upcoming exams?',
            createdAt: new Date(Date.now() - 7200000),
            comments: []
        }
    ];
    
    // Initialize the page
    function init() {
        renderAllPosts();
        setupEventListeners();
        checkThemePreference();
    }
    
    // Render all posts
    function renderAllPosts() {
        postsContainer.innerHTML = '';
        posts.forEach(post => {
            const user = post.userId === currentUser.id ? currentUser : 
                sampleUsers.find(u => u.id === post.userId) || currentUser;
            renderPost(post, user);
        });
    }
    
    // Render a single post
    function renderPost(post, user) {
        const postEl = document.createElement('div');
        postEl.className = 'post-card';
        postEl.dataset.postId = post.id;
        
        const timeAgo = getTimeAgo(post.createdAt);
        
        postEl.innerHTML = `
            <div class="post-header">
                <img src="${user.profilePicture}" alt="${user.username}" class="post-profile">
                <div>
                    <div class="post-user">${user.username}</div>
                    <div class="post-time">${timeAgo}</div>
                </div>
            </div>
            <div class="post-content">${post.content}</div>
            <div class="post-actions">
                <button class="action-btn like-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                    Like
                </button>
                <button class="action-btn comment-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                    Comment
                </button>
            </div>
        `;
        
        postsContainer.appendChild(postEl);
        
        // Add event listeners to the new post
        const commentBtn = postEl.querySelector('.comment-btn');
        commentBtn.addEventListener('click', () => openCommentsModal(post.id));
    }
    
    // Open create post modal
    function openCreatePostModal() {
        createPostModal.classList.add('active');
        postInput.focus();
    }
    
    // Close create post modal
    function closeCreatePostModal() {
        createPostModal.classList.remove('active');
        postForm.reset();
    }
    
    // Handle post submission
    function handlePostSubmit(e) {
        e.preventDefault();
        
        const content = postInput.value.trim();
        if (!content) return;
        
        // Create new post
        const newPost = {
            id: 'post' + Date.now(),
            userId: currentUser.id,
            content: content,
            createdAt: new Date(),
            comments: []
        };
        
        // In a real app, you would send this to your backend
        // For now, we'll add it to our local posts array
        posts = [newPost, ...posts]; // Add new post at the beginning
        
        // If user already has a post, remove the oldest one
        const userPosts = posts.filter(post => post.userId === currentUser.id);
        if (userPosts.length > 1) {
            // Find the oldest post by this user
            const oldestPost = userPosts.reduce((oldest, post) => {
                return post.createdAt < oldest.createdAt ? post : oldest;
            });
            
            // Remove it from the posts array
            posts = posts.filter(post => post.id !== oldestPost.id);
        }
        
        renderAllPosts();
        closeCreatePostModal();
    }
    
    // Open comments modal
    function openCommentsModal(postId) {
        const post = posts.find(p => p.id === postId);
        if (!post) return;
        
        const postUser = post.userId === currentUser.id ? currentUser : 
            sampleUsers.find(u => u.id === post.userId) || currentUser;
        
        // Clear previous comments
        commentsBody.innerHTML = '';
        
        // Add post content at the top
        const postHeader = document.createElement('div');
        postHeader.className = 'comment';
        postHeader.innerHTML = `
            <img src="${postUser.profilePicture}" alt="${postUser.username}" class="comment-profile">
            <div class="comment-content">
                <div class="comment-user">${postUser.username}</div>
                <div class="comment-text">${post.content}</div>
            </div>
        `;
        commentsBody.appendChild(postHeader);
        
        // Add all comments
        post.comments.forEach(comment => {
            const commentUser = comment.userId === currentUser.id ? currentUser : 
                sampleUsers.find(u => u.id === comment.userId) || currentUser;
            
            const timeAgo = getTimeAgo(comment.createdAt);
            
            const commentEl = document.createElement('div');
            commentEl.className = 'comment';
            commentEl.innerHTML = `
                <img src="${commentUser.profilePicture}" alt="${commentUser.username}" class="comment-profile">
                <div class="comment-content">
                    <div class="comment-user">${commentUser.username} <span style="color: var(--text-light); font-weight: normal;">• ${timeAgo}</span></div>
                    <div class="comment-text">${comment.content}</div>
                </div>
            `;
            commentsBody.appendChild(commentEl);
        });
        
        // Set up comment submission
        commentInput.onkeypress = function(e) {
            if (e.key === 'Enter' && this.value.trim()) {
                const newComment = {
                    userId: currentUser.id,
                    content: this.value.trim(),
                    createdAt: new Date()
                };
                
                // In a real app, you would send this to your backend
                post.comments.push(newComment);
                
                // Add the new comment to the modal
                const commentEl = document.createElement('div');
                commentEl.className = 'comment';
                commentEl.innerHTML = `
                    <img src="${currentUser.profilePicture}" alt="${currentUser.username}" class="comment-profile">
                    <div class="comment-content">
                        <div class="comment-user">${currentUser.username} <span style="color: var(--text-light); font-weight: normal;">• just now</span></div>
                        <div class="comment-text">${newComment.content}</div>
                    </div>
                `;
                commentsBody.appendChild(commentEl);
                
                // Scroll to bottom and clear input
                commentsBody.scrollTop = commentsBody.scrollHeight;
                this.value = '';
            }
        };
        
        commentsModal.classList.add('active');
        commentInput.focus();
    }
    
    // Close comments modal
    function closeCommentsModal() {
        commentsModal.classList.remove('active');
        commentInput.onkeypress = null;
    }
    
    // Toggle theme
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
    
    // Check user's theme preference
    function checkThemePreference() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    // Helper function to get time ago
    function getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) return interval + " year" + (interval === 1 ? "" : "s") + " ago";
        
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) return interval + " month" + (interval === 1 ? "" : "s") + " ago";
        
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) return interval + " day" + (interval === 1 ? "" : "s") + " ago";
        
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) return interval + " hour" + (interval === 1 ? "" : "s") + " ago";
        
        interval = Math.floor(seconds / 60);
        if (interval >= 1) return interval + " minute" + (interval === 1 ? "" : "s") + " ago";
        
        return "just now";
    }
    
    // Set up event listeners
    function setupEventListeners() {
        createPostBtn.addEventListener('click', openCreatePostModal);
        closeModal.addEventListener('click', closeCreatePostModal);
        postForm.addEventListener('submit', handlePostSubmit);
        
        // Close modals when clicking outside
        [createPostModal, commentsModal].forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    if (this === createPostModal) closeCreatePostModal();
                    else closeCommentsModal();
                }
            });
        });
        
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Initialize the app
    init();
});