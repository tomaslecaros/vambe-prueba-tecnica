# 🚀 Guía de Deployment en Northflank

Esta guía te ayudará a desplegar tu proyecto completo (Backend + Frontend + Base de Datos) en Northflank.

## 📋 Prerequisitos

1. Cuenta en [Northflank](https://northflank.com)
2. Repositorio de GitHub con tu código (ya lo tienes: `tomaslecaros/vambe-prueba-tecnica`)
   - **✅ NO necesitas separar el repositorio** - Puedes usar el monorepo tal como está
3. API Key de OpenAI para el backend

## 📁 Estructura del Monorepo

Tu proyecto usa un monorepo (todo en un solo repositorio):
```
vambe-prueba-tecnica/
├── backend/          # NestJS backend
├── frontend/         # Next.js frontend
└── ...
```

Los Dockerfiles están configurados para trabajar con esta estructura desde la raíz del repositorio.

---

## 🗄️ Paso 1: Crear Base de Datos PostgreSQL

1. **Ir a Northflank Dashboard** → Click en "Create" → "Add Service"
2. **Seleccionar "Database"** → Elegir **PostgreSQL**
3. **Configuración:**
   - **Name**: `vambe-postgres` (o el nombre que prefieras)
   - **Version**: `15` (o la más reciente)
   - **Storage**: 10GB (puedes ajustar según necesidad)
   - **Region**: Elegir la más cercana a tus usuarios
4. **Crear** y esperar a que esté listo
5. **Copiar las credenciales** (las necesitarás después):
   - Host
   - Port
   - Database name
   - User
   - Password

---

## 🔴 Paso 2: Crear Redis

1. **Create** → "Add Service" → **Redis**
2. **Configuración:**
   - **Name**: `vambe-redis`
   - **Version**: `7-alpine` o más reciente
   - **Storage**: 1GB (suficiente para colas)
3. **Crear** y copiar las credenciales

---

## 🔧 Paso 3: Preparar el Backend

### 3.1 Crear Dockerfile para Backend

Crea `backend/Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY backend/package*.json ./
COPY backend/tsconfig*.json ./
COPY backend/nest-cli.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY backend/ ./

# Generar Prisma Client
RUN npx prisma generate --schema=./database/schema.prisma

# Compilar
RUN npm run build

# Producción
FROM node:20-alpine

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

CMD ["node", "dist/main.js"]
```

### 3.2 Crear archivo .dockerignore

Crea `backend/.dockerignore`:

```
node_modules
dist
.env
*.log
.DS_Store
```

---

## 🎨 Paso 4: Preparar el Frontend

### 4.1 Dockerfile para Frontend (Monorepo)

**Ya está creado** `frontend/Dockerfile` configurado para monorepo:

El Dockerfile ya está configurado. Revisa `frontend/Dockerfile` para ver los detalles.

### 4.2 next.config.mjs actualizado

**Ya está actualizado** `frontend/next.config.mjs` con `output: 'standalone'` necesario para Docker.

### 4.3 .dockerignore para frontend

**Ya está creado** `frontend/.dockerignore`:

```
node_modules
.next
.env*
*.log
.DS_Store
```

---

## 🚢 Paso 5: Desplegar Backend en Northflank

1. **Create** → "Add Service" → **"Container Service"**
2. **Configuración General:**
   - **Name**: `vambe-backend`
   - **Source**: Seleccionar "Git Repository"
   - **Repository**: `tomaslecaros/vambe-prueba-tecnica`
   - **Branch**: `dev` (o `main`)

3. **Build Settings:**
   - **Build Method**: Dockerfile
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Context Path**: `.` (raíz del repositorio, ya que el Dockerfile copia desde `backend/`)
   - **O alternativamente**:
     - **Context Path**: `backend` 
     - **Dockerfile Path**: `Dockerfile` (relativo al context path)

4. **Variables de Entorno** (en Secrets/Environment):
   ```
   DATABASE_URL=postgresql://usuario:password@host:puerto/vambe_db
   OPENAI_API_KEY=tu-api-key-de-openai
   REDIS_HOST=vambe-redis
   REDIS_PORT=6379
   PORT=3000
   NODE_ENV=production
   ```

5. **Connections** (conectar servicios):
   - Conectar a `vambe-postgres` (se agregará automáticamente como variable `DATABASE_URL`)
   - Conectar a `vambe-redis` (se agregará como `REDIS_HOST` y `REDIS_PORT`)

6. **Ports:**
   - **Port**: `3000`
   - **Protocol**: HTTP

7. **Deploy** → Esperar a que el build termine

---

## 🎨 Paso 6: Desplegar Frontend en Northflank

1. **Create** → "Add Service" → **"Container Service"**
2. **Configuración General:**
   - **Name**: `vambe-frontend`
   - **Source**: Mismo repositorio (`tomaslecaros/vambe-prueba-tecnica`)
   - **Branch**: `dev` (o `main`)

3. **Build Settings:**
   - **Build Method**: Dockerfile
   - **Dockerfile Path**: `frontend/Dockerfile`
   - **Context Path**: `.` (raíz del repositorio, ya que el Dockerfile copia desde `frontend/`)
   - **O alternativamente**:
     - **Context Path**: `frontend`
     - **Dockerfile Path**: `Dockerfile` (relativo al context path)

4. **Variables de Entorno:**
   ```
   NEXT_PUBLIC_API_URL=https://vambe-backend-tu-proyecto.northflank.app
   NODE_ENV=production
   PORT=3000
   ```

   ⚠️ **IMPORTANTE**: Reemplaza `vambe-backend-tu-proyecto` con la URL real de tu backend

5. **Ports:**
   - **Port**: `3000`
   - **Protocol**: HTTP

6. **Deploy**

---

## 📝 Paso 7: Ejecutar Migraciones de Prisma

Después de desplegar el backend, necesitas ejecutar las migraciones:

1. **Opción A - Desde el servicio**:
   - Ve al servicio `vambe-backend`
   - Abre la terminal/console
   - Ejecuta:
     ```bash
     cd /app
     npx prisma migrate deploy --schema=./database/schema.prisma
     ```

2. **Opción B - Agregar al Dockerfile**:
   Puedes agregar un script de inicio que ejecute migraciones automáticamente.

---

## 🔗 Paso 8: Actualizar URLs

1. **Obtener URL del Backend:**
   - Ve al servicio `vambe-backend` en Northflank
   - Copia la URL pública (ej: `https://vambe-backend-xyz.northflank.app`)

2. **Actualizar Frontend:**
   - Ve al servicio `vambe-frontend`
   - Edita las variables de entorno
   - Actualiza `NEXT_PUBLIC_API_URL` con la URL real del backend
   - **Redeploy** el frontend

---

## ✅ Paso 9: Verificar Deployment

1. **Backend:**
   - Visita: `https://tu-backend-url.northflank.app`
   - Deberías ver respuesta o error 404 (normal, el root no tiene endpoint)

2. **Test endpoint:**
   - `https://tu-backend-url.northflank.app/dashboards`
   - Debería retornar JSON o error de DB (si no corriste migraciones)

3. **Frontend:**
   - Visita: `https://tu-frontend-url.northflank.app`
   - Debería cargar la aplicación

4. **Bull Board (Admin):**
   - `https://tu-backend-url.northflank.app/admin/queues`

---

## 🔐 Paso 10: Variables de Entorno Importantes

### Backend:
- `DATABASE_URL` - Conectado automáticamente si conectas el servicio PostgreSQL
- `OPENAI_API_KEY` - **Debes agregarlo manualmente** (secreto)
- `REDIS_HOST` - Conectado automáticamente si conectas Redis
- `REDIS_PORT` - Conectado automáticamente
- `PORT` - 3000 (default)

### Frontend:
- `NEXT_PUBLIC_API_URL` - URL completa del backend (ej: `https://vambe-backend-xyz.northflank.app`)
- `PORT` - 3000 (default)

---

## 🛠️ Comandos Útiles

### Ver logs del backend:
En Northflank → Servicio `vambe-backend` → Logs

### Ver logs del frontend:
En Northflank → Servicio `vambe-frontend` → Logs

### Ejecutar migraciones (desde terminal del servicio):
```bash
npx prisma migrate deploy --schema=./database/schema.prisma
```

### Generar Prisma Client (si es necesario):
```bash
npx prisma generate --schema=./database/schema.prisma
```

---

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
- Verifica que el servicio PostgreSQL esté corriendo
- Verifica que `DATABASE_URL` tenga el formato correcto
- Verifica que las migraciones se hayan ejecutado

### Error: "Cannot connect to Redis"
- Verifica que el servicio Redis esté corriendo
- Verifica que `REDIS_HOST` y `REDIS_PORT` estén correctos

### Frontend no carga datos:
- Verifica que `NEXT_PUBLIC_API_URL` apunte al backend correcto
- Verifica CORS en el backend (ya está habilitado con `app.enableCors()`)
- Revisa la consola del navegador para ver errores

### Build falla:
- Revisa los logs de build en Northflank
- Verifica que los Dockerfiles estén en las rutas correctas
- Verifica que todos los archivos necesarios estén en el repositorio

---

## 📚 Recursos Adicionales

- [Documentación Northflank](https://docs.northflank.com)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [NestJS Deployment](https://docs.nestjs.com/recipes/repl)
