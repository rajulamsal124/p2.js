# Base stage for all builds
FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# Development stage
FROM base AS development
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev"]

# Test stage
FROM base AS test
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
CMD ["pnpm", "test"]

# Build stage
FROM base AS builder
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN pnpm build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
RUN npm install --production
EXPOSE 3000
CMD ["node", "dist/server.js"]
