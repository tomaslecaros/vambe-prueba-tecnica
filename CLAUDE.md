# CLAUDE.md - Directrices de Programación

## 📐 Estructura de Archivos y Proyecto

### Organización del Proyecto
```
backend/
├── database/              # Prisma schema y migraciones
├── src/
│   ├── common/           # Código compartido
│   │   ├── config/      # Módulos de configuración global
│   │   ├── services/    # Servicios globales (Prisma, etc)
│   │   ├── constants/   # Constantes del proyecto
│   │   └── utils/       # Funciones utilitarias
│   ├── modules/         # Módulos de negocio
│   │   └── [feature]/   # Cada feature tiene su carpeta
│   │       ├── dto/     # Data Transfer Objects
│   │       ├── *.controller.ts
│   │       ├── *.service.ts
│   │       ├── *.processor.ts (si usa colas)
│   │       └── *.module.ts
│   ├── app.module.ts    # Módulo raíz
│   └── main.ts         # Entry point
```

### Nomenclatura
- **Archivos**: `kebab-case` (ej: `user-profile.service.ts`)
- **Clases**: `PascalCase` (ej: `UserProfileService`)
- **Variables/Funciones**: `camelCase` (ej: `getUserProfile`)
- **Constantes**: `UPPER_SNAKE_CASE` (ej: `MAX_RETRIES`)
- **Carpetas**: `kebab-case` y plurales cuando corresponda (ej: `services/`, `constants/`)

### Path Aliases (TypeScript)
Usar siempre path aliases para imports limpios:
```typescript
// ✅ Correcto
import { PrismaService } from '@common/services/prisma.service';
import { UploadsModule } from '@modules/uploads/uploads.module';

// ❌ Evitar
import { PrismaService } from '../../../common/services/prisma.service';
```

Aliases configurados en `tsconfig.json`:
- `@/*` → `src/*`
- `@common/*` → `src/common/*`
- `@modules/*` → `src/modules/*`

## Principios Generales

1. **Simplicidad**: No agregar funcionalidades extras que no se pidan
2. **Clean Code**: Código limpio, legible y mantenible
3. **KISS**: Keep It Simple, Stupid
4. **YAGNI**: You Aren't Gonna Need It - no implementar cosas "por si acaso"

## Convenciones de Código

### Nombres (en inglés siempre)

- **Variables**: descriptivas, aunque sean largas
  ```typescript
  // Bien
  const clientsWithoutCategorization = await this.getClientsWithoutCategorization();
  const totalClosedDealsCount = clients.filter(c => c.closed).length;

  // Mal
  const cls = await this.getCls();
  const cnt = clients.filter(c => c.closed).length;
  ```

- **Funciones**: verbos descriptivos que indiquen la acción
  ```typescript
  // Bien
  async findClientsByUploadId(uploadId: string): Promise<Client[]>
  async extractCategoriesFromTranscription(transcription: string): Promise<Categories>
  async calculateConversionRateByIndustry(): Promise<IndustryStats[]>

  // Mal
  async getClients(id: string)
  async process(text: string)
  async calc()
  ```

- **Clases/Interfaces**: sustantivos descriptivos
  ```typescript
  // Bien
  interface ClientCategorization { }
  class UploadProcessingService { }

  // Mal
  interface Data { }
  class Helper { }
  ```

### Estructura

- Una función = una responsabilidad
- Funciones cortas (máximo ~20-30 líneas)
- Si una función hace muchas cosas, dividirla
- Evitar anidación excesiva (máximo 2-3 niveles)

### Comentarios

- El código debe ser autoexplicativo
- Solo comentar el "por qué", no el "qué"
- No dejar código comentado

```typescript
// Bien: explica el por qué
// Using batch processing to avoid LLM rate limits
await this.processCategoriesInBatches(clients, batchSize);

// Mal: explica lo obvio
// Get all clients
const clients = await this.getClients();
```

## Estructura del Proyecto

Ver `backend/ESTRUCTURA.md` para detalles completos.

### Responsabilidades por Capa

1. **Controller** (Capa de Presentación)
   - Recibe requests HTTP
   - Valida datos de entrada (DTOs)
   - Llama al Service
   - Retorna respuestas

2. **Service** (Capa de Lógica de Negocio)
   - Procesa la lógica
   - Coordina operaciones
   - Llama a Repository/ORM
   - Maneja errores de negocio

3. **DTO** (Data Transfer Object)
   - Validación de entrada
   - Transformación de datos
   - Documentación de API

4. **Constants & Utils** (Utilidades)
   - Constantes centralizadas en `src/common/constants/`
   - Funciones utilitarias en `src/common/utils/`
   - Reutilizables en todo el proyecto

## Manejo de Errores

- Usar excepciones de NestJS (HttpException, BadRequestException, etc.)
- Mensajes de error claros y útiles
- No capturar errores sin hacer nada

```typescript
// Bien
if (!file) {
  throw new BadRequestException('File is required. Please upload an .xlsx or .csv file');
}

// Mal
if (!file) {
  throw new Error('Error');
}
```

## Base de Datos

- Usar Prisma para todas las queries
- Nombres de tablas en snake_case (Prisma convierte automáticamente)
- Usar transacciones cuando sea necesario

## API

- RESTful
- Respuestas consistentes
- Códigos HTTP apropiados (200, 201, 400, 404, 500)

## Testing

- Por ahora no implementar tests (se pueden agregar después si se pide)
- Código debe ser testeable (inyección de dependencias)

## Lo que NO hacer

- No sobre-ingeniar
- No agregar librerías innecesarias
- No crear abstracciones prematuras
- No implementar features que no se pidieron
- No optimizar prematuramente

---

# 🎨 Frontend - Next.js 15 + Tailwind + shadcn/ui

## 📐 Estructura de Archivos

### Organización del Proyecto
```
frontend/
├── app/                          # Next.js 15 App Router
│   ├── (dashboard)/             # Grupo de rutas
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Estilos globales
│
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── dashboard/               # Componentes del dashboard
│   └── layout/                  # Layout components
│
├── lib/                         # Utilidades
│   ├── utils.ts                 # cn() helper
│   ├── api.ts                   # Axios config
│   └── constants.ts
│
├── types/                       # TypeScript types
│   └── index.ts
│
└── hooks/                       # Custom hooks
    └── use-*.ts
```

## 🎯 Convenciones Frontend

### Nomenclatura
- **Componentes**: `kebab-case.tsx` (ej: `file-upload.tsx`)
- **Funciones componente**: `PascalCase` (ej: `function FileUpload()`)
- **Hooks**: `use-nombre.ts` (ej: `use-upload.ts`)
- **Tipos**: Interfaces con sufijo `Props` para props de componentes

### Path Aliases
```typescript
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import type { Client } from '@/types'
```

### Estructura de Componentes
```typescript
'use client' // Solo si necesita interactividad

import { ... }

interface ComponentNameProps {
  // Props aquí
}

export function ComponentName({ ...props }: ComponentNameProps) {
  // Lógica del componente
  
  return (
    // JSX
  )
}
```

### Server vs Client Components
- **Server Components** (por defecto):
  - Fetch de datos
  - Acceso directo a DB/APIs
  - No interactividad
  
- **Client Components** (`'use client'`):
  - useState, useEffect, eventos
  - Interactividad del usuario
  - Hooks de React

### Tailwind CSS
- Usar utilidades de Tailwind directamente
- Usar `cn()` de `lib/utils.ts` para combinar clases
- Seguir convenciones de shadcn/ui para consistencia

```typescript
// Ejemplo
<div className={cn(
  "rounded-lg border p-4",
  error && "border-red-500",
  className
)}>
```

### Fetch de Datos
- Usar `async/await` en Server Components
- Usar hooks personalizados para Client Components
- Centralizar llamadas HTTP en `lib/api.ts`

```typescript
// Server Component
export default async function Page() {
  const data = await fetch('...')
  return <Component data={data} />
}

// Client Component
'use client'
export function Component() {
  const { data, loading } = useClients()
  return <div>{data}</div>
}
```

## 🎨 Estilos y UI

### shadcn/ui
- Usar componentes de `@/components/ui/`
- Personalizar con Tailwind cuando sea necesario
- Mantener consistencia visual

### Responsive Design
- Mobile-first approach
- Usar breakpoints de Tailwind: `sm:`, `md:`, `lg:`, `xl:`
- Probar en múltiples tamaños

### Dark Mode (Opcional)
- Configurar con `next-themes` si se requiere
- Usar variables CSS de Tailwind

## 📦 Dependencias Frontend

### Core
- `next` (v15+)
- `react` (v19+)
- `typescript`
- `tailwindcss` (v4+)

### UI
- `shadcn/ui` components
- `lucide-react` (iconos)
- `class-variance-authority` (variantes)
- `tailwind-merge` + `clsx` (utilidades)

### HTTP
- `axios` (API calls)

## 🚀 Comandos Frontend

```bash
# Desarrollo
npm run dev          # Servidor desarrollo (puerto 3000)
npm run build        # Build producción
npm run start        # Servidor producción
npm run lint         # ESLint

# shadcn/ui
npx shadcn@latest add [component]  # Agregar componente
```

## ✅ Checklist para Nuevos Componentes

- [ ] Nombrado correcto (`kebab-case.tsx`)
- [ ] `'use client'` solo si es necesario
- [ ] Props con TypeScript interface
- [ ] Imports organizados
- [ ] Tailwind para estilos
- [ ] Responsive design
- [ ] Accesibilidad básica
