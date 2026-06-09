FROM node:22-alpine AS base

# --- STAGE 1: Install Dependencies ---
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package management files to cache layer steps smoothly
COPY package.json package-lock.json* ./
RUN npm ci

# --- STAGE 2: Build Stage ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars: NEXT_PUBLIC_* must be available at build time
# because Next.js inlines them into the client bundle during `next build`.
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:5108
ARG NEXT_PUBLIC_SIGNALR_HUB_URL=http://localhost:5108/hubs
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_SIGNALR_HUB_URL=$NEXT_PUBLIC_SIGNALR_HUB_URL

# Turn off telemetry tracking during production builds
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- STAGE 3: Production Runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Leverage Next.js standalone outputs to trim down size drastically
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]