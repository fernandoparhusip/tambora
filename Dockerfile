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

# Build Vue application
RUN npm run build


# ============================================================
# RUNTIME STAGE
# ============================================================

FROM node:22-alpine

WORKDIR /app

# Install only what is needed to run Vite preview
COPY package*.json ./

RUN npm ci --omit=dev

# Copy build result
COPY --from=builder /app/dist ./dist

# Expose frontend port
EXPOSE 9091

# Run Vue/Vite preview
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "9091"]