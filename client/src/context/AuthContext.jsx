/**
 * JanSamadhan – Authentication Provider
 * Manages global user session and auth actions.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from './AuthContextInstance';
import authService from '../services/authService';
import { getDashboardForRole } from '../utils/roleUtils';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check existing session on mount
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const data = await authService.getMe();
      if (data?.success && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Login user
   */
  const login = async (credentials) => {
    setError(null);
    try {
      const data = await authService.login(credentials);
      if (data?.success && data?.user) {
        if (data.token) {
          localStorage.setItem('js_token', data.token);
        }
        setUser(data.user);
        return { success: true, user: data.user, redirectTo: getDashboardForRole(data.user.role) };
      }
      throw new Error(data?.message || 'Login failed');
    } catch (err) {
      const fieldError =
        err.response?.data?.errors?.[0]?.message ||
        (Array.isArray(err.response?.data?.errors)
          ? err.response?.data?.errors.map((e) => e.message || e).join(', ')
          : null);
      const message =
        fieldError ||
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please verify credentials.';
      setError(message);
      return { success: false, error: message };
    }
  };

  /**
   * Register citizen user
   */
  const register = async (formData) => {
    setError(null);
    try {
      const data = await authService.register(formData);
      if (data?.success && data?.user) {
        if (data.token) {
          localStorage.setItem('js_token', data.token);
        }
        setUser(data.user);
        return { success: true, user: data.user, redirectTo: getDashboardForRole(data.user.role) };
      }
      throw new Error(data?.message || 'Registration failed');
    } catch (err) {
      const fieldError =
        err.response?.data?.errors?.[0]?.message ||
        (Array.isArray(err.response?.data?.errors)
          ? err.response?.data?.errors.map((e) => e.message || e).join(', ')
          : null);
      const message =
        fieldError ||
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please try again.';
      setError(message);
      return { success: false, error: message };
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout request warning:', err.message);
    } finally {
      localStorage.removeItem('js_token');
      setUser(null);
      setError(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      checkAuth,
      getDashboardPath: (role) => getDashboardForRole(role || user?.role),
    }),
    [user, loading, error, checkAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
