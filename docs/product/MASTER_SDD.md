# JanSamadhan – Master System Design Document (SDD)

**Document Reference:** `JSD-SDD-001`  
**Version:** `1.0.0`  
**Classification:** Single Source of Truth (SSOT)  
**Document Owner:** JanSamadhan Core Engineering Architecture Group  

---

## 1. System Architecture Overview

JanSamadhan follows a modern, decoupled **Layered Client-Server Architecture** designed for horizontal scalability, zero-trust security, and high developer productivity.

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION TIER (CLIENT)                           │
│   React 18 + Vite | Tailwind CSS | React Router DOM | Lucide React | Leaflet   │
└───────────────────────────────────────┬────────────────────────────────────────┘
                                        │ HTTPS / WSS / REST
                                        ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION TIER (SERVER)                            │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                    API GATEWAY & SECURITY MIDDLEWARE                     │  │
│  │    Helmet.js | CORS | Express Rate Limit | Cookie Parser | JWT Auth Guard │  │
│  └────────────────────────────────────┬─────────────────────────────────────┘  │
│                                       │ Validated Express Request              │
│                                       ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                     CONTROLLER & VALIDATION LAYER                        │  │
│  │       Express Controllers | Zod Schema Validators | Payload Sanitizers   │  │
│  └────────────────────────────────────┬─────────────────────────────────────┘  │
│                                       │ DTOs                                   │
│                                       ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                          BUSINESS SERVICE LAYER                          │  │
│  │  AuthService | ProblemService | AnonymousReportService | GrokAIService    │  │
│  │  CollaborationService | TaskEvidenceService | SpatialDeduplicationEngine │  │
│  └───────────────────┬───────────────────────────────────┬──────────────────┘  │
│                      │                                   │                     │
└──────────────────────┼───────────────────────────────────┼─────────────────────┘
                       │ Prisma ORM Client                 │ REST / HTTPS
                       ▼                                   ▼
┌──────────────────────────────────────────────┐ ┌───────────────────────────────┐
│              DATA PERSISTENCE TIER           │ │     EXTERNAL CIVIC SERVICES   │
│                                              │ │                               │
│       PostgreSQL 15+ (Relational Database)   │ │  • xAI Grok API Engine        │
│    • Multi-City Jurisdictions & Wards        │ │  • OpenStreetMap / Nominatim  │
│    • Spatial PostGIS / Haversine Indexes     │ │  • Cloudinary / S3 Storage    │
│    • Zero-PII Anonymous Report Vault         │ │  • SMTP & SMS Webhook Gateway │
└──────────────────────────────────────────────┘ └───────────────────────────────┘
```

---

## 2. Technology Stack Justification & Interactions

| Component | Selected Technology | Architectural Justification |
| :--- | :--- | :--- |
| **Frontend Framework** | **React.js 18 + Vite** | Instant HMR development cycle, virtual DOM efficiency, component modularity, light client bundle footprint ($< 250\text{ KB}$ gzipped). |
| **Styling & Design System** | **Tailwind CSS v3** | Strict utility-first design tokens matching Gov-Tech palette (`#12304A`, `#16834A`, `#F7F9F7`), zero runtime CSS overhead, accessible contrast ratios. |
| **Client Routing & Icons** | **React Router DOM v6 + Lucide React** | Nested route layouts, role-based route guards, and clean feather-style iconography. |
| **Backend Runtime & Framework** | **Node.js (LTS) + Express.js** | Asynchronous non-blocking I/O ideal for concurrent civic report ingestion, rich middleware ecosystem, and lightweight memory footprint. |
| **Database & ORM** | **PostgreSQL + Prisma ORM** | ACID transactional guarantees for financial/work-order milestones, strict relational foreign keys, schema migrations, and native connection pooling. |
| **Authentication & Tokens** | **JWT + bcryptjs** | Stateless signed JWTs stored in `HttpOnly`, `SameSite=Strict` cookies, with password hashing at work factor 12. |
| **AI Intelligence Engine** | **Grok API (xAI)** | Fast contextual reasoning, high-throughput multilingual parsing (English, Hindi, transliterated Hinglish), and structured JSON completions. |
| **GIS & Spatial Mapping** | **Leaflet + OpenStreetMap** | Zero licensing cost, open-source tile rendering, interactive ward polygon overlays, and privacy-respecting client geolocation. |
| **Schema Validation** | **Zod** | TypeScript-first declarative schema validation running at runtime on all Express request bodies. |

---

## 3. Layered Application Architecture

### 3.1 Controller-Service-Repository Pattern
To guarantee separation of concerns, the backend strictly adheres to three distinct layers:
1. **Controllers (`server/controllers/`):** Solely responsible for extracting request parameters, invoking Zod validation schemas, delegating to the business service layer, and returning standard HTTP status envelopes.
2. **Services (`server/services/`):** Encapsulates core business rules (e.g., duplicate checking, SLA date calculation, Grok API dispatch, cryptographic tracking token generation). Services never touch raw HTTP request/response objects.
3. **Data Access Layer (`server/prisma/`):** All database operations occur via the singleton `prisma` client (`server/config/db.js`), guaranteeing parameterized queries that prevent SQL injection.

### 3.2 Standard API Response Envelope
Every endpoint returns a predictable JSON payload:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Resource fetched successfully",
  "data": {},
  "meta": {
    "timestamp": "2026-11-03T11:24:00Z",
    "requestId": "req_8f9e12a4b3"
  }
}
```

Error responses conform to:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "issue": "Invalid email address format" }
  ],
  "meta": {
    "timestamp": "2026-11-03T11:24:00Z",
    "requestId": "req_8f9e12a4b3"
  }
}
```

---

## 4. Multi-City & Municipal Jurisdiction Architecture

To support deployment across any Indian Municipal Corporation (e.g., BMC Mumbai, BBMP Bengaluru, MCD Delhi, PMC Pune), the system models territorial authority using a hierarchical relational structure:

```
┌──────────────────┐
│       City       │ (e.g., Pune, Maharashtra)
└────────┬─────────┘
         │ 1:N
         ▼
┌──────────────────┐
│   Jurisdiction   │ (e.g., Zone 4 - Kothrud Bavdhan)
└────────┬─────────┘
         │ 1:N
         ▼
┌──────────────────┐
│       Ward       │ (e.g., Ward 31 - Ideal Colony)
└────────┬─────────┘
         │ 1:N
         ▼
┌──────────────────┐
│   Department     │ (e.g., Ward 31 PWD / Drainage Division)
└──────────────────┘
```

* **Spatial Indexing:** Every Problem record stores latitude, longitude, and an optional foreign key link to the resolved `WardId`.
* **Automated Ward Polygon Matching:** During report intake, coordinates are checked against cached GeoJSON ward boundary polygons using Ray Casting to auto-assign the governing Ward.

---

## 5. End-to-End Sequence Flows

### 5.1 Registered Citizen Problem Reporting Flow

```
Citizen              Frontend             Express API           Grok AI Service         PostgreSQL
   │                    │                      │                       │                    │
   │── Fill Form & Map ─►│                      │                       │                    │
   │   Upload Photo     │── POST /api/problems ─►│                       │                    │
   │                    │   (Bearer Cookie)    │── Verify Auth JWT ────►│                    │
   │                    │                      │── Validate Zod Schema ─►│                    │
   │                    │                      │── Strip EXIF Metadata ─►│                    │
   │                    │                      │── Create Problem Record ───────────────────►│ (Status: SUBMITTED)
   │                    │                      │                       │                    │
   │                    │                      │── Trigger Async Triage │                    │
   │                    │                      │   (Non-blocking)      │                    │
   │                    │                      │                       │── Prompt Grok API ─►│
   │                    │                      │                       │   (JSON Mode)       │
   │                    │                      │                       │◄─ Suggestions ─────│
   │                    │                      │                       │── Save AIAnalysis ─►│
   │                    │                      │                       │── Link Duplicates ─►│
   │                    │◄── 201 Created ──────│                       │                    │
   │◄── Success Banner ─│   (Problem Object)   │                       │                    │
```

### 5.2 Anonymous Reporting & Zero-Knowledge Tracking Flow

```
Anonymous User         Frontend             Express API             PostgreSQL
      │                    │                      │                      │
      │── Fill Public Form ┼                      │                      │
      │   (No Auth / PII)  │── POST /api/public/ ─►│                      │
      │                    │   reports            │── Check IP Hash Rate │
      │                    │                      │   Limiter (HMAC)     │
      │                    │                      │── Generate:          │
      │                    │                      │   TRK-2026-891021    │
      │                    │                      │   SecretToken (256b) │
      │                    │                      │── Hash SecretToken   │
      │                    │                      │   (argon2id)         │
      │                    │                      │── Save to DB ────────┼── Store trackingTokenHash
      │                    │                      │                      │   (Zero User ID link)
      │                    │◄── 201 Created ──────│                      │
      │                    │   (TRK-ID + Secret)  │                      │
      │◄── Display Secret ─┤                      │                      │
      │   "Save This Key"  │                      │                      │
      │                    │                      │                      │
      │── Later: Check ────┼                      │                      │
      │   Status (TRK-ID   │── POST /api/public/ ─►│                      │
      │   + SecretToken)   │   reports/track      │── Verify Token Hash ─┼── Query DB by TRK-ID
      │                    │                      │   (Constant Time)    │   Compare Hashes
      │                    │◄── 200 OK Status ────│                      │
      │◄── Render Status ──┤   (Sanitized Data)   │                      │
```

---

## 6. Grok AI Service Architecture & Resilience

The Grok AI integration service (`server/services/grokAiService.js`) wraps the external xAI HTTP endpoint with strict production safeguards:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GROK AI INTEGRATION PIPELINE                    │
│                                                                        │
│   Incoming Civic Report ──► [ Input Sanitizer & Truncator ]            │
│                                           │                            │
│                                           ▼                            │
│                             [ Prompt Construction Engine ]             │
│                             (System Instructions + Schema Guard)       │
│                                           │                            │
│                                           ▼                            │
│                             [ Circuit Breaker & Retry ]                │
│                             (Exponential backoff, max 2 retries)       │
│                                           │                            │
│                                           ▼                            │
│                             [ HTTPS Call: api.x.ai/v1 ]                │
│                                           │                            │
│                     ┌─────────────────────┴────────────────────┐       │
│                     ▼ Success                                  ▼ Error │
│         [ Zod Response Parser ]                    [ Fallback Engine ] │
│                     │                              (Rule-based tags)   │
│                     ▼                                          │       │
│         [ Persist to AIAnalysis ] ◄────────────────────────────┘       │
└────────────────────────────────────────────────────────────────────────┘
```

### 6.1 Circuit Breaker & Resilience Policies
* **Timeout:** $8,000\text{ ms}$ hard timeout on external requests.
* **Retry Strategy:** Max 2 retries with exponential backoff ($1,000\text{ ms}$, then $2,000\text{ ms}$) on HTTP 429 (Rate Limit) or 5xx server errors.
* **Graceful Degradation:** If Grok API fails or exceeds latency thresholds, the system defaults to deterministic keyword tagging (e.g., detecting "pothole" maps to "Roads and Infrastructure") and logs an administrative health warning. Civic reporting is never blocked by an AI outage.
* **Token Budget Control:** Prompts strictly truncate user descriptions to $1,000\text{ characters}$ to prevent prompt injection and keep token consumption predictably low ($< 500\text{ tokens}$ per call).

---

## 7. Media & Evidence Ingestion Pipeline

```
Citizen Upload ──► [ Client File Check ] ──► [ Memory Buffer Upload ]
                   • Size <= 5MB              • Multer in-memory
                   • Type: JPEG/PNG/WebP      • Zero disk write
                                                      │
                                                      ▼
                                           [ EXIF Stripper (Sharp) ]
                                           • Strip GPS Exif
                                           • Strip Device Serial
                                           • Strip Author metadata
                                                      │
                                                      ▼
                                           [ Storage Dispatcher ]
                                           • S3 / Cloudinary / Local
                                           • WebP compression (80% q)
                                                      │
                                                      ▼
                                           [ ProblemImage Record ]
```

---

## 8. Deployment Topology & High Availability

JanSamadhan is designed for cloud-native deployment with horizontal scaling:

* **Frontend:** Hosted on Vercel Edge Network or AWS CloudFront/S3 with immutable cache headers for hashed Vite assets.
* **Backend:** Node.js Express cluster running on Render / Railway / AWS ECS container instances.
* **Database:** Managed PostgreSQL (e.g., Supabase / Neon / AWS RDS) with automated daily backups, SSL connection enforcement, and connection pooling.
* **Environment Configuration:** Strict separation of secrets via environment variables (`DATABASE_URL`, `JWT_SECRET`, `GROK_API_KEY`, `CORS_ORIGIN`).
