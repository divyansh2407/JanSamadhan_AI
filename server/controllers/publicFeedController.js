/**
 * JanSamadhan – Public Civic Problem Transparency Controller
 * Provides sanitized, privacy-safe civic problem feeds, city KPIs,
 * category/location distributions, and verified resolution updates for the public homepage.
 */

const { prisma } = require('../config/db');
const offlineStore = require('../config/offlineStore');

function isDbOffline(err) {
  return (
    err.code === 'P1001' ||
    err.name?.includes('Prisma') ||
    (err.message && err.message.includes("Can't reach database server"))
  );
}

/**
 * Sanitize a problem object to ensure strict citizen privacy
 */
function sanitizePublicProblem(prob) {
  if (!prob) return null;

  return {
    id: prob.id,
    trackingNumber: prob.trackingNumber || `JS-${prob.id.slice(0, 8).toUpperCase()}`,
    title: prob.title,
    description: prob.description,
    category: prob.category ? {
      id: prob.category.id || prob.categoryId,
      name: prob.category.name || prob.category,
      icon: prob.category.icon || 'AlertCircle',
    } : { id: prob.categoryId || 'cat-gen', name: 'Civic Infrastructure', icon: 'AlertCircle' },
    // Approximate / Public Location (Never expose precise apartment/floor/private notes)
    location: {
      city: prob.city || 'Pune',
      state: prob.state || 'Maharashtra',
      pincode: prob.pincode ? prob.pincode.slice(0, 3) + 'XXX' : '411XXX',
      landmark: prob.landmark || null,
      area: prob.ward?.name || prob.city || 'Municipal Ward',
    },
    city: prob.city || 'Pune',
    status: prob.status || 'SUBMITTED',
    severity: prob.severity || 'MEDIUM',
    priority: prob.priority || 'NORMAL',
    isVerified: Boolean(prob.isVerified),
    createdAt: prob.createdAt,
    updatedAt: prob.updatedAt,
    images: (prob.images || []).map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      stage: img.stage,
      caption: img.caption,
    })),
    assignedDepartment: prob.assignedDepartment ? {
      name: prob.assignedDepartment.name,
      departmentCode: prob.assignedDepartment.departmentCode,
    } : null,
    resolutionNotes: prob.status === 'RESOLVED' ? (prob.resolutionNotes || 'Issue rectified by municipal task force.') : null,
    reporterAlias: prob.isAnonymous ? 'Anonymous Citizen' : 'Verified Resident',
    // Strictly omit: reporter.email, reporter.phone, reporter.passwordHash, full address
  };
}

/**
 * GET /api/public/civic-feed
 * Aggregated transparency KPIs + filterable public problem feed
 */
const getPublicFeed = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      category = '',
      city = '',
      status = '',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    try {
      // 1. Calculate platform-wide live statistics from PostgreSQL
      const [
        totalCount,
        verifiedCount,
        resolvedCount,
        inProgressCount,
        pendingCount,
      ] = await Promise.all([
        prisma.problem.count(),
        prisma.problem.count({ where: { isVerified: true } }),
        prisma.problem.count({ where: { status: 'RESOLVED' } }),
        prisma.problem.count({ where: { status: { in: ['IN_PROGRESS', 'ASSIGNED'] } } }),
        prisma.problem.count({ where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'ACKNOWLEDGED'] } } }),
      ]);

      // Category breakdown
      const categories = await prisma.problemCategory.findMany({
        where: { isActive: true },
        include: { _count: { select: { problems: true } } },
      });
      const categoryStats = categories.map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        count: c._count.problems,
      }));

      // Build filter
      const where = {};
      if (search.trim()) {
        where.OR = [
          { title: { contains: search.trim(), mode: 'insensitive' } },
          { description: { contains: search.trim(), mode: 'insensitive' } },
          { trackingNumber: { contains: search.trim(), mode: 'insensitive' } },
          { city: { contains: search.trim(), mode: 'insensitive' } },
        ];
      }
      if (category.trim()) {
        where.OR = [
          ...(where.OR || []),
          { categoryId: category.trim() },
          { category: { name: { contains: category.trim(), mode: 'insensitive' } } },
        ];
      }
      if (city.trim()) {
        where.city = { contains: city.trim(), mode: 'insensitive' };
      }
      if (status.trim() && status.toUpperCase() !== 'ALL') {
        where.status = status.toUpperCase();
      }

      const [filteredTotal, rawProblems] = await Promise.all([
        prisma.problem.count({ where }),
        prisma.problem.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
          include: {
            category: true,
            assignedDepartment: true,
            images: true,
            ward: true,
          },
        }),
      ]);

      // Recent updates
      const recentUpdatesRaw = await prisma.problemStatusHistory.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          problem: {
            select: { id: true, title: true, trackingNumber: true, city: true },
          },
        },
      });

      const recentUpdates = recentUpdatesRaw.map((u) => ({
        id: u.id,
        problemId: u.problemId,
        problemTitle: u.problem?.title || 'Civic Issue',
        trackingNumber: u.problem?.trackingNumber,
        city: u.problem?.city || 'Pune',
        fromStatus: u.fromStatus,
        toStatus: u.toStatus,
        remarks: u.remarks || 'Municipal status updated',
        timestamp: u.createdAt,
      }));

      return res.json({
        success: true,
        statistics: {
          total: totalCount,
          verified: verifiedCount,
          resolved: resolvedCount,
          inProgress: inProgressCount,
          pending: pendingCount,
        },
        categoryStats,
        recentUpdates,
        pagination: {
          total: filteredTotal,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(filteredTotal / limitNum) || 1,
        },
        problems: rawProblems.map(sanitizePublicProblem),
        offline: false,
      });
    } catch (dbErr) {
      if (!isDbOffline(dbErr)) throw dbErr;

      // Graceful In-Memory Fallback
      return getPublicFeedOffline(req, res, { pageNum, limitNum, search, category, city, status });
    }
  } catch (err) {
    console.error('Public feed error:', err);
    res.status(500).json({ success: false, message: 'Failed to load public civic feed.' });
  }
};

/**
 * In-memory fallback for public civic feed
 */
function getPublicFeedOffline(req, res, { pageNum, limitNum, search, category, city, status }) {
  const allProblems = Array.from(offlineStore.problems.values());
  const uniqueProblems = [];
  const seenIds = new Set();

  for (const prob of allProblems) {
    if (!seenIds.has(prob.id)) {
      seenIds.add(prob.id);
      uniqueProblems.push(prob);
    }
  }

  // Calculate live statistics
  const total = uniqueProblems.length;
  const verified = uniqueProblems.filter((p) => p.isVerified || p.status === 'VERIFIED').length;
  const resolved = uniqueProblems.filter((p) => p.status === 'RESOLVED').length;
  const inProgress = uniqueProblems.filter((p) => ['IN_PROGRESS', 'ASSIGNED'].includes(p.status)).length;
  const pending = uniqueProblems.filter((p) => ['SUBMITTED', 'UNDER_REVIEW', 'ACKNOWLEDGED'].includes(p.status)).length;

  // Category stats
  const catMap = new Map();
  offlineStore.categories.forEach((c) => catMap.set(c.name, { id: c.id, name: c.name, icon: c.icon, count: 0 }));
  uniqueProblems.forEach((p) => {
    const cName = p.category?.name || p.category || 'Roads and Potholes';
    if (catMap.has(cName)) {
      catMap.get(cName).count += 1;
    } else {
      catMap.set(cName, { id: p.categoryId || 'cat-gen', name: cName, icon: 'AlertCircle', count: 1 });
    }
  });

  // Apply filters
  let filtered = uniqueProblems;
  if (search.trim()) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title?.toLowerCase().includes(s) ||
        p.description?.toLowerCase().includes(s) ||
        p.trackingNumber?.toLowerCase().includes(s) ||
        p.city?.toLowerCase().includes(s)
    );
  }
  if (category.trim()) {
    const c = category.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.categoryId?.toLowerCase() === c ||
        (p.category?.name && p.category.name.toLowerCase().includes(c))
    );
  }
  if (city.trim()) {
    filtered = filtered.filter((p) => p.city?.toLowerCase().includes(city.toLowerCase()));
  }
  if (status.trim() && status.toUpperCase() !== 'ALL') {
    filtered = filtered.filter((p) => p.status === status.toUpperCase());
  }

  // Sort descending by date
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalFiltered = filtered.length;
  const skip = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(skip, skip + limitNum);

  // Recent updates
  const recentUpdates = [];
  uniqueProblems
    .slice(0, 8)
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .forEach((p) => {
      const lastHist = p.statusHistory?.[p.statusHistory.length - 1];
      recentUpdates.push({
        id: `upd-${p.id}`,
        problemId: p.id,
        problemTitle: p.title,
        trackingNumber: p.trackingNumber,
        city: p.city || 'Pune',
        fromStatus: lastHist?.fromStatus || 'SUBMITTED',
        toStatus: p.status,
        remarks: lastHist?.remarks || `Official status updated to ${p.status}`,
        timestamp: lastHist?.createdAt || p.updatedAt || p.createdAt,
      });
    });

  return res.json({
    success: true,
    statistics: {
      total,
      verified,
      resolved,
      inProgress,
      pending,
    },
    categoryStats: Array.from(catMap.values()),
    recentUpdates: recentUpdates.slice(0, 6),
    pagination: {
      total: totalFiltered,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalFiltered / limitNum) || 1,
    },
    problems: paginated.map(sanitizePublicProblem),
    offline: true,
  });
}

/**
 * GET /api/public/civic-feed/:id
 * Get full public transparency details for a problem
 */
const getPublicProblemDetails = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const problem = await prisma.problem.findFirst({
        where: {
          OR: [{ id }, { trackingNumber: id }],
        },
        include: {
          category: true,
          assignedDepartment: true,
          images: true,
          statusHistory: {
            orderBy: { createdAt: 'asc' },
          },
          _count: {
            select: { solutionProposals: true },
          },
        },
      });

      if (!problem) {
        return res.status(404).json({ success: false, message: 'Problem report not found.' });
      }

      const sanitized = sanitizePublicProblem(problem);
      sanitized.statusHistory = (problem.statusHistory || []).map((h) => ({
        id: h.id,
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        remarks: h.remarks || 'Status updated',
        actor: h.changedBy ? 'Municipal Authority' : 'System',
        createdAt: h.createdAt,
      }));
      sanitized.proposalsCount = problem._count?.solutionProposals || 0;

      return res.json({ success: true, problem: sanitized });
    } catch (dbErr) {
      if (!isDbOffline(dbErr)) throw dbErr;

      const prob = offlineStore.findProblem(id);
      if (!prob) {
        return res.status(404).json({ success: false, message: 'Problem report not found.' });
      }

      const sanitized = sanitizePublicProblem(prob);
      sanitized.statusHistory = (prob.statusHistory || []).map((h) => ({
        id: h.id,
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        remarks: h.remarks || 'Status updated',
        actor: 'Municipal Authority',
        createdAt: h.createdAt,
      }));
      sanitized.proposalsCount = 0;

      return res.json({ success: true, problem: sanitized, offline: true });
    }
  } catch (err) {
    console.error('Public problem details error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve problem details.' });
  }
};

module.exports = {
  getPublicFeed,
  getPublicProblemDetails,
};

