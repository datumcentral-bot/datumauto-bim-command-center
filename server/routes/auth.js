const express = require('express');
const router = express.Router();

// Mock users database (in production, use hashed passwords)
const users = [
  {
    id: 1,
    username: 'director',
    email: 'director@datumauto.com',
    password: 'admin123',
    role: 'director',
    name: 'BIM Director',
    department: 'Management'
  },
  {
    id: 2,
    username: 'manager',
    email: 'manager@datumauto.com',
    password: 'manager123',
    role: 'manager',
    name: 'Project Manager',
    department: 'Management'
  },
  {
    id: 3,
    username: 'engineer',
    email: 'engineer@datumauto.com',
    password: 'engineer123',
    role: 'engineer',
    name: 'BIM Engineer',
    department: 'Engineering'
  },
  {
    id: 4,
    username: 'architect',
    email: 'architect@datumauto.com',
    password: 'architect123',
    role: 'architect',
    name: 'BIM Architect',
    department: 'Architecture'
  }
];

// Login endpoint
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`Login attempt: ${email}`);
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    const user = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === password
    );
    
    if (user) {
      // Remove password from session
      const { password, ...userWithoutPassword } = user;
      
      req.session.user = userWithoutPassword;
      req.session.save(err => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({
            success: false,
            error: 'Session error'
          });
        }
        
        console.log(`Login successful for: ${user.email} (${user.role})`);
        
        res.json({
          success: true,
          user: userWithoutPassword,
          message: 'Login successful'
        });
      });
    } else {
      console.log(`Login failed for: ${email}`);
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

// Check authentication status
router.get('/check', (req, res) => {
  if (req.session.user) {
    res.json({
      success: true,
      user: req.session.user,
      authenticated: true
    });
  } else {
    res.status(401).json({
      success: false,
      authenticated: false,
      error: 'Not authenticated'
    });
  }
});

// Get user profile
router.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated'
    });
  }
  
  res.json({
    success: true,
    user: req.session.user
  });
});

// Get all users (for team management)
router.get('/users', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated'
    });
  }
  
  // Only director and manager can see all users
  if (!['director', 'manager'].includes(req.session.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions'
    });
  }
  
  // Remove passwords from response
  const safeUsers = users.map(user => {
    const { password, ...safeUser } = user;
    return safeUser;
  });
  
  res.json({
    success: true,
    users: safeUsers
  });
});

module.exports = router;