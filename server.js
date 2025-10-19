const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sequelize, testConnection } = require('./src/config/database');
const authService = require('./src/services/authService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3002',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://localhost:3002',
    'https://localhost:3000',
    'https://localhost:5173',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Handle preflight requests
app.options('*', cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'VeriSense AI Backend is running!',
    version: '1.0.0',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

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
    
    // Authenticate user with database
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ 
      error: error.message || 'Authentication failed' 
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
    
    // Register user in database
    const result = await authService.register({ name, email, password });
    res.status(201).json(result);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ 
      error: error.message || 'Registration failed' 
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

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync database models
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized successfully');
    
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 VeriSense AI Backend running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API docs: http://localhost:${PORT}/api`);
      console.log(`🗄️  Database: Connected and synchronized`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;