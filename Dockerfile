# ============================================================
# BUILD STAGE
# ============================================================

FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Vue
RUN npm run build


# ============================================================
# RUNTIME STAGE
# ============================================================

FROM node:22-alpine

WORKDIR /app

# Install serve
RUN npm install -g serve

# Copy hasil build
COPY --from=builder /app/dist ./dist

# Expose internal container port
EXPOSE 9091

# Run Vue frontend
CMD ["serve", "-s", "dist", "-l", "9091"]