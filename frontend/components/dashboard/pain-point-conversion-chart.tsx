'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import type { ClosureByItem } from '@/types';
import { AlertCircle } from 'lucide-react';

interface PainPointConversionChartProps {
  data: ClosureByItem[];
}

export function PainPointConversionChart({ data }: PainPointConversionChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cierre por Pain Point</CardTitle>
          <CardDescription>Qué problemas llevan a más cierres de venta</CardDescription>
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
    closureRate: item.closureRate,
    total: item.total,
    closed: item.closed,
    open: item.total - item.closed,
  }));

  // Colores basados en tasa de cierre (verde = alta, amarillo = media, rojo = baja)
  const getColor = (rate: number) => {
    if (rate >= 60) return 'hsl(142, 76%, 36%)'; // Verde
    if (rate >= 40) return 'hsl(38, 92%, 50%)'; // Amarillo
    if (rate >= 20) return 'hsl(25, 95%, 53%)'; // Naranja
    return 'hsl(0, 84%, 60%)'; // Rojo
  };

  const chartConfig = {
    closureRate: {
      label: 'Tasa de Cierre (%)',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cierre por Pain Point</CardTitle>
        <CardDescription>
          Identifica qué problemas de los clientes tienen mayor tasa de cierre
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} label={{ value: 'Tasa de Cierre (%)', position: 'insideBottom', offset: -5 }} />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={150}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
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
                            <span className="font-bold text-green-600">
                              {data.closureRate.toFixed(1)}% cierre
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
              <Bar 
                dataKey="closureRate" 
                radius={[0, 8, 8, 0]}
                label={{ position: 'right', formatter: (value: number) => `${value.toFixed(1)}%` }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.closureRate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 text-xs text-muted-foreground">
          <p className="font-semibold mb-2">Insight:</p>
          {data[0] && (
            <p>
              El pain point <span className="font-medium">{data[0].name}</span> tiene la mayor tasa de cierre con{' '}
              <span className="font-medium">{data[0].closureRate}%</span>. 
              {data[0].closureRate > 50 
                ? ' Esto sugiere que los clientes con este problema están más dispuestos a cerrar la venta.'
                : ' Considera enfocar más esfuerzos en clientes con este perfil.'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
