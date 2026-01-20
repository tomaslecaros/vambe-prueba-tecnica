'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { ClosureByItem } from '@/types';
import { AlertCircle } from 'lucide-react';

interface DiscoverySourceConversionChartProps {
  data: ClosureByItem[];
}

const COLORS = [
  'hsl(142, 76%, 36%)',
  'hsl(217, 91%, 60%)',
  'hsl(38, 92%, 50%)',
  'hsl(25, 95%, 53%)',
  'hsl(0, 84%, 60%)',
  'hsl(280, 67%, 60%)',
  'hsl(262, 83%, 58%)',
];

export function DiscoverySourceConversionChart({ data }: DiscoverySourceConversionChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cierre por Fuente de Descubrimiento</CardTitle>
          <CardDescription>Qué canales generan mejores clientes</CardDescription>
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

  const chartData = data.map((item) => ({
    name: item.name,
    value: item.closureRate,
    total: item.total,
    closed: item.closed,
    fullLabel: `${item.name} (${item.closureRate.toFixed(1)}%)`,
  }));

  const chartConfig = {
    value: {
      label: 'Tasa de Cierre (%)',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cierre por Fuente de Descubrimiento</CardTitle>
        <CardDescription>
          Qué canales de adquisición generan clientes con mayor probabilidad de cierre
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                {data.name}
                              </span>
                              <span className="font-bold">
                                {data.value.toFixed(1)}% cierre
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {data.closed} cerrados de {data.total} total
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Ranking de Fuentes</h4>
            <div className="space-y-2">
              {chartData
                .sort((a, b) => b.value - a.value)
                .slice(0, 5)
                .map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-2 rounded-md border"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-green-600">
                        {item.value.toFixed(1)}%
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {item.closed}/{item.total}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
            <div className="mt-4 text-xs text-muted-foreground bg-muted p-3 rounded-md">
              <p className="font-semibold mb-1">💡 Insight:</p>
              {chartData.length > 0 && (
                <p>
                  La fuente <span className="font-medium">{chartData[0].name}</span> tiene la mayor tasa de cierre con{' '}
                  <span className="font-medium">{chartData[0].value.toFixed(1)}%</span>. 
                  {' '}Considera aumentar la inversión en este canal.
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
