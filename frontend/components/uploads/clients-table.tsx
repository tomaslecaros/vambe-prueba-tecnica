'use client';

import { useState } from 'react';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { ClientDetailModal } from './client-detail-modal';
import type { ClientProgress } from '@/types';

interface ClientsTableProps {
  clients: ClientProgress[];
}

const getStatusBadge = (status: string) => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
    completed: 'default',
    active: 'secondary',
    waiting: 'secondary',
    failed: 'destructive',
  };

  const labels: Record<string, string> = {
    completed: 'Completado',
    active: 'En progreso',
    waiting: 'En espera',
    failed: 'Fallido',
  };

  return (
    <Badge variant={variants[status] || 'secondary'}>
      {labels[status] || status}
    </Badge>
  );
};

const baseColumns: DataTableColumn<ClientProgress>[] = [
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
    key: 'status',
    header: 'Estado',
    searchable: false,
    render: (client) => getStatusBadge(client.status),
  },
  {
    key: 'industry',
    header: 'Industria',
    getValue: (client) => client.categories?.industry,
    render: (client) =>
      client.categories?.industry || (
        <span className="text-muted-foreground">-</span>
      ),
  },
];

export function ClientsTable({ clients }: ClientsTableProps) {
  const [selectedClient, setSelectedClient] = useState<ClientProgress | null>(null);

  const columns: DataTableColumn<ClientProgress>[] = [
    ...baseColumns,
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
            setSelectedClient(client);
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
        columns={columns}
        keyExtractor={(client) => client.clientId}
        searchPlaceholder="Buscar por email o nombre..."
        pageSize={10}
        emptyMessage="No hay clientes para mostrar"
      />

      <ClientDetailModal
        client={selectedClient}
        open={!!selectedClient}
        onClose={() => setSelectedClient(null)}
      />
    </>
  );
}
