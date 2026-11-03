# JanSamadhan – Stage 11: Multi-Stakeholder Collaboration Platform

## 1. Overview
The JanSamadhan Collaboration Platform bridges traditional municipal departments with academic universities, research institutes, domain specialists, community NGOs, and private CSR industries.

## 2. Architecture & Components
- **Prisma Models**: `Collaboration`, `CollaborationMember`, `Organization`
- **Backend Controller**: `server/controllers/collaborationController.js`
- **REST Endpoints**: `server/routes/collaborations.js` mounted at `/api/collaborations`
- **Client Service**: `client/src/services/collaborationService.js`
- **Frontend Pages**:
  - `client/src/pages/collaborations/CollaborationsPage.jsx`
  - `client/src/pages/collaborations/CollaborationDetailPage.jsx`

## 3. Key Endpoints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/collaborations` | List collaborative initiatives |
| GET | `/api/collaborations/:id` | Detailed collaboration workspace |
| POST | `/api/collaborations` | Launch new collaboration initiative (Gov/Admin) |
| POST | `/api/collaborations/:id/join` | Join workspace as researcher / partner / observer |
| PATCH | `/api/collaborations/:id/status` | Update collaboration lifecycle status |

## 4. Automated Tests
- Test Suite: `server/test-stage11-suite.js` (9/9 tests passing)

