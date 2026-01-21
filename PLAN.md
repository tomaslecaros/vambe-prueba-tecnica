# PLAN - Vambe Prueba Técnica

## 1. Flujo Completo (Frontend + Backend)

### 1.1 Usuario sube archivo
- **Frontend**: Formulario de upload que acepta `.xlsx` o `.csv`
- **Backend**: `POST /api/uploads` recibe el archivo

### 1.2 Backend valida el archivo
- Verifica formato (solo .xlsx, .csv)
- Verifica que existan las 7 columnas requeridas: `Nombre`, `Correo Electronico`, `Numero de Telefono`, `Fecha de la Reunion`, `Vendedor asignado`, `closed`, `Transcripcion`
- Verifica que no esté vacío
- Verifica tamaño máximo (configurable)
- Si falla validación → retorna error descriptivo al frontend

### 1.3 Backend procesa el archivo
- Crea registro en tabla `uploads` con status `processing`
- Parsea el archivo a JSON
- Detecta duplicados por email
- Inserta clientes nuevos en tabla `clients`
- Retorna `{ uploadId, status, totalClients, newClients, duplicates }`

### 1.4 Backend categoriza con LLM
- Por cada cliente sin categorización:
  - Envía transcripción al LLM (OpenAI principal, fallback a otros)
  - Guarda resultado en tabla `categorizations` (campo JSONB `data`)
  - Actualiza progreso del upload
- Cuando termina → status `completed`

### 1.5 Frontend consume datos
- `GET /api/uploads/:id/status` → estado del procesamiento
- `GET /api/clients` → lista de clientes con sus categorías
- `GET /api/analytics/*` → métricas agregadas para dashboard

---

## 2. Modelo de Datos

### Tabla: uploads
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Primary key |
| filename | VARCHAR | Nombre del archivo subido |
| status | ENUM | pending, processing, completed, failed |
| total_rows | INT | Total de filas en el archivo |
| processed_rows | INT | Filas procesadas por LLM |
| errors | JSONB | Lista de errores si hubo |
| created_at | TIMESTAMP | Fecha de creación |
| completed_at | TIMESTAMP | Fecha de finalización |

### Tabla: clients
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Primary key |
| upload_id | UUID | FK a uploads |
| name | VARCHAR | Nombre del cliente |
| email | VARCHAR | Email (UNIQUE) |
| phone | VARCHAR | Teléfono |
| meeting_date | DATE | Fecha de reunión |
| seller | VARCHAR | Vendedor asignado |
| closed | BOOLEAN | Si cerró la venta |
| transcription | TEXT | Transcripción de la reunión |
| created_at | TIMESTAMP | Fecha de creación |

### Tabla: categorizations
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Primary key |
| client_id | UUID | FK a clients |
| data | JSONB | Categorías extraídas (ver estructura abajo) |
| llm_provider | VARCHAR | openai, anthropic, groq |
| model | VARCHAR | gpt-4, claude-3, etc |
| prompt_version | VARCHAR | v1.0, v1.1, etc |
| processed_at | TIMESTAMP | Fecha de procesamiento |

### Estructura del campo `data` (JSONB)

```json
{
  "industry": "Finanzas",
  "company_size": "Mediana",
  "weekly_contact_volume": 500,
  "volume_trend": "Creciente",
  "main_pain_point": "Alto volumen",
  "current_solution": "Manual",
  "discovery_source": "Evento/Conferencia",
  "use_case": "Atención al cliente",
  "integration_needs": ["CRM", "Tickets"],
  "query_topics": ["inversiones", "regulaciones"],
  "summary": "Empresa financiera con 500 interacciones/semana buscando automatizar consultas repetitivas."
}
```

### Categorías (LLM elige de estas listas)

**industry**: Finanzas | Retail/E-commerce | Salud | Tecnología | Educación | Logística/Transporte | Turismo | Consultoría | Gastronomía | Legal | Eventos | Inmobiliario | ONG | Diseño/Creativos | Construcción | Energía | Moda | Agricultura | Otro

**company_size** (basado en volumen de interacciones):
- Pequeña (<100/semana)
- Mediana (100-500/semana)
- Grande (>500/semana)
- No especificado

**weekly_contact_volume**: number (extraer número mencionado, 0 si no se especifica)

**volume_trend**: Creciente | Estable | Estacional | No especificado

**main_pain_point**: Alto volumen | Consultas repetitivas | Respuesta lenta | Procesos manuales | Multicanal | Escalabilidad | Soporte técnico | Clientes internacionales | Otro

**current_solution**: Manual | Automatización parcial | Otra herramienta | No especificado

**discovery_source**: Evento/Conferencia | Búsqueda online | Referido | Redes sociales | Artículo/Podcast | Foro/Comunidad | Otro

**use_case**: Atención al cliente | Soporte técnico | Ventas/Pre-venta | E-commerce | Reservas/Citas | Logística | Otro

**integration_needs** (array): CRM | ERP | E-commerce | Tickets | Calendario/Reservas | Pagos | Sistema propio | Ninguna | Otro

**query_topics** (array, elegir las que apliquen):
- Envíos/Logística
- Devoluciones
- Disponibilidad/Stock
- Precios/Cotizaciones
- Citas/Reservas
- Horarios
- Soporte técnico
- Información de productos
- Programas/Servicios
- Pagos/Facturación
- Garantías
- Promociones/Descuentos
- Estado de pedidos
- Registro/Inscripción
- Otro

**summary**: string (1-2 oraciones factuales)

---

## 3. API Endpoints (Backend)

### Uploads
- `POST /api/uploads` - Subir archivo
- `GET /api/uploads` - Listar uploads
- `GET /api/uploads/:id` - Detalle de upload
- `GET /api/uploads/:id/status` - Estado de procesamiento

### Clients
- `GET /api/clients` - Listar clientes con categorías
- `GET /api/clients/:id` - Detalle de cliente

### Analytics
- `GET /api/analytics/summary` - KPIs generales
- `GET /api/analytics/by-industry` - Agrupado por industria
- `GET /api/analytics/by-seller` - Performance por vendedor
- `GET /api/analytics/conversion-rates` - Tasas de conversión

### Prediction
- `GET /api/prediction/status` - Estado del modelo (entrenado, accuracy, datos disponibles)
- `POST /api/prediction/train` - Entrenar/re-entrenar modelo manualmente
- `POST /api/prediction` - Predecir probabilidad de cierre desde transcripción

---

## 4. Módulo de Predicción (ML)

### Por qué ML y no LLM para predecir
- **LLM**: Bueno para extraer información de texto, pero inconsistente para predicciones numéricas
- **ML**: Diseñado para predecir outcomes, consistente, basado en patrones de datos reales
- **Enfoque híbrido**: LLM extrae categorías → ML predice probabilidad de cierre

### Librería
- **`ml.js`** (Logistic Regression)
- Corre 100% en Node.js (no requiere servicio externo)
- Funciona bien con datasets pequeños (~50-100 registros)
- Simple de implementar y mantener

### Flujo de predicción
```
1. Usuario envía transcripción
         ↓
2. LLM extrae categorías (mismo proceso que upload)
         ↓
3. Convertir categorías a features numéricas (one-hot encoding)
         ↓
4. Modelo ML predice probabilidad
         ↓
5. Retorna: probabilidad + factores que influyeron
```

### Entrenamiento del modelo
- **Mínimo requerido**: 50 clientes con `closed` conocido (true o false)
- **Entrenamiento manual**: Solo cuando el usuario ejecuta `POST /api/prediction/train`
- **Datos usados**: Solo clientes que tienen `closed` definido (no se usan datos sin resultado conocido)
- **Job en background**: Usa Bull queue para no bloquear la aplicación
- **Modelo anterior activo**: Mientras entrena uno nuevo, el anterior sigue funcionando

### Endpoints

#### GET /api/prediction/status
Retorna el estado actual del modelo.

**Response (no entrenado, sin datos suficientes):**
```json
{
  "trained": false,
  "canTrain": false,
  "availableSamples": 35,
  "minimumRequired": 50,
  "message": "Se necesitan al menos 50 clientes con cierre conocido"
}
```

**Response (no entrenado, puede entrenar):**
```json
{
  "trained": false,
  "canTrain": true,
  "availableSamples": 58,
  "minimumRequired": 50,
  "message": "Modelo listo para entrenar"
}
```

**Response (entrenado):**
```json
{
  "trained": true,
  "canTrain": true,
  "availableSamples": 58,
  "minimumRequired": 50,
  "lastTrainedAt": "2024-01-20T15:30:00Z",
  "samplesUsed": 58,
  "accuracy": 0.75,
  "isTraining": false
}
```

**Response (entrenando):**
```json
{
  "trained": true,
  "canTrain": false,
  "availableSamples": 65,
  "minimumRequired": 50,
  "lastTrainedAt": "2024-01-20T15:30:00Z",
  "samplesUsed": 58,
  "accuracy": 0.75,
  "isTraining": true,
  "trainingProgress": {
    "status": "processing",
    "progress": 45,
    "startedAt": "2024-01-20T16:00:00Z"
  }
}
```

#### POST /api/prediction/train
Inicia el entrenamiento del modelo en background.

**Response (éxito):**
```json
{
  "message": "Entrenamiento iniciado",
  "jobId": "train-123",
  "samplesUsed": 58
}
```

**Response (error - ya entrenando):**
```json
{
  "error": "TRAINING_IN_PROGRESS",
  "message": "Ya hay un entrenamiento en curso",
  "progress": 45
}
```

**Response (error - datos insuficientes):**
```json
{
  "error": "INSUFFICIENT_DATA",
  "message": "Se necesitan al menos 50 clientes con cierre conocido",
  "availableSamples": 35,
  "minimumRequired": 50
}
```

#### POST /api/prediction
Predice la probabilidad de cierre de una transcripción.

**Request:**
```json
{
  "transcription": "En nuestra empresa de finanzas hemos notado que la carga de trabajo ha incrementado significativamente. Un colega mencionó Vambe en una conferencia..."
}
```

**Response (éxito):**
```json
{
  "probability": 0.78,
  "prediction": "high",
  "categories": {
    "industry": "Finanzas",
    "company_size": "Mediana",
    "main_pain_point": "Alto volumen",
    "discovery_source": "Evento/Conferencia",
    "volume_trend": "Creciente"
  },
  "topFactors": [
    { "feature": "industry", "value": "Finanzas", "impact": "+12%" },
    { "feature": "volume_trend", "value": "Creciente", "impact": "+8%" },
    { "feature": "discovery_source", "value": "Referido", "impact": "+6%" }
  ],
  "model": {
    "trained": true,
    "lastTrainedAt": "2024-01-20T15:30:00Z",
    "samplesUsed": 58,
    "accuracy": 0.75
  }
}
```

**Response (error - modelo no entrenado):**
```json
{
  "error": "MODEL_NOT_TRAINED",
  "message": "El modelo no está entrenado aún",
  "canTrain": true,
  "availableSamples": 58,
  "minimumRequired": 50
}
```

### Casos borde y UX

| Estado | Puede predecir | Puede entrenar | Mensaje UI |
|--------|---------------|----------------|------------|
| No entrenado, <50 datos | ❌ | ❌ | "Necesitas más datos (35/50)" |
| No entrenado, ≥50 datos | ❌ | ✅ | "Entrena el modelo para comenzar" |
| Entrenado | ✅ | ✅ | Todo habilitado |
| Entrenando | ✅ (usa anterior) | ❌ | "Entrenando... 45% (modelo actual sigue activo)" |
| Entrenamiento falló | ✅ (usa anterior) | ✅ | "Error en último entrenamiento. [Reintentar]" |

### Modelo de datos adicional

#### Tabla: prediction_model
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Primary key |
| trained | BOOLEAN | Si el modelo está entrenado |
| samples_used | INT | Cantidad de muestras usadas |
| accuracy | FLOAT | Precisión del modelo (0-1) |
| model_data | JSONB | Coeficientes del modelo serializado |
| trained_at | TIMESTAMP | Fecha de entrenamiento |
| is_training | BOOLEAN | Si hay entrenamiento en curso |
| training_job_id | VARCHAR | ID del job de Bull |
| training_started_at | TIMESTAMP | Inicio del entrenamiento actual |
| last_error | TEXT | Último error si falló |

### Features para el modelo (one-hot encoding)
Las categorías se convierten a features numéricas:
- `industry` → 19 features binarias (industry_finanzas, industry_retail, ...)
- `company_size` → 3 features binarias
- `main_pain_point` → 9 features binarias
- `discovery_source` → 7 features binarias
- `use_case` → 7 features binarias
- `volume_trend` → 4 features binarias
- `weekly_contact_volume` → 1 feature numérica (normalizada)

**Target**: `closed` (0 o 1)

---

## 5. Casos Borde

| Caso | Comportamiento |
|------|----------------|
| Formato inválido | Error 400: "Solo se aceptan archivos .xlsx o .csv" |
| Columnas faltantes | Error 400: "Faltan columnas: [lista]" |
| Archivo vacío | Error 400: "El archivo no contiene datos" |
| Archivo muy grande | Error 400: "Máximo X filas permitidas" |
| Email duplicado en archivo | Ignorar duplicados, reportar en respuesta |
| Cliente ya existe en DB | No duplicar, actualizar si hay cambios |
| Transcripción vacía | Guardar cliente, marcar como "sin categorizar" |
| LLM falla | Reintentar con fallback, si todo falla marcar como "pendiente" |
| Archivo corrupto | Error 400: "No se pudo leer el archivo" |

---

## 6. Stack Técnico

### Backend
- **Framework**: NestJS (TypeScript)
- **ORM**: Prisma
- **Base de datos**: PostgreSQL
- **LLM**: Multi-provider (OpenAI principal, Anthropic/Groq fallback)
- **ML**: ml.js (Logistic Regression para predicciones)

### Frontend (por definir)
- Consumirá los endpoints listados arriba
- Dashboard con métricas y gráficos
- Formulario de upload
- Tabla de clientes con filtros

---

## 7. Estructura del Repositorio (Monorepo)

```
vambe-prueba-tecnica/
├── backend/                    # NestJS
│   ├── src/
│   │   ├── clients/           # Módulo de clientes
│   │   ├── uploads/           # Módulo de upload
│   │   ├── llm/               # Módulo LLM multi-provider
│   │   ├── categorization/    # Módulo de categorización
│   │   ├── analytics/         # Módulo de métricas
│   │   ├── prediction/        # Módulo ML predicción
│   │   └── prisma/            # Servicio Prisma
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── .env
├── frontend/                   # React (después)
│   ├── src/
│   └── package.json
├── PLAN.md
├── INSTRUCCIONES.md
├── README.md
└── vambe_clients.xlsx
```

---

## 8. Plan de Implementación (Backend)

### Paso 1: Setup inicial ✅
- Crear proyecto NestJS
- Configurar Prisma + PostgreSQL
- Crear schema con las 3 tablas
- Configurar variables de entorno

### Paso 2: Módulo de Upload ✅
- Endpoint para recibir archivo
- Validaciones (formato, columnas, tamaño)
- Parsing xlsx/csv
- Detección de duplicados
- Guardado en DB

### Paso 3: Módulo LLM ✅
- Interface LLMProvider
- OpenAIProvider
- AnthropicProvider (fallback)
- GroqProvider (fallback)
- LLMService con lógica de fallback

### Paso 4: Módulo de Categorización ✅
- Servicio que procesa clientes pendientes
- Guarda resultados en categorizations
- Actualiza status del upload

### Paso 5: Módulo de Analytics
- Endpoints de métricas
- Queries agregados
- Filtros

### Paso 6: Módulo de Clientes
- CRUD de clientes
- Joins con categorizations
- Búsqueda y filtros

### Paso 7: Módulo de Predicción
- Instalar `ml.js`
- Servicio de entrenamiento (Logistic Regression)
- Convertir categorías a features numéricas (one-hot encoding)
- Endpoint `POST /api/predict`
- Endpoint `GET /api/predict/model-status`
- Endpoint `POST /api/predict/retrain`

### Paso 8: Sistema de Colas Robusto (Mejora futura)
**Estado actual**: La categorización se ejecuta en "background" sin await, lo que funciona para desarrollo pero tiene limitaciones:
- ❌ Si el servidor se reinicia, se pierden las tareas en curso
- ❌ No hay reintentos automáticos
- ❌ No hay control de concurrencia (rate limits de OpenAI)
- ❌ No hay dashboard para ver el estado de las tareas

**Mejora recomendada para producción**:
- Implementar **Bull/BullMQ** con Redis
- Dashboard con Bull Board para monitoreo
- Reintentos automáticos con backoff
- Control de concurrencia y rate limiting
- Persistencia de tareas (sobreviven al reinicio del servidor)

---

## 9. Estrategia de Deployment: Local vs Producción

### Local (para corrector)
- **Base de datos**: Docker Compose (PostgreSQL local en `localhost:5432`)
- **Backend**: `npm run start:dev`
- **Archivo `.env`**:
  ```env
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vambe_db"
  OPENAI_API_KEY=tu-key
  ```
- **Comandos**:
  ```bash
  docker compose up -d        # Levantar DB
  cd backend
  npm install
  npx prisma migrate dev      # Crear tablas
  npm run start:dev           # Servidor en http://localhost:3000
  ```

### Producción
- **Base de datos**: Supabase (PostgreSQL en la nube)
- **Backend**: Render/Railway/Vercel
- **Variables de entorno** (configuradas en el servicio de hosting):
  ```env
  DATABASE_URL="postgresql://user:pass@db.supabase.co:5432/postgres"
  OPENAI_API_KEY=tu-key
  PORT=3000
  ```
- **Build**:
  ```bash
  npm run build
  npm run start:prod
  ```

### Diferenciación automática
- El archivo `.env` NO se sube a GitHub (está en `.gitignore`)
- Cada ambiente tiene su propio `.env` con su `DATABASE_URL`
- Prisma lee automáticamente `DATABASE_URL` del entorno
- No se requiere código condicional, solo cambiar la variable de entorno
