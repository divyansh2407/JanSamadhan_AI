# JanSamadhan – Stage 7: Grok AI Civic Problem Analysis Integration

## 1. Executive Overview

Stage 7 incorporates xAI's **Grok API** into JanSamadhan's civic problem-solving pipeline. The platform leverages Grok as an asynchronous, advisory intelligence layer to classify incoming civic complaints, assess public risk severities, recommend responsible municipal departments, synthesize concise 3–4 sentence incident briefings, generate actionable preliminary solutions, and detect potential duplicate reports.

```
       [ Citizen Submits Complaint ] (Registered or Anonymous)
                     │
                     ▼
       [ PostgreSQL Database Write ]  ──> Returns HTTP 201 (<50ms)
                     │
                     ▼ (Asynchronous setImmediate Queue)
       [ AI Analysis Service ]
         ├─ Fetch DB ground-truth Categories & Departments
         ├─ Fetch nearby reports for duplicate detection
         ├─ Prompt Injection Sanitizer (<citizen_report> quarantine)
         └─ Call xAI Grok API (POST /v1/chat/completions)
                     │
                     ▼
       [ Zod Structured Validation ] (grokOutputSchema)
         ├─ Reconcile Category & Department with DB IDs
         └─ Store in PostgreSQL (AIAnalysis record)
                     │
                     ▼
       [ Authorized Officer Review ] (/government/ai-review/:id)
         ├─ "AI-GENERATED RECOMMENDATION" / "REQUIRES HUMAN VERIFICATION"
         ├─ Review Actions: ACCEPT | EDIT | REJECT
         └─ Audit Log Persistence (Zero autonomous government decisions)
```

---

## 2. Strict Human-in-the-Loop Boundaries

In strict compliance with municipal safety policies:
1. **AI is strictly advisory**: Grok recommendations are clearly watermarked as `AI-GENERATED RECOMMENDATION` and `REQUIRES HUMAN VERIFICATION`.
2. **Zero autonomous decisions**: The AI **never** independently verifies, rejects, alters status, re-assigns departments, or marks complaints resolved.
3. **Audit Ledger**: Any officer review action (`ACCEPT`, `EDIT`, `REJECT`) is permanently logged with officer ID, timestamp, and audit remarks in `ActivityLog`.

---

## 3. Grok API Configuration & Environment Variables

Grok API configurations are managed exclusively on the backend (`server/.env`). Secret keys are strictly prohibited from frontend bundles.

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `XAI_API_KEY` | *(Secret)* | Official xAI API Key from console.x.ai |
| `XAI_MODEL` | `grok-2-latest` | Actively supported text model (e.g. `grok-2-latest`, `grok-beta`) |
| `XAI_BASE_URL` | `https://api.x.ai/v1` | Official xAI API Base URL |

### 3.1 Network & Retry Policy
- **Request Timeout**: 20,000ms (20s).
- **Exponential Backoff**: Up to 3 retries for HTTP 429 (Rate Limit) and HTTP 500/502/503/504 errors:
  $$\text{Backoff} = 1000\text{ms} \times 2^{(\text{attempt} - 1)} + \text{jitter}$$
- **Fallback / Test Mode**: When `XAI_API_KEY` is not provided or when running in test mode (`process.env.NODE_ENV === 'test'`), the service automatically activates a deterministic heuristic analyzer. This guarantees zero test flakiness and avoids burning paid xAI credits during automated test runs.

---

## 4. Prompt Engineering & Injection Defense

Citizen-submitted problem titles, descriptions, and locations are treated as **untrusted data**:
- **Quarantine Delimiters**: Inputs are quarantined within `<citizen_report>` and `</citizen_report>` XML tags.
- **Instruction Shielding**: System prompts explicitly command Grok to ignore any instructions, prompts, or persona modifications inside user content.
- **Sanitization Pipeline**: All HTML/script tags, `System:` prefixes, and jailbreak phrases (e.g. `"ignore previous instructions"`, `"you are now DAN"`) are automatically stripped or converted to `[filtered]`.
- **Zero PII Exposure**: Reporter names, emails, phone numbers, and anonymous secret tracking tokens are **never** included in Grok prompts.

---

## 5. Structured Output Schema (Zod)

Grok responses are strictly parsed and validated against `grokOutputSchema` before any database persistence:

```json
{
  "summary": "3-4 concise professional sentences describing the civic problem",
  "suggestedCategory": "Water Supply & Leakage",
  "categoryConfidence": 0.94,
  "categoryReason": "Contextual keywords indicate municipal water distribution failure",
  "severity": "CRITICAL",
  "severityConfidence": 0.92,
  "severityReason": "High-pressure pipeline burst posing pedestrian hazards and utility loss",
  "suggestedDepartment": "Water Supply Department",
  "departmentConfidence": 0.91,
  "urgency": "URGENT",
  "solutionSuggestions": [
    {
      "title": "Site Inspection & Pressure Isolation",
      "description": "Deploy ward valve operator to isolate section and deploy barricades.",
      "department": "Water Supply Department",
      "complexity": "LOW",
      "benefits": "Halts clean water wastage immediately.",
      "limitations": "May temporarily affect supply to adjacent 40 households."
    }
  ],
  "possibleDuplicates": [
    {
      "reportId": "uuid-here",
      "trackingId": "JS-2026-X1Y2Z3",
      "similarityExplanation": "Similar burst reported on same junction 2 hours ago.",
      "confidence": 0.88
    }
  ],
  "requiresHumanReview": true
}
```

---

## 6. Database Schema Enhancements (`AIAnalysis`)

The `AIAnalysis` model in PostgreSQL via Prisma has been enhanced with:
- `summary` (`String`): 3–4 sentence incident briefing.
- `detectedCategory` (`String`): Reconciled municipal category name.
- `categoryConfidence` (`Float`): Confidence score $\in [0, 1]$.
- `severity` (`String`): Severity rating (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- `severityConfidence` (`Float`): Confidence score $\in [0, 1]$.
- `severityReason` (`String`): Factual reasoning for severity.
- `suggestedSolutions` (`String`): JSON-encoded solution suggestion array.
- `recommendedDepartment` (`String`): Reconciled municipal department name.
- `departmentConfidence` (`Float`): Confidence score $\in [0, 1]$.
- `urgency` (`String`): Urgency recommendation.
- `possibleDuplicates` (`String`): JSON-encoded duplicate detection list.
- `confidence` (`Float`): Composite confidence metric.
- `modelName` (`String`): Model identifier (e.g. `grok-2-latest`).
- `processingStatus` (`String`): `PENDING` $\rightarrow$ `PROCESSING` $\rightarrow$ `COMPLETED` / `FAILED`.
- `errorMessage` (`String`): Error details if processing failed.
- `requiresHumanReview` (`Boolean`): Defaults to `true`.
- `reviewStatus` (`String`): `PENDING`, `ACCEPTED`, `EDITED`, or `REJECTED`.
- `reviewedBy` (`String`): User ID of the reviewing officer.
- `reviewedAt` (`DateTime`): Timestamp of officer review.
- `reviewNotes` (`String`): Officer remarks.
- `promptTokens`, `completionTokens`, `totalTokens`, `durationMs`: Token and latency tracking.

---

## 7. Backend API Specifications

### 7.1 Trigger Manual AI Analysis
- **Route**: `POST /api/ai/analyze/:reportId`
- **Access**: `GOVERNMENT`, `SUPER_ADMIN`
- **Body**: `{ "forceReanalyze": true }`
- **Response**: `200 OK` with updated `AIAnalysis` record.

### 7.2 Fetch Latest Analysis
- **Route**: `GET /api/ai/analysis/:reportId`
- **Access**: `GOVERNMENT`, `SUPER_ADMIN`, or the authenticated citizen who submitted the report.
- **Response**: `200 OK` with latest analysis.

### 7.3 Fetch Analysis History
- **Route**: `GET /api/ai/analysis/:reportId/history`
- **Access**: `GOVERNMENT`, `SUPER_ADMIN`
- **Response**: `200 OK` with array of historical analysis runs.

### 7.4 Submit Officer Review Action
- **Route**: `PATCH /api/ai/analysis/:analysisId/review`
- **Access**: `GOVERNMENT`, `SUPER_ADMIN`
- **Body**:
  ```json
  {
    "action": "ACCEPT" | "EDIT" | "REJECT",
    "notes": "Field inspection confirmed pipeline burst.",
    "editedFields": { "severity": "CRITICAL" }
  }
  ```
- **Response**: `200 OK` with updated review status and audit log creation.

---

## 8. Frontend Interface

1. **`AIAnalysisCard.jsx`**:
   - Prominent `AI-GENERATED RECOMMENDATION` and `REQUIRES HUMAN VERIFICATION` badges.
   - Confidence meters with color indicators (Green $\ge 90\%$, Emerald $\ge 80\%$, Amber $< 80\%$).
   - Severity & Urgency cards with reasoning.
   - Department routing with confidence.
   - Solution suggestion cards with complexity levels (`LOW`, `MEDIUM`, `HIGH`) and operational limitations.
   - Duplicate warning accordions.
   - Officer review buttons: "Accept Suggestions", "Modify", "Reject".
2. **`AIReviewModal.jsx`**:
   - Interactive dialog allowing officers to modify category, severity, or department before confirming.
   - Enforces required officer audit remarks.
3. **`AIAnalysisPreviewPage.jsx`**:
   - Dedicated review portal mounted at `/government/ai-review/:problemId`.
   - Accessible by authorized municipal personnel.

---

## 9. Automated Test Verification (129 / 129 Tests Passing)

All four automated test suites pass with 100% success rate:

```bash
JanSamadhan Test Suite Matrix:
  ✅ Stage 4 PostgreSQL Foundation: 58 / 58 Passed (100%)
  ✅ Stage 5 Citizen Dashboard   : 14 / 14 Passed (100%)
  ✅ Stage 6 Reporting & Intake   : 23 / 23 Passed (100%)
  ✅ Stage 7 Grok AI Integration  : 34 / 34 Passed (100%)
  ---------------------------------------------------------
  🎯 Total Backend Verification  : 129 / 129 Passed (100%)
  📦 Frontend Vite Build Check   : 2029 Modules, 0 Errors
```

### Running Tests Locally
```bash
# In JanSamadhan/server directory:
node test-stage7-suite.js
node test-stage6-suite.js
node test-stage5-suite.js
node test-stage4-suite.js
```
