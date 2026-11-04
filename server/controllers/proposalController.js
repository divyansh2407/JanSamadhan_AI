/**
 * JanSamadhan – Proposal Controller (Stage 12)
 * Solution proposals and implementation tasks.
 */

const { prisma } = require('../config/db');
const offlineStore = require('../config/offlineStore');

function isDbOffline(err) {
  return (
    err.code === 'P1001' ||
    (err.message && err.message.includes("Can't reach database server"))
  );
}

// GET /api/proposals
const listProposals = async (req, res) => {
  const { page = 1, limit = 20, status, problemId } = req.query || {};
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const where = {};
  if (status) where.status = status;
  if (problemId) where.problemId = problemId;

  try {
    const [proposals, total] = await Promise.all([
      prisma.solutionProposal.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          problem: { select: { id: true, title: true, city: true } },
          submitter: { select: { id: true, name: true, role: true } },
          organization: { select: { id: true, name: true } },
        },
      }),
      prisma.solutionProposal.count({ where }),
    ]);
    res.json({ success: true, data: { proposals, total } });
  } catch (err) {
    if (isDbOffline(err)) {
      const proposals = offlineStore.listProposals({ status, problemId });
      return res.json({ success: true, data: { proposals, total: proposals.length }, offline: true });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/proposals/:id
const getProposal = async (req, res) => {
  try {
    const proposal = await prisma.solutionProposal.findUnique({
      where: { id: req.params.id },
      include: {
        problem: true,
        submitter: { select: { id: true, name: true, role: true } },
        organization: true,
      },
    });
    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });
    res.json({ success: true, data: proposal });
  } catch (err) {
    if (isDbOffline(err)) {
      return res.status(503).json({ success: false, message: 'Database offline' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/proposals
const createProposal = async (req, res) => {
  const { problemId, title, description, proposedApproach, estimatedCost, estimatedDuration, organizationId } = req.body || {};

  if (!problemId || !title || !description || !proposedApproach) {
    return res.status(400).json({
      success: false,
      message: 'problemId, title, description, proposedApproach are required',
    });
  }

  try {
    const proposal = await prisma.solutionProposal.create({
      data: {
        problemId,
        submittedBy: req.user.id,
        title,
        description,
        proposedApproach,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
        estimatedDuration,
        organizationId,
        status: 'PROPOSED',
      },
    });
    res.status(201).json({ success: true, data: proposal });
  } catch (err) {
    if (isDbOffline(err)) {
      const proposal = offlineStore.createProposal({
        problemId,
        submittedBy: req.user?.id || 'usr-univ',
        title,
        description,
        proposedApproach,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
        estimatedDuration,
        organizationId,
        submitter: { id: req.user?.id, name: req.user?.name, role: req.user?.role },
      });
      return res.status(201).json({ success: true, data: proposal, offline: true });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/proposals/:id/status
const updateProposalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['PROPOSED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const updated = await prisma.solutionProposal.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    if (isDbOffline(err)) {
      const updated = offlineStore.updateProposalStatus(req.params.id, req.body?.status);
      return res.json({ success: true, data: updated, offline: true });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/proposals/tasks/list
const listTasks = async (req, res) => {
  try {
    const { problemId, status } = req.query;
    const where = {};
    if (problemId) where.problemId = problemId;
    if (status) where.status = status;

    const tasks = await prisma.implementationTask.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignee: { select: { id: true, name: true } },
        assignedDepartment: { select: { id: true, name: true } },
        evidences: true,
      },
    });
    res.json({ success: true, data: tasks });
  } catch (err) {
    if (isDbOffline(err)) {
      return res.json({ success: true, data: [], offline: true });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/proposals/tasks
const createTask = async (req, res) => {
  try {
    const { problemId, title, description, assignedTo, assignedDepartmentId, deadline, progress = 0 } = req.body;
    if (!problemId || !title || !description) {
      return res.status(400).json({ success: false, message: 'problemId, title, description required' });
    }
    const task = await prisma.implementationTask.create({
      data: {
        problemId,
        title,
        description,
        assignedTo,
        assignedDepartmentId,
        deadline: deadline ? new Date(deadline) : null,
        progress: parseInt(progress),
        status: 'PENDING',
      },
    });
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    if (isDbOffline(err)) {
      return res.status(503).json({ success: false, message: 'Database offline' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/proposals/tasks/:id
const updateTask = async (req, res) => {
  try {
    const { status, progress } = req.body;
    const data = {};
    if (status) data.status = status;
    if (progress !== undefined) data.progress = parseInt(progress);

    const updated = await prisma.implementationTask.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    if (isDbOffline(err)) {
      return res.status(503).json({ success: false, message: 'Database offline' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  listProposals,
  getProposal,
  createProposal,
  updateProposalStatus,
  listTasks,
  createTask,
  updateTask,
};
