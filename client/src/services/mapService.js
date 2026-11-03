/**
 * JanSamadhan – Map & Location Service (Client API)
 * Interacts with /api/map and /api/location endpoints for geospatial
 * civic intelligence, nearby discovery, and reverse geocoding.
 */

import api from './api';

export const mapService = {
  /**
   * Fetch map-ready civic issue points with filters and bounding box
   */
  async getMapReports(filters = {}) {
    const params = new URLSearchParams();
    if (filters.bbox) params.append('bbox', filters.bbox);
    if (filters.city) params.append('city', filters.city);
    if (filters.wardId) params.append('wardId', filters.wardId);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.status) params.append('status', filters.status);
    if (filters.severity) params.append('severity', filters.severity);
    if (filters.verifiedOnly !== undefined) params.append('verifiedOnly', filters.verifiedOnly);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/map/reports?${params.toString()}`);
    return response.data?.data || [];
  },

  /**
   * Discover nearby civic issues sorted by distance from coordinates
   */
  async getNearbyReports(lat, lng, radius = 5, extraFilters = {}) {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
    });

    if (extraFilters.limit) params.append('limit', extraFilters.limit);
    if (extraFilters.categoryId) params.append('categoryId', extraFilters.categoryId);
    if (extraFilters.status) params.append('status', extraFilters.status);

    const response = await api.get(`/map/nearby?${params.toString()}`);
    return response.data || { count: 0, data: [] };
  },

  /**
   * Get ward-wise report distribution & concentration
   */
  async getWardStatistics(city = 'Pune') {
    const response = await api.get(`/map/wards?city=${encodeURIComponent(city)}`);
    return response.data?.data || [];
  },

  /**
   * Get city-wide mapping metrics summary
   */
  async getMapSummary(city = 'Pune') {
    const response = await api.get(`/map/summary?city=${encodeURIComponent(city)}`);
    return response.data?.data || null;
  },

  /**
   * Reverse geocode coordinates to approximate street / landmark
   */
  async reverseGeocode(lat, lng) {
    const response = await api.get(`/location/reverse-geocode?lat=${lat}&lng=${lng}`);
    return response.data?.data || null;
  },
};

export default mapService;

