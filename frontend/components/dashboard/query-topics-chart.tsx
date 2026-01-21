'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import type { ClosureByItem } from '@/types';
import { AlertCircle, Trophy, Award, Medal } from 'lucide-react';
import { CHART_COLORS } from '@/lib/chart-colors';

const chartConfig = {
  total: {
    label: 'Clientes (cantidad)',
    color: CHART_COLORS.chart2,
  },
  closureRate: {
    label: 'Tasa de Cierre (%)',
    color: CHART_COLORS.chart1,
  },
} satisfies ChartConfig;

interface QueryTopicsChartProps {
  data: ClosureByItem[];
}

export function QueryTopicsChart({ data }: QueryTopicsChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cierre por Temas de Consulta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No hay datos disponibles</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ordenar por cantidad de clientes (total)
  const allSortedData = [...data]
    .sort((a, b) => b.total - a.total)
    .map((item) => ({
      name: item.name,
      closureRate: item.closureRate,
      total: item.total,
      closed: item.closed,
    }));

  // Top 3 por tasa de cierre (para destacar)
  const top3ByRate = [...data]
    .sort((a, b) => {
      // Primero por tasa de cierre, luego por cantidad si hay empate
      if (b.closureRate !== a.closureRate) {
        return b.closureRate - a.closureRate;
      }
      return b.total - a.total;
    })
    .slice(0, 3);

  // Datos para el gráfico (mostrar más temas)
  const chartData = allSortedData.slice(0, 12);
  const remainingItems = allSortedData.length - 12;

  const getTopIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 1:
        return <Award className="h-4 w-4 text-gray-400" />;
      case 2:
        return <Medal className="h-4 w-4 text-amber-600" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Cierre por Temas de Consulta</CardTitle>
        <CardDescription className="text-xs">
          Top {Math.min(data.length, 12)} temas ordenados por cantidad de clientes
          {remainingItems > 0 && ` (+${remainingItems} más)`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Top 3 destacados */}
        <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-primary">Top 3 por Tasa de Cierre</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {top3ByRate.map((item, index) => (
              <div
                key={item.name}
                className="rounded-md border bg-background p-3 space-y-1"
              >
                <div className="flex items-center gap-2 mb-1">
                  {getTopIcon(index)}
                  <span className="text-xs font-semibold text-foreground line-clamp-1">
                    {item.name}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-primary">
                      {item.closureRate.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground">cierre</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {item.closed}/{item.total} clientes
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Combined Bar + Line Chart */}
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 15, left: 5, bottom: 80 }}
            >
              <defs>
                <linearGradient id="barGradient-total" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.chart2} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={CHART_COLORS.chart2} stopOpacity={0.4} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
                opacity={0.5}
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                tickMargin={8}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />

              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: CHART_COLORS.chart2 }}
                width={35}
              />

              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: CHART_COLORS.chart1 }}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
                width={30}
              />

              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md text-sm">
                        <p className="font-semibold mb-2">{item.name}</p>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 rounded bg-chart-2" />
                          <span className="text-muted-foreground">Clientes:</span>
                          <span className="font-medium">{item.total}</span>
                          <span className="text-muted-foreground text-xs">({item.closed} cerrados)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-chart-1" />
                          <span className="text-muted-foreground">Cierre:</span>
                          <span className="font-medium">{item.closureRate.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Bar chart - cantidad de clientes (principal) */}
              <Bar
                yAxisId="left"
                dataKey="total"
                fill="url(#barGradient-total)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />

              {/* Line chart - tasa de cierre (secundaria) */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="closureRate"
                stroke={CHART_COLORS.chart1}
                strokeWidth={3}
                connectNulls
                dot={{
                  fill: CHART_COLORS.chart1,
                  stroke: '#fff',
                  strokeWidth: 2,
                  r: 5,
                }}
                activeDot={{
                  r: 7,
                  fill: CHART_COLORS.chart1,
                  stroke: '#fff',
                  strokeWidth: 2,
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs pt-2 border-t">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 rounded bg-chart-2" />
            <span className="font-medium text-chart-2">Clientes (cantidad)</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="24" height="12" className="shrink-0">
              <line x1="0" y1="6" x2="16" y2="6" stroke={CHART_COLORS.chart1} strokeWidth="3" />
              <circle cx="20" cy="6" r="4" fill={CHART_COLORS.chart1} />
            </svg>
            <span className="font-medium text-chart-1">Tasa de Cierre (%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
