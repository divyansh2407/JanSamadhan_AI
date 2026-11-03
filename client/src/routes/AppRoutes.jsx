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
import ReportEntryPage from '../pages/report/ReportEntryPage';
import ReportProblemForm from '../pages/report/ReportProblemForm';
import ReportConfirmation from '../pages/report/ReportConfirmation';
import TrackReportPage from '../pages/report/TrackReportPage';
import CityMapExplorerPage from '../pages/map/CityMapExplorerPage';
import AIAnalysisPreviewPage from '../pages/dashboards/AIAnalysisPreviewPage';
import GovernmentDashboard from '../pages/dashboards/GovernmentDashboard';
import CollaborationsPage from '../pages/collaborations/CollaborationsPage';
import CollaborationDetailPage from '../pages/collaborations/CollaborationDetailPage';
import ProposalsPage from '../pages/proposals/ProposalsPage';
import SubmitProposalPage from '../pages/proposals/SubmitProposalPage';
import AnalyticsDashboard from '../pages/analytics/AnalyticsDashboard';
import {
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
      <Route path="/map" element={<CityMapExplorerPage />} />

      {/* ── Civic Reporting & Tracking Routes (Stage 6) ─────────────────── */}
      <Route path="/report" element={<ReportEntryPage />} />
      <Route path="/report/submit" element={<ReportProblemForm />} />
      <Route path="/report/confirmation" element={<ReportConfirmation />} />
      <Route path="/track" element={<TrackReportPage />} />

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
        path="/government/ai-review/:problemId"
        element={
          <ProtectedRoute allowedRoles={['GOVERNMENT', 'SUPER_ADMIN']}>
            <AIAnalysisPreviewPage />
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

      {/* ── Multi-Stakeholder Collaboration Routes (Stage 11) ─────────── */}
      <Route
        path="/collaborations"
        element={
          <ProtectedRoute>
            <CollaborationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/collaborations/:id"
        element={
          <ProtectedRoute>
            <CollaborationDetailPage />
          </ProtectedRoute>
        }
      />

      {/* ── Solution Proposals & Implementation Routes (Stage 12) ─────── */}
      <Route
        path="/proposals"
        element={
          <ProtectedRoute>
            <ProposalsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/proposals/submit"
        element={
          <ProtectedRoute>
            <SubmitProposalPage />
          </ProtectedRoute>
        }
      />

      {/* ── City Analytics & Impact Dashboard (Stage 13) ──────────────── */}
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsDashboard />
          </ProtectedRoute>
        }
      />

      {/* ── Fallback ────────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

