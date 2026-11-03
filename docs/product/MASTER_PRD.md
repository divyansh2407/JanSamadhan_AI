# JanSamadhan – Master Product Requirements Document (PRD)

**Document Reference:** `JSD-PRD-001`  
**Version:** `1.0.0`  
**Classification:** Single Source of Truth (SSOT)  
**Target Platform:** Indian Municipalities & Smart Cities  
**Document Owner:** JanSamadhan Core Product Architecture Group  

---

## 1. Executive Summary & Product Vision

### 1.1 Product Vision
**JanSamadhan** is an AI-powered civic problem-solving, collaboration, and impact measurement platform designed specifically for Indian cities and urban local bodies (ULBs). 

Traditional municipal complaint portals function as one-way ticketing logs: citizens lodge grievances, municipal staff close tickets administratively, and root causes remain unaddressed. JanSamadhan transforms this dynamic into a **collaborative civic ecosystem** uniting:
* **Citizens & Resident Welfare Associations (RWAs):** Transparent reporting (authenticated and anonymous) and real-time resolution verification.
* **Government Authorities & Municipal Departments:** Streamlined verification, AI-assisted triage, ward-level workload balancing, and audit-ready resolution tracking.
* **Universities & Research Institutions:** Academic engagement to formulate sustainable engineering, logistical, and environmental solutions for chronic civic bottlenecks.
* **Domain Experts & Urban Planners:** Independent technical review, feasibility analysis, and architectural oversight.
* **Industry & Corporate Social Responsibility (CSR) Partners:** Implementation capability, public-private partnerships (PPP), and resource allocation.
* **Super Administrators:** City-wide governance, cross-jurisdiction data management, policy compliance, and platform integrity.

```
                    ┌─────────────────────────┐
                    │      CITIZENS / RWAs    │
                    └────────────┬────────────┘
                                 │ Reports (Auth / Anon)
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      JANSAMADHAN CIVIC PLATFORM                        │
│                                                                        │
│   [ REPORT ] ──► [ GROK AI ] ──► [ VERIFY ] ──► [ ASSIGN ]            │
│                       │             │              │                   │
│   [ IMPACT ] ◄── [ RESOLUTION ] ◄── [ IMPLEMENT ] ◄─ [ COLLABORATE ]   │
└────────────────────────────────┬───────────────────────────────────────┘
                                 │ Multi-Stakeholder Action
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  MUNICIPAL GOVT  │    │   UNIVERSITIES   │    │  INDUSTRY & CSR  │
│  & WARD OFFICES  │    │  & CIVIC EXPERTS │    │  & CONTRACTORS   │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

### 1.2 Core Workflow Pipeline
Every civic issue on JanSamadhan moves through eight strictly enforced stages:
1. **REPORT:** Citizen reports issue via registered account or secure anonymous pipeline with geolocation and image proof.
2. **AI ANALYSIS:** Grok AI parses natural language, extracts severity, suggests municipal department, and detects duplicate candidates.
3. **VERIFICATION:** Ward engineer or municipal triage officer reviews report, accepts or rejects with recorded statutory reason.
4. **ASSIGNMENT:** Ticket routed to designated municipal department, zonal engineer, and contractor with SLA deadline.
5. **COLLABORATION:** For complex or recurring challenges, universities, urban planners, and industries are invited to submit solution proposals.
6. **IMPLEMENTATION:** Field teams execute repair work, uploading geotagged, timestamped photographic evidence for each task.
7. **RESOLUTION:** Municipal authorities submit resolution claim; reporting citizen and community conduct independent verification.
8. **IMPACT MEASUREMENT:** Automated analytics record MTTR (Mean Time to Resolution), cost efficiency, ward scorecards, and public satisfaction index.

---

## 2. Problem Statement & Market Context

Indian cities face rapid urbanization leading to severe stress on public infrastructure. While several central, state, and city grievance redressal portals exist (e.g., CPGRAMS, Swachhata App, State CM Helplines), municipal administrations and citizens encounter specific systemic challenges:

| Challenge | Real-World Civic Bottleneck | How JanSamadhan Solves It |
| :--- | :--- | :--- |
| **Fragmented Reporting** | Citizens report through informal WhatsApp groups, social media tags, and disjointed departmental desks, creating data silos. | **Unified Civic Ingestion Engine:** Aggregates registered, anonymous, and partner reports into a standardized spatial database. |
| **Incorrect Categorization** | A citizen reporting a water leak damaging an asphalt road may misclassify it under "Roads", delaying the Jal Board / Water Authority response. | **Grok AI Semantic Classifier:** Analyzes complaint text and image context to recommend the primary and secondary responsible departments. |
| **Duplicate Complaints** | 50 citizens reporting the same pothole on a major arterial road flood the triage queue with redundant tickets. | **Spatial & Semantic Deduplication:** Clusters reports within geographic radius ($R \le 50\text{ m}$) with similar embeddings, linking them to a primary issue. |
| **Poor Stakeholder Coordination** | Potholes caused by underground telecom pipe laying remain unresolved because departments dispute jurisdictional responsibility. | **Cross-Department Collaboration Hub:** Multi-stakeholder workspace allowing joint jurisdiction assignments, inter-departmental notices, and timeline tracking. |
| **Lack of Technical Expertise** | Chronic waterlogging requires civil engineering redesign rather than repetitive drain de-silting. | **University & Expert Think-Tank:** Formal interface allowing academic engineering colleges to submit structured technical solution designs. |
| **Limited Implementation Tracking** | Work orders are issued on paper; citizens have zero visibility into whether work has commenced or stalled. | **Milestone-Driven Implementation Board:** Real-time task tracking with mandatory photographic proof at start, midpoint, and completion. |
| **Unverified Administrative Closures** | Contractors mark tickets "Closed" without physical repairs, eroding citizen trust. | **Dual-Key Verification & Community Audit:** Resolutions require field photo proof and citizen confirmation before formal closure. |
| **Lack of Predictive Civic Analytics** | Municipalities respond reactively to breakdowns rather than preemptively maintaining failing infrastructure. | **Ward-Level Heatmaps & Recurrence Engine:** Grok AI pattern analysis highlighting chronic infrastructure failure corridors. |

> [!IMPORTANT]
> **Complementary Positioning:** JanSamadhan is designed as a **civic intelligence and multi-stakeholder collaboration layer**, not as a hostile replacement for existing state or municipal IT portals. It interfaces with municipal ERPs through open webhooks and standardized REST adapters.

---

## 3. User Roles, Personas & Permission Matrix

JanSamadhan enforces strict **Role-Based Access Control (RBAC)** across six user roles:

```
[ SUPER_ADMIN ]
      │
      ├───────────────────────┬───────────────────────┐
      ▼                       ▼                       ▼
[ GOVERNMENT ]          [ UNIVERSITY ]          [ INDUSTRY / EXPERT ]
      │                       │                       │
      └───────────────────────┼───────────────────────┘
                              ▼
                         [ CITIZEN ]
```

### 3.1 Role Definitions & Privileges

#### 1. CITIZEN
* **Profile:** Urban residents, daily commuters, local shopkeepers, and RWA members.
* **Onboarding:** Public self-registration (email, phone, password) or instant unauthenticated anonymous submission.
* **Capabilities:** Submit reports, track own reports, upvote community problems, track anonymous reports via secure token, submit resolution verification feedback, join public forums.
* **Dashboard Needs:** "My Reports" tracker, active community problems map, resolution confirmation alerts, civic reputation badge.

#### 2. GOVERNMENT
* **Profile:** Municipal Commissioners, Zonal Officers, Ward Junior Engineers (JEs), Department Heads (PWD, Jal Board, Sanitation, Electricity).
* **Onboarding:** Authorized administrative creation by Super Admin or Department Head invitation only.
* **Capabilities:** Verify inbound complaints, assign to internal teams/contractors, set SLAs, approve/reject duplicate merges, inspect solution proposals, update task status, submit final resolution proof.
* **Dashboard Needs:** Ward-level Kanban triage board, SLA breach warning countdowns, field worker task allocation, departmental performance metrics.

#### 3. UNIVERSITY
* **Profile:** Engineering faculties, urban planning departments, environmental research laboratories, and student civic innovators.
* **Onboarding:** Institutional verification by Super Admin with academic accreditation credentials.
* **Capabilities:** Browse high-severity recurring civic problems, form interdisciplinary research teams, submit technical solution proposals with budgetary and material estimates, peer-review other proposals.
* **Dashboard Needs:** Open research challenges board, proposal draft workspace, review status monitor, student researcher credit tracking.

#### 4. EXPERT
* **Profile:** Certified structural engineers, retired municipal chief planners, environmental scientists, and legal advisors.
* **Onboarding:** Vetted application approved by Super Admin with professional licensure verification.
* **Capabilities:** Provide independent technical feasibility reviews on university and industry proposals, sign off on safety certifications, suggest regulatory compliance steps.
* **Dashboard Needs:** Proposal review queue, technical evaluation scoring rubrics, active consultation threads.

#### 5. INDUSTRY
* **Profile:** Civil infrastructure contractors, waste management vendors, smart city technology suppliers, and corporate CSR wings.
* **Onboarding:** Corporate verification by Super Admin with CIN/GSTIN registration documentation.
* **Capabilities:** Submit commercial execution bids or CSR funding commitments for accepted technical solutions, assign field teams to implementation tasks, upload procurement receipts and execution proof.
* **Dashboard Needs:** Active tenders/implementation projects, task milestone submission portal, CSR impact audit reporting.

#### 6. SUPER_ADMIN
* **Profile:** State IT Directorate, Municipal IT Cell Administrators, and Platform Security Officers.
* **Onboarding:** Initial root seed with mandatory hardware multi-factor authentication (MFA).
* **Capabilities:** Multi-city onboarding, municipal department provisioning, user role management, system audit log inspection, Grok AI rate limit monitoring, DPDP compliance supervision.
* **Dashboard Needs:** City-wide health telemetry, global user management, system audit logs, API usage & cost meters, security anomaly flags.

### 3.2 Role Permission Matrix

| Feature / Action | CITIZEN | GOVERNMENT | UNIVERSITY | EXPERT | INDUSTRY | SUPER_ADMIN |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Public Self-Registration | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Submit Problem (Auth) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit Problem (Anon) | ✅ (No Auth) | N/A | N/A | N/A | N/A | N/A |
| Upvote / Community Track | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Verify Inbound Complaints | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Assign Department / SLA | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Trigger Grok AI Triage | Auto | Manual/Auto | ❌ | ❌ | ❌ | Full Access |
| Submit Solution Proposal | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Peer Review Proposal | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Approve Solution Proposal | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Fund / Implement Project | ❌ | ✅ (Budget) | ❌ | ❌ | ✅ (CSR/Bid) | ✅ |
| Upload Task Evidence | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Mark Problem Resolved | ❌ | ✅ (Claim) | ❌ | ❌ | ❌ | ✅ |
| Verify Resolution (Citizen) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Provision Cities & Wards | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| View Global Audit Logs | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 4. Anonymous Reporting Architecture & Privacy Mandates

Anonymous reporting is a **mandatory statutory requirement** to encourage reporting of sensitive civic hazards (e.g., illegal encroachments, hazardous industrial discharge, corrupt waste dumping) where citizens fear retaliation.

### 4.1 Reporting Options: Registered vs. Anonymous

```
                     ┌───────────────────────────────┐
                     │   CITIZEN REPORTING GATEWAY   │
                     └───────────────┬───────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
      [ REGISTERED REPORTING ]                [ ANONYMOUS REPORTING ]
      * Requires User Auth                    * Zero Account Creation
      * User ID linked                        * Zero PII Collected
      * Direct Push / SMS Updates             * Ephemeral IP (Hashed & Salted)
      * Citizen Reputation Score              * EXIF Metadata Stripped
      * Edit / Reopen Privileges              * Secure Token + Nonce Access
```

### 4.2 Anonymous Ingestion Specifications
* **Zero PII Collection:** The submission payload must strictly reject user identifiers, email addresses, phone numbers, and identity cookies.
* **Client EXIF Sanitization:** Photographic attachments are processed through a client-side and server-side metadata stripper removing GPS tags, device make/model, camera serial numbers, and original timestamps before persisting.
* **Cryptographic Tracking Token:**
  * When an anonymous report is submitted, the system generates a human-readable Public Tracking ID (`TRK-YYYY-XXXXXX`) and a high-entropy secret Tracking Token ($256\text{-bit}$ CSPRNG hex string).
  * The database stores only the **argon2id / SHA-256 salted hash** of the tracking token (`trackingTokenHash`).
  * The plaintext tracking token is displayed to the user **exactly once** upon submission with a copy/download prompt.
  * To inspect the report status later, the anonymous citizen must provide both the Tracking ID and the secret Tracking Token.
* **Spam & Abuse Defense:**
  * Submissions are governed by an in-memory sliding window rate limiter keyed on a daily-rotated salted hash of the subnet IP:
    $$\text{RateLimitKey} = \text{HMAC-SHA256}(\text{SubnetIP}, \text{DailySalt})$$
  * Maximum 3 anonymous reports per 15 minutes per subnet.
  * Turnstile / hCaptcha integration for bot deterrence without tracking cookies.

---

## 5. Civic Problem Taxonomy & Classification Engine

JanSamadhan categorizes civic challenges into 9 standardized primary categories with granular subcategories, fully expandable through administrative configuration:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CIVIC PROBLEM TAXONOMY ENGINE                        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
      ┌──────────────┬─────────────┼─────────────┬──────────────┐
      ▼              ▼             ▼             ▼              ▼
[ ROADS & INFRA] [ WASTE MGMT ] [ WATER/SAN ] [ ELECTRICITY ] [ TRAFFIC ]
      │              │             │             │              │
      ▼              ▼             ▼             ▼              ▼
[ ENVIRONMENT ] [ PUB SAFETY ] [ PUB INFRA ]  [    OTHER    ] [ EXPANSION ]
```

1. **Roads & Infrastructure:** Potholes, damaged footpaths, missing manhole covers, bridge structural cracks, unfinished road construction.
2. **Waste Management:** Overflowing community dumpsters, uncollected door-to-door domestic waste, illegal construction debris dumping, biomedical waste hazard.
3. **Water & Sanitation:** Pipeline bursts, contaminated drinking water supply, sewage overflow, dry public borewells, stagnant water pools (vector breeding).
4. **Electricity & Streetlights:** Non-functional streetlights, exposed high-voltage cables, transformer sparks, leaning electric poles, dangling low-hanging cables.
5. **Traffic & Transportation:** Missing road signage, broken traffic signals, severe bottleneck choke-points, illegal pavement parking, damaged bus stops.
6. **Environment & Pollution:** Industrial chemical discharge, open garbage burning, excessive noise pollution beyond decibel norms, illegal tree felling, lake encroachment.
7. **Public Safety:** Unlit dark alleys, stray animal hazards, open excavation sites near schools, structural collapse risk of abandoned buildings.
8. **Public Infrastructure:** Damaged municipal school buildings, vandalized public parks, dysfunctional public toilets, broken boundary walls.
9. **Other:** Civic grievances falling outside standard classification, subject to human-in-the-loop triage re-assignment.

---

## 6. Core Platform Modules Specification

The JanSamadhan platform comprises 20 decoupled functional modules:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      20 CORE PLATFORM MODULES                           │
├─────────────────────┬─────────────────────┬─────────────────────────────┤
│ 1. Auth & RBAC      │ 8. Govt Dashboard   │ 15. Solution Proposals      │
│ 2. Citizen Hub      │ 9. Dept Management  │ 16. Implementation Tracker  │
│ 3. Anonymous Module │ 10. Triage & Assign │ 17. Multi-Channel Alerts    │
│ 4. Report Pipeline  │ 11. University Hub  │ 18. Civic Impact Analytics  │
│ 5. Grok AI Engine   │ 12. Expert Review   │ 19. Resolution Verification │
│ 6. Deduplication    │ 13. Industry Hub    │ 20. Super Admin Governance  │
│ 7. Leaflet / GIS    │ 14. Collab Spaces   │                             │
└─────────────────────┴─────────────────────┴─────────────────────────────┘
```

### Module 1: Authentication and Authorization
* **Purpose:** Multi-tenant identity management, role verification, and secure session lifecycle.
* **Users:** Registered Citizens, Government Officers, Academic Partners, Experts, Industry Partners, Super Admins.
* **Features:** Password hashing via `bcrypt` ($12\text{ rounds}$), JSON Web Tokens (JWT) signed with RS256/HS256 stored in `HttpOnly`, `SameSite=Strict` cookies, brute-force lockout, role authorization guards.
* **APIs:** `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.

### Module 2: Citizen Dashboard
* **Purpose:** Centralized control center for registered citizens.
* **Features:** Personal report tracking timeline, upvoted issue feed, neighborhood alert subscription, resolution verification queue, community engagement leaderboard.
* **APIs:** `GET /api/citizens/dashboard/stats`, `GET /api/citizens/my-reports`, `POST /api/problems/:id/upvote`.

### Module 3: Anonymous Reporting Module
* **Purpose:** Zero-knowledge civic hazard reporting with cryptographic receipt tracking.
* **Features:** Metadata-free intake, non-sequential tracking token generator, unauthenticated status viewer, anti-abuse throttling.
* **APIs:** `POST /api/public/reports`, `POST /api/public/reports/track`.

### Module 4: Civic Problem Reporting Engine
* **Purpose:** Unified ingestion pipeline for registered reports.
* **Features:** Multi-photo attachment, GPS coordinates capture with map pin correction, address geocoding, category selector, severity self-assessment.
* **APIs:** `POST /api/problems`, `GET /api/problems/:id`, `PATCH /api/problems/:id`.

### Module 5: Grok AI Analysis Engine
* **Purpose:** Asynchronous natural language understanding and visual context processing via Grok API by xAI.
* **Features:** Semantic extraction, automated severity recommendation, department routing advice, duplicate match ranking.
* **APIs:** Internal service worker consuming `/api/ai/analyze-problem`.

### Module 6: Duplicate Problem Detection Engine
* **Purpose:** Prevent municipal ticket queues from being flooded by redundant submissions.
* **Features:** Haversine spatial proximity check ($R \le 50\text{ m}$) coupled with Grok AI vector semantic similarity score ($S \ge 0.82$). Groups candidate duplicates under a master ticket.
* **APIs:** `GET /api/problems/:id/duplicates`, `POST /api/problems/:id/merge-duplicates`.

### Module 7: Location and Spatial Mapping (Leaflet + OSM)
* **Purpose:** Open-source GIS visualization without proprietary API fees.
* **Features:** Interactive OpenStreetMap tiles via Leaflet, cluster markers for high-density complaint zones, municipal ward boundary polygons, reverse geocoding via Nominatim.
* **APIs:** Client GIS services, `GET /api/geo/wards`, `GET /api/geo/problems-heatmap`.

### Module 8: Government Authority Dashboard
* **Purpose:** Command and control interface for municipal administrators and ward engineers.
* **Features:** Real-time incoming queue, SLA countdown timers, visual map triage, batch departmental routing, resolution sign-off.
* **APIs:** `GET /api/gov/dashboard/overview`, `GET /api/gov/problems/triage-queue`.

### Module 9: Department Management
* **Purpose:** Organizational hierarchy modeling for urban local bodies.
* **Features:** Multi-department directory (PWD, Water Supply, Solid Waste, Health, Electrical), jurisdiction mapping, nodal officer assignment.
* **APIs:** `GET /api/departments`, `POST /api/departments`, `PATCH /api/departments/:id`.

### Module 10: Verification and Assignment Engine
* **Purpose:** Formal administrative gatekeeping ensuring only valid, actionable complaints enter the execution lifecycle.
* **Features:** Field inspection assignment, statutory rejection with mandatory recorded reason, SLA allocation based on problem severity.
* **APIs:** `POST /api/problems/:id/verify`, `POST /api/problems/:id/assign`.

### Module 11: University Dashboard
* **Purpose:** Academic research portal connecting students and faculty to real-world municipal problems.
* **Features:** Open research challenge registry, multidisciplinary team formation, proposal submission canvas, academic credit portfolio.
* **APIs:** `GET /api/university/challenges`, `POST /api/proposals`.

### Module 12: Expert Review Dashboard
* **Purpose:** Technical advisory panel for civic engineering feasibility.
* **Features:** Technical review workspace, structured scoring rubrics (structural integrity, environmental impact, cost realism), regulatory audit notes.
* **APIs:** `GET /api/expert/reviews/pending`, `POST /api/proposals/:id/reviews`.

### Module 13: Industry & CSR Dashboard
* **Purpose:** Private sector participation gateway for urban revitalization.
* **Features:** Open municipal tenders, CSR sponsorship commitments, contractor work order logs, milestone invoice and evidence submissions.
* **APIs:** `GET /api/industry/tenders`, `POST /api/collaborations/pledge-funding`.

### Module 14: Collaboration Management Workspace
* **Purpose:** Shared virtual project room uniting Government, Universities, Experts, and Industry on complex civic projects.
* **Features:** Shared file repository, chronological meeting notes, milestone roadmap, threaded stakeholder discussions.
* **APIs:** `POST /api/collaborations`, `GET /api/collaborations/:id`, `POST /api/collaborations/:id/comments`.

### Module 15: Solution Proposal Engine
* **Purpose:** Structured repository for technical solutions submitted by Universities and Industry.
* **Features:** Proposal versioning, bill of quantities (BOQ) estimates, implementation timeline diagrams, automated status changes (Submitted, Under Review, Approved, Rejected).
* **APIs:** `GET /api/proposals`, `POST /api/proposals`, `PATCH /api/proposals/:id/status`.

### Module 16: Implementation Tracking Engine
* **Purpose:** Granular milestone tracking for physical civic repairs.
* **Features:** Task decomposition, assigned contractor tracking, mandatory triple-stage photo evidence (Before, In-Progress, After), GPS location verification.
* **APIs:** `GET /api/tasks/problem/:problemId`, `POST /api/tasks`, `PATCH /api/tasks/:id/evidence`.

### Module 17: Notification Engine
* **Purpose:** Omnichannel transactional messaging.
* **Features:** In-app real-time alerts, email dispatches via SMTP, SMS/WhatsApp webhooks for key citizen milestone events.
* **APIs:** `GET /api/notifications`, `PATCH /api/notifications/:id/read`.

### Module 18: Analytics and Impact Measurement
* **Purpose:** Data-driven urban governance intelligence.
* **Features:** Ward-level cleanliness index, MTTR by department, contractor performance scores, recurring hotspot forecasts.
* **APIs:** `GET /api/analytics/ward-performance`, `GET /api/analytics/mttr-breakdown`.

### Module 19: Feedback and Resolution Verification
* **Purpose:** Citizen-led closure verification preventing paper closures.
* **Features:** 48-hour citizen verification window, satisfaction star rating ($1\text{ to }5\text{ stars}$), one-click reopening with photographic rebuttal.
* **APIs:** `POST /api/problems/:id/verify-resolution`, `POST /api/problems/:id/reopen`.

### Module 20: Super Admin Management
* **Purpose:** Global platform governance and multi-city management.
* **Features:** City/Ward provisioning, master department directory, system security audit logs, Grok API consumption telemetry.
* **APIs:** `GET /api/admin/audit-logs`, `POST /api/admin/cities`, `GET /api/admin/system-health`.

---

## 7. Grok AI Integration & Safeguards

JanSamadhan integrates the **Grok API (xAI)** as a high-speed civic intelligence assistant.

### 7.1 Grok AI Capabilities
1. **Semantic Categorization:** Reads multi-lingual natural language (English, Hindi, regional transliterations) and predicts category with confidence score.
2. **Executive Summarization:** Condenses lengthy citizen descriptions into a 25-word actionable summary for field engineers.
3. **Severity & Urgency Scoring:** Recommends priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) based on safety keywords (e.g., "sparking wire near school" $\rightarrow$ `CRITICAL`).
4. **Departmental Routing:** Recommends primary and secondary municipal department code.
5. **Deduplication Assistant:** Evaluates pairs of complaints and outputs similarity confidence ($0.0\text{ to }1.0$).
6. **Solution Generation:** Suggests standard civil engineering or municipal best-practice remediation steps.

### 7.2 Strict AI Safety Boundaries & Human-in-the-Loop Safeguards
```
┌────────────────────────────────────────────────────────┐
│                   GROK AI BOUNDARIES                   │
├───────────────────────────┬────────────────────────────┤
│   WHAT AI IS PERMITTED    │    WHAT AI IS FORBIDDEN    │
│         TO DO             │           TO DO            │
├───────────────────────────┼────────────────────────────┤
│ • Suggest categories      │ • Approve official reports │
│ • Recommend urgency       │ • Reject citizen complaints│
│ • Flag duplicate matches  │ • Mark problems resolved   │
│ • Draft summaries         │ • Make legal determinations│
│ • Recommend departments   │ • Fabricate evidence data  │
└───────────────────────────┴────────────────────────────┘
```

* **Zero Autonomous Administrative Actions:** Grok AI suggestions are stored in a dedicated `AIAnalysis` relational table and surfaced to authorized human officers as **recommendations**.
* **Statutory Human Responsibility:** An official ticket can only be accepted, assigned, rejected, or resolved by a verified `GOVERNMENT` or `SUPER_ADMIN` user with an immutable audit entry.
* **Model Provenance:** Every AI response logs `modelName`, `promptTokens`, `completionTokens`, `confidenceScore`, and execution timestamp.
* **Circuit Breaker & Fallback:** If the Grok API is unreachable or rate-limited, the application degrades gracefully to deterministic keyword-based heuristics without interrupting report intake.

---

## 8. Non-Functional Requirements (NFRs)

| Dimension | Target Metric (Proposed) | Verification Methodology |
| :--- | :--- | :--- |
| **API Response Time** | $P_{95} \le 200\text{ ms}$ for core REST endpoints | Load testing via k6 with 1,000 concurrent requests |
| **AI Inference Latency** | $P_{95} \le 2.5\text{ s}$ asynchronous processing | Background queue with worker telemetry |
| **System Availability** | $99.9\%$ uptime during business hours ($06:00 - 22:00\text{ IST}$) | Health endpoint monitoring via external synthetic pings |
| **Mobile Responsiveness** | Fully functional on $360\text{ px}$ to $4\text{K}$ screens | Responsive design tested on Chrome DevTools & physical devices |
| **Accessibility** | WCAG 2.1 Level AA compliance | Axe-core accessibility auditing |
| **Data Protection** | Full compliance with India's DPDP Act 2023 | Zero PII in anonymous tables, encrypted credentials at rest |
| **Scalability** | Multi-city tenancy supporting $100\text{ Wards}$ and $100,000\text{ active reports}$ | PostgreSQL index optimization & connection pooling |

