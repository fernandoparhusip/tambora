# =========================================================
# BUILD STAGE
# =========================================================

FROM node:22 AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies di Linux
RUN rm -rf node_modules && npm install

# Copy source code
COPY . .

# Build Nuxt
RUN npm run build


# =========================================================
# PRODUCTION STAGE
# =========================================================

FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy hasil build Nuxt
COPY --from=builder /app/.output ./.output

# Nuxt production server
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]