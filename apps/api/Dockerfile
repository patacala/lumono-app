FROM node:20-alpine AS base

WORKDIR /app

# bcrypt needs native compilation on Alpine
RUN apk add --no-cache python3 make g++

# Install dependencies only when needed
FROM base AS deps
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/tsconfig/package.json ./packages/tsconfig/
RUN npm ci

# Build the application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build -w @lumono/api

# Production image
FROM base AS runner
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

USER nestjs

EXPOSE 3001

CMD ["node", "dist/main"]

