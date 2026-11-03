# 🚀 JanSamadhan – Production Deployment Guide

This guide walks you through deploying **JanSamadhan** to production. Choose the deployment strategy that best fits your requirements and budget.

---

## 📋 Pre-Deployment Checklist
- [x] Production build verified (`npm run build --prefix client`)
- [x] Database migrations & schema ready (`server/prisma/schema.prisma`)
- [x] Zero-PII anonymous & registered citizen flows tested
- [x] Image upload pipeline configured with EXIF sanitization
- [x] Fallback offline store active for zero-downtime resilience

---

## 🌟 Option 1: All-in-One Free Cloud Deployment on Render (Recommended)

Render offers a **Free Tier** for both Node.js web services and PostgreSQL databases. The express server serves both the API endpoints (`/api/*`) and the compiled React SPA (`client/dist`).

### Step-by-Step Instructions:
1. **Push your code to GitHub**:
   - Create a repository on GitHub (e.g. `jansamadhan`).
   - Push your code to the `main` branch.

2. **Sign up on Render**:
   - Go to [render.com](https://render.com) and log in with GitHub.

3. **Deploy with 1-Click Blueprint (`render.yaml`)**:
   - In Render Dashboard, click **New +** > **Blueprint**.
   - Connect your GitHub repository.
   - Render will detect `render.yaml` and automatically configure:
     - **Database**: Managed PostgreSQL (`jansamadhan-db`)
     - **Web Service**: Node.js Fullstack app (`jansamadhan-app`)
     - Auto-generated `DATABASE_URL` and `JWT_SECRET`.
   - Click **Apply**.

4. **Or Create Manually on Render**:
   - **PostgreSQL Database**:
     - Click **New +** > **PostgreSQL**.
     - Name: `jansamadhan-db`, Database: `jansamadhan`, User: `jansamadhan_user`.
     - Copy the **Internal Database URL**.
   - **Web Service**:
     - Click **New +** > **Web Service**.
     - Environment: `Node`.
     - Build Command:
       ```bash
       npm install && npm run build --prefix client && cd server && npm install && npx prisma generate
       ```
     - Start Command:
       ```bash
       cd server && npx prisma db push && node server.js
       ```
     - Environment Variables:
       - `NODE_ENV`: `production`
       - `DATABASE_URL`: *(paste Internal Database URL)*
       - `JWT_SECRET`: *(enter a random 32-character secret)*
       - `JWT_EXPIRES_IN`: `7d`
       - `GROK_API_KEY`: *(optional, your xAI Grok API key)*

---

## 🚂 Option 2: Railway Deployment

Railway provides seamless fullstack deployments with high speed and zero configuration.

### Steps:
1. Go to [railway.app](https://railway.app) and sign in.
2. Click **New Project** > **Deploy from GitHub repo**.
3. Select your JanSamadhan repository.
4. Click **+ New** > **Database** > **Add PostgreSQL**.
5. In your web service settings, add Environment Variables:
   - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}`
   - `JWT_SECRET`: *(generate random string)*
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
6. Set Build & Start commands:
   - **Build Command**: `npm install && npm run build --prefix client && cd server && npm install && npx prisma generate`
   - **Start Command**: `cd server && npx prisma db push && node server.js`
7. Click **Generate Domain** under Networking.

---

## ⚡ Option 3: Split Deployment (Vercel Frontend + Render/Railway Backend)

If you prefer Vercel for high-speed edge frontend delivery:

### 1. Database & Backend (Render, Railway, or Fly.io):
- Deploy `server/` with `DATABASE_URL` (from [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com) free tier).
- Copy your live backend URL: `https://api.yourdomain.com`.

### 2. Frontend on Vercel:
1. Go to [vercel.com](https://vercel.com).
2. Import your GitHub repository.
3. Set **Root Directory** to `client`.
4. Add Environment Variable:
   - `VITE_API_URL`: `https://api.yourdomain.com/api`
5. Click **Deploy**. (SPA rewrites are automatically handled by `client/vercel.json`).

---

## 🐳 Option 4: Docker & Docker Compose (Self-Hosted / VPS)

Deploy anywhere (Ubuntu VPS, AWS EC2, DigitalOcean, Linode) using Docker.

```bash
# 1. Clone repository on your server
git clone <your-repo-url>
cd JanSamadhan

# 2. Run with Docker Compose
docker compose up -d --build

# 3. Check running containers
docker compose ps

# 4. Run database migrations / seed
docker compose exec app npx prisma db push --schema=server/prisma/schema.prisma
docker compose exec app node server/prisma/seed.js
```
The app will be available at `http://your-server-ip:5000`.

---

## 🔑 Production Environment Variables Reference

| Variable | Description | Required | Example |
| :--- | :--- | :---: | :--- |
| `NODE_ENV` | Environment mode | Yes | `production` |
| `PORT` | HTTP Server port | Yes | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgresql://user:pass@host:5432/jansamadhan` |
| `JWT_SECRET` | Cryptographic key for JWTs | Yes | `min_32_characters_random_secret` |
| `JWT_EXPIRES_IN` | Token lifetime | No | `7d` |
| `CORS_ORIGIN` | Allowed frontend domains | No | `https://jansamadhan.vercel.app` |
| `GROK_API_KEY` | xAI Grok API key | No | `xai-xxxxxxxxxxxx` |
| `RESEND_API_KEY` | Resend email dispatch key | No | `re_xxxxxxxxxxxx` |
| `EMAIL_FROM` | Sender address for notifications | No | `alerts@jansamadhan.gov.in` |

---

## 🩺 Post-Deployment Health Check
After deploying, verify:
1. `GET https://your-domain/api/health` ➡️ `{ status: "OK", database: "connected" }`
2. `GET https://your-domain/api/categories` ➡️ 12 municipal categories returned.
3. Open `https://your-domain` in browser ➡️ Interactive JanSamadhan citizen platform loaded.

