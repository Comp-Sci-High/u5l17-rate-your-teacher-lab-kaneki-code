const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const multer = require('multer');

const app = express();

// Database Connection
mongoose.connect('mongodb+srv://SE12:CSH2025@cluster0.pqx7f.mongodb.net/CSHteachers?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// User Schema (updated - no unique username constraint)
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  profilePicture: { type: String, default: '/images/default-profile.png' },
  birthDate: { type: String },
  bio: { type: String, default: '' },
  profileComplete: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Post Schema
const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
});

const Post = mongoose.model('Post', postSchema);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configure file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Routes
app.get('/', (req, res) => {
  res.render('login');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/createprofile', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  
  const user = await User.findById(req.session.userId);
  if (!user) {
    req.session.destroy();
    return res.redirect('/login');
  }
  res.render('createprofile', { user });
});

app.get('/social', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  
  const [user, posts] = await Promise.all([
    User.findById(req.session.userId),
    Post.find().populate('userId', 'username profilePicture')
      .populate('comments.userId', 'username profilePicture')
      .sort({ createdAt: -1 })
  ]);
  
  if (!user) {
    req.session.destroy();
    return res.redirect('/login');
  }
  res.render('social', { user, posts });
});

// Auth Endpoints
app.post('/signup', async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const user = new User({
      email: req.body.email,
      password: req.body.password
    });

    await user.save();
    req.session.userId = user._id;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    
    if (!user || user.password !== req.body.password) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    req.session.userId = user._id;
    res.json({ 
      success: true,
      redirect: user.profileComplete ? "/social" : "/createprofile"
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Profile Endpoints
app.post('/upload-profile-image', upload.single('profileImage'), async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const imagePath = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;
    
    await User.findByIdAndUpdate(req.session.userId, {
      profilePicture: imagePath
    });

    res.json({ success: true, imagePath });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile image" });
  }
});

app.post('/createprofile', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const { username, birthDate, bio } = req.body;
    
    await User.findByIdAndUpdate(req.session.userId, {
      username,
      birthDate,
      bio,
      profileComplete: true
    });

    res.json({ success: true, redirect: "/social" });
  } catch (error) {
    res.status(500).json({ error: "Profile creation failed" });
  }
});

// Post Endpoints
app.post('/posts', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    // Delete existing post by this user if it exists
    await Post.deleteMany({ userId: req.session.userId });
    
    const post = new Post({
      userId: req.session.userId,
      content: req.body.content
    });

    await post.save();
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ error: "Failed to create post" });
  }
});

app.post('/posts/:postId/comments', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = {
      userId: req.session.userId,
      content: req.body.content
    };

    post.comments.push(comment);
    await post.save();
    res.json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});