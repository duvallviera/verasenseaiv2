import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Mock user database (in a real app, this would be in a database)
const users = [
  {
    id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123', // In a real app, this would be hashed
    role: 'admin',
    faceVector: 'mock-face-vector-data' // This would be actual face embedding data
  }
];

// Login route - email/password authentication
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Find user by email
  const user = users.find(u => u.email === email);
  
  // Check if user exists and password matches
  if (!user || user.password !== password) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid email or password' 
    });
  }
  
  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1d' }
  );
  
  // Return user data and token
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  });
});

// Face login route
router.post('/face-login', (req, res) => {
  console.log('Face login endpoint called');
  const { faceImage } = req.body;
  
  // Validate face image data
  if (!faceImage || typeof faceImage !== 'string') {
    console.error('Invalid face image data:', { 
      received: faceImage ? 'data (but wrong type)' : 'null or undefined',
      type: typeof faceImage 
    });
    return res.status(400).json({
      success: false,
      message: 'Invalid face image data'
    });
  }

  // Log data length to verify we're receiving the complete image
  console.log(`Received face image data: ${faceImage.length} characters`);
  console.log(`Data starts with: ${faceImage.substring(0, 30)}...`);
  
  try {
    console.log('Processing face login request...');
    // In a production app, you would:
    // 1. Extract face embedding from the image using face-api.js or similar
    // 2. Compare with stored face embeddings in the database
    // 3. Find the closest match and validate if it's above a threshold
    
    // For demo purposes, we'll simulate a successful match
    const user = users[0];
    console.log(`Matched user: ${user.name} (${user.email})`);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );
    
    console.log('Face login successful, returning user data and token');
    // Return user data and token
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Face login processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing face login'
    });
  }
});

// Register new user
router.post('/register', (req, res) => {
  const { name, email, password, faceVector } = req.body;
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ 
      success: false, 
      message: 'User already exists with this email' 
    });
  }
  
  // Create new user
  const newUser = {
    id: `user${Date.now()}`,
    name,
    email,
    password, // In a real app, this would be hashed
    role: 'user',
    faceVector
  };
  
  // Add to mock database
  users.push(newUser);
  
  // Generate JWT token
  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1d' }
  );
  
  // Return user data and token
  res.status(201).json({
    success: true,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    },
    token
  });
});

// Face verification route
router.post('/face-verify', (req, res) => {
  const { faceImage } = req.body;
  
  // Validate face image data
  if (!faceImage || typeof faceImage !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid face image data'
    });
  }
  
  try {
    // In a production app, you would:
    // 1. Extract face embedding from the image using face-api.js
    // 2. Compare with the user's stored face embedding
    // 3. Return a similarity score or verification result
    
    // For demo purposes, we'll simulate a successful verification
    const verificationResult = {
      verified: true,
      confidence: 0.95,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      result: verificationResult
    });
  } catch (error) {
    console.error('Face verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing face verification'
    });
  }
});

// Get current user profile
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Find user by id (from token)
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Return user profile data
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
});

// Verify token route
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    res.json({
      success: true,
      user: decoded
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
});

export default router;
