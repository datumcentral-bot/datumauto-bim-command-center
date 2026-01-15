const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Create data directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync(path.join(__dirname, '../data'))) {
  fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable for now to allow CDN
}));
app.use(compression());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Session configuration
app.use(session({
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: path.join(__dirname, '../data'),
    table: 'sessions'
  }),
  secret: process.env.SESSION_SECRET || 'datumauto-bim-secret-key-development',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: false, // Set to true in production with HTTPS
    httpOnly: true
  }
}));

// Import routes
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');

// Use routes
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);

// Authentication middleware for HTML routes
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  next();
};

// Serve HTML pages with authentication
app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  }
});

app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('/projects', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/projects.html'));
});

app.get('/project-create', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/project-create.html'));
});

app.get('/project-edit/:id', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/project-edit.html'));
});

app.get('/tasks', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/tasks.html'));
});

app.get('/team', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/team.html'));
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    session: req.session.user ? 'Authenticated' : 'Not authenticated'
  });
});

// 404 handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// 404 handler for pages
app.use('*', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`
    ┌─────────────────────────────────────────────────────┐
    │                                                     │
    │   🚀 DATUMAUTO BIM COMMAND CENTER                  │
    │                                                     │
    │   Server: http://localhost:${PORT}                 │
    │                                                     │
    │   Login: director@datumauto.com / admin123         │
    │                                                     │
    │   Features:                                        │
    │   ✅ Complete CRUD Operations                      │
    │   ✅ Projects Management                           │
    │   ✅ Tasks Management                              │
    │   ✅ Director Role Implementation                  │
    │                                                     │
    └─────────────────────────────────────────────────────┘
  `);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});