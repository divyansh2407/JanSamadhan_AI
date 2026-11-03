/**
 * JanSamadhan – AI Analysis Service (Client API)
 * Interacts with /api/ai endpoints for Grok AI analysis retrieval,
 * re-analysis triggers, and officer verification actions.
 */

import api from './api';

export const aiService = {
  /**
   * Fetch latest AI analysis for a problem report
   */
  async getAnalysis(reportId) {
    const response = await api.get(`/ai/analysis/${reportId}`);
    return response.data?.data || null;
  },

  /**
   * Manually trigger or re-run Grok AI analysis
   */
  async triggerAnalysis(reportId, forceReanalyze = true) {
    const response = await api.post(`/ai/analyze/${reportId}`, { forceReanalyze });
    return response.data?.data || null;
  },

  /**
   * Fetch full AI analysis historical audit trail
   */
  async getAnalysisHistory(reportId) {
    const response = await api.get(`/ai/analysis/${reportId}/history`);
    return response.data?.data || { totalRuns: 0, history: [] };
  },

  /**
   * Officer human-in-the-loop review action (Accept, Edit, Reject)
   */
  async reviewAnalysis(analysisId, reviewData) {
    const response = await api.patch(`/ai/analysis/${analysisId}/review`, reviewData);
    return response.data?.data || null;
  },
};

export default aiService;

