# Frontend - Vambe Dashboard

Dashboard para gestión de clientes y categorización con IA.

## 🚀 Stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui**
- **Axios**

## 📦 Instalación

```bash
# Instalar dependencias
npm install --legacy-peer-deps

# Configurar shadcn/ui (opcional, si quieres más componentes)
npx shadcn@latest init -d
npx shadcn@latest add button card table progress badge dialog
```

## 🛠️ Desarrollo

```bash
# Servidor desarrollo (puerto 3001)
npm run dev

# Build producción
npm run build

# Servidor producción
npm start

# Linter
npm run lint
```

## 📁 Estructura

```
frontend/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Layout raíz
│   ├── page.tsx             # Home page
│   └── globals.css          # Estilos globales
│
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── dashboard/           # Componentes dashboard
│   └── layout/              # Layout components
│
├── lib/
│   ├── utils.ts             # cn() helper
│   ├── api.ts               # Axios config
│   └── constants.ts         # Constantes
│
├── types/
│   └── index.ts             # TypeScript types
│
└── hooks/
    └── use-*.ts             # Custom hooks
```

## 🌐 Variables de Entorno

Crea un archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📝 Agregar Componentes shadcn/ui

```bash
# Ver componentes disponibles
npx shadcn@latest add

# Agregar un componente específico
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add table
```

## 🔗 API Backend

El frontend se conecta al backend en `http://localhost:3000` (configurable vía `.env.local`).

### Endpoints usados:
- `POST /uploads` - Subir archivo
- `GET /categorization/:uploadId/progress` - Ver progreso

## 🎨 Personalización

### Colores
Edita las variables CSS en `app/globals.css`:

```css
:root {
  --primary: 240 5.9% 10%;
  --secondary: 240 4.8% 95.9%;
  /* ... */
}
```

### Componentes UI
Los componentes de shadcn/ui están en `components/ui/` y son completamente editables.

## ✅ Checklist

- [x] Estructura de carpetas creada
- [x] Configuración básica (Next.js, TypeScript, Tailwind)
- [x] Utilidades (API client, types)
- [ ] Instalar dependencias (`npm install`)
- [ ] Crear componentes del dashboard
- [ ] Integrar con backend

## 🚀 Próximos Pasos

1. Instalar dependencias
2. Crear componentes UI con shadcn/ui
3. Implementar dashboard
4. Conectar con backend
