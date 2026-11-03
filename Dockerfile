# Multi-stage Production Dockerfile for JanSamadhan

# ── Stage 1: Build Frontend ──────────────────────────────────────────────────
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ── Stage 2: Build & Package Backend ─────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install OpenSSL for Prisma on Alpine
RUN apk add --no-cache openssl libc6-compat

# Copy server package files and install dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --omit=dev

# Copy Prisma schema and generate Prisma client
COPY server/prisma ./prisma
RUN npx prisma generate

# Copy server source code
COPY server/ ./

# Copy compiled frontend from Stage 1 into /app/client/dist
COPY --from=client-builder /app/client/dist /app/client/dist

# Expose server port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
