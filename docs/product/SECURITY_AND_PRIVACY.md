# JanSamadhan – Security, Privacy & Compliance Architecture

**Document Reference:** `JSD-SEC-001`  
**Version:** `1.0.0`  
**Classification:** Single Source of Truth (SSOT)  
**Compliance Standard:** India Digital Personal Data Protection (DPDP) Act 2023 & ISO/IEC 27001  
**Document Owner:** JanSamadhan Chief Information Security Office (CISO) Group  

---

## 1. Security Philosophy & Threat Model

JanSamadhan operates on a **Zero-Trust Architecture**:
1. Never trust the client.
2. Authenticate and authorize every request.
3. Validate and sanitize all inputs at runtime.
4. Protect citizen anonymity with cryptographic guarantees.
5. Maintain immutable audit trails for all administrative actions.

```
                  ┌─────────────────────────────────────┐
                  │          UNTRUSTED INTERNET         │
                  └──────────────────┬──────────────────┘
                                     │
             ┌───────────────────────┴───────────────────────┐
             ▼                                               ▼
   [ REGISTERED CITIZEN ]                          [ ANONYMOUS CITIZEN ]
   • JWT in HttpOnly Cookie                        • Zero Cookies / Zero Auth
   • Password hashed (bcrypt 12)                   • Ephemeral Salted IP Hash
             │                                               │
             └───────────────────────┬───────────────────────┘
                                     ▼
                      ┌─────────────────────────────┐
                      │    SECURITY SHIELD LAYER    │
                      │  Helmet.js | CORS | RateLim │
                      └──────────────┬──────────────┘
                                     ▼
                      ┌─────────────────────────────┐
                      │   DATA SANITIZATION LAYER   │
                      │  Zod Schema | EXIF Stripper │
                      └──────────────┬──────────────┘
                                     ▼
                      ┌─────────────────────────────┐
                      │     PRISMA ORM DATA ACCESS  │
                      │    (100% Parameterized SQL) │
                      └─────────────────────────────┘
```

---

## 2. Authentication & Authorization Hardening

### 2.1 Password Hashing & Salt Rounds
* Passwords are encrypted using `bcryptjs` with **12 salt rounds** ($\approx 250\text{ ms}$ hashing latency), providing robust defense against offline GPU/ASIC rainbow table attacks.
* Minimum password policy enforced by Zod:
  * Minimum 8 characters, maximum 64 characters.
  * At least 1 uppercase letter ($[A-Z]$).
  * At least 1 lowercase letter ($[a-z]$).
  * At least 1 number ($[0-9]$).
  * At least 1 special character ($[!@#$%^&*]$).

### 2.2 JWT Storage & Session Security
* Tokens are issued with a 7-day expiration (`expiresIn: '7d'`) and signed with a 512-bit secret.
* Primary browser transport is via **`HttpOnly` cookies**:
  * `httpOnly: true`: Prevents client-side JavaScript access, neutralizing Cross-Site Scripting (XSS) token theft.
  * `secure: process.env.NODE_ENV === 'production'`: Transmitted exclusively over TLS/HTTPS.
  * `sameSite: 'strict'`: Fully mitigates Cross-Site Request Forgery (CSRF).
* Authorization headers (`Authorization: Bearer <token>`) are supported for native mobile and programmatic API integrations.

### 2.3 Strict Privilege Isolation
* **Public Registration Guard:** Public `POST /api/auth/register` explicitly hardcodes `role: 'CITIZEN'`. Even if a malicious actor injects `role: 'SUPER_ADMIN'` into the JSON payload, the field is stripped during controller sanitization.
* **Privileged Account Provisioning:** Roles such as `GOVERNMENT`, `UNIVERSITY`, `EXPERT`, and `INDUSTRY` can only be created by an active `SUPER_ADMIN` or via an administratively issued cryptographically signed invitation link.

---

## 3. Anonymous Reporting Privacy Architecture

### 3.1 Threat Scenarios & Mitigations

| Threat Vector | Attack Scenario | JanSamadhan Mitigation |
| :--- | :--- | :--- |
| **Database Compromise** | An attacker dumps the SQL database and attempts to identify who reported corruption. | Anonymous reports are stored in a dedicated `AnonymousReport` table with **zero foreign key connection to `User`**, no name, no email, and no phone number. |
| **Sequential ID Enumeration** | Attacker iterates through sequential IDs (`/report/1`, `/report/2`) to scrape complaints. | Tracking IDs use a non-sequential, random pattern (`TRK-YYYY-XXXXXX`). Fetching tracking details strictly requires a $256\text{-bit}$ secret token passed via `X-Tracking-Token`. |
| **Metadata Deanonymization** | High-resolution smartphone photos contain embedded GPS coordinates, camera serial numbers, and capture timestamps. | Photographic attachments pass through a server-side **Sharp EXIF Stripper** that removes all EXIF, XMP, and IPTC tags before persisting to disk/S3. |
| **IP Correlation Attack** | Correlating web server access logs with complaint submission timestamps to identify home IP addresses. | Inbound IPs are hashed using an ephemeral HMAC with a daily-rotated secret salt: $\text{HMAC}(\text{IP}, \text{Salt}_{\text{day}})$. Raw IPs are never written to the application database. |

### 3.2 Secret Tracking Token Lifecycle
1. **Entropy Generation:** When an anonymous report is received, the server generates a $256\text{-bit}$ cryptographically secure pseudorandom token:
   $$\text{SecretToken} = \text{crypto.randomBytes(32).toString('hex')}$$
2. **One-Way Storage:** The database generates a random salt and stores the hash:
   $$\text{trackingTokenHash} = \text{argon2id}(\text{SecretToken}, \text{salt})$$
3. **One-Time Client Presentation:** The raw `SecretToken` is returned to the user in the HTTP 201 response payload. The server never logs or caches the plaintext token.
4. **Verification:** When tracking, the user supplies the token; the server validates it against `trackingTokenHash` using constant-time comparison to prevent timing side-channel attacks.

---

## 4. Input Sanitization & Injection Defense

### 4.1 SQL Injection Neutralization
* The platform utilizes **Prisma ORM**, which generates strictly parameterized SQL queries for all CRUD operations.
* Raw SQL queries (`$queryRaw`) are prohibited in the codebase unless reviewed and approved by the Security Architecture Group with mandatory parameter bindings.

### 4.2 Cross-Site Scripting (XSS) & Content Security
* **Helmet.js:** Configured on the Express app to set secure HTTP headers:
  * `Content-Security-Policy (CSP)`
  * `X-Frame-Options: DENY` (Clickjacking prevention)
  * `X-Content-Type-Options: nosniff`
  * `Strict-Transport-Security (HSTS)`
* **Input Sanitization:** Rich text descriptions are stripped of `<script>`, `<iframe>`, and `onerror` inline handlers.

---

## 5. Media & File Upload Security

All uploaded photographs (road cracks, water leaks, garbage heaps) must pass through a multi-tier inspection pipeline before acceptance:

```
[ Inbound Multipart Upload ]
             │
             ▼
[ 1. Size Check ] ──────────► If > 5 MB ──► Reject (413 Payload Too Large)
             │
             ▼
[ 2. Magic Bytes / MIME ] ──► If not JPEG/PNG/WebP ──► Reject (415 Unsupported)
             │
             ▼
[ 3. Buffer In-Memory ] ────► Never written to disk uninspected
             │
             ▼
[ 4. EXIF Stripping ] ──────► Strip GPS, Device Serial, Author, ICC profiles
             │
             ▼
[ 5. WebP Compression ] ────► Re-encode at 80% quality (neutralizes polyglots)
             │
             ▼
[ Secure Object Storage ]
```

---

## 6. Compliance with India's DPDP Act 2023

JanSamadhan is architected to be fully compliant with the **Digital Personal Data Protection Act (DPDP Act 2023)** of India:

1. **Lawful Consent & Notice (Section 6):**
   * Clear, itemized bilingual consent notice during registered onboarding.
   * Consent records logged immutably in `ConsentRecord` table.
2. **Purpose Limitation (Section 7):**
   * Citizen phone numbers and email addresses are used strictly for civic grievance tracking and status updates, never shared with commercial third parties.
3. **Data Minimization:**
   * Only necessary civic data is collected. Anonymous reporting allows citizens to report without providing any personal data whatsoever.
4. **Right to Correction & Erasure (Section 12):**
   * Registered citizens can request account deletion or data anonymization upon resolution of all their open grievances.
5. **Breach Notification Protocol:**
   * Automated monitoring flags abnormal database access or token leaks. Any breach triggers a statutory 72-hour notice protocol to the Data Protection Board of India.

---

## 7. Audit Logging & Disaster Recovery

* **Immutable Activity Logs:** Every administrative action (`VERIFY_PROBLEM`, `ASSIGN_DEPARTMENT`, `APPROVE_PROPOSAL`, `REOPEN_ISSUE`) writes an immutable entry to `ActivityLog` capturing `userId`, `action`, `entityId`, and timestamp.
* **Database Backups:** Automated daily snapshots with 30-day point-in-time recovery (PITR) enabled on production PostgreSQL instances.
* **Disaster Recovery RTO / RPO:**
  * Recovery Time Objective (RTO): $< 2\text{ hours}$
  * Recovery Point Objective (RPO): $< 15\text{ minutes}$ of data loss in catastrophic failure.

