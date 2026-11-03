/**
 * JanSamadhan – Authentication Service
 * Communicates with backend authentication endpoints.
 */

import api from './api';

export const authService = {
  /**
   * Registers a new citizen account
   */
  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  /**
   * Authenticates user credentials
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Terminates session and clears cookie
   */
  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  /**
   * Fetches the current authenticated user's profile
   */
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
