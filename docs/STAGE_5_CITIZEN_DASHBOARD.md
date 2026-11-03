# JanSamadhan – Stage 5 Citizen Dashboard Documentation

**Document Reference:** `JSD-STAGE5-001`  
**Milestone:** Stage 5 – Master Citizen Dashboard Development  
**Status:** Completed & Verified (14 / 14 Automated Tests Passing; 58 / 58 Regression Tests Passing)  
**Classification:** Technical Documentation & Developer Runbook  

---

## 1. Overview & Objectives

In Stage 5, JanSamadhan introduces a dedicated, high-performance, mobile-responsive **Citizen Dashboard** designed for authenticated residents of Indian cities. The dashboard transitions JanSamadhan from static authentication into an active civic engagement platform where citizens can:
* Inspect live metrics on their personal civic reporting activity.
* View, search, and filter all their submitted complaints.
* Track the 7-step resolution progress timeline with official notes and timestamps.
* Receive in-app notifications and inspect real-time civic activity.
* Manage their personal profile and review their civic contribution scorecard.
* Access emergency municipal helplines (112, 1916, 1969) and FAQs.

---

## 2. Design System & Visual Philosophy

The Citizen Dashboard matches the government-tech / civic-tech aesthetic established in the Master PRD:
* **Background:** Clean White / Subtle Sage Background (`#F8FAF8`, `#FFFFFF`).
* **Primary Branding:** Deep Forest Green (`#16A34A`, `#166534`, `#E8F5EC`).
* **Text & Accents:** Main Text (`#172B20`), Secondary Text (`#647067`), Borders (`#E2E8E2`).
* **Cards & Shadows:** Rounded 24px and 32px corners, subtle borders, and smooth hover micro-interactions.
* **Iconography:** Lucide React icons representing categories, statuses, and municipal departments.

---

## 3. Frontend Architecture & Components Created

```
client/src/
├── components/citizen/
│   ├── StatsCard.jsx             # Metric summary card with loading skeleton
│   ├── StatusBadge.jsx           # Semantic badge (REPORTED, VERIFIED, IN PROGRESS, RESOLVED, etc.)
│   ├── StatusTimelineModal.jsx   # 7-step resolution lifecycle timeline modal with real timestamps
│   ├── ReportsTable.jsx          # Searchable, filterable, paginated table & mobile responsive cards
│   ├── ActivityStream.jsx        # Live chronological activity log of report status changes
│   ├── NotificationsModal.jsx    # Real-time notifications dialog with mark-as-read
│   ├── ProfileView.jsx           # Citizen profile management & civic contribution scorecard
│   ├── HelpSupportModal.jsx      # Municipal helplines (112, 1969, 1916) and citizen charter FAQ
│   └── PreReportNoticeModal.jsx  # Stage 6 geo-tagged intake roadmap explanation modal
├── pages/citizen/
│   └── CitizenDashboard.jsx      # Master coordinating dashboard page with sidebar & topbar
├── services/
│   └── citizenService.js         # Dedicated Axios API service layer for all citizen endpoints
└── routes/
    └── AppRoutes.jsx             # Role-protected route guard for /citizen/dashboard
```

### Component Details
1. **Sidebar Navigation:**
   * Desktop sticky sidebar + mobile slide-over drawer with backdrop blur.
   * Highlights active tab (`Dashboard`, `My Reports`, `Track Issues`, `Notifications`, `My Profile`, `Help & Support`, `Logout`).
2. **Top Navigation Bar:**
   * Dynamic breadcrumbs.
   * Search interface for citizen's own complaints.
   * Unread notifications badge counter.
   * Citizen avatar with interactive profile dropdown.
3. **Personalized Welcome Banner:**
   * Dynamically calculates time-of-day greeting (*"Good Morning / Afternoon / Evening, [Name]!"*).
   * Prominent **"Report a Civic Issue"** call-to-action button.
4. **Four Live Summary Cards:**
   * Total Reports
   * Pending Review
   * In Progress
   * Resolved Reports
5. **Interactive Reports Table:**
   * Desktop table view + mobile card view.
   * Search by keyword, address, or tracking ID.
   * Category and Status filters.
   * Pagination controls.
6. **Resolution Progress Timeline:**
   * Renders the 7-step lifecycle:
     `1. Report Submitted` $\rightarrow$ `2. Under Review` $\rightarrow$ `3. Field Verified` $\rightarrow$ `4. Department Assigned` $\rightarrow$ `5. Work in Progress` $\rightarrow$ `6. Work Resolved` $\rightarrow$ `7. Resolution Verified`.
   * Displays official remarks, field photo attachments, and rejection explanations where applicable.

---

## 4. Backend APIs Implemented

All citizen endpoints are mounted at `/api/citizen/*` in `server/routes/citizen.js` and protected with `authenticate` and `authorize('CITIZEN', 'SUPER_ADMIN')`:

| Method | Endpoint | Description | Security & IDOR Guard |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/citizen/dashboard` | Aggregated metrics, recent reports, activities, unread notification count | Strictly filtered by `reportedBy: req.user.id` |
| `GET` | `/api/citizen/reports` | Paginated, searchable, filterable list of citizen's own reports | Strictly excludes anonymous reports; only returns non-anonymous citizen issues |
| `GET` | `/api/citizen/reports/:id` | Full problem details with photographic evidence and status history | **IDOR Guard:** Rejects requests with 403 if `report.reportedBy !== req.user.id` |
| `GET` | `/api/citizen/activity` | Chronological activity stream of status changes on citizen's reports | Scoped to `problem.reportedBy: req.user.id` |
| `GET` | `/api/citizen/notifications` | Paginated notifications for citizen | Scoped to `recipientId: req.user.id` |
| `PATCH`| `/api/citizen/notifications/:id/read` | Marks notification as read | Verifies notification recipient ownership |
| `GET` | `/api/citizen/profile` | Citizen profile details, civic scorecard, and resolution rate | Scoped to `req.user.id` |

---

## 5. Security & Privacy Safeguards

1. **Insecure Direct Object Reference (IDOR) Prevention:**
   * A citizen can **never** inspect another citizen's complaint details or private notes. `getCitizenReportById` enforces:
     ```javascript
     if (report.reportedBy !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
       return res.status(403).json({ success: false, message: 'Access denied.' });
     }
     ```
2. **Anonymous Report Isolation:**
   * Anonymous reports have `reportedBy: null` and `isAnonymous: true`. They are strictly excluded from registered citizen dashboard feeds and must be tracked via the public tracking token portal.
3. **Role Lock:**
   * Public registration and profile updating strictly prevent role escalation. The role is read-only (`CITIZEN`).
4. **Password Scrubbing:**
   * Passwords and password hashes are never serialized into responses.

---

## 6. Automated Testing Verification

The dedicated test suite `server/test-stage5-suite.js` executes 14 automated tests covering:
1. `GET /api/citizen/dashboard` rejects unauthenticated requests with HTTP 401.
2. `GET /api/citizen/reports` rejects unauthenticated requests with HTTP 401.
3. `GET /api/citizen/profile` rejects unauthenticated requests with HTTP 401.
4. Non-citizen roles (`UNIVERSITY`, `EXPERT`) are rejected with HTTP 403 Forbidden.
5. Authenticated `CITIZEN` receives 200 OK with actual database statistics.
6. IDOR prevention protects reports against cross-citizen access.
7. Anonymous reports do not leak into registered citizen reports.
8. Notifications feed returns structured JSON envelope.
9. Activity stream returns chronological updates.
10. Citizen profile returns civic contribution scorecard.
11. `sanitizeUser` strictly scrubs `passwordHash` before transmission.
12. `SUPER_ADMIN` retains supervisory inspection access.

```
======================================================
  STAGE 5 TEST RESULTS: 14 / 14 TESTS PASSED (100%)
======================================================
```

All 58 regression tests in `server/test-stage4-suite.js` also continue to pass 100%.

---

## 7. Instructions to Run and Inspect the Citizen Dashboard

1. **Start Development Server:**
   ```bash
   cd JanSamadhan
   npm run dev
   ```
2. **Open in Browser:**
   * Application URL: `http://localhost:5173`
   * API Server: `http://localhost:5000`
3. **Accessing the Citizen Dashboard:**
   * Navigate to `http://localhost:5173/login`
   * Register or log in with any `CITIZEN` account
   * You will be redirected directly to `http://localhost:5173/citizen/dashboard`
   * Test the interactive tabs: **Dashboard**, **My Reports**, **My Profile**, **Notifications**, and **Help & Support**.

---

## 8. Known Limitations & Transition to Stage 6

* **Stage 6 Intake Pipeline:** The "Report a Civic Issue" button currently presents the Stage 6 roadmap notice modal. The full interactive Leaflet map pin placement, client-side EXIF stripping, and multi-photo upload pipeline will be implemented in **Stage 6: Registered and Anonymous Reporting Pipeline**.
