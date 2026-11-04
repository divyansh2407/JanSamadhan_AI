/**
 * JanSamadhan – Public Civic Problem Transparency Service
 * Calls public endpoints for the transparent homepage feed and problem inspection.
 */

import api from './api';

export const publicFeedService = {
  getFeed: async (params = {}) => {
    const res = await api.get('/public/civic-feed', { params });
    return res.data;
  },

  getProblemDetails: async (id) => {
    const res = await api.get(`/public/civic-feed/${id}`);
    return res.data;
  },
};

export default publicFeedService;

