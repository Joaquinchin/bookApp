# 1) Dependencias
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm ci --only=production

# 2) Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

# Build arguments for environment variables
ARG MONGODB_URI
ARG JWT_SECRET
ARG NEXT_PUBLIC_GOOGLE_API_KEY

# Set environment variables for build
ENV MONGODB_URI=$MONGODB_URI
ENV JWT_SECRET=$JWT_SECRET
ENV NEXT_PUBLIC_GOOGLE_API_KEY=$NEXT_PUBLIC_GOOGLE_API_KEY

# Install all dependencies for build (including devDependencies)
RUN npm ci
RUN npm run build

# 3) Runtime mínimo
FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copiamos salida standalone + estáticos
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Verificar que server.js existe antes de ejecutar
RUN ls -la /app/
CMD ["node", "server.js"]
