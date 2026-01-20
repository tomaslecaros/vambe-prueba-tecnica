# 🚀 Comandos para Correr el Proyecto

## 📋 Prerequisitos

Asegúrate de tener todo corriendo antes de empezar:

### 1. Docker (Base de Datos)
```bash
# En la raíz del proyecto
docker compose up -d
```

Esto levanta:
- ✅ PostgreSQL (puerto 5432)
- ✅ Redis (puerto 6379)

### 2. Variables de Entorno

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vambe_db"
OPENAI_API_KEY="tu-api-key-aquí"
REDIS_HOST="localhost"
REDIS_PORT=6379
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 🎯 Correr el Proyecto

### Opción 1: Dos Terminales (Recomendado)

#### Terminal 1: Backend
```bash
cd backend
npm run start:dev
```

**Resultado:**
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [NestApplication] Nest application successfully started

Application is running on: http://localhost:3000
Bull Board is running on: http://localhost:3000/admin/queues
```

**URLs Backend:**
- API: http://localhost:3000
- Bull Board: http://localhost:3000/admin/queues
- Endpoint Upload: POST http://localhost:3000/uploads
- Endpoint Progress: GET http://localhost:3000/categorization/:uploadId/progress

#### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

**Resultado:**
```
▲ Next.js 15.1.0
- Local:        http://localhost:3000
- Ready in X ms
```

**URL Frontend:**
- Dashboard: http://localhost:3000

---

### Opción 2: Con Puertos Diferentes

Si hay conflicto de puertos, cambia el puerto del frontend:

```bash
# Backend (puerto 3000)
cd backend
npm run start:dev

# Frontend (puerto 3001)
cd frontend
npm run dev -- -p 3001
```

**URLs:**
- Backend: http://localhost:3000
- Frontend: http://localhost:3001

**⚠️ Importante:** Si usas puerto 3001, actualiza `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000  # Backend sigue en 3000
```

---

## ✅ Verificar que Todo Funciona

### 1. Backend Funcionando
```bash
# Desde otra terminal
curl http://localhost:3000
```

Deberías ver algo o un mensaje del servidor.

### 2. Frontend Funcionando
Abre: http://localhost:3000 (o 3001)

Deberías ver:
```
Vambe Dashboard
Sistema de gestión de clientes y categorización con IA
```

### 3. Docker Funcionando
```bash
docker ps
```

Deberías ver:
```
vambe_postgres    (puerto 5432)
vambe_redis       (puerto 6379)
```

---

## 🎨 Usar el Dashboard

### 1. Subir Archivo

1. Haz clic en el área de upload o arrastra un archivo
2. Selecciona `vambe_clients.xlsx` (o tu archivo .csv)
3. Haz clic en "Subir Archivo"

### 2. Ver Progreso

Automáticamente verás:
- ✅ Estadísticas (total, nuevos, duplicados, errores)
- ✅ Barra de progreso (actualización cada 2 segundos)
- ✅ Tabla de clientes procesados

### 3. Ver Detalle de Cliente

1. En la tabla, haz clic en "Ver" en cualquier cliente
2. Se abrirá un modal con:
   - Información básica
   - Categorización de IA
   - Análisis de ventas
   - Detalles adicionales

---

## 🔍 Monitoreo

### Bull Board (Colas)
http://localhost:3000/admin/queues

Aquí puedes ver:
- Jobs en espera
- Jobs activos
- Jobs completados
- Jobs fallidos
- Progreso detallado

### Prisma Studio (Base de Datos)
```bash
cd backend
npm run prisma:studio
```

Abre: http://localhost:5555

---

## 🛑 Detener Todo

### Backend
```
Ctrl + C en la terminal del backend
```

### Frontend
```
Ctrl + C en la terminal del frontend
```

### Docker
```bash
docker compose down
```

---

## 🔄 Reiniciar Base de Datos

Si necesitas limpiar todo:

```bash
cd backend
npm run prisma:migrate:reset
```

⚠️ **Esto borra todos los datos!**

---

## 📊 Flujo Completo de Prueba

1. **Inicia Docker**
   ```bash
   docker compose up -d
   ```

2. **Inicia Backend**
   ```bash
   cd backend
   npm run start:dev
   ```

3. **Inicia Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Abre el Dashboard**
   - http://localhost:3000

5. **Sube el archivo de prueba**
   - `vambe_clients.xlsx` (en la raíz del proyecto)

6. **Observa el progreso**
   - Las tarjetas de estadísticas aparecerán
   - La barra de progreso se actualizará en tiempo real
   - Los clientes aparecerán en la tabla

7. **Explora los clientes**
   - Haz clic en "Ver" para ver el detalle
   - Revisa la categorización de IA

8. **Monitorea en Bull Board**
   - http://localhost:3000/admin/queues
   - Ve los jobs procesándose

---

## ⚡ Comandos Rápidos

```bash
# Todo en uno (desde la raíz)
docker compose up -d && \
  (cd backend && npm run start:dev &) && \
  (cd frontend && npm run dev)

# Detener todo
docker compose down
pkill -f "npm run start:dev"
pkill -f "npm run dev"
```

---

## 🐛 Troubleshooting

### "Puerto 3000 ya en uso"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# O cambia el puerto del frontend
npm run dev -- -p 3001
```

### "Cannot connect to database"
```bash
# Verifica Docker
docker ps

# Reinicia contenedores
docker compose restart
```

### "OPENAI_API_KEY not found"
Agrega tu API key en `backend/.env`:
```env
OPENAI_API_KEY=sk-tu-clave-aquí
```

---

## ✅ Checklist

- [ ] Docker corriendo (`docker ps`)
- [ ] Backend corriendo (http://localhost:3000)
- [ ] Frontend corriendo (http://localhost:3000 o 3001)
- [ ] Variables de entorno configuradas
- [ ] Archivo de prueba disponible

---

**🎉 ¡Listo para usar!**
