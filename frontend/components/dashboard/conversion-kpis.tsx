'use client';

import { Card } from '@/components/ui/card';
import { Target, Calendar, TrendingUp, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import type { DashboardsKpiStats, ClosureByItem } from '@/types';
import { CHART_COLORS_ARRAY } from '@/lib/chart-colors';

interface ConversionKpisProps {
  kpis: DashboardsKpiStats;
  topIndustry?: ClosureByItem;
  topSeller?: ClosureByItem;
  closureByIndustry?: ClosureByItem[];
  closureByDiscoverySource?: ClosureByItem[];
}

export function ConversionKpis({
  kpis,
  topSeller,
  closureByIndustry = [],
  closureByDiscoverySource = [],
}: ConversionKpisProps) {
  const closedClients = Math.round((kpis.totalClients * kpis.closureRate) / 100);
  
  // Get last month data
  const lastMonthClosureRate = kpis.lastMonthClosureRate ?? 0;
  const previousMonthClosureRate = kpis.previousMonthClosureRate ?? 0;
  const monthOverMonthChange = kpis.monthOverMonthChange ?? 0;
  const lastMonthLabel = kpis.monthlyClosures?.[0]?.label || 'Último mes';
  const previousMonthLabel = kpis.monthlyClosures?.[1]?.label || 'Mes anterior';

  // Top 5 industrias por tasa de cierre
  const topIndustries = [...closureByIndustry]
    .sort((a, b) => b.closureRate - a.closureRate)
    .slice(0, 5);

  // Datos para el gráfico de barras de discovery source (ordenados por cantidad)
  const discoveryData = [...closureByDiscoverySource]
    .sort((a, b) => b.total - a.total)
    .map((item, index) => ({
      name: item.name,
      total: item.total,
      closed: item.closed,
      closureRate: item.closureRate,
      fill: CHART_COLORS_ARRAY[index % CHART_COLORS_ARRAY.length],
    }));

  const kpiCards = [
    {
      title: 'Tasa de Cierre',
      value: `${kpis.closureRate.toFixed(1)}%`,
      description: `${closedClients} de ${kpis.totalClients} clientes`,
      icon: Target,
    },
    {
      title: 'Tasa de Cierre del Mes',
      value: `${lastMonthClosureRate.toFixed(1)}%`,
      description: lastMonthLabel,
      icon: Calendar,
    },
    {
      title: 'Tasa de Cierre del Mes Anterior',
      value: `${previousMonthClosureRate.toFixed(1)}%`,
      description: previousMonthLabel,
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards - 3 columnas */}
      <div className="grid gap-4 md:grid-cols-3">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          
          return (
            <Card key={kpi.title} className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </p>
                  <p className="text-3xl font-bold tracking-tight">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">
                    {kpi.description}
                  </p>
                </div>
                <div className="rounded-full p-3 bg-secondary">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Segunda fila: Top Industrias + Discovery Source Pie + Mejor Vendedor */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Top 5 Industrias */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Top 5 Industrias</h3>
          </div>
          <div className="space-y-3">
            {topIndustries.map((industry, index) => (
              <div key={industry.name} className="flex items-center gap-3">
                <span
                  className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: CHART_COLORS_ARRAY[index] }}
                >
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{industry.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {industry.closed}/{industry.total} cerrados
                  </p>
                </div>
                <span className="text-sm font-semibold">
                  {industry.closureRate.toFixed(0)}%
                </span>
              </div>
            ))}
            {topIndustries.length === 0 && (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            )}
          </div>
        </Card>

        {/* Bar Chart - Fuente de Descubrimiento */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Fuente de Descubrimiento</h3>
          </div>
          {discoveryData.length > 0 ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={discoveryData}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 'dataMax']} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={75}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-md">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {data.total} clientes
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {data.closed} cerrados · {data.closureRate.toFixed(1)}% cierre
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                    {discoveryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin datos</p>
          )}
        </Card>

        {/* Mejor Vendedor */}
        {topSeller && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Mejor Vendedor</h3>
            </div>
            <div className="flex flex-col items-center justify-center h-[200px]">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-3">
                <span className="text-2xl font-bold">
                  {topSeller.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-xl font-bold">{topSeller.name}</p>
              <p className="text-3xl font-bold mt-2" style={{ color: 'var(--chart-1)' }}>
                {topSeller.closureRate.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {topSeller.closed} de {topSeller.total} cerrados
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
