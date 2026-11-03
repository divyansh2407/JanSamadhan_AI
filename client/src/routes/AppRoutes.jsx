/**
 * JanSamadhan – Application Route Definitions
 * Configures public, authenticated, and role-protected routes.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import CitizenDashboard from '../pages/citizen/CitizenDashboard';
import {
  GovernmentDashboard,
  UniversityDashboard,
  ExpertDashboard,
  IndustryDashboard,
  AdminDashboard,
} from '../pages/dashboards/RoleDashboard';


export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Public Routes ───────────────────────────────────────────────── */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ── Protected Role Dashboards ───────────────────────────────────── */}
      <Route
        path="/citizen/dashboard"
        element={
          <ProtectedRoute allowedRoles={['CITIZEN', 'SUPER_ADMIN']}>
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/government/dashboard"
        element={
          <ProtectedRoute allowedRoles={['GOVERNMENT', 'SUPER_ADMIN']}>
            <GovernmentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/university/dashboard"
        element={
          <ProtectedRoute allowedRoles={['UNIVERSITY', 'SUPER_ADMIN']}>
            <UniversityDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/expert/dashboard"
        element={
          <ProtectedRoute allowedRoles={['EXPERT', 'SUPER_ADMIN']}>
            <ExpertDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/industry/dashboard"
        element={
          <ProtectedRoute allowedRoles={['INDUSTRY', 'SUPER_ADMIN']}>
            <IndustryDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ── Fallback ────────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

