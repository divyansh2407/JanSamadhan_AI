# JanSamadhan – Stage 6: Complete Civic Issue Reporting & Anonymous Intake System

## 1. Executive Summary

Stage 6 implements the core civic problem ingestion engine for JanSamadhan. It introduces a high-integrity, dual-pipeline reporting architecture that serves both **Verified Registered Citizens** and **100% Anonymous Reporters** with strict zero-PII guarantees, cryptographically verifiable tracking tokens, and server-side EXIF metadata sanitization.

---

## 2. Dual Reporting Architecture

```
                    ┌─────────────────────────────────────────┐
                    │     /report (Reporting Entry Page)      │
                    └────────────────────┬────────────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
      [Option 1: Registered Citizen]              [Option 2: Anonymous Report]
      • Authenticated JWT Session                 • Zero registration, zero login
      • Profile Linked (Name, Email, Phone)       • ZERO PII stored or collected
      • Appears in Citizen Dashboard              • 256-bit CSPRNG Secret Token issued ONCE
      • Real-time notifications                   • Salted SHA-256 hash in PostgreSQL
      • Earns Civic Karma                         • Ephemeral daily subnet hash for anti-abuse
                   │                                           │
                   └─────────────────────┬─────────────────────┘
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │  5-Step Multi-Section Reporting Wizard  │
                    │  1. Category Selection (12 Categories)  │
                    │  2. Problem Title, Desc & Severity      │
                    │  3. GPS Geolocation / Manual Address    │
                    │  4. Photographic Evidence (1-3 photos)  │
                    │  5. Review, Declaration & Submission    │
                    └────────────────────┬────────────────────┘
                                         │
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │       Storage & Security Pipeline       │
                    │  • Strips APP1 (0xFFE1) EXIF GPS segs   │
                    │  • Non-sequential ID: JS-YYYY-XXXXXX    │
                    │  • Constant-time token verification     │
                    └────────────────────┬────────────────────┘
                                         │
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │      Public Tracking Portal (/track)    │
                    │  • Registered: Tracking ID lookup       │
                    │  • Anonymous: Requires Secret Token     │
                    │  • Zero reporter identity exposed       │
                    └─────────────────────────────────────────┘
```

---

## 3. The 12 Standard Problem Categories

| Category Slug | Name | Lucide Icon | Typical Focus Areas |
| :--- | :--- | :--- | :--- |
| `roads-potholes` | Roads & Potholes | `AlertTriangle` | Potholes, road caving, missing tar, broken pavers |
| `garbage-waste` | Garbage & Waste Management | `Trash2` | Overflowing dumpsters, illegal dumping, uncollected waste |
| `water-supply` | Water Supply & Leakage | `Droplets` | Broken pipelines, low pressure, contaminated water |
| `street-lighting` | Street Lighting | `Lightbulb` | Dark streets, non-functional sodium/LED fixtures |
| `drainage-sewage` | Drainage & Sewage | `CloudRain` | Blocked drains, monsoon waterlogging, sewer overflow |
| `public-health` | Public Health & Sanitation | `Activity` | Unsanitary public toilets, open defecation, vector risks |
| `air-pollution` | Air Pollution | `Wind` | Garbage burning, industrial smoke, dust clouds |
| `noise-pollution` | Noise Pollution | `Volume2` | Loudspeakers, late-night construction, traffic honking |
| `illegal-construction` | Illegal Construction | `Hammer` | Encroachments, footpath blockage, unauthorized floors |
| `tree-greenery` | Tree & Greenery Maintenance | `Trees` | Fallen branches, obstructing trees, uprooted trunks |
| `stray-animals` | Stray Animals | `PawPrint` | Dog bite hazards, cattle blocking roads, injured animals |
| `traffic-signage` | Traffic & Signage | `TrafficCone` | Missing stop signs, malfunctioning signals, broken dividers |

---

## 4. Cryptographic Security & Zero-PII Protections

### 4.1. Non-Sequential Tracking ID Generation
Public tracking numbers are strictly decoupled from sequential database auto-increment IDs to prevent enumeration attacks:
$$\text{Tracking ID} = \text{"JS-" } + \text{YYYY} + \text{"-" } + \text{CryptoRandomBytes}(3).\text{toString}('hex').\text{toUpperCase}()$$
*Example:* `JS-2026-A8K7P2`

### 4.2. Secret Tracking Token (256-Bit Entropy)
Anonymous reporters receive a CSPRNG token generated via `crypto.randomBytes(32).toString('hex')` (64 hexadecimal characters). This token is displayed **exactly once** on the confirmation screen and in downloadable `.txt` receipts.

### 4.3. Salted SHA-256 Storage
Plaintext secret tokens are **never** stored on disk, logged, or retained in database tables:
$$\text{Salt} \leftarrow \text{CSPRNG}(16 \text{ bytes})$$
$$\text{StoredHash} = \text{SHA256}(\text{SecretToken} \parallel \text{Salt})$$

### 4.4. Constant-Time Verification (`crypto.timingSafeEqual`)
To eliminate side-channel timing attacks when checking secret tracking tokens, JanSamadhan enforces constant-time equality:
```javascript
const computedHash = crypto.createHash('sha256').update(providedToken + salt).digest('hex');
const expectedBuf = Buffer.from(anonymousRecord.trackingTokenHash, 'hex');
const actualBuf = Buffer.from(computedHash, 'hex');

if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
  return res.status(401).json({ success: false, message: 'Invalid secret tracking token.' });
}
```

### 4.5. Ephemeral Daily Subnet Hashing
To enforce rate limits without identifying individuals, client IP addresses are salted with the current day:
$$\text{SubnetHash} = \text{SHA256}(\text{ClientIP} \parallel \text{Date}(\text{"YYYY-MM-DD"}))$$
This allows the server to detect multi-request floods within a 24-hour window while remaining mathematically irreversible.

---

## 5. Photographic Evidence Sanitization Pipeline

When citizens upload photographic evidence (JPEG, PNG, WebP), camera hardware embeds extensive metadata segments:
- GPS coordinates (Latitude, Longitude, Altitude)
- Camera make, model, and serial number
- Timestamp and device identifiers

`server/services/storageService.js` incorporates a streaming JPEG binary parser that traverses markers from the Start of Image (`0xFFD8`) to Start of Scan (`0xFFDA`):
- All APP1 marker segments (`0xFFE1`) containing EXIF tags are skipped.
- Only pristine image raster chunks are persisted to `/uploads/`.
- File sizes are strictly bounded to 5MB, and non-image extensions are rejected.

---

## 6. Public Tracking Portal (`/track`)

The tracking portal resolves reports via `POST /api/public/reports/track`:
1. If the tracking ID belongs to an **Anonymous Report**, the `secretToken` is validated using constant-time comparison. Missing or invalid tokens yield `401 Unauthorized`.
2. If the tracking ID belongs to a **Registered Problem**, public resolution status is displayed with **zero reporter identity** (no name, email, phone number, or internal user ID).
3. Lifecycle progress updates are rendered in an interactive 4-phase tracker:
   - `SUBMITTED` $\rightarrow$ `ACKNOWLEDGED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED`

---

## 7. Automated Test Verification Matrix

All 95 backend tests across Stages 4, 5, and 6 pass with 100% success:

| Test Suite | File | Tests | Status |
| :--- | :--- | :---: | :---: |
| **Stage 4: PostgreSQL & Core Backend Foundation** | `test-stage4-suite.js` | 58 / 58 | **100% PASS** |
| **Stage 5: Citizen Dashboard System** | `test-stage5-suite.js` | 14 / 14 | **100% PASS** |
| **Stage 6: Reporting & Anonymous Intake** | `test-stage6-suite.js` | 23 / 23 | **100% PASS** |
| **Frontend Production Bundle (Vite)** | `client/` | 2025 Modules | **0 Errors, Built Clean** |

---

## 8. Frontend Routes Added

- `/report`: Interactive entry gate offering "Report as a Citizen" vs "Report Anonymously" with comparison table and privacy disclosure.
- `/report/submit`: 5-step structured intake wizard (Category, Details, Location, Photos, Review & Submit).
- `/report/confirmation`: Secure confirmation interface with copyable Tracking ID, one-time 256-bit Secret Key, and `.txt` receipt download.
- `/track`: Public tracking engine with live resolution timeline, department assignment, and sanitized photos.
