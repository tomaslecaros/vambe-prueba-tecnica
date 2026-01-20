FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files del frontend
COPY frontend/package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código del frontend
COPY frontend/ ./

# Build
RUN npm run build

# Producción
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copiar archivos necesarios del build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
