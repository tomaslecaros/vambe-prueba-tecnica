'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { PainPointIndustryMatrix } from '@/types';
import { AlertCircle, Lightbulb } from 'lucide-react';

interface PainPointIndustryHeatmapProps {
  data: PainPointIndustryMatrix;
}

export function PainPointIndustryHeatmap({ data }: PainPointIndustryHeatmapProps) {
  if (!data || !data.matrix || data.matrix.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Matriz Industria × Pain Point</CardTitle>
          <CardDescription>Combinaciones que más cierran</CardDescription>
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

  const { painPoints, industries, matrix } = data;

  // Encontrar max y min para escala de colores
  const closureRates = matrix.map((m) => m.closureRate).filter((r) => r > 0);
  const maxRate = Math.max(...closureRates, 100);
  const minRate = Math.min(...closureRates, 0);

  // Color basado en tasa de cierre (escala de grises a colores)
  const getColor = (rate: number) => {
    if (rate === 0) return 'bg-muted';
    const normalized = (rate - minRate) / (maxRate - minRate || 1);

    if (normalized >= 0.7) return 'bg-emerald-500 text-white';
    if (normalized >= 0.5) return 'bg-emerald-300 text-emerald-900';
    if (normalized >= 0.3) return 'bg-amber-300 text-amber-900';
    if (normalized >= 0.1) return 'bg-orange-300 text-orange-900';
    return 'bg-red-300 text-red-900';
  };

  // Lookup map para acceso rápido
  const matrixMap = new Map<string, typeof matrix[0]>();
  matrix.forEach((item) => {
    matrixMap.set(`${item.painPoint}|${item.industry}`, item);
  });

  // Encontrar la mejor combinación
  const topCombination = matrix
    .filter((m) => m.total > 0)
    .sort((a, b) => b.closureRate - a.closureRate)[0];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Matriz Industria × Pain Point</CardTitle>
        <CardDescription className="text-xs">
          Combinaciones con mayor tasa de cierre
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="overflow-x-auto rounded-md border">
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-10 bg-background min-w-[100px]">

                </TableHead>
                {/* Pain Points en el eje X */}
                {painPoints.map((painPoint) => (
                  <TableHead
                    key={painPoint}
                    className="text-center min-w-[70px] max-w-[70px] p-1.5"
                    title={painPoint}
                  >
                    <div className="truncate text-[10px] text-muted-foreground -rotate-45 origin-center h-12 flex items-end justify-center">
                      {painPoint.length > 12 ? painPoint.substring(0, 12) + '...' : painPoint}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Industrias en el eje Y */}
              {industries.map((industry) => (
                <TableRow key={industry}>
                  <TableCell className="sticky left-0 z-10 bg-background font-medium text-[11px]">
                    {industry.length > 15 ? industry.substring(0, 15) + '...' : industry}
                  </TableCell>
                  {painPoints.map((painPoint) => {
                    const item = matrixMap.get(`${painPoint}|${industry}`);
                    const rate = item?.closureRate || 0;
                    const total = item?.total || 0;

                    return (
                      <TableCell
                        key={`${industry}-${painPoint}`}
                        className={`p-1 text-center ${getColor(rate)}`}
                        title={`${industry} + ${painPoint}: ${rate.toFixed(1)}% (${item?.closed || 0}/${total})`}
                      >
                        {total > 0 ? (
                          <span className="font-medium text-[10px]">{rate.toFixed(0)}%</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Leyenda compacta */}
        <div className="mt-3 flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
            <span>&gt;70%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-emerald-300 rounded"></div>
            <span>50-70%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-amber-300 rounded"></div>
            <span>30-50%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-300 rounded"></div>
            <span>10-30%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-300 rounded"></div>
            <span>&lt;10%</span>
          </div>
        </div>

        {/* Insight compacto */}
        {topCombination && (
          <div className="mt-3 flex items-start gap-2 p-2 rounded bg-muted/50 text-xs">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">{topCombination.industry}</span> +
              <span className="font-medium text-foreground"> {topCombination.painPoint}</span>:
              {' '}{topCombination.closureRate.toFixed(0)}% cierre
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
