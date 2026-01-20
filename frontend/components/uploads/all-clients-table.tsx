'use client';

import { useState, useEffect, useCallback } from 'react';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { ClientDetailModal } from './client-detail-modal';
import { getAllClients } from '@/lib/api';
import type { Client, ClientProgress } from '@/types';

const PAGE_SIZE = 20;

const columns: DataTableColumn<Client>[] = [
  {
    key: 'email',
    header: 'Email',
    className: 'font-medium',
    searchable: true,
  },
  {
    key: 'name',
    header: 'Nombre',
    searchable: true,
  },
  {
    key: 'seller',
    header: 'Vendedor',
    searchable: true,
  },
  {
    key: 'closed',
    header: 'Cerrado',
    headerClassName: 'text-center',
    className: 'text-center',
    searchable: false,
    render: (client) =>
      client.closed ? (
        <CheckCircle2 className="h-5 w-5 text-slate-500 mx-auto" />
      ) : (
        <XCircle className="h-5 w-5 text-slate-300 mx-auto" />
      ),
  },
  {
    key: 'industry',
    header: 'Industria',
    getValue: (client) => client.categorization?.data.industry,
    render: (client) =>
      client.categorization?.data.industry || (
        <span className="text-muted-foreground text-sm">-</span>
      ),
  },
  {
    key: 'categorized',
    header: 'Categorizado',
    headerClassName: 'text-center',
    className: 'text-center',
    searchable: false,
    render: (client) =>
      client.categorization ? (
        <div className="flex items-center justify-center" title="Categorizado">
          <CheckCircle2 className="h-5 w-5 text-slate-500" />
        </div>
      ) : (
        <div className="flex items-center justify-center" title="Pendiente">
          <Clock className="h-5 w-5 text-slate-300" />
        </div>
      ),
  },
  {
    key: 'createdAt',
    header: 'Fecha',
    searchable: false,
    render: (client) => (
      <span className="text-sm text-muted-foreground">
        {new Date(client.createdAt).toLocaleDateString('es-ES')}
      </span>
    ),
  },
];

export function AllClientsTable() {
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClientProgress | null>(null);
  const [page, setPage] = useState(1);

  const loadClients = useCallback(async (currentPage: number) => {
    try {
      setIsLoading(true);
      const offset = (currentPage - 1) * PAGE_SIZE;
      const data = await getAllClients(PAGE_SIZE, offset);
      setClients(data.clients);
      setTotal(data.total);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients(page);
  }, [page, loadClients]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const convertToClientProgress = (client: Client): ClientProgress => ({
    jobId: client.id,
    clientId: client.id,
    email: client.email,
    name: client.name,
    status: client.categorization ? 'completed' : 'waiting',
    progress: 100,
    categories: client.categorization?.data || null,
  });

  const columnsWithActions: DataTableColumn<Client>[] = [
    ...columns,
    {
      key: 'actions',
      header: 'Acción',
      headerClassName: 'text-right',
      className: 'text-right',
      searchable: false,
      render: (client) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedClient(convertToClientProgress(client));
          }}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver
        </Button>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={clients}
        columns={columnsWithActions}
        keyExtractor={(client) => client.id}
        searchPlaceholder="Buscar por email, nombre o vendedor..."
        pageSize={PAGE_SIZE}
        emptyMessage="No hay clientes todavía. Sube un archivo Excel o CSV para comenzar."
        emptyIcon={<span className="text-4xl">📊</span>}
        isLoading={isLoading}
        loadingComponent={
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        }
        serverPagination
        serverTotal={total}
        serverPage={page}
        onServerPageChange={handlePageChange}
        headerActions={
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Total: {total} clientes
            </span>
            <Button variant="outline" size="sm" onClick={() => loadClients(page)}>
              Actualizar
            </Button>
          </div>
        }
      />

      <ClientDetailModal
        client={selectedClient}
        open={Boolean(selectedClient)}
        onClose={() => setSelectedClient(null)}
      />
    </>
  );
}
