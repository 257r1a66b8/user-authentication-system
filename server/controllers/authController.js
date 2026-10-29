import User from '../models/User.js';
import { sendTokenCookie, clearTokenCookie } from '../utils/token.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @desc    Register a new user account
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email address, and password.'
      });
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.toLowerCase().trim();

    // 2. Validate input constraints
    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long.'
      });
    }

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    // 3. Prevent duplicate email registration
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // 4. Create user (password will be automatically hashed in pre-save hook)
    const newUser = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password,
      role: 'user'
    });

    // 5. Send signed JWT inside HttpOnly cookie and return safe user data
    return sendTokenCookie(
      res,
      newUser,
      201,
      'User registered successfully and logged in.'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & issue session cookie
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate presence of credentials
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Find user by email and explicitly include password hash
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    // Generic error message prevents account enumeration attacks
    const invalidAuthMessage = 'Invalid email or password.';

    if (!user) {
      return res.status(401).json({
        success: false,
        message: invalidAuthMessage
      });
    }

    // 3. Verify password hash using bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: invalidAuthMessage
      });
    }

    // 4. Set HttpOnly cookie and return safe user response
    return sendTokenCookie(res, user, 200, 'Login successful.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log out current user & clear session cookie
 * @route   POST /api/auth/logout
 * @access  Public / Authenticated
 */
export const logout = async (req, res, next) => {
  try {
    clearTokenCookie(res);
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private (Protected)
 */
export const getMe = async (req, res, next) => {
  try {
    // req.user was attached by authMiddleware
    return res.status(200).json({
      success: true,
      user: req.user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password for authenticated user
 * @route   POST /api/auth/change-password
 * @access  Private (Protected)
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 1. Validate input fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your current password and new password.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long.'
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password.'
      });
    }

    // 2. Fetch user with password field
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    // 3. Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    // 4. Update password (pre-save hook hashes password and sets passwordChangedAt)
    user.password = newPassword;
    await user.save();

    // 5. Issue a fresh session cookie signed with the updated timestamp
    return sendTokenCookie(
      res,
      user,
      200,
      'Password updated successfully.'
    );
  } catch (error) {
    next(error);
  }
};
