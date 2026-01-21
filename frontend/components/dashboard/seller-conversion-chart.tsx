'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import type { ClosureByItem } from '@/types';
import { AlertCircle, TrendingUp, Users } from 'lucide-react';
import { CHART_COLORS } from '@/lib/chart-colors';

const MAX_SELLERS_DISPLAY = 10;

interface ConversionChartProps {
  data: ClosureByItem[];
  title?: string;
  description?: string;
  maxItems?: number;
  sortBy?: 'closureRate' | 'total'; // Ordenar por tasa de cierre o cantidad total
  primaryMetric?: 'closureRate' | 'total'; // Qué mostrar como barra (principal)
  showMetrics?: boolean; // Mostrar las tarjetas de métricas (Total Clientes, Tasa Promedio)
}

const chartConfig = {
  closureRate: {
    label: 'Tasa de Cierre (%)',
    color: CHART_COLORS.chart1,
  },
  total: {
    label: 'Clientes (cantidad)',
    color: CHART_COLORS.chart2,
  },
} satisfies ChartConfig;

export function SellerConversionChart({ 
  data,
  title = 'Cierre por Vendedor',
  description,
  maxItems = MAX_SELLERS_DISPLAY,
  sortBy = 'closureRate',
  primaryMetric = 'closureRate',
  showMetrics = true,
}: ConversionChartProps) {
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

  // Ordenar según el criterio especificado
  const allSortedData = [...data]
    .sort((a, b) => {
      if (sortBy === 'total') {
        return b.total - a.total;
      }
      return b.closureRate - a.closureRate;
    })
    .map((item) => ({
      name: item.name,
      closureRate: item.closureRate,
      total: item.total,
      closed: item.closed,
    }));

  // Limitar a máximo de items para visualización
  const chartData = allSortedData.slice(0, maxItems);
  const remainingItems = allSortedData.length - maxItems;

  // Calcular métricas sobre TODOS los datos
  const totalClients = allSortedData.reduce((sum, item) => sum + item.total, 0);
  const totalClosed = allSortedData.reduce((sum, item) => sum + item.closed, 0);
  const avgClosureRate = totalClients > 0 ? ((totalClosed / totalClients) * 100).toFixed(1) : '0';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-xs">
          {description || `Top ${Math.min(data.length, maxItems)} por ${sortBy === 'total' ? 'cantidad de clientes' : 'tasa de cierre'}`}
          {remainingItems > 0 && ` (+${remainingItems} más)`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics - Opcional */}
        {showMetrics && (
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
                <TrendingUp className="h-3.5 w-3.5 text-chart-1" />
              </div>
              <p className="text-xl font-bold mt-1">{avgClosureRate}%</p>
              <p className="text-[10px] text-muted-foreground">de cierre</p>
            </div>
          </div>
        )}

        {/* Combined Bar + Line Chart */}
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 15, left: 5, bottom: 20 }}
            >
              <defs>
                <linearGradient id={`barGradient-${primaryMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={primaryMetric === 'closureRate' ? CHART_COLORS.chart1 : CHART_COLORS.chart2} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={primaryMetric === 'closureRate' ? CHART_COLORS.chart1 : CHART_COLORS.chart2} stopOpacity={0.4} />
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
                tick={{ fontSize: 10, fill: primaryMetric === 'closureRate' ? CHART_COLORS.chart1 : CHART_COLORS.chart2 }}
                tickFormatter={primaryMetric === 'closureRate' ? (value) => `${value}%` : undefined}
                domain={primaryMetric === 'closureRate' ? [0, 100] : [0, 'dataMax']}
                width={35}
              />

              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: primaryMetric === 'closureRate' ? CHART_COLORS.chart2 : CHART_COLORS.chart1 }}
                tickFormatter={primaryMetric === 'closureRate' ? undefined : (value) => `${value}%`}
                domain={primaryMetric === 'closureRate' ? [0, 'dataMax'] : [0, 100]}
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
                        {primaryMetric === 'closureRate' ? (
                          <>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-3 h-3 rounded bg-chart-1" />
                              <span className="text-muted-foreground">Cierre:</span>
                              <span className="font-medium">{item.closureRate.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-chart-2" />
                              <span className="text-muted-foreground">Clientes:</span>
                              <span className="font-medium">{item.total}</span>
                              <span className="text-muted-foreground text-xs">({item.closed} cerrados)</span>
                            </div>
                          </>
                        ) : (
                          <>
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
                          </>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Bar chart - métrica principal */}
              {primaryMetric === 'closureRate' ? (
                <Bar
                  yAxisId="left"
                  dataKey="closureRate"
                  fill={`url(#barGradient-${primaryMetric})`}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              ) : (
                <Bar
                  yAxisId="left"
                  dataKey="total"
                  fill={`url(#barGradient-${primaryMetric})`}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              )}

              {/* Line chart - métrica secundaria */}
              {primaryMetric === 'closureRate' ? (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="total"
                  stroke={CHART_COLORS.chart2}
                  strokeWidth={3}
                  connectNulls
                  dot={{
                    fill: CHART_COLORS.chart2,
                    stroke: '#fff',
                    strokeWidth: 2,
                    r: 5,
                  }}
                  activeDot={{
                    r: 7,
                    fill: CHART_COLORS.chart2,
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                />
              ) : (
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
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs pt-2 border-t">
          {primaryMetric === 'closureRate' ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded bg-chart-1" />
                <span className="font-medium text-chart-1">Tasa de Cierre (%)</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="24" height="12" className="shrink-0">
                  <line x1="0" y1="6" x2="16" y2="6" stroke={CHART_COLORS.chart2} strokeWidth="3" />
                  <circle cx="20" cy="6" r="4" fill={CHART_COLORS.chart2} />
                </svg>
                <span className="font-medium text-chart-2">Clientes (cantidad)</span>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
