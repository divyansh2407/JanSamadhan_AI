/**
 * JanSamadhan – Report Service
 * Handles category retrieval, image uploading, registered/anonymous report submission,
 * and secure report tracking.
 */

import api from './api';

export const reportService = {
  /**
   * Fetch all active problem categories
   */
  async getCategories() {
    const response = await api.get('/categories');
    return response.data?.data || [];
  },

  /**
   * Upload an evidence image
   * Strips EXIF and returns sanitized URL
   */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });

    return response.data?.data || null;
  },

  /**
   * Submit problem as an authenticated citizen
   */
  async submitRegisteredReport(problemData) {
    try {
      const response = await api.post('/reports', problemData);
      return response.data?.data || response.data;
    } catch (err) {
      // Fallback to /problems if /reports fails
      const fallbackRes = await api.post('/problems', problemData);
      return fallbackRes.data?.data || fallbackRes.data;
    }
  },

  /**
   * Get authenticated citizen's submitted reports
   */
  async getMyReports(params = {}) {
    const response = await api.get('/reports/my-reports', { params });
    return response.data?.data || response.data;
  },

  /**
   * Get report details by tracking ID
   */
  async getReportByTrackingId(trackingId) {
    const response = await api.get(`/reports/${encodeURIComponent(trackingId)}`);
    return response.data?.data || response.data;
  },

  /**
   * Get user dashboard overview stats
   */
  async getDashboardStats() {
    const response = await api.get('/dashboard/stats');
    return response.data?.data || response.data;
  },

  /**
   * Submit problem anonymously (zero PII, receives secret token once)
   */
  async submitAnonymousReport(reportData) {
    const response = await api.post('/public/reports', reportData);
    return response.data?.data || response.data;
  },

  /**
   * Track problem report status (works for both registered and anonymous)
   */
  async trackReport(trackingId, secretToken = '') {
    const trimmedId = trackingId.trim();
    const trimmedToken = secretToken ? secretToken.trim() : '';

    const headers = {};
    if (trimmedToken) {
      headers['X-Tracking-Token'] = trimmedToken;
    }

    const response = await api.post(
      '/public/reports/track',
      {
        trackingId: trimmedId,
        secretToken: trimmedToken,
      },
      { headers }
    );

    return response.data?.data || response.data;
  },
};

export default reportService;

