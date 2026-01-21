'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import type { ClosureByItem } from '@/types';
import { AlertCircle } from 'lucide-react';
import { CHART_COLORS } from '@/lib/chart-colors';

interface PainPointRadarChartProps {
  data: ClosureByItem[];
}

export function PainPointRadarChart({ data }: PainPointRadarChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cierre por Pain Point</CardTitle>
          <CardDescription>Distribución de tasas de cierre</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[280px] text-muted-foreground">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No hay datos disponibles</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for radar chart - truncate long names
  const chartData = data.map((item) => ({
    painPoint: item.name.length > 15 ? item.name.substring(0, 12) + '...' : item.name,
    fullName: item.name,
    closureRate: item.closureRate,
    total: item.total,
    closed: item.closed,
  }));

  const chartConfig = {
    closureRate: {
      label: 'Tasa de Cierre',
      color: CHART_COLORS.chart1,
    },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Cierre por Pain Point</CardTitle>
        <CardDescription className="text-xs">
          Comparación visual de {data.length} pain points
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="painPoint"
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fontSize: 8 }}
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md text-xs">
                        <p className="font-semibold">{item.fullName}</p>
                        <p>
                          <span className="font-medium" style={{ color: CHART_COLORS.chart1 }}>
                            {item.closureRate.toFixed(1)}%
                          </span> de cierre
                        </p>
                        <p className="text-muted-foreground">
                          {item.closed} cerrados de {item.total}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Radar
                name="Cierre"
                dataKey="closureRate"
                stroke={CHART_COLORS.chart1}
                fill={CHART_COLORS.chart1}
                fillOpacity={0.4}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
