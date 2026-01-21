'use client';

import { useState, useEffect } from 'react';
import { getDashboards } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { DashboardsResponse } from '@/types';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  CategorizationsTable,
  ConversionKpis,
  IndustryConversionChart,
  SellerConversionChart,
  SellerExpertiseTable,
  DiscoverySourceChart,
  CrossHeatmap,
} from '@/components/dashboard';

export default function DashboardPage() {
  const [dashboards, setDashboards] = useState<DashboardsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboards = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getDashboards();
      setDashboards(data);
    } catch (err) {
      setError('Error al cargar las métricas. Verifica que el backend esté corriendo.');
      console.error('Error loading dashboards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboards();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-40" />
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <Skeleton className="h-[400px] w-full" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadDashboards} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (!dashboards || dashboards.kpis.totalClients === 0) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard de Cierre</h1>
          <p className="text-sm text-muted-foreground">
            Métricas y análisis enfocados en cerrar ventas
          </p>
        </div>
        <Card className="p-12 text-center">
          <p className="text-lg font-medium mb-2">No hay datos disponibles</p>
          <p className="text-muted-foreground">
            Sube un archivo de clientes en la sección de Uploads para ver las métricas
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard de Cierre</h1>
          <p className="text-sm text-muted-foreground">
            Análisis inteligente para maximizar el cierre de ventas
          </p>
        </div>
        <Button onClick={loadDashboards} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <Tabs defaultValue="resumen" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="vendedores">Por Vendedor</TabsTrigger>
          <TabsTrigger value="categorias">Por Categoría</TabsTrigger>
          <TabsTrigger value="todas">Todas</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-6 mt-6">
          <ConversionKpis
            kpis={dashboards.kpis}
            topSeller={dashboards.closureBySeller?.[0]}
            closureByIndustry={dashboards.closureByIndustry}
            closureByDiscoverySource={dashboards.closureByDiscoverySource}
          />
        </TabsContent>

        <TabsContent value="vendedores" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <SellerConversionChart data={dashboards.closureBySeller} />
            <SellerExpertiseTable data={dashboards.sellerExpertiseByIndustry} />
          </div>
          <CrossHeatmap
            title="Matriz de Cierre por Vendedor"
            description="Analiza el rendimiento de cada vendedor en diferentes dimensiones"
            dataSets={[
              {
                rowDimension: 'seller',
                colDimension: 'industry',
                data: dashboards.sellerExpertiseByIndustry.flatMap((seller) =>
                  seller.expertise.map((exp) => ({
                    row: seller.sellerName,
                    col: exp.industry,
                    value: exp.closureRate,
                    total: exp.totalDeals,
                    closed: exp.closedDeals,
                  }))
                ),
              },
              {
                rowDimension: 'seller',
                colDimension: 'discoverySource',
                data: dashboards.sellerByDiscoverySource?.matrix.map((item) => ({
                  row: item.seller,
                  col: item.dimension,
                  value: item.closureRate,
                  total: item.total,
                  closed: item.closed,
                })) || [],
              },
              {
                rowDimension: 'seller',
                colDimension: 'painPoint',
                data: dashboards.sellerByPainPoint?.matrix.map((item) => ({
                  row: item.seller,
                  col: item.dimension,
                  value: item.closureRate,
                  total: item.total,
                  closed: item.closed,
                })) || [],
              },
            ]}
            rowDimensions={[
              { key: 'seller', label: 'Vendedor' },
            ]}
            colDimensions={[
              { key: 'industry', label: 'Industria' },
              { key: 'discoverySource', label: 'Fuente' },
              { key: 'painPoint', label: 'Pain Point' },
            ]}
            defaultRowDimension="seller"
            defaultColDimension="industry"
            valueLabel="Cierre"
          />
        </TabsContent>

        <TabsContent value="categorias" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <IndustryConversionChart data={dashboards.closureByIndustry} />
            <DiscoverySourceChart data={dashboards.closureByDiscoverySource} />
          </div>
        </TabsContent>

        <TabsContent value="todas" className="space-y-6 mt-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Todas las Categorizaciones</h2>
            <Card className="p-6">
              <CategorizationsTable />
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
