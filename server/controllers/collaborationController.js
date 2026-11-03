/**
 * JanSamadhan – Collaboration Controller (Stage 11)
 */

const { prisma } = require('../config/db');

function isDbOffline(err) {
  return (
    err.code === 'P1001' ||
    (err.message && err.message.includes("Can't reach database server"))
  );
}

// GET /api/collaborations - List collaborations
const listCollaborations = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = status ? { status } : {};

    const [collaborations, total] = await Promise.all([
      prisma.collaboration.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          problem: { select: { id: true, title: true, status: true, city: true } },
          members: {
            include: { user: { select: { id: true, name: true, role: true } } },
          },
        },
      }),
      prisma.collaboration.count({ where }),
    ]);
    res.json({ success: true, data: { collaborations, total } });
  } catch (err) {
    if (isDbOffline(err)) {
      return res.json({ success: true, data: { collaborations: [], total: 0 }, offline: true });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/collaborations/:id
const getCollaboration = async (req, res) => {
  try {
    const collab = await prisma.collaboration.findUnique({
      where: { id: req.params.id },
      include: {
        problem: true,
        members: {
          include: {
            user: { select: { id: true, name: true, role: true } },
            organization: true,
          },
        },
      },
    });
    if (!collab) return res.status(404).json({ success: false, message: 'Collaboration not found' });
    res.json({ success: true, data: collab });
  } catch (err) {
    if (isDbOffline(err)) {
      return res.status(503).json({ success: false, message: 'Database offline' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/collaborations - Create collaboration (GOVERNMENT, SUPER_ADMIN)
const createCollaboration = async (req, res) => {
  try {
    const { problemId, organization, collaborationType, description } = req.body;
    if (!problemId || !organization || !collaborationType || !description) {
      return res.status(400).json({
        success: false,
        message: 'problemId, organization, collaborationType, description are required',
      });
    }
    const collab = await prisma.collaboration.create({
      data: { problemId, organization, collaborationType, description, status: 'INITIATED' },
    });
    res.status(201).json({ success: true, data: collab });
  } catch (err) {
    if (isDbOffline(err)) {
      return res.status(503).json({ success: false, message: 'Database offline' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/collaborations/:id/join - Join as member
const joinCollaboration = async (req, res) => {
  try {
    const { role = 'OBSERVER' } = req.body;
    const userId = req.user.id;

    const existing = await prisma.collaborationMember.findFirst({
      where: { collaborationId: req.params.id, userId },
    });
    if (existing) return res.status(409).json({ success: false, message: 'Already a member' });

    const member = await prisma.collaborationMember.create({
      data: { collaborationId: req.params.id, userId, role },
    });
    res.status(201).json({ success: true, data: member });
  } catch (err) {
    if (isDbOffline(err)) {
      return res.status(503).json({ success: false, message: 'Database offline' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/collaborations/:id/status
const updateCollaborationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['INITIATED', 'ACTIVE', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const updated = await prisma.collaboration.update({
      where: { id: req.params.id },
      data: { status },
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
  listCollaborations,
  getCollaboration,
  createCollaboration,
  joinCollaboration,
  updateCollaborationStatus,
};
