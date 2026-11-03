# JanSamadhan – Architecture Overview

> **Stage 4: PostgreSQL Database Architecture & Core Backend APIs**

---

## System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                        User's Browser                          │
│                                                                │
│   React 18 + Vite  (http://localhost:5173)                     │
│   ┌──────────────────────────────────────────────────────────┐ │
│   │  React Router DOM  →  Pages  →  Components               │ │
│   │  Axios (services/api.js, withCredentials: true)          │ │
│   │  Tailwind CSS + Lucide React + Framer Motion             │ │
│   └──────────────────────┬───────────────────────────────────┘ │
└─────────────────────────-│──────────────────────────────────── ┘
                           │  HTTP / REST  (/api/*)
                           │  (HTTP-only session cookies / Bearer JWT)
┌──────────────────────────▼─────────────────────────────────────┐
│                    Express.js API Server                        │
│                 (http://localhost:5000)                         │
│                                                                │
│   server.js  ──▶  app.js                                       │
│                     │                                          │
│                     ├─▶  CORS (with credentials)               │
│                     ├─▶  cookie-parser                         │
│                     ├─▶  JSON Body Parser                      │
│                     ├─▶  Rate Limiter                          │
│                     ├─▶  Routes:                               │
│                     │     • /api/health                        │
│                     │     • /api/auth                          │
│                     │     • /api/users                         │
│                     │     • /api/departments                   │
│                     │     • /api/categories                    │
│                     │     • /api/problems                      │
│                     ├─▶  Controllers                           │
│                     ├─▶  Services (aiService.js xAI scaffold)   │
│                     └─▶  Error Handler Middleware              │
│                                                                │
└──────────────────────────┬─────────────────────────────────────┘
                           │
                           │  Prisma Client ORM (Type-Safe SQL)
                           ▼
┌────────────────────────────────────────────────────────────────┐
│                  PostgreSQL Relational Database                 │
│                                                                │
│   Tables (schema.prisma):                                      │
│   • users (CITIZEN, GOVERNMENT, UNIVERSITY, EXPERT, ...)       │
│   • departments                                                │
│   • problem_categories                                         │
│   • problems (severity, priority, status, geo-location)        │
│   • ai_analyses (Grok API results)                             │
│   • solution_proposals                                         │
│   • collaborations                                             │
│   • implementation_tasks                                       │
│   • notifications                                              │
│   • activity_logs                                              │
│   • feedbacks                                                  │
└────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Directory Responsibilities

| Directory | Responsibility |
|-----------|---------------|
| `src/pages/` | Route-level "smart" components – fetch data and compose layouts |
| `src/components/` | Reusable, stateless UI components (buttons, cards, badges, forms) |
| `src/layouts/` | Page wrapper templates (e.g. `MainLayout`, `AuthLayout`) |
| `src/context/` | React Context providers (AuthContext, ThemeContext) |
| `src/hooks/` | Custom React hooks (`useAuth`, `useFetch`, `useDebounce`) |
| `src/services/` | Axios-based API service modules (`authService`, `reportsService`) |
| `src/routes/` | Route protection guards and route configuration |
| `src/utils/` | Pure helper functions (date formatting, validation, etc.) |
| `src/assets/` | Static images, fonts, and SVG icons |

### Data Flow

```
User Interaction
    │
    ▼
Page Component (pages/)
    │  calls hook or service
    ▼
Custom Hook (hooks/) or Service (services/)
    │  uses api.js (Axios instance)
    ▼
Backend REST API
    │
    ▼
Response → State update → Re-render
```

### Routing Strategy (React Router DOM v6)

- All routes are declared in `App.jsx`
- Protected routes will be wrapped by a `<PrivateRoute>` guard (Stage 2)
- Layouts are composed at the route level, not nested in `App.jsx`

---

## Backend Architecture

### Request Lifecycle

```
HTTP Request
    │
    ▼
CORS Middleware
    │
    ▼
Body Parser (JSON)
    │
    ▼
Router (routes/)
    │
    ▼
Auth Middleware (Stage 2+)
    │
    ▼
Controller (controllers/)
    │  delegates business logic
    ▼
Service Layer (services/)
    │  interacts with database
    ▼
Mongoose Model (models/)
    │
    ▼
MongoDB
    │
    ▼
Controller formats response
    │
    ▼
HTTP Response
```

### Error Handling

All errors bubble up to the centralized `errorHandler` middleware (`middleware/errorHandler.js`).
Controllers should `next(error)` rather than sending error responses directly.
Error objects can carry a `.statusCode` property to control the HTTP status.

### Environment Configuration

All secrets and environment-specific values live in `server/.env` (not committed).
`dotenv` is loaded once at the top of `server.js` and `app.js`.

---

## Security Considerations (Stage 1)

| Concern | Current Approach |
|---------|-----------------|
| CORS | Whitelist only known frontend origins via `CORS_ORIGIN` env var |
| Secrets | All in `.env`, excluded from Git via `.gitignore` |
| Dependencies | Minimal – only what Stage 1 requires |
| Error messages | Stack traces exposed only in `NODE_ENV=development` |

---

## Stage 2+ Planned Additions

- MongoDB connection pool in `config/db.js`
- JWT authentication middleware in `middleware/auth.js`
- Mongoose models: `User`, `Report`, `Department`, `Comment`
- Input validation with `express-validator` or `zod`
- Rate limiting with `express-rate-limit`
- File uploads with `multer`
- Grok AI integration in `services/aiService.js`
