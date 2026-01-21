'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList } from 'recharts';
import type { ClosureByItem } from '@/types';
import { AlertCircle } from 'lucide-react';
import { CHART_COLORS_ARRAY, CHART_COLORS } from '@/lib/chart-colors';

interface IntegrationsRadialChartProps {
  data: ClosureByItem[];
  maxItems?: number;
}

export function IntegrationsRadialChart({ data, maxItems = 6 }: IntegrationsRadialChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Necesidades de Integración</CardTitle>
          <CardDescription>Tasa de cierre por integración</CardDescription>
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

  // Sort by closure rate
  const chartData = [...data]
    .sort((a, b) => b.closureRate - a.closureRate)
    .map((item) => ({
      name: item.name,
      closureRate: item.closureRate,
      total: item.total,
      closed: item.closed,
    }));

  const chartConfig = {
    closureRate: {
      label: 'Tasa de Cierre (%)',
    },
  };

  const integrationsWithData = chartData.filter((d) => d.total > 0).length;

  // Use a fixed larger height to take advantage of all available space
  const chartHeight = Math.max(500, chartData.length * 50);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Necesidades de Integración</CardTitle>
        <CardDescription>
          Todas las integraciones ordenadas por tasa de cierre ({integrationsWithData} con datos)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full" style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 60, left: 0, bottom: 5 }}
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
                          <span className="font-medium" style={{ color: CHART_COLORS.chart1 }}>
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
                    fill={CHART_COLORS_ARRAY[index % CHART_COLORS_ARRAY.length]}
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
