/**
 * JanSamadhan – Collaboration Service (Client API)
 * Interacts with /api/collaborations endpoints.
 */

import api from './api';

export const collaborationService = {
  async listCollaborations(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/collaborations?${query}`);
    return res.data?.data || { collaborations: [], total: 0 };
  },

  async getCollaboration(id) {
    const res = await api.get(`/collaborations/${id}`);
    return res.data?.data;
  },

  async createCollaboration(data) {
    const res = await api.post('/collaborations', data);
    return res.data?.data;
  },

  async joinCollaboration(id, role = 'RESEARCHER') {
    const res = await api.post(`/collaborations/${id}/join`, { role });
    return res.data?.data;
  },

  async updateStatus(id, status) {
    const res = await api.patch(`/collaborations/${id}/status`, { status });
    return res.data?.data;
  },
};

export default collaborationService;

