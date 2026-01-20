# Vambe - Categorización Automática de Clientes

Aplicación para procesar transcripciones de reuniones de ventas y categorizarlas automáticamente usando LLM.

## 🚀 Instalación y Ejecución Local

### Requisitos
- Node.js 18+
- Docker Desktop
- API Key de OpenAI ([obtener aquí](https://platform.openai.com/api-keys))

### Pasos

1. **Clonar el repositorio**
```bash
git clone <url-repo>
cd vambe-prueba-tecnica
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
```
Editar `.env` y agregar tu `OPENAI_API_KEY`

3. **Levantar base de datos**
```bash
docker-compose up -d
```

4. **Instalar dependencias**
```bash
cd backend
npm install
```

5. **Crear tablas en la base de datos**
```bash
npx prisma migrate dev
```

6. **Iniciar el servidor**
```bash
npm run start:dev
```

El backend estará corriendo en `http://localhost:3000`

---

## 📁 Estructura del Proyecto

```
vambe-prueba-tecnica/
├── backend/              # API NestJS
│   ├── prisma/          # Schema y migraciones
│   └── src/             # Código fuente
├── docker-compose.yml   # PostgreSQL local
└── vambe_clients.xlsx   # Archivo de ejemplo
```

---

## 🛠️ Stack Técnico

- **Backend:** NestJS + TypeScript
- **Base de datos:** PostgreSQL (Prisma ORM)
- **LLM:** OpenAI API
- **Archivo:** `vambe_clients.xlsx` (60 clientes con transcripciones)

---

## 📊 Funcionalidades

1. **Upload de archivos**: Subir Excel/CSV con datos de clientes
2. **Categorización automática**: LLM extrae 15+ categorías de cada transcripción
3. **Analytics**: Métricas por industria, vendedor, tasa de conversión
4. **Predicción ML**: Probabilidad de cierre basada en categorías

---

## 🗄️ Base de Datos

El proyecto usa **3 tablas**:

- `uploads`: Registros de archivos subidos
- `clients`: Datos de clientes (nombre, email, transcripción, etc.)
- `categorizations`: Categorías extraídas por LLM (JSONB)

Ver `backend/prisma/schema.prisma` para el schema completo.

---

## 📝 Documentación Adicional

- `PLAN.md`: Plan técnico completo del proyecto
- `INSTRUCCIONES.md`: Requisitos originales de la prueba técnica
- `CLAUDE.md`: Convenciones de código y arquitectura
