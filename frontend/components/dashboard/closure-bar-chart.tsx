'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList } from 'recharts';
import type { ClosureByItem } from '@/types';
import { AlertCircle } from 'lucide-react';
import { CHART_COLORS_ARRAY, CHART_COLORS } from '@/lib/chart-colors';

interface ClosureBarChartProps {
  data: ClosureByItem[];
  title: string;
  description?: string;
  maxItems?: number;
  showAll?: boolean;
  labelWidth?: number;
}

export function ClosureBarChart({
  data,
  title,
  description,
  maxItems = 8,
  showAll = false,
  labelWidth = 140,
}: ClosureBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
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

  // Sort by closure rate
  const allSortedData = [...data]
    .sort((a, b) => b.closureRate - a.closureRate)
    .map((item) => ({
      name: item.name,
      closureRate: item.closureRate,
      total: item.total,
      closed: item.closed,
    }));

  const chartData = showAll ? allSortedData : allSortedData.slice(0, maxItems);
  const remainingItems = allSortedData.length - maxItems;

  // Dynamic height based on number of items
  const chartHeight = Math.max(200, chartData.length * 32);

  const chartConfig = {
    closureRate: {
      label: 'Tasa de Cierre (%)',
    },
  };

  const descriptionText = description || (
    showAll
      ? `${data.length} items ordenados por tasa de cierre`
      : `Top ${Math.min(data.length, maxItems)} por tasa de cierre${remainingItems > 0 ? ` (+${remainingItems} más)` : ''}`
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="text-xs">{descriptionText}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="w-full" style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 50, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 10 }}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={labelWidth}
                tick={{ fontSize: 10 }}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md text-xs">
                        <p className="font-semibold">{item.name}</p>
                        <p>
                          <span className="font-medium" style={{ color: CHART_COLORS.chart1 }}>
                            {item.closureRate.toFixed(1)}%
                          </span> de cierre
                        </p>
                        <p className="text-muted-foreground">
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
                  formatter={(value: number) => `${value.toFixed(0)}%`}
                  className="fill-foreground text-[10px]"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
