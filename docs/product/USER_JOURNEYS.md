# JanSamadhan – End-to-End User Journeys Specification

**Document Reference:** `JSD-UJ-001`  
**Version:** `1.0.0`  
**Classification:** Single Source of Truth (SSOT)  
**Document Owner:** JanSamadhan Product & UX Design Group  

---

## 1. Overview of Platform Personas

JanSamadhan serves seven distinct user personas across the civic problem-solving lifecycle:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        JANSAMADHAN USER PERSONAS                       │
├─────────────────────────┬──────────────────────┬───────────────────────┤
│ 1. Registered Citizen   │ 4. University Member │ 7. Super Admin        │
│ 2. Anonymous Citizen    │ 5. Domain Expert     │                       │
│ 3. Government Officer   │ 6. Industry Partner  │                       │
└─────────────────────────┴──────────────────────┴───────────────────────┘
```

---

## 2. Detailed Persona Journeys

### 2.1 Journey 1: Registered Citizen (Aarav Sharma)

* **Profile:** 34-year-old software engineer, active RWA member in Ward 24, Bengaluru.
* **Motivation:** Ensure long-standing sewage overflow outside his residential lane is permanently fixed.

#### Happy Path Flow
1. **Authentication:** Aarav opens `http://localhost:5173/login`, logs in with his verified citizen credentials.
2. **Dashboard Ingestion:** Directed to `/citizen/dashboard`, where he views his active reports and neighborhood stats.
3. **Report Initiation:** Clicks **"Report a Problem"** (`/report`).
4. **Data Capture:**
   * Enters Title: *"Sewage line backflow on 4th Main Road"*.
   * Selects Category: *"Water and Sanitation"*.
   * Captures GPS location via Leaflet interactive map, adjusting pin precisely to the overflowing manhole.
   * Uploads two high-resolution photos ($< 5\text{MB}$ each).
   * Types description highlighting vector breeding risks.
5. **Submission:** Clicks **"Submit Report"**. The frontend dispatches `POST /api/problems`.
6. **AI Triage Notification:** Within 3 seconds, UI informs Aarav that **Grok AI** categorized the issue with High Severity and suggested routing to the *Bangalore Water Supply and Sewerage Board (BWSSB)*.
7. **Tracking:** Problem enters `SUBMITTED` state. Aarav receives an SMS and in-app notification with issue ID `PRB-2026-00412`.
8. **Upvoting:** Neighbors in Aarav's RWA view the issue on their community map and click **Upvote**, raising its community priority score.
9. **Resolution & Verification:** 
   * When the contractor marks repairs complete, Aarav receives a push alert: *"BWSSB has marked your issue resolved. Please verify within 48 hours."*
   * Aarav visits the spot, sees new drainage piping laid, and clicks **"Verify Resolution"** on his dashboard, giving a 5-star rating. Problem transitions to `RESOLVED`.

#### Edge Cases & Failure Flows
* **Duplicate Detected:** When Aarav inputs the location and title, the client prompts: *"Similar issue reported 30m away 4 hours ago. Do you want to upvote PRB-2026-00398 instead?"* Aarav clicks "Yes", preventing ticket clutter.
* **Network Interruption:** If network drops during image upload, client caches payload in `localStorage` and automatically prompts retry on reconnection.

---

### 2.2 Journey 2: Anonymous Citizen (Anonymous Whistleblower)

* **Profile:** Urban resident reporting illegal chemical effluent dumping into a storm drain by a nearby factory at midnight.
* **Motivation:** Expose a severe environmental hazard without risking personal safety or commercial retaliation.

#### Happy Path Flow
1. **Access Gateway:** Navigates directly to `http://localhost:5173/report/anonymous` without logging in.
2. **Privacy Notice:** Reads the clear privacy banner: *"Zero personal data collected. EXIF metadata stripped. You will receive a secret tracking token to check status."*
3. **Data Input:**
   * Enters Title: *"Chemical wastewater discharge into storm drain near Kengeri Bridge"*.
   * Category: *"Environment and Pollution"*.
   * Drops map pin on location.
   * Uploads night photograph of the colored discharge.
4. **Receipt Generation:**
   * Hits **"Submit Anonymous Report"**.
   * Client receives `201 Created` with payload containing:
     * Public Tracking ID: `TRK-2026-981423`
     * Secret Tracking Token: `a9f24c8b6e01d4a...` (64-character hex)
   * UI displays modal: *"Save your Secret Tracking Token now. This key is never stored in plaintext and cannot be recovered."* Aarav clicks **"Copy Token & Save PDF"**.
5. **Subsequent Status Tracking:**
   * 48 hours later, the citizen opens `http://localhost:5173/track`.
   * Enters `TRK-2026-981423` and pastes the secret token.
   * The backend validates the token hash in constant time and returns status: *"Verified by Environmental Cell; Field Inspection scheduled for tomorrow."*

#### Security & Error Handling
* **Incorrect Token:** Providing an invalid secret token returns `401 Unauthorized` with a generic message: *"Invalid tracking credentials."* Sequential ID brute-forcing is mathematically impossible.
* **Spam Flood:** Submitting $>3$ reports within 15 minutes from the same IP subnet triggers HTTP `429 Too Many Requests`.

---

### 2.3 Journey 3: Government Officer (Er. Ramesh Kulkarni, Ward Junior Engineer)

* **Profile:** 42-year-old PWD Junior Engineer assigned to Ward 31, Pune Municipal Corporation (PMC).
* **Motivation:** Clear his ward's complaint backlog within statutory Citizen Charter SLAs ($72\text{ hours}$).

#### Happy Path Flow
1. **Login:** Authenticates at `/login` with official government credentials. System verifies `GOVERNMENT` role and loads the Ward 31 Authority Triage Board.
2. **Triage Review:**
   * Reviews incoming ticket `PRB-2026-00412` (Categorized as *Water and Sanitation*, Severity *CRITICAL* by Grok AI).
   * Inspects citizen photos and GIS map location.
3. **Verification & Action:**
   * Clicks **"Verify & Accept"**.
   * Reassigns ticket to internal Drainage Maintenance Contractor *M/s Apex Infrastructure* with a $48\text{ hour}$ SLA.
   * Problem state updates to `ASSIGNED`.
4. **Field Execution Monitoring:**
   * Contractor uploads photo evidence of excavated pipe and replacement pipe.
   * Officer inspects photographic evidence and clicks **"Approve Execution Evidence"**.
5. **Resolution Claim:**
   * Clicks **"Mark Resolved"**, uploading official completion memo. Problem state updates to `IN_VERIFICATION`.

#### Error & Edge Cases
* **Jurisdictional Mismatch:** If an issue falls under the State Highway Authority rather than PMC, Ramesh clicks **"Forward Jurisdiction"**, selecting the Highway Department with an explanatory note.
* **Frivolous / Spam Report:** Ramesh marks the report **"Rejected"**, selecting standard reason *"Invalid civic location / private property"* with a mandatory remark.

---

### 2.4 Journey 4: University Researcher (Dr. Priya Nair, Civil Engineering Faculty)

* **Profile:** Professor of Urban Hydrology at COEP Tech University.
* **Motivation:** Partner with municipal bodies to pilot sustainable permeable pavement solutions for chronic urban waterlogging.

#### Happy Path Flow
1. **Access:** Logs in to `/university/dashboard`.
2. **Challenge Discovery:** Browses the **Open Research Challenges** tab filtered for *"Chronic Waterlogging Hotspots"*.
3. **Collaboration Space Creation:**
   * Selects cluster of recurring complaints in Deccan Gymkhana area.
   * Clicks **"Create Solution Proposal"**.
   * Enters project title: *"Bioswale and Permeable Paver Retrofit for Sub-basin 4"*.
   * Attaches structural CAD drawings, hydrological runoff calculations, and an estimated material budget of ₹4.5 Lakhs.
4. **Peer Review & Approval:**
   * Proposal is reviewed by external Civil Experts on the platform.
   * Municipal Superintending Engineer approves the pilot.
5. **Milestone Tracking:** Dr. Nair tracks university student interns conducting weekly soil infiltration tests linked to the task board.

---

### 2.5 Journey 5: Domain Expert (Ar. Rajiv Saxena, Urban Planning Fellow)

* **Profile:** Independent urban designer with 25 years experience, certified by Council of Architecture.
* **Motivation:** Provide impartial peer review to ensure civic projects comply with environmental and safety standards.

#### Happy Path Flow
1. **Review Queue:** Receives notification: *"New University Proposal requires Expert Feasibility Review."*
2. **Technical Evaluation:**
   * Opens `/expert/reviews/PROP-2026-081`.
   * Evaluates technical feasibility across 5 criteria (structural stability, drainage capacity, material availability, cost realism, regulatory compliance).
   * Inputs score: $88/100$ and appends technical note recommending geotextile underlayment.
3. **Submission:** Submits signed evaluation. Review becomes part of the permanent immutable proposal audit trail.

---

### 2.6 Journey 6: Industry Partner (Vikram Patel, Director at InfraTech Solutions)

* **Profile:** Licensed municipal civil contractor and CSR implementer.
* **Motivation:** Execute sanctioned municipal repair tenders efficiently and provide verifiable CSR impact reports to corporate boards.

#### Happy Path Flow
1. **Work Order Ingestion:** Logs into `/industry/dashboard`, viewing active work orders assigned by Ward 31.
2. **Execution Milestones:**
   * Task 1: Site Clearance $\rightarrow$ Uploads "Before" photo with GPS metadata verified by client browser.
   * Task 2: Pipe Replacement $\rightarrow$ Uploads "In-Progress" photo and batch invoice receipt.
   * Task 3: Surface Re-asphalting $\rightarrow$ Uploads "After" photo.
3. **Sign-off Request:** Clicks **"Submit for Department Inspection"**.

---

### 2.7 Journey 7: Super Administrator (IT Directorate, Smart City Mission)

* **Profile:** Central Platform Security Administrator.
* **Motivation:** Ensure uptime, data privacy compliance (DPDP Act), role governance, and API cost controls.

#### Happy Path Flow
1. **Health Check:** Logs into `/admin/dashboard` with hardware FIDO2 MFA.
2. **Telemetry Inspection:**
   * Monitors Grok AI API token consumption ($42,000\text{ tokens used today}, \$0.84\text{ spend}$).
   * Observes system latency ($P_{95} = 142\text{ ms}$).
3. **Department Provisioning:** Provisions new municipal zone for expanding pilot to a neighboring city, configuring 15 new wards and department heads.
4. **Audit Trail Review:** Inspects cryptographic activity logs to verify no unauthorized role escalation occurred.
