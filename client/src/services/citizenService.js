/**
 * JanSamadhan – Citizen Service
 * Handles API interactions for authenticated citizen dashboard metrics,
 * complaints feed, single-report tracking timelines, activities, notifications, and profile.
 */

import api from './api';

const citizenService = {
  /**
   * Get aggregated citizen dashboard metrics, stats, recent reports, and notifications
   */
  async getDashboardSummary() {
    const response = await api.get('/citizen/dashboard');
    return response.data?.data || response.data;
  },

  /**
   * Get paginated, filtered list of citizen's own submitted reports
   */
  async getMyReports(params = {}) {
    const response = await api.get('/citizen/reports', { params });
    return response.data?.data || response.data;
  },

  /**
   * Get detailed problem report with chronological status history timeline
   */
  async getReportById(id) {
    const response = await api.get(`/citizen/reports/${id}`);
    return response.data?.data?.report || response.data?.report;
  },

  /**
   * Get chronological activity stream
   */
  async getActivityStream(params = {}) {
    const response = await api.get('/citizen/activity', { params });
    return response.data?.data || response.data;
  },

  /**
   * Get citizen notifications
   */
  async getNotifications(params = {}) {
    const response = await api.get('/citizen/notifications', { params });
    return response.data?.data || response.data;
  },

  /**
   * Mark a notification as read
   */
  async markNotificationAsRead(id) {
    const response = await api.patch(`/citizen/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Get citizen profile and civic contribution scorecard
   */
  async getProfile() {
    const response = await api.get('/citizen/profile');
    return response.data?.data?.profile || response.data?.profile;
  },

  /**
   * Update citizen personal profile information
   */
  async updateProfile(data) {
    const response = await api.patch('/users/me', data);
    return response.data?.data || response.data;
  },
};

export default citizenService;

