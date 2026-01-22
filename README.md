# Vambe — Categorización y predicción de cierre

Aplicación para procesar transcripciones de reuniones de ventas: categorización automática con LLM (OpenAI), métricas en dashboard y predicción de probabilidad de cierre con ML (regresión logística).

---

## 1. Inicializar y ejecutar el proyecto en local

### Requisitos

- **Node.js 18+**
- **Docker Desktop** (PostgreSQL + Redis)
- **OpenAI API Key** — [obtener aquí](https://platform.openai.com/api-keys)

### Pasos

#### 1. Clonar e instalar

```bash
git clone <url-repo>
cd vambe-prueba-tecnica
```

#### 2. Levantar PostgreSQL y Redis

```bash
docker compose up -d
```

- **PostgreSQL**: `localhost:5433` (mapeado desde 5432 en el contenedor para evitar conflictos con PostgreSQL local).
- **Redis**: `localhost:6379`.

Comprueba que estén en marcha:

```bash
docker ps
```

#### 3. Variables de entorno

**Backend** — Crear `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/vambe_db"
DIRECT_URL="postgresql://postgres:postgres@localhost:5433/vambe_db"
OPENAI_API_KEY="sk-tu-api-key-aqui"
REDIS_URL="redis://localhost:6379"
```

**Frontend** — Crear `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### 4. Backend

```bash
cd backend
npm install
npx prisma generate --schema=./database/schema.prisma
npx prisma migrate dev --schema=./database/schema.prisma
npm run start:dev
```

- API: **http://localhost:3000**
- Bull Board (colas): **http://localhost:3000/admin/queues**

#### 5. Frontend

En **otra terminal**:

```bash
cd frontend
npm install
npm run dev
```

- App: **http://localhost:3001** (o el puerto que indique Next.js).

Si usas otro puerto para el frontend, `NEXT_PUBLIC_API_URL` debe seguir apuntando al backend (p. ej. `http://localhost:3000`).

### Resumen rápido

```bash
docker compose up -d
cd backend && npm install && npx prisma generate --schema=./database/schema.prisma && npx prisma migrate dev --schema=./database/schema.prisma && npm run start:dev
# En otra terminal:
cd frontend && npm install && npm run dev
```

### Comandos útiles

| Acción | Comando |
|--------|---------|
| Reiniciar BD (borra datos) | `cd backend && npm run prisma:migrate:reset --schema=./database/schema.prisma` |
| Prisma Studio | `cd backend && npm run prisma:studio` → http://localhost:5555 |
| Parar Docker | `docker compose down` |

### Troubleshooting

- **Puerto 3000 ocupado**: cambia el puerto del backend o mata el proceso que lo usa (`netstat -ano \| findstr :3000` en Windows, luego `taskkill /PID <id> /F`).
- **Error al conectar a la BD**: revisa que Docker esté corriendo, que `DATABASE_URL` use el puerto **5433** y que los contenedores estén up (`docker ps`).
- **OPENAI_API_KEY**: debe estar definida en `backend/.env`.

---

## 2. Resumen de lo implementado y decisiones técnicas

### Funcionalidades

1. **Upload de archivos**  
   - Excel/CSV con columnas: `Nombre`, `Correo Electronico`, `Numero de Telefono`, `Fecha de la Reunion`, `Vendedor asignado`, `closed`, `Transcripcion`.  
   - Validación de formato y columnas, detección de duplicados por `(email, phone)`, inserción en BD.

2. **Categorización automática**  
   - Por cada cliente nuevo, se envía la transcripción a OpenAI (`gpt-4o-mini`).  
   - Se extraen categorías (industria, tamaño, pain points, uso, etc.) y se guardan en `categorizations` (JSONB).

3. **Dashboard y analytics**  
   - KPIs (tasa de cierre general, del mes, del mes anterior).  
   - Gráficos por industria, vendedor, fuentes de descubrimiento, temas de consulta, pain points, necesidades de integración.  
   - Tabla de categorizaciones con detalle por cliente en modal.

4. **Predicción de cierre (ML)**  
   - Modelo de **regresión logística** (`ml-logistic-regression`) entrenado con categorizaciones y `closed`.  
   - Endpoint que recibe transcripción → LLM extrae categorías → modelo predice probabilidad y factores clave.  
   - Entrenamiento automático al completar la categorización de un upload (o manual vía API).

### Colas, paralelización y procesos en background

- **Redis + Bull**:  
  - Cola **`categorization`**: un job por cliente a categorizar.  
  - Cola **`prediction-training`**: entrenamiento del modelo de predicción.  
  - Bull Board en `/admin/queues` para monitoreo.

- **Categorización**  
  - Tras el upload, los clientes nuevos se encolan en `categorization`.  
  - **Concurrencia 50**: hasta 50 trabajos en paralelo (límite configurable).  
  - Reintentos con backoff exponencial.  
  - Al terminar **todos** los jobs de un upload, se dispara automáticamente el **entrenamiento del modelo** (cola `prediction-training`).

- **Upload**  
  - **Síncrono** en la request: parseo, validación, detección de duplicados e inserción.  
  - Inserción en **lotes de 50** con `createMany` y `skipDuplicates`.  
  - Duplicados resueltos por batch de `(email, phone)` contra BD.  
  - No se usa cola para el upload (el archivo se procesa en la misma petición); solo la categorización y el entrenamiento corren en background.

- **Entrenamiento del modelo**  
  - Job en Bull; el modelo previo sigue activo mientras se entrena uno nuevo.  
  - Mínimo 50 muestras con `closed` conocido.

### Decisiones técnicas relevantes

| Ámbito | Decisión | Motivo |
|--------|----------|--------|
| **ML vs LLM para predicción** | Regresión logística sobre categorías extraídas por LLM | LLM bueno para extraer datos; ML estable y reproducible para probabilidades. |
| **Librería ML** | `ml-logistic-regression` | En Node.js, sin servicios externos; adecuada para "pocas" muestras. |
| **LLM** | OpenAI `gpt-4o-mini` | Coste/rendimiento y calidad suficiente para categorización. |
| **Colas** | Bull + Redis | Persistencia de jobs, reintentos, concurrencia y Bull Board. |
| **Upload** | Síncrono + batches | Evita pasar el `Buffer` por Redis; menor complejidad y buena velocidad con `createMany`. |
| **Duplicados** | `(email, phone)` único | Evita clientes repetidos entre uploads. |
| **Entrenamiento** | Automático al completar categorización de un upload | Menos fricción para el usuario; el modelo se actualiza con nuevos datos. |

### Stack

- **Backend**: NestJS, TypeScript, Prisma, PostgreSQL, Redis, Bull, OpenAI, `ml-logistic-regression`.  
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Axios.

