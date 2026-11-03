# JanSamadhan – Anonymous Civic Reporting & Privacy Specification

**Document Reference:** `JSD-ANON-001`  
**Version:** `1.0.0`  
**Classification:** Single Source of Truth (SSOT)  
**Security Level:** Zero-PII Cryptographic Isolation  
**Document Owner:** JanSamadhan Privacy Engineering & Security Architecture Group  

---

## 1. Executive Summary & Purpose

Anonymous reporting is a **mandatory, core statutory capability** of the JanSamadhan platform. In Indian cities, citizens frequently encounter hazardous or corrupt civic situations—such as illegal industrial chemical discharge into stormwater drains, commercial encroachment on public footpaths, debris dumping by construction cartels, or safety hazards in unlit alleys—where fear of harassment, retaliation, or administrative friction prevents them from reporting through authenticated channels.

JanSamadhan provides a **cryptographically isolated anonymous reporting pipeline** that enables citizens to submit verified civic hazards with **zero personal data collection**, while equipping municipal authorities with the necessary spatial and visual proof to take immediate corrective action.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   ANONYMOUS REPORTING SYSTEM DESIGN                    │
│                                                                        │
│   Citizen (Anonymous)                Public Ingestion Gateway          │
│   ┌────────────────────┐            ┌───────────────────────────────┐  │
│   │ • No Login / PII   │            │ 1. Subnet HMAC Rate Limiter   │  │
│   │ • Photo Upload     │── POST ───►│ 2. Sharp EXIF Stripper        │  │
│   │ • Map Pin Location │            │ 3. 256-bit CSPRNG Token Gen   │  │
│   └────────────────────┘            └───────────────┬───────────────┘  │
│                                                     │                  │
│                                                     ▼                  │
│                                     ┌───────────────────────────────┐  │
│                                     │ 4. argon2id / SHA-256 Hash    │  │
│                                     └───────────────┬───────────────┘  │
│                                                     │                  │
│                     ┌───────────────────────────────┴───────────────┐  │
│                     ▼                                               ▼  │
│   Client Response (ONCE)                            PostgreSQL Database│
│   ┌─────────────────────────────┐                  ┌─────────────────┐ │
│   │ Public ID: TRK-2026-981423  │                  │ AnonymousReport │ │
│   │ Secret: 64-char Hex Token   │                  │ (Zero User FK,  │ │
│   │ [ Save Secret Credential ]  │                  │  Only Hash)     │ │
│   └─────────────────────────────┘                  └─────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Mandatory Architectural Separation & Zero-PII Mandate

### 2.1 What is Strictly Forbidden
* **No User Table References:** The `AnonymousReport` record contains **no foreign key** to `User.id`. `Problem.citizenId` is stored as `NULL`.
* **No Identity Harvesting:** Forms never ask for Full Name, Email Address, Phone Number, Aadhaar, Voter ID, or Social Media accounts.
* **No Tracking Cookies:** The anonymous reporting portal sets zero persistent tracking cookies or local storage fingerprint tokens.
* **No Raw IP Storage:** Raw client IP addresses are **never written to the application database**. Subnet rate limiting uses an ephemeral, daily-salted HMAC:
  $$\text{SubnetHash} = \text{HMAC-SHA256}(\text{Subnet(/24)}, \text{DailySalt})$$

### 2.2 Realistic Anonymity Disclosure (No False Claims)
JanSamadhan does **not** claim "absolute military-grade anonymity":
* If a user accesses the site over an unencrypted public Wi-Fi or compromised ISP without HTTPS/VPN, network observers can see that an HTTP connection to the domain was established.
* While the application discards PII, citizens reporting sensitive matters are advised on-screen to use standard privacy practices (e.g., Tor Browser or reputable VPNs) if their threat model demands state-level network anonymity.

---

## 3. Data Ingestion Fields & Metadata Sanitization

### 3.1 Intake Form Fields
1. **Problem Title:** Brief, descriptive headline (e.g., *"Broken storm drain cover near bus stand"*).
2. **Problem Description:** Detailed context, time observed, and immediate risk.
3. **Problem Category:** Selected from the standard 9 civic categories.
4. **Photographic Evidence:** High-resolution photo upload ($< 5\text{MB}$, JPEG/PNG/WebP).
5. **Location Pin:** Placed on interactive Leaflet map to capture latitude and longitude.
6. **Date & Time Observed:** Client timestamp of the observed hazard.
7. **Optional Details:** Landmarks, nearest cross street, municipal ward (if known).

### 3.2 Automated EXIF & Metadata Scrubbing
Modern smartphones embed extensive personal identifiers within images. The JanSamadhan backend runs every uploaded file through an automated **Sharp Metadata Sanitizer** before persisting:

```
[ Inbound Image Stream ]
          │
          ▼
[ Buffer Analysis: Sharp ]
          ├── Strip GPS Latitude / Longitude (exif:GPSLatitude)
          ├── Strip Camera Make & Model (exif:Make, exif:Model)
          ├── Strip Device Serial Number (exif:BodySerialNumber)
          ├── Strip Original Capture Timestamp (exif:DateTimeOriginal)
          ├── Strip Lens & Software Info (exif:Software, exif:LensModel)
          └── Strip IPTC & XMP Copyright / Author Tags
          │
          ▼
[ Clean WebP Image Persisted to Object Storage ]
```

---

## 4. Cryptographic Tracking Token Lifecycle

Because anonymous users do not possess an account, they cannot track progress via standard session cookies. JanSamadhan implements a **Dual-Key Asymmetric Receipt Mechanism**:

```
                         ┌─────────────────────────────┐
                         │   ANONYMOUS RECEIPT PAIR    │
                         └──────────────┬──────────────┘
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼                                                         ▼
[ PUBLIC TRACKING ID ]                                    [ SECRET TRACKING TOKEN ]
• Format: TRK-YYYY-XXXXXX                                 • Format: 64-char Hex String
• Public Identifier for indexing                          • 256-bit entropy (CSPRNG)
• Shared with municipal officers                          • Kept privately by reporting citizen
• Safe for public display                                 • Plaintext NEVER stored in DB
                                                          • DB holds only argon2id / SHA-256 hash
```

### 4.1 Generation & Presentation Flow
1. **Entropy Generation:** When an anonymous report passes Zod schema validation, Node.js crypto generates 32 bytes of secure random entropy:
   ```javascript
   const secretToken = crypto.randomBytes(32).toString('hex'); // 64 hex characters
   ```
2. **Public ID Assignment:** A unique, non-sequential tracking ID is formatted:
   ```javascript
   const trackingId = `TRK-${new Date().getFullYear()}-${nanoid(6).toUpperCase()}`;
   ```
3. **Cryptographic Hashing:**
   ```javascript
   const salt = crypto.randomBytes(16).toString('hex');
   const trackingTokenHash = crypto.createHash('sha256').update(secretToken + salt).digest('hex');
   ```
4. **Database Commit:** The server writes `publicTrackingId`, `trackingTokenHash`, and `salt` to the `AnonymousReport` table.
5. **Single-Use Display:** The plaintext `secretToken` is returned in the API response. The frontend renders a high-visibility modal prompting:
   > *"Save Your Secret Tracking Token: `a9f24c8b6e01...`.*  
   > *This is your ONLY key to check status updates without logging in. JanSamadhan cannot recover lost tokens."*

### 4.2 Status Inquiry Workflow (`/track`)
To check the status of an anonymous complaint:
1. Citizen visits `http://localhost:5173/track`.
2. Enters Public Tracking ID (`TRK-2026-981423`) and pastes their secret token.
3. The frontend issues a `POST /api/public/reports/track` with JSON `{ "trackingId": "TRK-2026-981423", "secretToken": "..." }` or passes it via `X-Tracking-Token` header.
4. The backend loads the record by `publicTrackingId`, hashes the submitted secret token with the stored `salt`, and compares the result using `crypto.timingSafeEqual()`.
5. Upon verification, the sanitized complaint status, verification state, and contractor task milestones are returned.

---

## 5. Abuse Prevention & Administrative Moderation

Anonymity must never be exploited to launch spam attacks, defame individuals, or flood municipal queues.

### 5.1 Rate Limiting & Bot Deterrence
* **Subnet Sliding Window:** Maximum 3 submissions per 15 minutes per `/24` IPv4 subnet.
* **CAPTCHA Integration:** Unobtrusive Cloudflare Turnstile or hCaptcha validation runs on the form to block automated script botnets.
* **Payload Constraints:** Strict Zod size caps ($500\text{ characters}$ description, max 2 images, $< 5\text{MB}$ each).

### 5.2 Municipal Verification & Rejection Controls
* **Equal Verification Standard:** Anonymous reports undergo identical field verification by municipal Junior Engineers as registered complaints.
* **Statutory Rejection Workflow:** If an anonymous complaint is spam, malicious, or unverifiable, the municipal officer marks it `REJECTED`, selecting a mandatory standardized statutory reason:
  * `INVALID_LOCATION`: Coordinates point to private property or inaccessible terrain.
  * `INSUFFICIENT_EVIDENCE`: Uploaded photo is blurry, black, or unrelated to civic infrastructure.
  * `DUPLICATE_SUBMISSION`: Identical hazard already logged under active maintenance.
  * `DEFAMATORY_CONTENT`: Contains personal attacks or non-civic grievances.
* The rejection reason is immutably logged in `ProblemStatusHistory` and viewable when the citizen tracks the token.

