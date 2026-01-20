'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { UploadClientProgress } from '@/types';

interface UploadProgressCardProps {
  data: UploadClientProgress;
}

export function UploadProgressCard({ data }: UploadProgressCardProps) {
  const { upload, progress, clients } = data;

  return (
    <Card className="p-4">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">{upload.filename}</h3>
            <p className="text-xs text-gray-500">
              {new Date(upload.createdAt).toLocaleString('es-ES')}
            </p>
          </div>
          <Badge variant={upload.status === 'completed' ? 'default' : 'secondary'}>
            {upload.status}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {progress.categorized} / {progress.total} clientes categorizados
            </span>
            <span className="font-medium">{progress.percentage}%</span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-600">Total</p>
            <p className="text-lg font-semibold">{progress.total}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-2">
            <p className="text-xs text-gray-600">Completados</p>
            <p className="text-lg font-semibold text-green-700">
              {progress.categorized}
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-2">
            <p className="text-xs text-gray-600">Pendientes</p>
            <p className="text-lg font-semibold text-yellow-700">
              {progress.pending}
            </p>
          </div>
        </div>

        {/* Clients Table */}
        {clients.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">
              Progreso por Cliente
            </p>
            <ScrollArea className="h-[200px] border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Cliente</TableHead>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs text-center">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="text-xs font-medium">
                        {client.name}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {client.email}
                      </TableCell>
                      <TableCell className="text-center">
                        {client.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-600 mx-auto" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}
      </div>
    </Card>
  );
}
