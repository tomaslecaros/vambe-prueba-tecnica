FROM node:20-alpine AS builder

WORKDIR /app

# Variable de entorno para el build (se pasa como ARG)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copiar package files del frontend
COPY frontend/package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código del frontend
COPY frontend/ ./

# Build con la variable de entorno
RUN npm run build

# Producción
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copiar archivos necesarios del build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Crear public folder (puede estar vacía)
RUN mkdir -p ./public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
