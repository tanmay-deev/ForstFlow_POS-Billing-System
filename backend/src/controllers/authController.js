import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import Notification from '../models/Notification.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (!user.isActive) {
      res.status(401);
      throw new Error('Account has been deactivated');
    }

    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user (Admin only)
// @route   POST /api/auth/register
// @access  Private/Admin
export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    fullName,
    email,
    password,
    phone,
    role: role || 'staff',
  });

  if (user) {
    await Notification.create({
      title: 'New Employee',
      message: `A new employee account was created for ${user.fullName}.`,
      type: 'info',
      relatedEntity: `user_${user._id}`
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (user) {
    res.json({
      success: true,
      message: 'User fetched successfully',
      data: user,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Logout user / clear cookie (if using cookies)
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort('-createdAt');
  res.json({
    success: true,
    data: users
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.fullName = req.body.fullName || user.fullName;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.role = req.body.role || user.role;
    if (req.body.isActive !== undefined) {
      user.isActive = req.body.isActive;
    }
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive
      },
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.isActive = false;
    await user.save();

    await Notification.create({
      title: 'Employee Suspended',
      message: `Employee account for ${user.fullName} was suspended.`,
      type: 'alert',
      relatedEntity: `user_${user._id}`
    });

    res.json({
      success: true,
      message: 'User suspended successfully',
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
