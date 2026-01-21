'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Lightbulb } from 'lucide-react';

export interface HeatmapCell {
  row: string;
  col: string;
  value: number;
  total: number;
  closed: number;
}

export interface HeatmapDimension {
  key: string;
  label: string;
}

export interface HeatmapDataSet {
  rowDimension: string;
  colDimension: string;
  data: HeatmapCell[];
}

export interface CrossHeatmapProps {
  title: string;
  description?: string;
  // Múltiples conjuntos de datos para diferentes combinaciones de dimensiones
  dataSets: HeatmapDataSet[];
  // Dimensiones disponibles para filas
  rowDimensions: HeatmapDimension[];
  // Dimensiones disponibles para columnas
  colDimensions: HeatmapDimension[];
  // Dimensión inicial para filas
  defaultRowDimension?: string;
  // Dimensión inicial para columnas
  defaultColDimension?: string;
  // Etiqueta del valor (ej: "Tasa de cierre")
  valueLabel?: string;
}

export function CrossHeatmap({
  title,
  description,
  dataSets,
  rowDimensions,
  colDimensions,
  defaultRowDimension,
  defaultColDimension,
  valueLabel = 'Cierre',
}: CrossHeatmapProps) {
  const [selectedRowDim, setSelectedRowDim] = useState(
    defaultRowDimension || rowDimensions[0]?.key || ''
  );
  const [selectedColDim, setSelectedColDim] = useState(
    defaultColDimension || colDimensions[0]?.key || ''
  );

  // Encontrar el dataset que coincide con las dimensiones seleccionadas
  const currentDataSet = useMemo(() => {
    return dataSets.find(
      (ds) => ds.rowDimension === selectedRowDim && ds.colDimension === selectedColDim
    );
  }, [dataSets, selectedRowDim, selectedColDim]);

  const data = currentDataSet?.data || [];

  // Obtener filas y columnas únicas, ordenadas por total
  const { rows, cols, matrixMap } = useMemo(() => {
    const rowTotals = new Map<string, number>();
    const colTotals = new Map<string, number>();

    data.forEach((cell) => {
      rowTotals.set(cell.row, (rowTotals.get(cell.row) || 0) + cell.total);
      colTotals.set(cell.col, (colTotals.get(cell.col) || 0) + cell.total);
    });

    const rows = [...new Set(data.map((d) => d.row))]
      .sort((a, b) => (rowTotals.get(b) || 0) - (rowTotals.get(a) || 0));

    const cols = [...new Set(data.map((d) => d.col))]
      .sort((a, b) => (colTotals.get(b) || 0) - (colTotals.get(a) || 0));

    const matrixMap = new Map<string, HeatmapCell>();
    data.forEach((cell) => {
      matrixMap.set(`${cell.row}|${cell.col}`, cell);
    });

    return { rows, cols, matrixMap };
  }, [data]);

  // Calcular escala de colores
  const { maxValue, minValue } = useMemo(() => {
    const values = data.map((d) => d.value).filter((v) => v > 0);
    return {
      maxValue: Math.max(...values, 100),
      minValue: Math.min(...values, 0),
    };
  }, [data]);

  const getColor = (value: number, total: number) => {
    if (total === 0) return 'bg-muted';
    const normalized = (value - minValue) / (maxValue - minValue || 1);

    if (normalized >= 0.7) return 'bg-emerald-500 text-white';
    if (normalized >= 0.5) return 'bg-emerald-300 text-emerald-900';
    if (normalized >= 0.3) return 'bg-amber-300 text-amber-900';
    if (normalized >= 0.1) return 'bg-orange-300 text-orange-900';
    return 'bg-red-300 text-red-900';
  };

  // Mejor combinación
  const topCell = useMemo(() => {
    return data
      .filter((d) => d.total >= 2)
      .sort((a, b) => b.value - a.value)[0];
  }, [data]);

  const currentRowLabel = rowDimensions.find((d) => d.key === selectedRowDim)?.label || '';
  const currentColLabel = colDimensions.find((d) => d.key === selectedColDim)?.label || '';

  if (dataSets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && (
              <CardDescription className="text-xs">{description}</CardDescription>
            )}
          </div>

          {/* Selectores de dimensión */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Filas:</span>
              <Select value={selectedRowDim} onValueChange={setSelectedRowDim}>
                <SelectTrigger className="h-7 text-xs w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rowDimensions.map((dim) => (
                    <SelectItem key={dim.key} value={dim.key} className="text-xs">
                      {dim.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Columnas:</span>
              <Select value={selectedColDim} onValueChange={setSelectedColDim}>
                <SelectTrigger className="h-7 text-xs w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colDimensions.map((dim) => (
                    <SelectItem key={dim.key} value={dim.key} className="text-xs">
                      {dim.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No hay datos para {currentRowLabel} × {currentColLabel}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-auto rounded-md border max-h-[400px]">
              <Table className="text-xs">
                <TableHeader className="sticky top-0 z-20 bg-background">
                  <TableRow>
                    <TableHead className="sticky left-0 z-30 bg-background min-w-[120px] text-xs font-medium border-r">
                      <span className="text-muted-foreground">{currentRowLabel} / {currentColLabel}</span>
                    </TableHead>
                    {cols.map((col) => (
                      <TableHead
                        key={col}
                        className="text-center min-w-[70px] p-2 border-r last:border-r-0"
                        title={col}
                      >
                        <span className="text-[10px] text-muted-foreground font-medium truncate block max-w-[70px]">
                          {col}
                        </span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row}>
                      <TableCell
                        className="sticky left-0 z-10 bg-background font-medium text-[11px] border-r"
                        title={row}
                      >
                        <span className="truncate block max-w-[110px]">{row}</span>
                      </TableCell>
                      {cols.map((col) => {
                        const cell = matrixMap.get(`${row}|${col}`);
                        const value = cell?.value || 0;
                        const total = cell?.total || 0;

                        return (
                          <TableCell
                            key={`${row}-${col}`}
                            className={`p-1.5 text-center border-r last:border-r-0 ${getColor(value, total)}`}
                            title={`${row} × ${col}: ${value.toFixed(1)}% (${cell?.closed || 0}/${total})`}
                          >
                            {total > 0 ? (
                              <span className="font-medium text-[10px]">{value.toFixed(0)}%</span>
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

            {/* Leyenda */}
            <div className="mt-3 flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
              <span className="font-medium">{valueLabel}:</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-emerald-500 rounded" />
                <span>&gt;70%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-emerald-300 rounded" />
                <span>50-70%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-amber-300 rounded" />
                <span>30-50%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-300 rounded" />
                <span>10-30%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-300 rounded" />
                <span>&lt;10%</span>
              </div>
            </div>

            {/* Insight */}
            {topCell && (
              <div className="mt-3 flex items-start gap-2 p-2 rounded bg-muted/50 text-xs">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-muted-foreground">
                  Mejor combinación:{' '}
                  <span className="font-medium text-foreground">{topCell.row}</span> ×{' '}
                  <span className="font-medium text-foreground">{topCell.col}</span>:{' '}
                  {topCell.value.toFixed(0)}% ({topCell.closed}/{topCell.total})
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
