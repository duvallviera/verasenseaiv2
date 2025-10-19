const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3002',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'VeriSense AI Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.get('/api', (req, res) => {
  res.json({ 
    message: 'VeriSense AI Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users'
    }
  });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }
    
    // Mock authentication (replace with real database logic)
    if (email === 'test@example.com' && password === 'password123') {
      const token = 'mock-jwt-token-' + Date.now();
      
      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: '1',
          name: 'Test User',
          email: email,
          role: 'user'
        }
      });
    } else {
      res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Name, email, and password are required' 
      });
    }
    
    // Mock registration (replace with real database logic)
    const token = 'mock-jwt-token-' + Date.now();
    
    res.json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: '2',
        name: name,
        email: email,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// User routes
app.get('/api/users/me', (req, res) => {
  // Mock user data (replace with real JWT verification)
  res.json({
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found' 
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 VeriSense AI Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API docs: http://localhost:${PORT}/api`);
});

module.exports = app;