# JanSamadhan – RESTful API Specification

**Document Reference:** `JSD-API-001`  
**Version:** `1.0.0`  
**Classification:** Single Source of Truth (SSOT)  
**Standard:** OpenAPI 3.0 / RESTful JSON  
**Base URL:** `http://localhost:5000/api`  
**Document Owner:** JanSamadhan Core API Architecture Group  

---

## 1. Global API Standards & Authentication

### 1.1 Content Negotiation & Envelopes
* All request and response bodies use `Content-Type: application/json` unless multipart form data is explicitly declared.
* All responses conform to the standard JanSamadhan API envelope:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Human-readable status summary",
  "data": {},
  "meta": {
    "timestamp": "2026-11-03T11:26:00.000Z",
    "requestId": "req_c3a812b4"
  }
}
```

### 1.2 Authentication Schemes
1. **Registered Sessions:** Handled via signed JSON Web Tokens (JWT) transmitted either via an `HttpOnly`, `SameSite=Strict` cookie named `token` or via the standard `Authorization: Bearer <JWT_TOKEN>` header.
2. **Anonymous Report Access:** Handled via dual credentials:
   * Path Parameter: Public Tracking ID (e.g., `TRK-2026-981423`)
   * Header: `X-Tracking-Token: <64-character-hex-secret>`  
   *(Anonymous reports can NEVER be fetched simply by sequential numeric ID).*

---

## 2. API Endpoint Directory

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CORE API ROUTE GROUPS                           │
├─────────────────────────┬──────────────────────┬───────────────────────┤
│ 1. /api/auth            │ 5. /api/departments  │ 9. /api/tasks         │
│ 2. /api/users           │ 6. /api/categories   │ 10. /api/notifications│
│ 3. /api/public/reports  │ 7. /api/ai           │ 11. /api/analytics    │
│ 4. /api/problems        │ 8. /api/collaborate  │ 12. /api/feedback     │
└─────────────────────────┴──────────────────────┴───────────────────────┘
```

---

## 3. Group 1: Authentication & Identity (`/api/auth`)

### 3.1 `POST /api/auth/register`
* **Description:** Public registration endpoint. Restricted exclusively to `CITIZEN` role creation. Any incoming `role` field is stripped.
* **Access:** Public (Unauthenticated)
* **Request Body:**
```json
{
  "name": "Aarav Sharma",
  "email": "aarav.sharma@example.com",
  "phone": "+919876543210",
  "password": "SecurePassword@123",
  "confirmPassword": "SecurePassword@123",
  "termsAccepted": true
}
```
* **Success Response (`201 Created`):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Citizen account registered successfully",
  "data": {
    "user": {
      "id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "name": "Aarav Sharma",
      "email": "aarav.sharma@example.com",
      "phone": "+919876543210",
      "role": "CITIZEN",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3.2 `POST /api/auth/login`
* **Description:** Authenticates any registered platform user and returns role-based dashboard redirection metadata.
* **Access:** Public
* **Request Body:**
```json
{
  "email": "aarav.sharma@example.com",
  "password": "SecurePassword@123",
  "rememberMe": true
}
```
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "name": "Aarav Sharma",
      "email": "aarav.sharma@example.com",
      "role": "CITIZEN"
    },
    "dashboardRoute": "/citizen/dashboard",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3.3 `GET /api/auth/me`
* **Description:** Returns the active authenticated user profile.
* **Access:** Bearer JWT / Cookie

---

## 4. Group 2: Anonymous Civic Reporting (`/api/public/reports`)

### 4.1 `POST /api/public/reports`
* **Description:** Submit an unauthenticated, zero-PII civic problem report.
* **Access:** Public (Governed by HMAC Subnet Rate Limiter: max 3/15 mins).
* **Request Body:**
```json
{
  "title": "Hazardous open manhole near primary school",
  "description": "The cast iron cover is completely broken on the corner of 5th cross road, creating life hazard for children.",
  "categoryId": "cat_water_sanitation_01",
  "latitude": 18.52043,
  "longitude": 73.85674,
  "address": "Opposite Balshikshan School, Mayur Colony, Kothrud, Pune",
  "imageUrl": "https://storage.jansamadhan.in/uploads/temp/anon_photo_8a7.jpg"
}
```
* **Success Response (`201 Created`):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Anonymous report submitted successfully. Save your secret tracking token now.",
  "data": {
    "trackingId": "TRK-2026-891021",
    "secretTrackingToken": "a9f24c8b6e01d4a7c83f120e5491cb88f24c8b6e01d4a7c83f120e5491cb8801",
    "status": "SUBMITTED",
    "notice": "This token is displayed ONCE. It cannot be recovered if lost."
  }
}
```

### 4.2 `GET /api/public/reports/:trackingId`
* **Description:** Fetches public progress updates for an anonymous report.
* **Access:** Requires Header `X-Tracking-Token: <SECRET_HEX_TOKEN>`.
* **Request Headers:**
  * `X-Tracking-Token: a9f24c8b6e01d4a7c83f120e5491cb88f24c8b6e01d4a7c83f120e5491cb8801`
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "trackingId": "TRK-2026-891021",
    "title": "Hazardous open manhole near primary school",
    "status": "ASSIGNED",
    "assignedDepartment": "Drainage Maintenance Division - Pune Municipal Corp",
    "slaDeadline": "2026-11-05T18:00:00Z",
    "publicUpdates": [
      {
        "status": "SUBMITTED",
        "timestamp": "2026-11-03T11:20:00Z",
        "note": "Report received and EXIF metadata stripped"
      },
      {
        "status": "VERIFIED",
        "timestamp": "2026-11-03T11:45:00Z",
        "note": "Verified as CRITICAL severity by Ward 31 Junior Engineer"
      },
      {
        "status": "ASSIGNED",
        "timestamp": "2026-11-03T12:00:00Z",
        "note": "Dispatched to Apex Infrastructure emergency repair team"
      }
    ]
  }
}
```
* **Failure Response (`401 Unauthorized`):**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid tracking ID or secret token. Access denied."
}
```

---

## 5. Group 3: Civic Problems Management (`/api/problems`)

### 5.1 `GET /api/problems`
* **Description:** Filterable query feed of civic issues.
* **Access:** Public / Authenticated
* **Query Parameters:**
  * `status`: e.g. `ASSIGNED`, `IN_PROGRESS`
  * `wardId`: e.g. `ward_31`
  * `departmentId`: e.g. `dept_pwd`
  * `severity`: `CRITICAL`
  * `page`: `1`, `limit`: `20`

### 5.2 `POST /api/problems`
* **Description:** Submit a registered civic problem report.
* **Access:** Authenticated (`CITIZEN`, `GOVERNMENT`, etc.)

### 5.3 `POST /api/problems/:id/verify`
* **Description:** Municipal authority accepts/verifies or rejects a ticket.
* **Access:** Role: `GOVERNMENT`, `SUPER_ADMIN`
* **Request Body:**
```json
{
  "action": "ACCEPT",
  "verifiedSeverity": "CRITICAL",
  "assignedDepartmentId": "dept_drainage_pmc",
  "slaHours": 48,
  "remarks": "Site inspection confirmed immediate danger. High priority."
}
```

### 5.4 `POST /api/problems/:id/verify-resolution`
* **Description:** Citizen dual-key verification closing a resolved ticket.
* **Access:** Reporting Citizen or Verified Community Member
* **Request Body:**
```json
{
  "rating": 5,
  "confirmed": true,
  "feedback": "New reinforced concrete cover installed. Cleaned up surrounding rubble."
}
```

---

## 6. Group 4: Grok AI Intelligence (`/api/ai`)

### 6.1 `POST /api/ai/analyze-problem`
* **Description:** Dispatches asynchronous natural language parsing and severity estimation to Grok API.
* **Access:** System Internal / Government Authority
* **Request Body:**
```json
{
  "problemId": "prb_8a92b3c1",
  "title": "Huge water pipe burst on Karve Road",
  "description": "Fresh drinking water flooding entire road since 6 AM. Road surface sinking."
}
```
* **Success Response (`200 OK`):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "recommendedCategory": "Water and Sanitation",
    "recommendedDepartmentCode": "JAL_BOARD_WATER_SUPPLY",
    "recommendedSeverity": "CRITICAL",
    "confidenceScore": 0.94,
    "executiveSummary": "Major drinking water main rupture causing severe localized flooding and road subsidence risk.",
    "suggestedRemediation": "Immediate valve shutoff at Kothrud booster station; deploy emergency asphalt patching after pipe weld."
  }
}
```

---

## 7. Group 5: Collaborations & Solution Proposals

* `POST /api/collaborations`: Create multi-stakeholder work room (University, Industry, Govt).
* `POST /api/proposals`: University/Expert submits technical CAD/budget solution design.
* `POST /api/proposals/:id/reviews`: Domain Expert submits structured evaluation score ($1-100$).
* `POST /api/tasks/:id/evidence`: Field contractor uploads photographic execution proof.

---

## 8. Group 6: Analytics & Impact Metrics (`/api/analytics`)

* `GET /api/analytics/ward-performance`: Ward-wise MTTR, resolution rates, and SLA compliance.
* `GET /api/analytics/heatmap`: GeoJSON point cloud for GIS heatmap rendering.
* `GET /api/analytics/anonymous-stats`: Aggregated anonymous vs. registered reporting trends without deanonymization.
