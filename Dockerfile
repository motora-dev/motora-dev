FROM node:22.18-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.14.0

# Install required system dependencies
RUN apt-get update && \
    apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and other configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/server/package.json ./packages/server/
COPY packages/shared/config-eslint/package.json ./packages/shared/config-eslint/
COPY packages/shared/config-jest/package.json ./packages/shared/config-jest/
COPY packages/shared/config-typescript/package.json ./packages/shared/config-typescript/
COPY packages/server/prisma/ ./packages/server/prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build only the server
RUN pnpm run build --filter=@monorepo/server

# Production stage
FROM node:22.18-slim AS runner

WORKDIR /app

# Install required system dependencies for production
RUN apt-get update && \
    apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy necessary files from builder stage
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/server/node_modules ./packages/server/node_modules
COPY --from=builder /app/packages/server/package.json ./packages/server/
COPY --from=builder /app/packages/server/prisma ./packages/server/prisma

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Set working directory to server
WORKDIR /app/packages/server

# Start the server
CMD ["node", "dist/main.js"]
