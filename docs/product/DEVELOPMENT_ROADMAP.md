# JanSamadhan – Master 18-Stage Engineering Development Roadmap

**Document Reference:** `JSD-RD-001`  
**Version:** `1.0.0`  
**Classification:** Single Source of Truth (SSOT)  
**Document Owner:** JanSamadhan Technical Program Management (TPM) Group  

---

## 1. Roadmap Architecture & Staging Strategy

The JanSamadhan platform roadmap is decomposed into **18 sequential, testable stages** (Stage 0 to Stage 17). Each stage has well-defined objectives, features, deliverables, acceptance criteria, and Git commit guidelines.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        18 DEVELOPMENT STAGES                           │
├─────────────────────┬─────────────────────┬────────────────────────────┤
│ Stage 0: PRD & SDD  │ Stage 6: Reporting  │ Stage 12: Proposals/Tasks  │
│ Stage 1: Scaffold   │ Stage 7: Grok AI    │ Stage 13: Analytics Engine │
│ Stage 2: Landing    │ Stage 8: GIS Maps   │ Stage 14: Notifications    │
│ Stage 3: Auth/RBAC  │ Stage 9: Govt Board │ Stage 15: Security/QA      │
│ Stage 4: PostgreSQL │ Stage 10: Triage    │ Stage 16: Municipal Pilot  │
│ Stage 5: Citizen Hub│ Stage 11: Collab    │ Stage 17: Multi-City Scale │
└─────────────────────┴─────────────────────┴────────────────────────────┘
```

---

## 2. Stage-by-Stage Specifications

### Stage 0: Product Planning & Master Architecture
* **Status:** Completed ✅
* **Objectives:** Formulate the Master PRD, System Design Document, Data Model, API Specification, and Security Directives as the single source of truth.
* **Deliverables:** Complete `docs/product/` suite containing 9 comprehensive architecture documents.
* **Acceptance Criteria:** Zero contradictory architectural requirements across all modules.
* **Git Commit Requirement:** `docs: Master PRD, SDD and complete technical documentation suite`

---

### Stage 1: Project Foundation, Monorepo & Baseline Setup
* **Status:** Completed ✅
* **Objectives:** Establish clean monorepo architecture (`client/`, `server/`, `docs/`) with root script orchestration.
* **Deliverables:** Working Express `/api/health` endpoint, clean Vite React setup, and `package.json` with `concurrently`.
* **Acceptance Criteria:** `npm run dev` boots both frontend and backend concurrently without port collisions.
* **Git Commit Requirement:** `feat: Stage 1 - Project foundation, architecture, and folder structure`

---

### Stage 2: Landing Page & Gov-Tech Design System
* **Status:** Completed ✅
* **Objectives:** Deliver a premium, accessible, responsive public landing page matching Indian Gov-Tech design tokens.
* **Deliverables:** Responsive Navbar, Hero, 6 Problem Categories, 5-Step Workflow timeline, Stakeholder Showcase, Impact Counter, and Footer.
* **Acceptance Criteria:** WCAG contrast compliance, responsive down to $360\text{ px}$, zero broken layout elements.
* **Git Commit Requirement:** `feat: Stage 2 - Professional Landing Page & Design System`

---

### Stage 3: Authentication & Role-Based Access Control (RBAC)
* **Status:** Completed ✅
* **Objectives:** Build full-stack secure authentication and role isolation across 6 roles.
* **Deliverables:** Registration page (CITIZEN only), Login page with role routing, `HttpOnly` cookie handling, bcrypt hashing, and route guard components.
* **Acceptance Criteria:** Public registration rejects role spoofing; unauthorized route access redirects cleanly to `/login`.
* **Git Commit Requirement:** `feat: Stage 3 - Complete Authentication System & Role-Based Access Control`

---

### Stage 4: PostgreSQL Database Architecture & Core Backend APIs
* **Status:** Completed ✅
* **Objectives:** Implement enterprise PostgreSQL schema via Prisma ORM and core REST APIs for Users, Departments, Categories, and Problems.
* **Deliverables:** `schema.prisma` with 11 relational models and 7 enums, migrations, `/api/users`, `/api/departments`, `/api/categories`, and `/api/problems`.
* **Acceptance Criteria:** Full database migrations execute cleanly; seeded data returns via REST endpoints with standard JSON envelopes.
* **Git Commit Requirement:** `feat: Stage 4 - PostgreSQL Database Architecture & Core Backend APIs`

---

### Stage 5: Citizen Dashboard & Community Interaction
* **Status:** Next Up ⏳
* **Objectives:** Develop the interactive citizen portal for tracking personal complaints and engaging with local civic issues.
* **Features:**
  * Personal report tracking cards with status progress timeline.
  * Community feed displaying active ward issues.
  * Upvote mechanism to boost civic priority.
  * Citizen reputation badge and impact counter.
* **Dependencies:** Stages 3 & 4.
* **Deliverables:** `CitizenDashboard.jsx`, `CommunityFeed.jsx`, `ProblemCard.jsx`, `/api/citizens/*` endpoints.
* **Acceptance Criteria:** Citizen can see only their submitted tickets in "My Reports" and upvote community tickets once.
* **Git Commit Requirement:** `feat: Stage 5 - Citizen Dashboard, My Reports and Community Upvoting`

---

### Stage 6: Registered & Anonymous Reporting Pipeline
* **Objectives:** Build full-featured multi-photo, location-tagged complaint submission pipeline for both authenticated citizens and anonymous reporters.
* **Features:**
  * Client-side EXIF metadata stripping for anonymous uploads.
  * Secure Tracking ID (`TRK-YYYY-XXXXXX`) and $256\text{-bit}$ secret token generator.
  * Unauthenticated `/track` portal validating token hashes.
  * Rate-limited anonymous submission endpoint.
* **Dependencies:** Stage 5.
* **Deliverables:** `ReportProblem.jsx`, `AnonymousReport.jsx`, `TrackReport.jsx`, `/api/public/reports/*`.
* **Acceptance Criteria:** Submitting anonymously returns a secret token; checking status with invalid token returns 401; zero PII stored.
* **Git Commit Requirement:** `feat: Stage 6 - Registered & Anonymous Civic Reporting Pipeline`

---

### Stage 7: Grok AI Integration & Civic Intelligence Engine
* **Objectives:** Integrate xAI Grok API for automated problem categorization, summarization, severity recommendation, and deduplication assistance.
* **Features:**
  * Asynchronous background analysis queue.
  * Strict JSON schema response parsing via Zod.
  * Circuit breaker with exponential backoff and rule-based fallback.
  * Human-in-the-loop recommendation display on authority screens.
* **Dependencies:** Stage 6.
* **Deliverables:** `grokAiService.js`, `AIAnalysis` table integration, AI badge components in UI.
* **Acceptance Criteria:** AI recommendations populate without blocking report intake; AI failure gracefully falls back to deterministic tags.
* **Git Commit Requirement:** `feat: Stage 7 - Grok AI Intelligence Integration & Safeguards`

---

### Stage 8: Location, Mapping & Spatial Analytics (Leaflet + OpenStreetMap)
* **Objectives:** Deliver open-source GIS visualization for civic issues and municipal boundaries.
* **Features:**
  * Interactive Leaflet map with custom category markers.
  * Marker clustering for dense areas.
  * Ward boundary polygon overlays.
  * Reverse geocoding via OpenStreetMap Nominatim.
* **Dependencies:** Stage 6.
* **Deliverables:** `CivicMap.jsx`, `WardBoundaryOverlay.jsx`, GIS API helpers.
* **Acceptance Criteria:** Map renders smooth pan/zoom on mobile; pins accurately reflect latitude/longitude of problems.
* **Git Commit Requirement:** `feat: Stage 8 - Spatial Mapping with Leaflet & OpenStreetMap`

---

### Stage 9: Government Authority Dashboard & Triage Interface
* **Objectives:** Provide a command-and-control Kanban triage center for municipal ward engineers.
* **Features:**
  * Inbound complaint queue with SLA countdown badges.
  * Grok AI recommendation inspector (one-click accept/override).
  * Filter by category, ward, severity, and status.
* **Dependencies:** Stages 4, 7, 8.
* **Deliverables:** `GovDashboard.jsx`, `TriageKanban.jsx`, `SLAAlertBadge.jsx`.
* **Acceptance Criteria:** Ward engineers see incoming ward tickets; statutory rejection requires mandatory remark.
* **Git Commit Requirement:** `feat: Stage 9 - Government Authority Dashboard & Triage Kanban`

---

### Stage 10: Verification & Department Assignment Engine
* **Objectives:** Formal administrative gatekeeping and work order dispatching.
* **Features:**
  * Department routing and nodal officer allocation.
  * Statutory SLA calculation based on problem priority.
  * Out-of-jurisdiction forwarding mechanism.
* **Dependencies:** Stage 9.
* **Deliverables:** `assignmentService.js`, `/api/problems/:id/verify`, `/api/problems/:id/assign`.
* **Acceptance Criteria:** Status transitions to `ASSIGNED`; SLA deadline automatically computed and stored in DB.
* **Git Commit Requirement:** `feat: Stage 10 - Verification and Department Assignment Engine`

---

### Stage 11: Multi-Stakeholder Collaboration Platform
* **Objectives:** Connect Universities, Domain Experts, and Industry Partners with Government on chronic civic challenges.
* **Features:**
  * University Research Challenge Board.
  * Shared collaboration workspaces with threaded discussions.
  * Academic team formation and student credit tracking.
* **Dependencies:** Stages 3, 10.
* **Deliverables:** `UniversityDashboard.jsx`, `CollaborationWorkspace.jsx`, `/api/collaborations/*`.
* **Acceptance Criteria:** Universities can initiate collaboration on high-severity recurring issues.
* **Git Commit Requirement:** `feat: Stage 11 - Multi-Stakeholder Collaboration Workspace`

---

### Stage 12: Solution Proposals, Reviews & Implementation Tracking
* **Objectives:** End-to-end engineering solution submission, expert peer review, and milestone-driven repair tracking.
* **Features:**
  * Technical proposal submission canvas with budget/duration fields.
  * Expert review scoring rubric ($1-100$).
  * Implementation task breakdown with mandatory photo evidence (Before, In-Progress, After).
* **Dependencies:** Stage 11.
* **Deliverables:** `ProposalEditor.jsx`, `ExpertReviewCard.jsx`, `TaskBoard.jsx`, `/api/tasks/*`.
* **Acceptance Criteria:** Resolution claim requires uploaded photographic evidence at all 3 stages.
* **Git Commit Requirement:** `feat: Stage 12 - Solution Proposals, Peer Reviews and Task Evidence`

---

### Stage 13: Advanced Analytics, Hotspot Heatmaps & Impact Measurement
* **Objectives:** Deliver city-wide executive dashboards for municipal leadership.
* **Features:**
  * Mean Time to Resolution (MTTR) by department.
  * Chronic problem hotspot heatmaps.
  * Public satisfaction index and contractor performance scorecards.
* **Dependencies:** Stages 10, 12.
* **Deliverables:** `AnalyticsDashboard.jsx`, Recharts visual graphs, `/api/analytics/*`.
* **Acceptance Criteria:** Analytics update in real time; anonymous vs. registered reporting trends reported without privacy leakage.
* **Git Commit Requirement:** `feat: Stage 13 - Civic Analytics & Impact Measurement Dashboard`

---

### Stage 14: Real-time Notification Engine
* **Objectives:** Multi-channel alert distribution for citizens and municipal field staff.
* **Features:**
  * In-app notification center with unread badge counter.
  * Transactional email notifications on key status updates.
  * Webhook adapters for SMS and WhatsApp gateway integration.
* **Dependencies:** Stages 5, 10.
* **Deliverables:** `notificationService.js`, `NotificationDropdown.jsx`, `/api/notifications/*`.
* **Acceptance Criteria:** Citizens receive notifications within 5 seconds of status change.
* **Git Commit Requirement:** `feat: Stage 14 - Multi-Channel Real-time Notification Engine`

---

### Stage 15: Security Hardening, Penetration Testing & End-to-End QA
* **Objectives:** Rigorous security verification, DPDP Act compliance auditing, and automated test coverage.
* **Features:**
  * Automated unit and integration tests (Jest / Supertest).
  * Static code analysis & dependency vulnerability scans (npm audit, Snyk).
  * Rate limiting, CSRF, and SQL injection fuzzing.
* **Dependencies:** All previous stages.
* **Deliverables:** Test suites, security audit report, automated CI pipeline.
* **Acceptance Criteria:** Zero high/critical vulnerabilities; $>80\%$ test coverage on critical auth and reporting services.
* **Git Commit Requirement:** `test: Comprehensive test suites and security hardening`

---

### Stage 16: Municipal Pilot Deployment (Single Ward Trial)
* **Objectives:** Deploy JanSamadhan in a single pilot ward (e.g., Ward 31, Pune) with active municipal staff and citizen groups.
* **Features:**
  * Ward boundary polygon calibration.
  * Field engineer onboarding and training sessions.
  * Pilot feedback ingestion loop.
* **Deliverables:** Production deployment on Render/AWS, staging environment, pilot sign-off report.
* **Git Commit Requirement:** `chore: Pilot deployment configuration and ward staging assets`

---

### Stage 17: Multi-City Production Scaling & High Availability
* **Objectives:** Scale platform to multiple municipal corporations with high-availability infrastructure.
* **Features:**
  * Multi-city database sharding / read replicas.
  * Redis caching for GIS boundaries and static categories.
  * Automated multi-region database failover.
* **Deliverables:** Production infrastructure Terraform/Docker configs, operational runbooks.
* **Git Commit Requirement:** `deploy: High-availability multi-city production orchestration`
