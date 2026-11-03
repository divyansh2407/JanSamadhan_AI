/**
 * JanSamadhan – Department Controller
 * Handles administrative government departments and municipal routing.
 */

const { prisma } = require('../config/db');

/**
 * @route   GET /api/departments
 * @desc    List all departments (filterable by city, state)
 * @access  Public (or Authenticated)
 */
const getDepartments = async (req, res, next) => {
  try {
    const { city, state, active } = req.query;

    const where = {};
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (state) where.state = { contains: state, mode: 'insensitive' };
    if (active !== undefined) where.isActive = active === 'true';

    const departments = await prisma.department.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { assignedProblems: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/departments/:id
 * @desc    Get department by ID
 * @access  Public (or Authenticated)
 */
const getDepartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            assignedProblems: true,
            implementationTasks: true,
          },
        },
      },
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: `Department with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      department,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/departments
 * @desc    Create a new department
 * @access  Private (SUPER_ADMIN, GOVERNMENT)
 */
const createDepartment = async (req, res, next) => {
  try {
    const {
      name,
      description,
      departmentCode,
      city,
      state,
      contactEmail,
      contactPhone,
    } = req.body;

    if (!name || !departmentCode || !city || !state || !contactEmail || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, departmentCode, city, state, contactEmail, and contactPhone',
      });
    }

    // Check for duplicate code
    const existing = await prisma.department.findUnique({
      where: { departmentCode: departmentCode.toUpperCase().trim() },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Department code '${departmentCode}' is already in use`,
      });
    }

    const newDepartment = await prisma.department.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        departmentCode: departmentCode.toUpperCase().trim(),
        city: city.trim(),
        state: state.trim(),
        contactEmail: contactEmail.toLowerCase().trim(),
        contactPhone: contactPhone.trim(),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Department registered successfully',
      department: newDepartment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/departments/:id
 * @desc    Update department details
 * @access  Private (SUPER_ADMIN, GOVERNMENT)
 */
const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      city,
      state,
      contactEmail,
      contactPhone,
      isActive,
    } = req.body;

    const department = await prisma.department.findUnique({ where: { id } });
    if (!department) {
      return res.status(404).json({
        success: false,
        message: `Department with ID ${id} not found`,
      });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (city) updateData.city = city.trim();
    if (state) updateData.state = state.trim();
    if (contactEmail) updateData.contactEmail = contactEmail.toLowerCase().trim();
    if (contactPhone) updateData.contactPhone = contactPhone.trim();
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await prisma.department.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      department: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
};
