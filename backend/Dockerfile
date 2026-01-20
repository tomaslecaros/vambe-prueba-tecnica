FROM node:20-alpine AS builder

# Instalar OpenSSL para Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copiar archivos de dependencias del backend
COPY backend/package*.json ./
COPY backend/tsconfig*.json ./
COPY backend/nest-cli.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente del backend
COPY backend/ ./

# Generar Prisma Client
RUN npx prisma generate --schema=./database/schema.prisma

# Compilar
RUN npm run build

# Producción
FROM node:20-alpine

# Instalar OpenSSL para Prisma en runtime
RUN apk add --no-cache openssl

WORKDIR /app

# Copiar package files
COPY backend/package*.json ./

# Instalar solo producción
RUN npm ci --only=production

# Copiar dist compilado y Prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/database ./database

EXPOSE 3000

# Ejecutar migraciones y luego iniciar
CMD ["sh", "-c", "npx prisma migrate deploy --schema=./database/schema.prisma && node dist/main.js"]
