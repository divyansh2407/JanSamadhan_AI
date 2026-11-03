/**
 * JanSamadhan – Government Service (Client API)
 * Interacts with /api/government endpoints for triage, verification, and assignment.
 */

import api from './api';

export const governmentService = {
  async getDashboardStats() {
    const res = await api.get('/government/dashboard');
    return res.data?.data || { total: 0, pending: 0, verified: 0, inProgress: 0, resolved: 0 };
  },

  async getVerificationQueue(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/government/queue?${query}`);
    return res.data?.data || { problems: [], total: 0 };
  },

  async getProblemDetail(id) {
    const res = await api.get(`/government/problems/${id}`);
    return res.data?.data;
  },

  async verifyProblem(id, { action, notes, rejectionReason }) {
    const res = await api.post(`/government/problems/${id}/verify`, {
      action,
      notes,
      rejectionReason,
    });
    return res.data;
  },

  async assignDepartment(id, { departmentId, assignmentNotes, priority, targetCompletionDate }) {
    const res = await api.post(`/government/problems/${id}/assign-department`, {
      departmentId,
      assignmentNotes,
      priority,
      targetCompletionDate,
    });
    return res.data;
  },

  async assignOfficer(id, { officerUserId, assignmentNotes, deadline }) {
    const res = await api.post(`/government/problems/${id}/assign-officer`, {
      officerUserId,
      assignmentNotes,
      deadline,
    });
    return res.data;
  },

  async addInternalNote(id, { noteText, isPublic }) {
    const res = await api.post(`/government/problems/${id}/notes`, { noteText, isPublic });
    return res.data;
  },

  async updateProblemStatus(id, { status, notes }) {
    const res = await api.post(`/government/problems/${id}/status`, { status, notes });
    return res.data;
  },

  async getDepartments() {
    const res = await api.get('/government/departments');
    return res.data?.data || [];
  },

  async getOfficers() {
    const res = await api.get('/government/officers');
    return res.data?.data || [];
  },

  async getAuditLogs(page = 1) {
    const res = await api.get(`/government/audit-logs?page=${page}`);
    return res.data?.data || { logs: [], total: 0 };
  },
};

export default governmentService;
