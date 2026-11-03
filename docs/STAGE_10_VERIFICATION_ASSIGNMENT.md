# JanSamadhan – Stage 10: Verification, Assignment & Status Progression

## 1. Overview
Stage 10 implements the official municipal decision-making and assignment workflow:
1. **Verification Action**: Verification, Rejection (with mandatory reason), or Requesting Additional Information.
2. **Department Routing**: Direct routing to competent municipal department with priority and deadline.
3. **Field Officer Assignment**: Assignment to designated ward officers.
4. **Internal Notes**: Administrative discussion thread isolated from citizen view.
5. **Resolution Progression**: Progression from `IN_PROGRESS` to `RESOLVED` with evidence notes.

## 2. API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/government/problems/:id/verify` | Record official verification/rejection |
| POST | `/api/government/problems/:id/assign-department` | Route to department with priority |
| POST | `/api/government/problems/:id/assign-officer` | Assign specific officer |
| POST | `/api/government/problems/:id/notes` | Post internal administrative note |
| POST | `/api/government/problems/:id/status` | Advance status (`IN_PROGRESS`, `RESOLVED`) |

## 3. Audit Trail
All state-modifying actions automatically write an immutable record to `GovAuditLog`.
