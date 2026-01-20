'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCategorizations } from '@/lib/api';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import type { CategorizationItem, CategorizationsResponse } from '@/types';

const PAGE_SIZE = 20;

export function CategorizationsTable() {
  const [data, setData] = useState<CategorizationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const loadData = useCallback(async (currentPage: number) => {
    try {
      setIsLoading(true);
      const offset = (currentPage - 1) * PAGE_SIZE;
      const response = await getCategorizations(PAGE_SIZE, offset);
      setData(response);
    } catch (error) {
      console.error('Error loading categorizations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(page);
  }, [page, loadData]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const columns: DataTableColumn<CategorizationItem>[] = [
    {
      key: 'clientName',
      header: 'Cliente',
      render: (item) => (
        <div>
          <p className="font-medium">{item.clientName}</p>
          <p className="text-sm text-muted-foreground">{item.clientEmail}</p>
        </div>
      ),
    },
    {
      key: 'seller',
      header: 'Vendedor',
      render: (item) => <span className="text-sm">{item.seller || 'N/A'}</span>,
    },
    {
      key: 'closed',
      header: 'Estado',
      render: (item) => (
        <Badge variant={item.closed ? 'default' : 'secondary'}>
          {item.closed ? 'Cerrado' : 'Abierto'}
        </Badge>
      ),
    },
    {
      key: 'meetingDate',
      header: 'Fecha Reunión',
      render: (item) => 
        item.meetingDate 
          ? new Date(item.meetingDate).toLocaleDateString('es-ES') 
          : 'N/A',
    },
    {
      key: 'industry',
      header: 'Industria',
      render: (item) => (
        <Badge variant="outline" className="text-xs">
          {item.data?.industry || 'N/A'}
        </Badge>
      ),
    },
    {
      key: 'company_size',
      header: 'Tamaño Empresa',
      render: (item) => (
        <span className="text-sm">{item.data?.company_size || 'N/A'}</span>
      ),
    },
    {
      key: 'weekly_contact_volume',
      header: 'Vol. Semanal',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (item) => (
        <span className="text-sm font-mono">
          {item.data?.weekly_contact_volume 
            ? item.data.weekly_contact_volume.toLocaleString() 
            : 'N/A'}
        </span>
      ),
    },
    {
      key: 'volume_trend',
      header: 'Tendencia Volumen',
      render: (item) => {
        const trend = item.data?.volume_trend;
        const variant = trend === 'Creciente' ? 'default' : trend === 'Estable' ? 'secondary' : 'outline';
        return (
          <Badge variant={variant} className="text-xs">
            {trend || 'N/A'}
          </Badge>
        );
      },
    },
    {
      key: 'main_pain_point',
      header: 'Pain Point',
      render: (item) => (
        <span className="text-sm">{item.data?.main_pain_point || 'N/A'}</span>
      ),
    },
    {
      key: 'current_solution',
      header: 'Solución Actual',
      render: (item) => (
        <span className="text-sm">{item.data?.current_solution || 'N/A'}</span>
      ),
    },
    {
      key: 'discovery_source',
      header: 'Fuente Descubrimiento',
      render: (item) => (
        <span className="text-sm">{item.data?.discovery_source || 'N/A'}</span>
      ),
    },
    {
      key: 'use_case',
      header: 'Caso de Uso',
      render: (item) => (
        <span className="text-sm">{item.data?.use_case || 'N/A'}</span>
      ),
    },
    {
      key: 'integration_needs',
      header: 'Integraciones',
      render: (item) => {
        const needs = item.data?.integration_needs || [];
        if (needs.length === 0) return <span className="text-sm text-muted-foreground">Ninguna</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {needs.slice(0, 2).map((need, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {need}
              </Badge>
            ))}
            {needs.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{needs.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'query_topics',
      header: 'Temas Consulta',
      render: (item) => {
        const topics = item.data?.query_topics || [];
        if (topics.length === 0) return <span className="text-sm text-muted-foreground">N/A</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {topics.slice(0, 2).map((topic, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {topic}
              </Badge>
            ))}
            {topics.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{topics.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'summary',
      header: 'Resumen',
      render: (item) => (
        <p className="text-sm text-muted-foreground max-w-xs truncate" title={item.data?.summary}>
          {item.data?.summary || 'N/A'}
        </p>
      ),
    },
    {
      key: 'processedAt',
      header: 'Procesado',
      render: (item) => (
        <span className="text-xs text-muted-foreground">
          {new Date(item.processedAt).toLocaleDateString('es-ES')}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      data={data?.categorizations || []}
      columns={columns}
      keyExtractor={(item) => item.id}
      isLoading={isLoading}
      searchPlaceholder="Buscar por cliente, industria..."
      emptyMessage="No hay categorizaciones disponibles"
      pageSize={PAGE_SIZE}
      serverPagination
      serverTotal={data?.total || 0}
      serverPage={page}
      onServerPageChange={handlePageChange}
    />
  );
}
