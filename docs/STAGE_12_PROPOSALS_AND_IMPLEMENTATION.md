# JanSamadhan – Stage 12: Solution Proposals & Implementation Tracking

## 1. Overview
Stage 12 enables research universities, engineering faculties, and technology partners to submit concrete solution proposals for complex civic challenges, and track implementation through tasks and milestones.

## 2. Architecture & Components
- **Prisma Models**: `SolutionProposal`, `ImplementationTask`, `TaskEvidence`
- **Backend Controller**: `server/controllers/proposalController.js`
- **REST Endpoints**: `server/routes/proposals.js` mounted at `/api/proposals`
- **Client Service**: `client/src/services/proposalService.js`
- **Frontend Pages**:
  - `client/src/pages/proposals/ProposalsPage.jsx`
  - `client/src/pages/proposals/SubmitProposalPage.jsx`

## 3. Key Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/proposals` | List submitted proposals with status filtering |
| GET | `/api/proposals/:id` | Proposal detail and methodology |
| POST | `/api/proposals` | Submit a new technical solution proposal |
| PATCH | `/api/proposals/:id/status` | Evaluate proposal (`ACCEPTED`, `REJECTED`, `UNDER_REVIEW`) |
| GET | `/api/proposals/tasks/list` | List implementation tasks |
| POST | `/api/proposals/tasks` | Create municipal task assignment |
| PATCH | `/api/proposals/tasks/:id` | Update progress % and status |

## 4. Automated Tests
- Test Suite: `server/test-stage12-suite.js` (10/10 tests passing)

