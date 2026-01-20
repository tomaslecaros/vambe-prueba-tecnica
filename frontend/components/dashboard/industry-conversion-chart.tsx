'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList } from 'recharts';
import type { ClosureByItem } from '@/types';
import { AlertCircle } from 'lucide-react';

interface IndustryConversionChartProps {
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

export function IndustryConversionChart({ data }: IndustryConversionChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cierre por Industria</CardTitle>
          <CardDescription>Rendimiento de cierre por sector</CardDescription>
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

  // Mostrar todas las industrias, ordenadas por tasa de cierre
  const chartData = [...data]
    .sort((a, b) => b.closureRate - a.closureRate)
    .map((item) => ({
      name: item.name,
      closureRate: item.closureRate,
      total: item.total,
      closed: item.closed,
    }));

  // Altura dinámica basada en cantidad de industrias
  const chartHeight = Math.max(300, chartData.length * 40);

  const chartConfig = {
    closureRate: {
      label: 'Tasa de Cierre (%)',
    },
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Cierre por Industria</CardTitle>
        <CardDescription>
          Todas las industrias ordenadas por tasa de cierre
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full" style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={140}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm">
                          <span className="font-medium" style={{ color: 'var(--chart-1)' }}>
                            {item.closureRate.toFixed(1)}%
                          </span> de cierre
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.closed} cerrados de {item.total} total
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="closureRate"
                radius={[0, 4, 4, 0]}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
                <LabelList
                  dataKey="closureRate"
                  position="right"
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                  className="fill-foreground text-xs"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
