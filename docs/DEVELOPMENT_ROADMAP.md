# JanSamadhan – Development Roadmap

---

## Overview

JanSamadhan is built in modular stages. Each stage is independently testable and deployable. Stages are completed sequentially, with approval required before proceeding.

---

## Stage 1 – Project Foundation & Architecture ✅

**Status:** Complete

### Deliverables
- [x] Full monorepo folder structure (`client/`, `server/`, `docs/`)
- [x] Vite + React 18 frontend scaffold
- [x] Tailwind CSS v3 with custom brand tokens
- [x] React Router DOM v6 configured
- [x] Axios instance with interceptors (`services/api.js`)
- [x] Express.js server with CORS, body parsing, and centralized error handling
- [x] Health-check endpoint: `GET /api/health`
- [x] Environment variable management (`.env.example`, `.gitignore`)
- [x] Root `package.json` with `concurrently` for unified dev start
- [x] Placeholder homepage displaying project identity and live API status
- [x] Full documentation: README, ARCHITECTURE, ROADMAP

---

## Stage 2 – Professional Landing Page & Design System ✅

**Status:** Complete

### Deliverables
- [x] Gov-Tech SaaS design system (#12304A Navy, #16834A Green, #F7F9F7 BG, Inter font)
- [x] Responsive navigation bar with sticky/scrolling blur effects and mobile drawer
- [x] Hero section with custom interactive connected city animation and live metric badges
- [x] 6 civic problem category cards with custom Lucide icons and hover transitions
- [x] 5-step interconnected workflow timeline from reporting to resolution
- [x] 5-stakeholder ecosystem overview (Citizens, Authorities, Universities, Experts, Industry)
- [x] 6 platform feature cards highlighting AI analysis, GIS mapping, and audit trails
- [x] Illustrative impact analytics dashboard with animated counters & category resolution bars
- [x] High-converting call-to-action banner with dual action buttons
- [x] Comprehensive footer with brand information, quick links, contacts, and legal notices
- [x] Framer Motion animations & responsive layout across mobile, tablet, and desktop

---

## Stage 3 – Authentication System & Role-Based Access Control ✅

**Status:** Complete

### Deliverables
- [x] Mongoose `User` model with 6 distinct roles (`CITIZEN`, `GOVERNMENT`, `UNIVERSITY`, `EXPERT`, `INDUSTRY`, `SUPER_ADMIN`)
- [x] Pre-save password hashing with `bcryptjs` and secure password comparison method
- [x] Public registration strictly enforced as `CITIZEN` only (privilege escalation prevention)
- [x] JWT token generation with expiration and verification utilities
- [x] Secure HTTP-only cookies with Lax/None SameSite and production SSL flags
- [x] Centralized authentication middleware (`authenticate`) supporting cookies & Authorization headers
- [x] Reusable Role-Based Access Control middleware (`authorize`) returning HTTP 403 on role mismatch
- [x] In-memory rate limiting middleware for `/api/auth/login` and `/api/auth/register`
- [x] Input validation utilities for email, phone, and password strength
- [x] Endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- [x] Frontend `AuthContext` and `useAuth` hook managing authenticated state across the application
- [x] Axios `api.js` updated with `withCredentials: true` and automatic token interceptors
- [x] Gov-Tech styled `LoginPage.jsx` with email/password validation and test account quick-fill
- [x] Gov-Tech styled `RegisterPage.jsx` with phone/email validation, password visibility toggles, and terms agreement
- [x] Dedicated branded dashboard placeholder pages for all 6 stakeholder roles
- [x] Dynamic Navigation bar reflecting authenticated state with role badges and logout trigger
- [x] Automated test suite verifying 41/41 test assertions with 100% pass rate

---

## Stage 4 – Citizen Dashboard & Problem Reporting

**Status:** Planned

### Deliverables
- [ ] `Report` Mongoose model (title, description, category, location, images, status, upvotes)
- [ ] Reports CRUD API: `POST /api/reports`, `GET /api/reports`, `GET /api/reports/:id`, `PATCH /api/reports/:id`
- [ ] Image upload with `multer` (Cloudinary integration)
- [ ] Geo-location capture and storage (lat/lng)
- [ ] Citizen dashboard page (my reports, stats, activity feed)
- [ ] Problem report form with category selection, image upload, location picker
- [ ] Report detail page with timeline
- [ ] Report status tracker (Submitted → Acknowledged → In Progress → Resolved)
- [ ] Upvote / community endorsement feature

---

## Stage 5 – Admin Panel & Case Management

**Status:** Planned

### Deliverables
- [ ] `Department` Mongoose model
- [ ] Admin dashboard: all reports, filters, bulk actions
- [ ] Department assignment and escalation workflow
- [ ] Official response system (comments on reports)
- [ ] Report status update by officials
- [ ] Analytics overview (resolution rates, average time, category breakdown)
- [ ] Role-restricted admin routes

---

## Stage 5 – Grok AI Integration

**Status:** Planned

### Deliverables
- [ ] `services/aiService.js` – Grok API client
- [ ] Automatic complaint categorisation on submission
- [ ] Priority scoring (low / medium / high / critical)
- [ ] Smart department routing based on category
- [ ] AI-generated citizen status updates
- [ ] Sentiment analysis on report descriptions
- [ ] Duplicate detection across nearby reports

---

## Stage 6 – Maps, Notifications & Collaboration

**Status:** Planned

### Deliverables
- [ ] Interactive city map with report heat-map overlay (Leaflet.js)
- [ ] Geo-clustered report pins by category
- [ ] Real-time notifications (Socket.io or SSE)
- [ ] Email notifications (Nodemailer)
- [ ] Community collaboration feed (comments, suggestions)
- [ ] Citizen-to-citizen support threads
- [ ] Public awareness campaigns module

---

## Stage 7 – Testing, Optimisation & Deployment

**Status:** Planned

### Deliverables
- [ ] Unit tests (Vitest + React Testing Library for frontend; Jest for backend)
- [ ] API integration tests
- [ ] Performance optimisation (lazy loading, image compression, query indexing)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Production Docker configuration
- [ ] Cloud deployment (Render / Railway / Vercel + MongoDB Atlas)
- [ ] Security audit (Helmet.js, rate limiting, HTTPS)
- [ ] Accessibility (WCAG 2.1 AA compliance)

---

## Milestone Summary

| Stage | Focus | Status |
|-------|-------|--------|
| 1 | Foundation & Architecture | ✅ Complete |
| 2 | Authentication | ⏳ Pending |
| 3 | Citizen Dashboard & Reporting | ⏳ Pending |
| 4 | Admin Panel | ⏳ Pending |
| 5 | Grok AI Integration | ⏳ Pending |
| 6 | Maps, Notifications & Collaboration | ⏳ Pending |
| 7 | Testing, Optimisation & Deployment | ⏳ Pending |
