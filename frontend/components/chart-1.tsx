"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { TrendingUp } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';

// Simple monthly data for sales and conversion rate
const chartData = [
  { month: 'Jan', sales: 4200, conversion: 3.2 },
  { month: 'Feb', sales: 3800, conversion: 2.8 },
  { month: 'Mar', sales: 5100, conversion: 4.1 },
  { month: 'Apr', sales: 4600, conversion: 3.5 },
  { month: 'May', sales: 5800, conversion: 4.8 },
  { month: 'Jun', sales: 6200, conversion: 5.2 },
];

// Chart configuration for Shadcn UI - using Tailwind HSL colors
const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--chart-1))",
  },
  conversion: {
    label: "Conversion Rate",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const Chart1: React.FC = () => {
  // Calculate total sales and average conversion
  const totalSales = chartData.reduce((sum, item) => sum + item.sales, 0);
  const avgConversion = (chartData.reduce((sum, item) => sum + item.conversion, 0) / chartData.length).toFixed(1);

  // Get current year dynamically
  const currentYear = new Date().getFullYear();

  return (
    <div className="px-6 md:px-8">
      <Card className="w-full max-w-2xl mx-auto my-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Sales Performance Overview
          </CardTitle>
          <CardDescription>
            Monthly sales volume and conversion rate trends for the first half of {currentYear}
          </CardDescription>
        </CardHeader>        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold mt-2">
                ${totalSales.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Last 6 months
              </p>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Avg Conversion</p>
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
              </div>
              <p className="text-2xl font-bold mt-2">
                {avgConversion}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Conversion rate
              </p>
            </div>
          </div>

          {/* Combined Bar + Line Chart */}
          <div className="w-full">
            <ChartContainer
              config={chartConfig}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 20, bottom: 20 }}
                  accessibilityLayer
                >
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5}/>
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                    opacity={0.5}
                  />

                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                    tickMargin={10}
                  />

                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                    width={50}
                  />

                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    tickFormatter={(value) => `${value}%`}
                    width={45}
                  />

                  <ChartTooltip
                    cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                    content={<ChartTooltipContent
                      formatter={(value, name) => {
                        if (name === 'conversion') {
                          return [`${Number(value).toFixed(1)}%`, 'Conversion Rate'];
                        }
                        return [`$${Number(value).toLocaleString()}`, 'Sales'];
                      }}
                    />}
                  />

                  <ChartLegend
                    content={<ChartLegendContent />}
                    iconType="circle"
                  />

                  {/* Bar chart for Sales */}
                  <Bar
                    yAxisId="left"
                    dataKey="sales"
                    fill="var(--chart-1)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="url(#salesGradient)" />
                    ))}
                  </Bar>

                  {/* Line chart for Conversion Rate */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="conversion"
                    stroke="var(--chart-3)"
                    strokeWidth={3}
                    dot={{
                      fill: "var(--chart-3)",
                      strokeWidth: 2,
                      r: 6,
                      stroke: "var(--background)",
                    }}
                    activeDot={{
                      r: 8,
                      fill: "var(--chart-3)",
                      stroke: "var(--background)",
                      strokeWidth: 3,
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>Showing data for January - June {currentYear}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chart1;
