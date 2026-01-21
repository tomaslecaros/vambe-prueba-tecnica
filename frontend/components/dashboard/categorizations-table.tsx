'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCategorizations } from '@/lib/api';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { CategorizationItem, CategorizationsResponse } from '@/types';
import { Mail, Calendar, Building2, Users, TrendingUp, Target, Lightbulb, Link2, Tag, FileText, CheckCircle2, XCircle } from 'lucide-react';

const PAGE_SIZE = 50;

export function CategorizationsTable() {
  const [data, setData] = useState<CategorizationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedClient, setSelectedClient] = useState<CategorizationItem | null>(null);

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
        <div className="py-1">
          <p className="text-xs font-medium">{item.clientName}</p>
          <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">{item.clientEmail}</p>
        </div>
      ),
    },
    {
      key: 'seller',
      header: 'Vendedor',
      render: (item) => <span className="text-xs py-1">{item.seller || 'N/A'}</span>,
    },
    {
      key: 'closed',
      header: 'Cierre',
      headerClassName: 'text-center',
      className: 'text-center',
      render: (item) => (
        <div className="flex justify-center items-center py-1">
          {item.closed ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
        </div>
      ),
    },
    {
      key: 'meetingDate',
      header: 'Fecha',
      render: (item) => (
        <span className="text-xs py-1">
          {item.meetingDate 
            ? new Date(item.meetingDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
            : 'N/A'}
        </span>
      ),
    },
    {
      key: 'industry',
      header: 'Industria',
      render: (item) => (
        <Badge variant="outline" className="text-[10px] py-0">
          {item.data?.industry || 'N/A'}
        </Badge>
      ),
    },
    {
      key: 'main_pain_point',
      header: 'Pain Point',
      render: (item) => (
        <span className="text-xs py-1 truncate max-w-[120px]" title={item.data?.main_pain_point || 'N/A'}>
          {item.data?.main_pain_point || 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <>
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
        onRowClick={(item) => setSelectedClient(item)}
        rowClassName="cursor-pointer hover:bg-muted/50"
        className="text-xs"
      />

      <Dialog open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedClient && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg">{selectedClient.clientName}</DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  {selectedClient.clientEmail}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* Información Básica */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Fecha de Reunión</p>
                        <p className="font-medium">
                          {selectedClient.meetingDate 
                            ? new Date(selectedClient.meetingDate).toLocaleDateString('es-ES', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                              })
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Vendedor</p>
                        <p className="font-medium">{selectedClient.seller || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Estado</p>
                        <Badge variant={selectedClient.closed ? 'default' : 'secondary'} className="text-xs">
                          {selectedClient.closed ? 'Cerrado' : 'Abierto'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Industria</p>
                        <p className="font-medium">{selectedClient.data?.industry || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Tamaño de Empresa</p>
                        <p className="font-medium">{selectedClient.data?.company_size || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Volumen Semanal</p>
                        <p className="font-medium">
                          {selectedClient.data?.weekly_contact_volume 
                            ? selectedClient.data.weekly_contact_volume.toLocaleString() 
                            : 'No especificado'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pain Point y Solución */}
                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Punto de Dolor Principal</p>
                      <p className="text-sm font-medium">{selectedClient.data?.main_pain_point || 'N/A'}</p>
                    </div>
                  </div>
                  {selectedClient.data?.current_solution && (
                    <div className="flex items-start gap-2">
                      <Link2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Solución Actual</p>
                        <p className="text-sm font-medium">{selectedClient.data.current_solution}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Casos de Uso y Fuentes */}
                <div className="grid gap-4 md:grid-cols-2 border-t pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Caso de Uso</p>
                    <Badge variant="outline" className="text-xs">
                      {selectedClient.data?.use_case || 'N/A'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Fuente de Descubrimiento</p>
                    <Badge variant="outline" className="text-xs">
                      {selectedClient.data?.discovery_source || 'N/A'}
                    </Badge>
                  </div>
                </div>

                {/* Volumen y Tendencia */}
                {selectedClient.data?.volume_trend && (
                  <div className="border-t pt-4">
                    <p className="text-xs text-muted-foreground mb-2">Tendencia de Volumen</p>
                    <Badge 
                      variant={selectedClient.data.volume_trend === 'Creciente' ? 'default' : 
                               selectedClient.data.volume_trend === 'Estable' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {selectedClient.data.volume_trend}
                    </Badge>
                  </div>
                )}

                {/* Integraciones */}
                {selectedClient.data?.integration_needs && selectedClient.data.integration_needs.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-xs text-muted-foreground mb-2">Necesidades de Integración</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedClient.data.integration_needs.map((need, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {need}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Temas de Consulta */}
                {selectedClient.data?.query_topics && selectedClient.data.query_topics.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                      <Tag className="h-3 w-3" />
                      Temas de Consulta
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedClient.data.query_topics.map((topic, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resumen */}
                {selectedClient.data?.summary && (
                  <div className="border-t pt-4">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      Resumen
                    </p>
                    <p className="text-sm leading-relaxed">{selectedClient.data.summary}</p>
                  </div>
                )}

                {/* Fecha de Procesamiento */}
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground">
                    Procesado el {new Date(selectedClient.processedAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
