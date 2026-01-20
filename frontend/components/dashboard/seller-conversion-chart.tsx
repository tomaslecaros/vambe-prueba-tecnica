'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import type { ClosureByItem } from '@/types';
import { AlertCircle, TrendingUp, Users } from 'lucide-react';

interface SellerConversionChartProps {
  data: ClosureByItem[];
}

// Colores directos para mejor compatibilidad con SVG
const COLORS = {
  bar: '#e97f2c', // naranja
  line: '#16a34a', // verde
};

const chartConfig = {
  total: {
    label: 'Clientes (cantidad)',
    color: COLORS.bar,
  },
  closureRate: {
    label: 'Tasa de Cierre (%)',
    color: COLORS.line,
  },
} satisfies ChartConfig;

export function SellerConversionChart({ data }: SellerConversionChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cierre por Vendedor</CardTitle>
          <CardDescription>Rendimiento individual de cada vendedor</CardDescription>
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

  // Ordenar por tasa de cierre descendente
  const chartData = [...data]
    .sort((a, b) => b.closureRate - a.closureRate)
    .map((item) => ({
      name: item.name,
      closureRate: item.closureRate,
      total: item.total,
      closed: item.closed,
    }));

  // Calcular métricas
  const totalClients = chartData.reduce((sum, item) => sum + item.total, 0);
  const totalClosed = chartData.reduce((sum, item) => sum + item.closed, 0);
  const avgClosureRate = totalClients > 0 ? ((totalClosed / totalClients) * 100).toFixed(1) : '0';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cierre por Vendedor</CardTitle>
        <CardDescription className="text-xs">
          Cantidad de clientes y tasa de cierre por vendedor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Total Clientes</p>
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <p className="text-xl font-bold mt-1">{totalClients.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">{totalClosed} cerrados</p>
          </div>

          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Tasa Promedio</p>
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <p className="text-xl font-bold mt-1">{avgClosureRate}%</p>
            <p className="text-[10px] text-muted-foreground">de cierre</p>
          </div>
        </div>

        {/* Combined Bar + Line Chart */}
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 15, left: 5, bottom: 20 }}
            >
              <defs>
                <linearGradient id="sellerBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.bar} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={COLORS.bar} stopOpacity={0.4} />
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
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickMargin={8}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />

              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: COLORS.bar }}
                width={30}
              />

              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: COLORS.line }}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
                width={35}
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
                          <div className="w-3 h-3 rounded" style={{ background: COLORS.bar }} />
                          <span className="text-muted-foreground">Clientes:</span>
                          <span className="font-medium">{item.total}</span>
                          <span className="text-muted-foreground text-xs">({item.closed} cerrados)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: COLORS.line }} />
                          <span className="text-muted-foreground">Cierre:</span>
                          <span className="font-medium">{item.closureRate.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />


              {/* Bar chart for total clients */}
              <Bar
                yAxisId="left"
                dataKey="total"
                fill="url(#sellerBarGradient)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />

              {/* Line chart for closure rate */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="closureRate"
                stroke={COLORS.line}
                strokeWidth={3}
                connectNulls
                dot={{
                  fill: COLORS.line,
                  stroke: '#fff',
                  strokeWidth: 2,
                  r: 5,
                }}
                activeDot={{
                  r: 7,
                  fill: COLORS.line,
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
            <div className="w-4 h-3 rounded" style={{ background: COLORS.bar }} />
            <span className="font-medium" style={{ color: COLORS.bar }}>Clientes (cantidad)</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="24" height="12" className="shrink-0">
              <line x1="0" y1="6" x2="16" y2="6" stroke={COLORS.line} strokeWidth="3" />
              <circle cx="20" cy="6" r="4" fill={COLORS.line} />
            </svg>
            <span className="font-medium" style={{ color: COLORS.line }}>Tasa de Cierre (%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
