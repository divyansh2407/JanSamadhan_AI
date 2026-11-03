/**
 * JanSamadhan – In-Memory Fallback Store
 * Used during local development and sandbox automated testing when
 * the local PostgreSQL database server is offline/unreachable.
 * Allows full end-to-end registration, authentication, problem reporting,
 * and dashboard tracking without throwing 503 connection errors.
 */

const crypto = require('crypto');

class OfflineStore {
  constructor() {
    this.users = new Map();
    this.problems = new Map();
    this.emailNotifications = [];
    this.problemStatusHistories = [];
    this.categories = [
      { id: 'cat-roads-01', name: 'Roads & Footpaths', icon: 'Construction', isActive: true },
      { id: 'cat-waste-02', name: 'Solid Waste & Sanitation', icon: 'Trash2', isActive: true },
      { id: 'cat-water-03', name: 'Water Supply & Drainage', icon: 'Droplets', isActive: true },
      { id: 'cat-street-04', name: 'Street Lighting & Electrical', icon: 'Lightbulb', isActive: true },
      { id: 'cat-traffic-05', name: 'Traffic & Signage', icon: 'Car', isActive: true },
    ];
  }

  // ── User Methods ──────────────────────────────────────────────────────────
  findUserByEmail(email) {
    if (!email) return null;
    return this.users.get(email.toLowerCase().trim()) || null;
  }

  findUserById(id) {
    for (const user of this.users.values()) {
      if (user.id === id) return user;
    }
    return null;
  }

  createUser(userData) {
    const id = userData.id || `usr-${crypto.randomUUID()}`;
    const user = {
      id,
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      phone: userData.phone || null,
      passwordHash: userData.passwordHash,
      role: userData.role || 'CITIZEN',
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      isVerified: userData.isVerified !== undefined ? userData.isVerified : false,
      createdAt: userData.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.email, user);
    return user;
  }

  // ── Problem Methods ───────────────────────────────────────────────────────
  createProblem(problemData) {
    const id = problemData.id || `prb-${crypto.randomUUID()}`;
    const trackingNumber = problemData.trackingNumber || problemData.trackingId;

    const categoryObj =
      this.categories.find(
        (c) => c.id === problemData.categoryId || c.name === problemData.category
      ) || { id: problemData.categoryId || 'cat-gen', name: problemData.category || 'Civic Infrastructure' };

    const problem = {
      id,
      trackingNumber,
      title: problemData.title,
      description: problemData.description,
      categoryId: categoryObj.id,
      category: categoryObj,
      reportedBy: problemData.reportedBy || null,
      isAnonymous: Boolean(problemData.isAnonymous),
      address: problemData.address || problemData.location,
      landmark: problemData.landmark || null,
      city: problemData.city || 'Pune',
      state: problemData.state || 'Maharashtra',
      pincode: problemData.pincode || '411001',
      latitude: problemData.latitude || null,
      longitude: problemData.longitude || null,
      severity: problemData.severity || 'MEDIUM',
      priority: problemData.priority || 'MEDIUM',
      status: problemData.status || 'SUBMITTED',
      isVerified: false,
      assignedDepartment: problemData.assignedDepartment || {
        id: 'dept-civic',
        name: 'Municipal Engineering Department',
        departmentCode: 'MUNICIPAL-ENG',
      },
      images: problemData.imageUrl
        ? [{ id: 'img-1', imageUrl: problemData.imageUrl, stage: 'INTAKE' }]
        : [],
      statusHistory: [
        {
          id: `hist-${Date.now()}`,
          problemId: id,
          fromStatus: 'SUBMITTED',
          toStatus: 'SUBMITTED',
          remarks: 'Complaint registered by citizen via JanSamadhan platform',
          createdAt: new Date(),
        },
      ],
      createdAt: problemData.createdAt || new Date(),
      updatedAt: new Date(),
    };

    this.problems.set(trackingNumber, problem);
    this.problems.set(id, problem);
    return problem;
  }

  findProblem(trackingOrId) {
    if (!trackingOrId) return null;
    return this.problems.get(trackingOrId) || null;
  }

  getUserProblems(userId, filters = {}) {
    const list = [];
    const seen = new Set();

    for (const prob of this.problems.values()) {
      if (seen.has(prob.id)) continue;
      seen.add(prob.id);

      if (prob.reportedBy === userId && !prob.isAnonymous) {
        // Apply filters
        if (filters.status && prob.status !== filters.status.toUpperCase()) {
          continue;
        }
        if (filters.categoryId && prob.categoryId !== filters.categoryId) {
          continue;
        }
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const match =
            prob.trackingNumber?.toLowerCase().includes(q) ||
            prob.title?.toLowerCase().includes(q) ||
            prob.description?.toLowerCase().includes(q) ||
            prob.address?.toLowerCase().includes(q) ||
            prob.city?.toLowerCase().includes(q);
          if (!match) continue;
        }
        list.push(prob);
      }
    }

    // Sort
    const sortOrder = filters.order === 'asc' ? 1 : -1;
    list.sort((a, b) => (new Date(a.createdAt) - new Date(b.createdAt)) * sortOrder);

    return list;
  }

  getUserStats(userId) {
    let totalReports = 0;
    let pendingReports = 0;
    let underReviewReports = 0;
    let inProgressReports = 0;
    let resolvedReports = 0;

    const seen = new Set();
    for (const prob of this.problems.values()) {
      if (seen.has(prob.id)) continue;
      seen.add(prob.id);

      if (prob.reportedBy === userId && !prob.isAnonymous) {
        totalReports++;
        if (prob.status === 'SUBMITTED' || prob.status === 'ACKNOWLEDGED') pendingReports++;
        else if (prob.status === 'UNDER_REVIEW') underReviewReports++;
        else if (prob.status === 'IN_PROGRESS') inProgressReports++;
        else if (prob.status === 'RESOLVED') resolvedReports++;
      }
    }

    return {
      totalReports,
      pendingReports,
      underReviewReports,
      inProgressReports,
      resolvedReports,
    };
  }

  recordEmail(emailData) {
    const entry = {
      id: `email-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      ...emailData,
      createdAt: new Date(),
    };
    this.emailNotifications.push(entry);
    return entry;
  }

  clear() {
    this.users.clear();
    this.problems.clear();
    this.emailNotifications = [];
    this.problemStatusHistories = [];
  }
}

const offlineStore = new OfflineStore();
module.exports = offlineStore;
