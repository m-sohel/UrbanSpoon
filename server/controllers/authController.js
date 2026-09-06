const User = require('../models/User');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, adminSecret } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a valid name' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Role assignment: restrict 'admin' unless verified or secret matches
    let assignedRole = 'user';
    if (role === 'admin') {
      const serverAdminSecret = process.env.ADMIN_SECRET || 'urbanspoon_admin_secret';
      if (adminSecret && adminSecret === serverAdminSecret) {
        assignedRole = 'admin';
      } else {
        // Fallback: If no admin secret is required for dev, allow or reject
        assignedRole = 'user';
      }
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: assignedRole,
    });

    const token = user.generateAuthToken();

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user and explicitly select password field
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Role verification: If logging in specifically as admin, verify permissions
    if (req.body.role === 'admin' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: This account does not possess administrator privileges',
      });
    }

    const token = user.generateAuthToken();


    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Seed default admin if none exists in MongoDB
 */
const seedDefaultAdmin = async () => {
  try {
    const adminEmail = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@urbanspoon.com').toLowerCase();
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const adminName = process.env.DEFAULT_ADMIN_NAME || 'Urban Admin';
      const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@UrbanSpoon2026';

      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });

      console.log(`[Urban Spoon Auth] ✅ Seeded default administrator account: ${adminEmail}`);
    } else {
      // Ensure role is admin
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
      }
    }
  } catch (err) {
    console.warn('[Urban Spoon Auth] Notice: Admin seeding skipped or database offline:', err.message);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  seedDefaultAdmin,
};
