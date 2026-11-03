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

## Stage 2 – Authentication & User Management

**Status:** Planned

### Deliverables
- [ ] MongoDB connection (`config/db.js` with Mongoose)
- [ ] `User` Mongoose model (name, email, password hash, role, city, verified)
- [ ] Auth routes: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`
- [ ] JWT issuance and refresh token strategy
- [ ] `bcryptjs` password hashing
- [ ] Auth middleware (`middleware/auth.js`) for protected routes
- [ ] Role-based access control: `citizen`, `official`, `admin`
- [ ] Frontend: Login page, Register page
- [ ] Frontend: `AuthContext` provider with `useAuth` hook
- [ ] Frontend: Protected route guard (`routes/PrivateRoute.jsx`)
- [ ] Email verification flow (basic)
- [ ] Input validation (server-side)

---

## Stage 3 – Citizen Dashboard & Problem Reporting

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

## Stage 4 – Admin Panel & Case Management

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
