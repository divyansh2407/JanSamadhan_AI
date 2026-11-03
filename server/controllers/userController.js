/**
 * JanSamadhan – User Management Controller
 * Handles profile retrieval and profile updates using Prisma.
 */

const { prisma } = require('../config/db');
const { sanitizeUser } = require('../middleware/auth');
const { validatePhone } = require('../utils/validators');

/**
 * @route   GET /api/users/me
 * @desc    Get currently authenticated user's profile with stats
 * @access  Private
 */
const getMyProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        _count: {
          select: {
            reportedProblems: true,
            solutionProposals: true,
            assignedTasks: true,
            feedbacks: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: sanitizeUser(user),
      stats: user._count,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/users/:id
 * @desc    Get user profile by ID (Public view / Administrative view)
 * @access  Private
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            reportedProblems: true,
            solutionProposals: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${id} not found`,
      });
    }

    // For non-admin, non-self requests, return public representation
    const isSelfOrAdmin = req.user.id === user.id || req.user.role === 'SUPER_ADMIN';

    const safeUser = sanitizeUser(user);

    if (!isSelfOrAdmin) {
      delete safeUser.phone;
      delete safeUser.isActive;
    }

    res.status(200).json({
      success: true,
      user: safeUser,
      stats: user._count,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/users/me
 * @desc    Update current user's profile (name, phone)
 * @access  Private
 * @note    SECURITY: Roles, email, and password cannot be altered through this endpoint.
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const updateData = {};

    if (name) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Full name must be at least 2 characters long',
        });
      }
      updateData.name = name.trim();
    }

    if (phone) {
      if (!validatePhone(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid phone number',
        });
      }
      updateData.phone = phone.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update (allowed: name, phone)',
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: sanitizeUser(updatedUser),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  getUserById,
  updateMyProfile,
};

