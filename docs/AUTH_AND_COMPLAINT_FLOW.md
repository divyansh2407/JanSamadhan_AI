# JanSamadhan – Production Authentication & Civic Complaint Management Flow

This document provides a comprehensive technical guide to the production-ready user authentication, civic complaint intake, automated email dispatch, and dashboard tracking architecture in **JanSamadhan**.

---

## 1. Architectural Overview

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Resident / Citizen
    participant Client as React + Vite Client
    participant AuthAPI as Express Auth Router
    participant ReportAPI as Express Reports Router
    participant DB as PostgreSQL (Prisma ORM)
    participant Email as Email Service (Resend/SMTP/Console)

    Note over Citizen,Client: 1. User Registration & Onboarding
    Citizen->>Client: Enters Name, Email, Phone (optional), Password
    Client->>Client: Validates format, length, terms agreement
    Client->>AuthAPI: POST /api/auth/register
    AuthAPI->>DB: Check duplicate email
    AuthAPI->>DB: Hash password with bcrypt ($2a$10), force role=CITIZEN
    AuthAPI-->>Client: Returns JWT session token & sanitized user profile

    Note over Citizen,Client: 2. Complaint Submission
    Citizen->>Client: Fills issue title, description, category, location, evidence
    Client->>ReportAPI: POST /api/reports (with Bearer JWT)
    ReportAPI->>ReportAPI: Generate non-sequential Tracking ID (JS-YYYY-XXXXXXX)
    ReportAPI->>DB: Save Problem + initial ProblemStatusHistory (SUBMITTED)
    ReportAPI-)Email: Dispatches branded confirmation email asynchronously
    ReportAPI-->>Client: Returns 201 Created with trackingId & complaint details

    Note over Citizen,Client: 3. Confirmation & Dashboard Tracking
    Client->>Citizen: Renders receipt with Tracking ID, Copy ID button, and .txt download
    Citizen->>Client: Navigates to Citizen Dashboard
    Client->>ReportAPI: GET /api/dashboard/stats & GET /api/reports/my-reports
    ReportAPI->>DB: Strict IDOR-protected queries (reportedBy = user.id)
    ReportAPI-->>Client: Returns 5 KPI metrics + citizen's reports feed
```

---

## 2. Key Modules & Implementations

### A. User Registration (`POST /api/auth/register`)
- **Fields**: Full Name, Email Address, Mobile Number (optional), Password, Confirm Password, Terms Agreement.
- **Role Security**: Public registration strictly overrides and enforces `role: "CITIZEN"`. Any attempt to pass `SUPER_ADMIN`, `GOVERNMENT`, or administrative roles is automatically ignored.
- **Password Security**: Passwords are salted and hashed using `bcryptjs` with work factor 10. Plaintext passwords are never written to disk or logs.
- **Duplicate Prevention**: Email addresses are normalized (`toLowerCase().trim()`). If an account exists, HTTP 400 with a clear message is returned.
- **Response**: Issues a signed JWT (7-day validity) and sets an HTTP-only secure cookie, returning the sanitized user profile without `passwordHash`.

### B. User Login (`POST /api/auth/login`)
- **Credentials**: Email and Password.
- **Validation**: Passwords verified against stored hashes using `bcrypt.compare`.
- **Rate Limiting**: Protected by an in-memory sliding window rate limiter (max 20 attempts per 15-minute window per IP) to mitigate brute-force attacks.
- **Persistence**: Frontend stores JWT in `localStorage('js_token')` and automatically attaches it to Axios headers (`Authorization: Bearer <token>`). Session state is re-hydrated on reload via `GET /api/auth/me`.

### C. Citizen Dashboard (`GET /api/dashboard/stats` & `GET /api/citizen/dashboard`)
- **Personalized Greeting**: Time-aware greeting (`Good Morning`, `Good Afternoon`, `Good Evening`) displaying the citizen's actual full name.
- **5 KPI Metric Counters**:
  1. **Total Complaints Submitted**: Lifetime reports submitted by this user.
  2. **Pending Complaints**: Reports in `SUBMITTED` or `ACKNOWLEDGED` status awaiting department review.
  3. **Under Review**: Reports currently in verification.
  4. **In Progress Complaints**: Reports actively assigned to municipal field teams.
  5. **Resolved Complaints**: Verified completed civic repairs.
- **"My Reports" Section**:
  - Unique non-sequential Tracking ID (e.g. `JS-2026-A8F42K9`).
  - Problem Title, Category, and Submission Date.
  - Location (City / Ward / Street Address).
  - Current Status with colored badge indicator.
  - Assigned Department name or triage pending indicator.
  - Action Buttons: **View Details** (interactive status timeline modal) and **Track Report** (public tracking portal).
  - Search by Tracking ID, title, or address; status dropdown; category dropdown; sort by newest/oldest.

### D. Complaint Submission (`POST /api/reports`)
- **Fields**: Title, Detailed Description, Category, City, Ward/Area, Location Description / Landmark, GPS Coordinates (optional), Upload Evidence Images (optional).
- **Authentication**: Requires valid citizen JWT. Complaint is associated with `req.user.id`.
- **Tracking ID Generator**: High-entropy, unambiguous alphanumeric format: `JS-YYYY-XXXXXXX` (e.g. `JS-2026-CA09C6`). Checked against database to guarantee uniqueness.
- **Initial Status**: Set to `SUBMITTED`. Initial immutable audit record created in `ProblemStatusHistory`.
- **Confirmation Receipt**: Shows tracking ID prominently, 1-click clipboard copy button, .txt receipt download, and direct link to dashboard.

### E. Email Confirmation System (`server/services/emailService.js`)
- **Trigger**: Dispatched automatically upon successful complaint submission for authenticated citizens.
- **Branded HTML Template**: Features clean dark-forest header `#172B20`, emerald accent `#10B981`, highlighted dashed tracking box, complaint summary table, and one-click tracking call-to-action button.
- **Supported Providers**:
  1. **Resend API**: Triggered when `RESEND_API_KEY` is configured via HTTPS `https://api.resend.com/emails`.
  2. **Local / Development Logger**: If no API key is set, logs formatted email metadata to the server console without throwing errors or failing complaint submission.
- **Resilience**: Email sending is non-blocking. Any provider failure or network outage is safely caught and logged into `EmailNotification` / offline store audit without interrupting complaint creation.

### F. Security & IDOR Defense
- Every query to `/api/reports/my-reports`, `/api/citizen/reports`, and `/api/dashboard/stats` enforces `where: { reportedBy: req.user.id, isAnonymous: false }`.
- A citizen cannot read or enumerate another resident's complaints by guessing IDs (HTTP 403 Forbidden).
- Public tracking endpoint (`GET /api/reports/track/:trackingId`) strictly omits citizen names, emails, phone numbers, and internal tokens.

---

## 3. Environment Configuration

Add the following to `server/.env`:

```env
# Server & Client Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long

# Database (PostgreSQL)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/jansamadhan?schema=public

# Email Confirmation Provider (Resend API)
RESEND_API_KEY=re_your_resend_api_key_here
EMAIL_FROM=JanSamadhan <noreply@jansamadhan.gov.in>

# (Optional) SMTP Configuration
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_SECURE=false
```

---

## 4. Verification & Automated Test Suite

A dedicated 70-assertion master verification test suite is available at `server/test-auth-complaint-suite.js`:

```bash
cd server
node test-auth-complaint-suite.js
```

### Verified Scenarios:
1. **TEST 1**: User Registration (bcrypt salt hash verification, CITIZEN role enforcement, JWT generation).
2. **TEST 2**: Duplicate Email Registration Rejection (HTTP 400 with user-friendly message).
3. **TEST 3**: User Login & Invalid Credentials Handling (401 for bad password, 200 with JWT for correct credentials).
4. **TEST 4**: Initial Dashboard State (verifies 5 KPI counters initialize cleanly).
5. **TEST 5**: Complaint Submission (`POST /api/reports` with authenticated session).
6. **TEST 6**: Non-Sequential Tracking ID Pattern Validation (`JS-YYYY-XXXXXXX`).
7. **TEST 7**: Confirmation Email Dispatch (HTML template rendering, tracking ID prominence, delivery provider audit).
8. **TEST 8**: Complaint Visibility in "My Reports" feed with assigned department details.
9. **TEST 9**: Dashboard Statistics Dynamic Update (5 KPI counters incremented).
10. **TEST 10**: Session Persistence Across Logout and Re-Login (preserves complaint history).
11. **TEST 11**: Public Tracking View & Zero-PII Defense (no citizen email, phone, or password exposed).
12. **TEST 12**: Insecure Direct Object Reference (IDOR) Defense (User 2 blocked from viewing User 1's complaints).
13. **TEST 13**: Email Provider Failure Resilience (complaint creation succeeds with 201 even when email service encounters network error).
