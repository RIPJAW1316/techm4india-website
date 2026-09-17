# Multi-stage production Dockerfile for TechM4India ERP NestJS API
# Optimized for Render Docker runtime and standard container deployments

# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies required for compilation)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy compiler configurations and source code
COPY tsconfig*.json nest-cli.json ./
COPY src ./src/

# Compile TypeScript / NestJS application
RUN npm run build

# Stage 2: Production runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=10000

# Install runtime utilities (dumb-init for PID 1 signal handling)
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled distribution and Prisma artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Security: run as non-root node user
USER node

EXPOSE 10000

# Handle container lifecycle signals cleanly
ENTRYPOINT ["dumb-init", "--"]

# Execute pending Prisma migrations, then start the compiled NestJS API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
