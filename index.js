require('dotenv').config();
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
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Schemas
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

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
// Auth Routes
app.get('/', (req, res) => res.render('login'));
app.get('/login', (req, res) => res.render('login'));
app.get('/signup', (req, res) => res.render('login')); // Using same page with toggle

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    req.session.userId = user._id;
    res.json({ 
      success: true,
      redirect: user.profileComplete ? '/social' : '/createprofile'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

app.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (await User.findOne({ email })) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already in use' 
      });
    }

    const newUser = new User({ 
      email, 
      password,
      username: email.split('@')[0] // Default username
    });
    await newUser.save();

    req.session.userId = newUser._id;
    res.json({ 
      success: true,
      redirect: '/createprofile'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error during signup' 
    });
  }
});

// Profile Routes
app.get('/createprofile', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.redirect('/login');
    }
    res.render('createprofile', { user });
  } catch (error) {
    res.redirect('/login');
  }
});

app.post('/createprofile', upload.single('profileImage'), async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ 
      success: false, 
      error: "Session expired. Please login again." 
    });
  }

  try {
    const { username, birthDate, bio } = req.body;
    
    if (!username || !birthDate) {
      return res.status(400).json({
        success: false,
        error: "Username and birth date are required"
      });
    }

    const updateData = {
      username,
      birthDate,
      bio: bio || '',
      profileComplete: true
    };

    // Handle profile picture
    if (req.file) {
      updateData.profilePicture = `/uploads/${req.file.filename}`;
    } else if (req.body.profilePicture) {
      updateData.profilePicture = req.body.profilePicture;
    }

    await User.findByIdAndUpdate(req.session.userId, updateData);
    res.json({ success: true });

  } catch (error) {
    console.error('Profile completion error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error. Please try again later."
    });
  }
});

// Social Routes
app.get('/social', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  
  try {
    const [user, posts] = await Promise.all([
      User.findById(req.session.userId),
      Post.find()
        .populate('userId', 'username profilePicture')
        .populate('comments.userId', 'username profilePicture')
        .sort({ createdAt: -1 })
    ]);

    if (!user || !user.profileComplete) {
      return res.redirect('/createprofile');
    }

    res.render('social', { user, posts });
  } catch (error) {
    res.redirect('/login');
  }
});

// Post Routes
app.post('/posts', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
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

    post.comments.push({
      userId: req.session.userId,
      content: req.body.content
    });

    await post.save();
    res.json({ success: true, comment: post.comments[post.comments.length - 1] });
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error('Logout error:', err);
    res.redirect('/login');
  });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { error: err.message });
});

// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});