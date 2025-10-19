const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

class AuthService {
  // Generate JWT token
  generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Register new user
  async register(userData) {
    const { email, password, name } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      name,
      role: 'user'
    });

    // Generate token
    const token = this.generateToken(user);

    return {
      success: true,
      message: 'User registered successfully',
      token,
      user: user.toJSON()
    };
  }

  // Login user
  async login(email, password) {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate token
    const token = this.generateToken(user);

    return {
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON()
    };
  }

  // Get user by ID
  async getUserById(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user.toJSON();
  }

  // Update user profile
  async updateProfile(userId, updateData) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Remove sensitive fields
    const { password, email, role, ...allowedUpdates } = updateData;
    
    await user.update(allowedUpdates);
    return user.toJSON();
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await user.validatePassword(currentPassword);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    await user.update({ password: newPassword });
    return { success: true, message: 'Password updated successfully' };
  }
}

module.exports = new AuthService();
