/**
 * JanSamadhan – Category Controller
 * Handles civic problem taxonomy and classifications.
 */

const { prisma } = require('../config/db');
const offlineStore = require('../config/offlineStore');

function isDbOffline(err) {
  return (
    !err ||
    err.code === 'P1001' ||
    err.name?.includes('Prisma') ||
    (err.message && err.message.includes("Can't reach database server"))
  );
}

/**
 * @route   GET /api/categories
 * @desc    Get all active problem categories with problem counts
 * @access  Public
 */
const getCategories = async (req, res, next) => {
  try {
    let categories = [];
    try {
      categories = await prisma.problemCategory.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { problems: true },
          },
        },
      });
    } catch (dbErr) {
      console.warn('⚠️ [Category Controller] Database unavailable, using standard municipal categories fallback');
      categories = offlineStore.categories;
    }

    // If database returned 0 categories (e.g. unseeded), fallback to defaults
    if (!categories || categories.length === 0) {
      categories = offlineStore.categories;
    }

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
      categories,
    });
  } catch (error) {
    // Ultimate safety fallback: never fail category retrieval
    return res.status(200).json({
      success: true,
      count: offlineStore.categories.length,
      data: offlineStore.categories,
      categories: offlineStore.categories,
    });
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
    if (isDbOffline(error)) {
      const trimmedName = req.body.name?.trim();
      const newCat = {
        id: `cat-${Date.now()}`,
        name: trimmedName,
        description: req.body.description?.trim() || '',
        icon: req.body.icon?.trim() || 'HelpCircle',
        isActive: true,
      };
      offlineStore.categories.push(newCat);
      return res.status(201).json({
        success: true,
        offline: true,
        message: 'Category created successfully (offline cache)',
        category: newCat,
      });
    }
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
};

