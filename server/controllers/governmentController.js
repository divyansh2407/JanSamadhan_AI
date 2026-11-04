/**
 * JanSamadhan – Government Controller (Stages 9 & 10)
 * Handles government officer dashboard, verification queue,
 * problem verification, department/officer assignment, internal notes,
 * audit logs, and problem status updates.
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

// GET /api/government/dashboard - Dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const [total, pending, verified, inProgress, resolved] = await Promise.all([
      prisma.problem.count(),
      prisma.problem.count({ where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } } }),
      prisma.problem.count({ where: { isVerified: true } }),
      prisma.problem.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.problem.count({ where: { status: 'RESOLVED' } }),
    ]);
    res.json({ success: true, data: { total, pending, verified, inProgress, resolved } });
  } catch (err) {
    if (isDbOffline(err)) {
      const stats = offlineStore.getGovStats();
      return res.json({
        success: true,
        data: stats,
        offline: true,
      });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/government/queue - Problems pending verification
const getVerificationQueue = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, severity, category } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (status) where.status = status;
    else where.status = { in: ['SUBMITTED', 'UNDER_REVIEW', 'ACKNOWLEDGED'] };
    if (severity) where.severity = severity;
    if (category) where.categoryId = category;

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: [{ severity: 'desc' }, { createdAt: 'asc' }],
        include: {
          category: { select: { name: true, icon: true } },
          reporter: { select: { id: true, name: true, role: true } },
          aiAnalyses: {
            select: { summary: true, urgency: true, recommendedDepartment: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.problem.count({ where }),
    ]);
    res.json({
      success: true,
      data: { problems, total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    if (isDbOffline(err)) {
      const { page = 1, limit = 20, status, severity, category } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const allProblems = offlineStore.getGovQueue({ status, severity, category });
      const paged = allProblems.slice(skip, skip + parseInt(limit));
      return res.json({
        success: true,
        data: {
          problems: paged.map((p) => ({
            ...p,
            reporter: { id: p.reportedBy || 'citizen-demo', name: 'Citizen Reporter', role: 'CITIZEN' },
            aiAnalyses: [
              {
                summary: `${p.title} – Municipal inspection required. Estimated severity: ${p.severity}`,
                urgency: p.severity || 'MEDIUM',
                recommendedDepartment: p.assignedDepartment?.name || 'Public Works Department',
              },
            ],
          })),
          total: allProblems.length,
          page: parseInt(page),
          limit: parseInt(limit),
        },
        offline: true,
      });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/government/problems/:id - Problem detail with AI analysis
const getProblemDetail = async (req, res) => {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        reporter: { select: { id: true, name: true, role: true } },
        aiAnalyses: { orderBy: { createdAt: 'desc' }, take: 1 },
        verificationRecords: {
          include: { officer: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        departmentAssignments: {
          include: {
            department: true,
            assignedByUser: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        officerAssignments: {
          include: {
            officerUser: { select: { id: true, name: true } },
            assignedByUser: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        internalNotes: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        images: true,
      },
    });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    res.json({ success: true, data: problem });
  } catch (err) {
    if (isDbOffline(err)) {
      const prob = offlineStore.findProblem(req.params.id);
      if (prob) {
        return res.json({
          success: true,
          data: {
            ...prob,
            reporter: { id: prob.reportedBy || 'citizen-demo', name: 'Citizen Reporter', role: 'CITIZEN' },
            aiAnalyses: [
              {
                summary: `${prob.title} – Municipal inspection required. Estimated severity: ${prob.severity}`,
                urgency: prob.severity || 'MEDIUM',
                recommendedDepartment: prob.assignedDepartment?.name || 'Public Works Department',
              },
            ],
            verificationRecords: prob.isVerified
              ? [{ id: 'vr-1', isVerified: true, verifiedAt: new Date(), notes: 'Verified by Municipal Authority' }]
              : [],
            departmentAssignments: prob.assignedDepartment
              ? [{ id: 'da-1', department: prob.assignedDepartment, priority: prob.priority || 'NORMAL' }]
              : [],
            officerAssignments: [],
            internalNotes: [],
          },
          offline: true,
        });
      }
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/government/problems/:id/verify - Verify or reject a problem
const verifyProblem = async (req, res) => {
  try {
    const { action, notes, rejectionReason } = req.body;
    const officerId = req.user.id;
    const { id } = req.params;

    if (!['VERIFY', 'REJECT', 'REQUEST_INFO'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    const problem = await prisma.problem.findUnique({ where: { id } });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

    const fromStatus = problem.status;
    let toStatus, updateData = {};

    if (action === 'VERIFY') {
      toStatus = 'VERIFIED';
      updateData = {
        isVerified: true,
        status: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedByUserId: officerId,
      };
    } else if (action === 'REJECT') {
      toStatus = 'REJECTED';
      updateData = {
        status: 'REJECTED',
        rejectedAt: new Date(),
        rejectedByUserId: officerId,
        rejectionReason: rejectionReason || notes,
      };
    } else {
      toStatus = 'UNDER_REVIEW';
      updateData = { status: 'UNDER_REVIEW' };
    }

    const [updatedProblem] = await prisma.$transaction([
      prisma.problem.update({ where: { id }, data: updateData }),
      prisma.verificationRecord.create({
        data: { problemId: id, officerId, action, notes: notes || '', rejectionReason },
      }),
      prisma.problemStatusHistory.create({
        data: { problemId: id, fromStatus, toStatus, changedBy: officerId, remarks: notes },
      }),
      prisma.govAuditLog.create({
        data: {
          actorId: officerId,
          action: `PROBLEM_${action}`,
          problemId: id,
          metadata: { notes, rejectionReason },
        },
      }),
    ]);

    res.json({
      success: true,
      message: `Problem ${action.toLowerCase()}d successfully`,
      data: updatedProblem,
    });
  } catch (err) {
    if (isDbOffline(err)) {
      const verifiedProb = offlineStore.verifyGovProblem(
        req.params.id,
        req.user?.id,
        req.body?.notes,
        req.body?.action !== 'REJECT'
      );
      return res.json({
        success: true,
        message: `Problem ${req.body?.action?.toLowerCase() || 'verifie'}d successfully`,
        data: verifiedProb,
        offline: true,
      });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/government/problems/:id/assign-department
const assignDepartment = async (req, res) => {
  try {
    const { departmentId, assignmentNotes, priority, targetCompletionDate } = req.body;
    const { id } = req.params;
    const assignedByUserId = req.user.id;

    if (!departmentId) {
      return res.status(400).json({ success: false, message: 'departmentId is required' });
    }

    const problem = await prisma.problem.findUnique({ where: { id } });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

    const fromStatus = problem.status;
    const [updatedProblem] = await prisma.$transaction([
      prisma.problem.update({
        where: { id },
        data: { assignedDepartmentId: departmentId, status: 'ASSIGNED' },
      }),
      prisma.departmentAssignment.create({
        data: {
          problemId: id,
          departmentId,
          assignedByUserId,
          assignmentNotes,
          priority: priority || 'NORMAL',
          targetCompletionDate: targetCompletionDate ? new Date(targetCompletionDate) : null,
        },
      }),
      prisma.problemStatusHistory.create({
        data: {
          problemId: id,
          fromStatus,
          toStatus: 'ASSIGNED',
          changedBy: assignedByUserId,
          remarks: assignmentNotes,
        },
      }),
      prisma.govAuditLog.create({
        data: {
          actorId: assignedByUserId,
          action: 'DEPARTMENT_ASSIGNED',
          problemId: id,
          metadata: { departmentId, priority },
        },
      }),
    ]);

    res.json({ success: true, message: 'Department assigned', data: updatedProblem });
  } catch (err) {
    if (isDbOffline(err)) {
      const assigned = offlineStore.assignGovDepartment(
        req.params.id,
        req.body?.departmentId,
        req.body?.assignmentNotes,
        req.body?.priority
      );
      return res.json({
        success: true,
        message: 'Department assigned successfully',
        data: assigned,
        offline: true,
      });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/government/problems/:id/assign-officer
const assignOfficer = async (req, res) => {
  try {
    const { officerUserId, assignmentNotes, deadline } = req.body;
    const { id } = req.params;
    const assignedByUserId = req.user.id;

    if (!officerUserId) {
      return res.status(400).json({ success: false, message: 'officerUserId is required' });
    }

    const assignment = await prisma.officerAssignment.create({
      data: {
        problemId: id,
        officerUserId,
        assignedByUserId,
        assignmentNotes,
        deadline: deadline ? new Date(deadline) : null,
      },
    });
    await prisma.govAuditLog.create({
      data: {
        actorId: assignedByUserId,
        action: 'OFFICER_ASSIGNED',
        problemId: id,
        metadata: { officerUserId },
      },
    });

    res.json({ success: true, message: 'Officer assigned', data: assignment });
  } catch (err) {
    if (isDbOffline(err)) {
      return res.json({
        success: true,
        message: 'Officer assigned successfully',
        offline: true,
      });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/government/problems/:id/notes - Add internal note
const addInternalNote = async (req, res) => {
  try {
    const { noteText, isPublic = false } = req.body;
    const authorId = req.user.id;
    const { id } = req.params;

    if (!noteText) {
      return res.status(400).json({ success: false, message: 'noteText is required' });
    }

    const note = await prisma.internalNote.create({
      data: { problemId: id, authorId, noteText, isPublic },
    });
    res.json({ success: true, data: note });
  } catch (err) {
    if (isDbOffline(err)) {
      return res.json({
        success: true,
        data: { id: `note-${Date.now()}`, noteText: req.body?.noteText, createdAt: new Date() },
        offline: true,
      });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/government/departments - List all departments
const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: departments });
  } catch (err) {
    if (isDbOffline(err)) {
      return res.json({ success: true, data: offlineStore.departments, offline: true });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/government/officers - List government officers
const getOfficers = async (req, res) => {
  try {
    const officers = await prisma.user.findMany({
      where: { role: 'GOVERNMENT', isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        officerProfile: {
          select: { governmentRole: true, designation: true, departmentId: true },
        },
      },
    });
    res.json({ success: true, data: officers });
  } catch (err) {
    if (isDbOffline(err)) {
      return res.json({ success: true, data: offlineStore.officers, offline: true });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/government/audit-logs
const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      prisma.govAuditLog.findMany({
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          actor: { select: { id: true, name: true, role: true } },
          problem: { select: { id: true, title: true, trackingNumber: true } },
        },
      }),
      prisma.govAuditLog.count(),
    ]);
    res.json({ success: true, data: { logs, total } });
  } catch (err) {
    if (isDbOffline(err)) {
      return res.json({ success: true, data: { logs: [], total: 0 }, offline: true });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/government/problems/:id/status (Stage 10)
const updateProblemStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const { id } = req.params;
    const actorId = req.user.id;
    const validStatuses = ['IN_PROGRESS', 'RESOLVED', 'ACKNOWLEDGED', 'UNDER_REVIEW'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const problem = await prisma.problem.findUnique({ where: { id } });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

    const [updated] = await prisma.$transaction([
      prisma.problem.update({
        where: { id },
        data: {
          status,
          ...(status === 'RESOLVED'
            ? { resolvedAt: new Date(), resolvedByUserId: actorId, resolutionNotes: notes }
            : {}),
        },
      }),
      prisma.problemStatusHistory.create({
        data: {
          problemId: id,
          fromStatus: problem.status,
          toStatus: status,
          changedBy: actorId,
          remarks: notes,
        },
      }),
      prisma.govAuditLog.create({
        data: {
          actorId,
          action: 'STATUS_UPDATED',
          problemId: id,
          metadata: { from: problem.status, to: status },
        },
      }),
    ]);

    res.json({ success: true, message: 'Status updated', data: updated });
  } catch (err) {
    if (isDbOffline(err)) {
      const updated = offlineStore.updateGovProblemStatus(req.params.id, req.body?.status, req.body?.notes);
      return res.json({
        success: true,
        message: 'Status updated successfully',
        data: updated,
        offline: true,
      });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  getVerificationQueue,
  getProblemDetail,
  verifyProblem,
  assignDepartment,
  assignOfficer,
  addInternalNote,
  getDepartments,
  getOfficers,
  getAuditLogs,
  updateProblemStatus,
};
