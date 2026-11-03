/**
 * JanSamadhan – Proposal & Implementation Service (Client API)
 * Interacts with /api/proposals endpoints.
 */

import api from './api';

export const proposalService = {
  async listProposals(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/proposals?${query}`);
    return res.data?.data || { proposals: [], total: 0 };
  },

  async getProposal(id) {
    const res = await api.get(`/proposals/${id}`);
    return res.data?.data;
  },

  async createProposal(data) {
    const res = await api.post('/proposals', data);
    return res.data?.data;
  },

  async updateStatus(id, status) {
    const res = await api.patch(`/proposals/${id}/status`, { status });
    return res.data?.data;
  },

  async listTasks(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/proposals/tasks/list?${query}`);
    return res.data?.data || [];
  },

  async createTask(data) {
    const res = await api.post('/proposals/tasks', data);
    return res.data?.data;
  },

  async updateTask(id, data) {
    const res = await api.patch(`/proposals/tasks/${id}`, data);
    return res.data?.data;
  },
};

export default proposalService;

