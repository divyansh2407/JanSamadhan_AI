# JanSamadhan – Stage 13: Civic Analytics & Impact Measurement

## 1. Overview
Stage 13 introduces city-scale data visualization, municipal department efficiency metrics, resolution pipeline progression, and urban impact measurement.

## 2. Architecture & Components
- **Backend Controller**: `server/controllers/analyticsController.js`
- **REST Endpoints**: `server/routes/analytics.js` mounted at `/api/analytics`
- **Visualization Library**: Recharts
- **Client Service**: `client/src/services/analyticsService.js`
- **Frontend Dashboard**: `client/src/pages/analytics/AnalyticsDashboard.jsx`

## 3. Key Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/overview` | Total reports, resolution rate %, stakeholder counts |
| GET | `/api/analytics/issues/by-category` | Category distribution aggregated data |
| GET | `/api/analytics/issues/by-status` | Pipeline stage counts |
| GET | `/api/analytics/departments/performance` | Department workload & task counts |
| GET | `/api/analytics/collaborations` | Multi-stakeholder initiative distribution |
| GET | `/api/analytics/proposals` | Proposal status metrics |
| GET | `/api/analytics/impact` | Environmental score & citizen satisfaction ratings |

## 4. Automated Tests
- Test Suite: `server/test-stage13-suite.js` (10/10 tests passing)
