const express = require('express');
const jwt = require('jsonwebtoken');
const { Sequelize } = require('sequelize');
const { User } = require('../models');
const authenticateToken = require('../middleware/auth');
const { Op } = Sequelize;

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'client' } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, and password'
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: normalizedEmail },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }

    // Create user (password will be hashed by Sequelize hook)
    const user = await User.create({
      username,
      email: normalizedEmail,
      password, // Will be hashed by beforeCreate hook
      role
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Trim and normalize email
    const trimmedEmail = email.trim().toLowerCase();
    console.log('Login attempt for email:', trimmedEmail);

    // Find user by email
    const user = await User.findOne({
      where: { email: trimmedEmail }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password using instance method
    const isPasswordValid = await user.checkPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    let token;
    try {
      token = jwt.sign(
        { userId: user.id, username: user.username, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );
      console.log('JWT token generated successfully');
    } catch (jwtError) {
      console.error('JWT signing error:', jwtError);
      return res.status(500).json({
        success: false,
        message: 'Error generating authentication token',
        error: jwtError.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.errors.map(e => e.message).join(', ')
      });
    }
    
    // Handle Sequelize database errors
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Handle Sequelize connection errors
    if (error.name === 'SequelizeConnectionError') {
      return res.status(500).json({
        success: false,
        message: 'Database connection failed. Please check your database configuration.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Return detailed error in development
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Error during login' 
      : error.message || 'Error during login';

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV !== 'production' ? {
        message: error.message,
        name: error.name
      } : undefined
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user data without password
    const userData = user.toJSON();
    
    // Ensure new fields exist (set to null if column doesn't exist yet)
    if (!userData.hasOwnProperty('name')) userData.name = null;
    if (!userData.hasOwnProperty('address')) userData.address = null;
    if (!userData.hasOwnProperty('profile_pic')) userData.profile_pic = null;

    res.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile (name, address, profile_pic)
// @access  Private
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, address, profile_pic } = req.body;

    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update only provided fields (email cannot be changed)
    const updateData = {};
    if (name !== undefined && name !== null && name.trim() !== '') {
      updateData.name = name.trim();
    }
    if (address !== undefined && address !== null && address.trim() !== '') {
      updateData.address = address.trim();
    }
    if (profile_pic !== undefined) {
      if (profile_pic === '' || profile_pic === null) {
        // Allow clearing profile_pic by sending empty string
        updateData.profile_pic = null;
      } else if (profile_pic !== null) {
        updateData.profile_pic = profile_pic;
      }
    }

    // Only update if there's something to update
    if (Object.keys(updateData).length > 0) {
      await user.update(updateData);
    }

    // Fetch updated user (use reload to get latest data)
    await user.reload();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.errors.map(e => e.message).join(', ')
      });
    }
    
    // Handle Sequelize database errors (like missing columns)
    if (error.name === 'SequelizeDatabaseError') {
      console.error('Database error - possibly missing columns. Run: npm run add-profile-columns');
      return res.status(500).json({
        success: false,
        message: 'Database error. Please make sure all profile columns exist.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    // Return detailed error in development
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Error updating profile' 
      : error.message || 'Error updating profile';

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV !== 'production' ? {
        message: error.message,
        name: error.name
      } : undefined
    });
  }
});

module.exports = router;
