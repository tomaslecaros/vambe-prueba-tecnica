'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { ClosureByItem } from '@/types';
import { AlertCircle } from 'lucide-react';

interface DiscoverySourceChartProps {
  data: ClosureByItem[];
}

// Colores consistentes usando la paleta de chart
const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

export function DiscoverySourceChart({ data }: DiscoverySourceChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fuentes de Descubrimiento</CardTitle>
          <CardDescription>Cómo los clientes encuentran a Vambe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No hay datos disponibles</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular totales para porcentajes de distribución
  const totalClients = data.reduce((sum, item) => sum + item.total, 0);

  const chartData = data
    .map((item) => ({
      name: item.name,
      value: item.total,
      percentage: totalClients > 0 ? ((item.total / totalClients) * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => b.value - a.value);

  const chartConfig = {
    value: {
      label: 'Clientes',
    },
  };

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Fuentes de Descubrimiento</CardTitle>
        <CardDescription className="text-xs">
          Cómo los clientes encuentran a Vambe
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex items-center gap-4">
          {/* Pie Chart */}
          <ChartContainer config={chartConfig} className="h-[180px] w-[180px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-md text-xs">
                          <p className="font-semibold">{item.name}</p>
                          <p>
                            {item.value} clientes ({item.percentage}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Legend */}
          <div className="flex-1 space-y-2">
            {chartData.slice(0, 5).map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <span className="truncate text-xs">{item.name}</span>
                </div>
                <span className="font-medium text-xs ml-2">{item.percentage}%</span>
              </div>
            ))}
            {chartData.length > 5 && (
              <p className="text-xs text-muted-foreground">
                +{chartData.length - 5} más
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
