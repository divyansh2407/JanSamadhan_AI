/**
 * JanSamadhan – Role Navigation Utilities
 * Maps user roles to designated dashboard URLs.
 */

export const ROLE_DASHBOARDS = {
  CITIZEN:     '/citizen/dashboard',
  GOVERNMENT:  '/government/dashboard',
  UNIVERSITY:  '/university/dashboard',
  EXPERT:      '/expert/dashboard',
  INDUSTRY:    '/industry/dashboard',
  SUPER_ADMIN: '/admin/dashboard',
};

export const getDashboardForRole = (role) => {
  return ROLE_DASHBOARDS[role] || '/citizen/dashboard';
};

