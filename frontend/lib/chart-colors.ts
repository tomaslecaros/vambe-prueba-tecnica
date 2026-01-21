// Colores centralizados para charts (Recharts)
// Referencia a las variables CSS definidas en globals.css

export const CHART_COLORS = {
  chart1: 'var(--chart-1)',
  chart2: 'var(--chart-2)',
  chart3: 'var(--chart-3)',
  chart4: 'var(--chart-4)',
  chart5: 'var(--chart-5)',
} as const;

// Array de colores para iteración (pie charts, etc.)
export const CHART_COLORS_ARRAY = [
  CHART_COLORS.chart1,
  CHART_COLORS.chart2,
  CHART_COLORS.chart3,
  CHART_COLORS.chart4,
  CHART_COLORS.chart5,
];

// Para usar en Tailwind classes (bg-chart-1, text-chart-1, etc.)
// Estos ya funcionan automáticamente gracias a globals.css @theme
