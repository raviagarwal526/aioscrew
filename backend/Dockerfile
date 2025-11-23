# Use Node.js 20 Alpine
FROM node:20-alpine AS backend-builder

# Set working directory for backend
WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install ALL dependencies (including devDependencies for building)
RUN npm ci

# Copy backend source code
COPY backend/ .

# Build backend TypeScript
RUN npm run build

# Build frontend
FROM node:20-alpine AS frontend-builder

# Set working directory for frontend
WORKDIR /app/frontend

# Accept build arguments for Vite environment variables
ARG VITE_DATABASE_URL
ARG VITE_API_URL

# Copy frontend package files (from root)
COPY package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source code
COPY src ./src
COPY public ./public
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.app.json ./
COPY tsconfig.node.json ./
COPY postcss.config.js ./
COPY tailwind.config.js ./

# Build frontend with environment variables
ENV VITE_DATABASE_URL=$VITE_DATABASE_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built backend from backend-builder
COPY --from=backend-builder /app/backend/dist ./dist

# Copy built frontend from frontend-builder
COPY --from=frontend-builder /app/frontend/dist ./public

# Expose port (Railway will set PORT env var, typically 8080)
EXPOSE 8080

# Health check - use wget (available in Alpine) with shell to expand PORT variable
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD sh -c "wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/health || exit 1"

# Start server
CMD ["npm", "start"]
