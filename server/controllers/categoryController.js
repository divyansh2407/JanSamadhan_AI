/**
 * JanSamadhan – Category Controller
 * Handles civic problem taxonomy and classifications.
 */

const { prisma } = require('../config/db');

/**
 * @route   GET /api/categories
 * @desc    Get all active problem categories with problem counts
 * @access  Public
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.problemCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { problems: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/categories
 * @desc    Create a new problem category
 * @access  Private (SUPER_ADMIN)
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Category name must be at least 2 characters long',
      });
    }

    const trimmedName = name.trim();

    // Check duplicate
    const existing = await prisma.problemCategory.findUnique({
      where: { name: trimmedName },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Category '${trimmedName}' already exists`,
      });
    }

    const category = await prisma.problemCategory.create({
      data: {
        name: trimmedName,
        description: description?.trim(),
        icon: icon?.trim(),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
};

