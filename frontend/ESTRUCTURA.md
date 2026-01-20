# ✅ Frontend Restructurado - Vambe

## 📁 Nueva Estructura de Archivos

```
frontend/
├── app/
│   ├── page.tsx                    # 🏠 Landing (sin sidebar)
│   ├── (app)/                      # 📦 Grupo con sidebar
│   │   ├── layout.tsx             # Layout sidebar-08 style
│   │   ├── dashboard/
│   │   │   └── page.tsx          # 📊 Dashboard/Overview
│   │   ├── analytics/
│   │   │   └── page.tsx          # 📈 Analytics
│   │   └── uploads/
│   │       └── page.tsx          # 📤 Uploads
│   ├── layout.tsx                 # Root layout
│   └── globals.css
│
├── components/
│   ├── app-sidebar.tsx           # Sidebar principal (sidebar-08)
│   ├── nav-main.tsx              # Navegación principal
│   ├── nav-user.tsx              # User section (footer)
│   ├── uploads/                  # Componentes de uploads
│   │   ├── file-upload.tsx
│   │   ├── stats-cards.tsx
│   │   ├── progress-card.tsx
│   │   ├── clients-table.tsx
│   │   ├── all-clients-table.tsx
│   │   └── client-detail-modal.tsx
│   ├── analytics/                # Componentes de analytics (futuro)
│   └── ui/                       # shadcn/ui components
│
├── hooks/
│   ├── use-progress.ts
│   └── use-mobile.tsx            # shadcn sidebar hook
│
├── lib/
│   ├── api.ts
│   ├── constants.ts
│   └── utils.ts
│
└── types/
    └── index.ts
```

## 🎯 Rutas del Sistema

| URL | Vista | Sidebar | Descripción |
|-----|-------|---------|-------------|
| `/` | Landing | ❌ | Página de inicio sin sidebar |
| `/dashboard` | Dashboard | ✅ | Overview con KPIs |
| `/analytics` | Analytics | ✅ | Gráficos y métricas |
| `/uploads` | Uploads | ✅ | Upload archivos + tabla clientes |

## 🔧 Tecnologías

- **Next.js 15** - App Router con grupos de rutas
- **shadcn/ui** - Sidebar-08 oficial
- **Tailwind CSS v4** - Estilos minimalistas
- **TypeScript** - Type safety
- **Lucide React** - Iconos

## 🎨 Características del Sidebar

✅ **Colapsable** - Click en trigger para colapsar
✅ **Responsive** - Sheet en mobile
✅ **Active state** - Detecta ruta actual
✅ **Breadcrumbs** - Navegación clara
✅ **Minimalista** - Blanco/negro/gris

## 🚀 Comandos

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Start producción
npm start
```

## 📝 Notas

- Grupo `(app)` tiene el layout con sidebar
- Landing `/` está fuera del grupo (sin sidebar)
- Componentes organizados por feature (uploads/, analytics/)
- Sidebar-08: Inset style con breadcrumbs
