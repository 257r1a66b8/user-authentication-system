import User from '../models/User.js';

/**
 * @desc    Get user profile details
 * @route   GET /api/users/profile
 * @access  Private (Protected)
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    return res.status(200).json({
      success: true,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update permitted profile fields (e.g. name)
 * @route   PATCH /api/users/profile
 * @access  Private (Protected)
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, role, email, password } = req.body;

    // Security check: Block attempts to elevate privileges or tamper with protected fields
    if (role !== undefined) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You cannot modify your own account role.'
      });
    }

    if (password !== undefined) {
      return res.status(400).json({
        success: false,
        message: 'Password cannot be changed here. Please use the change-password endpoint.'
      });
    }

    if (email !== undefined) {
      return res.status(400).json({
        success: false,
        message: 'Email address cannot be modified via profile update.'
      });
    }

    // Validate name
    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid name.'
      });
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 50 characters long.'
      });
    }

    // Update only the permitted user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    user.name = trimmedName;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};
