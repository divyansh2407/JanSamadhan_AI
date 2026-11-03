/**
 * JanSamadhan – Analytics Service (Client API)
 * Interacts with /api/analytics endpoints.
 */

import api from './api';

export const analyticsService = {
  async getOverview() {
    const res = await api.get('/analytics/overview');
    return res.data?.data || {
      totalProblems: 0,
      resolved: 0,
      inProgress: 0,
      pending: 0,
      resolutionRate: 0,
      totalUsers: 0,
      totalDepts: 0,
      totalCollabs: 0,
      totalProposals: 0,
    };
  },

  async getIssuesByCategory() {
    const res = await api.get('/analytics/issues/by-category');
    return res.data?.data || [];
  },

  async getIssuesByStatus() {
    const res = await api.get('/analytics/issues/by-status');
    return res.data?.data || [];
  },

  async getDepartmentPerformance() {
    const res = await api.get('/analytics/departments/performance');
    return res.data?.data || [];
  },

  async getCollaborationStats() {
    const res = await api.get('/analytics/collaborations');
    return res.data?.data || [];
  },

  async getProposalStats() {
    const res = await api.get('/analytics/proposals');
    return res.data?.data || [];
  },

  async getImpactMetrics() {
    const res = await api.get('/analytics/impact');
    return res.data?.data || {
      verifiedResolvedIssues: 0,
      citizenSatisfactionAvg: 0,
      totalFeedbacksSubmitted: 0,
      environmentalImpactScore: 0,
      civicEngagementIndex: 0,
    };
  },
};

export default analyticsService;
