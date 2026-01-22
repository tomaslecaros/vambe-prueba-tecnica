'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { FileValidator } from '@/components/uploads/file-validator';
import { UploadProgress } from '@/components/uploads/upload-progress';
import { uploadFile, getAllClients } from '@/lib/api';
import { toast } from 'sonner';
import { Client } from '@/types';
import {
  Loader2,
  CheckCircle2,
  RefreshCw,
  FileSpreadsheet,
  Clock,
} from 'lucide-react';

export default function UploadsPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingClientIds, setPendingClientIds] = useState<Set<string>>(new Set());
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);

  // Cargar clientes al montar
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await getAllClients(100, 0);
      setClients(response.clients);

      // Limpiar pending de los que ya tienen categorización
      setPendingClientIds((prev) => {
        const newSet = new Set(prev);
        response.clients.forEach((client: Client) => {
          if (client.categorization) {
            newSet.delete(client.id);
          }
        });
        return newSet;
      });
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('Error al cargar clientes');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const response = await uploadFile(file);
      
      setActiveUploadId(response.uploadId);
      toast.success('Archivo subido correctamente', {
        description: 'El archivo se está procesando en segundo plano',
      });
    } catch (error) {
      toast.error('Error al subir el archivo', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadComplete = () => {
    setActiveUploadId(null);
    loadClients(true);
    toast.success('Procesamiento completado', {
      description: 'Los clientes se están categorizando automáticamente',
    });
  };

  const pendingCount = clients.filter((c) => !c.categorization).length;
  const categorizedCount = clients.filter((c) => c.categorization).length;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Uploads</h1>
        <p className="text-sm text-muted-foreground">
          Sube archivos de clientes para categorización automática
        </p>
      </div>

      {/* Layout 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Columna izquierda: Upload */}
        <div className="space-y-4">
          <Card className="p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Subir archivo</span>
            </div>
            <div className="flex-1 flex items-center">
              <div className="w-full">
                <FileValidator onValidFile={handleFileUpload} isUploading={isUploading} />
                <p className="text-xs text-muted-foreground mt-2">
                  Formatos: .xlsx, .csv (máx. 10MB)
                </p>
              </div>
            </div>
          </Card>

          {/* Progress Card */}
          {activeUploadId && (
            <UploadProgress
              uploadId={activeUploadId}
              onComplete={handleUploadComplete}
            />
          )}
        </div>

        {/* Columna derecha: Resumen */}
        <Card className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">Estado de clientes</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadClients(true)}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
          <div className="flex-1 flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{categorizedCount}</span>
              </div>
              <span className="text-xs text-muted-foreground">Categorizados</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="h-5 w-5 text-amber-500" />
                <span className="text-2xl font-bold">{pendingCount}</span>
              </div>
              <span className="text-xs text-muted-foreground">Pendientes</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabla de clientes */}
      <Card>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">Clientes</span>
            <Badge variant="secondary">{clients.length}</Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileSpreadsheet className="h-12 w-12 mb-3" />
            <p>No hay clientes</p>
            <p className="text-sm">Sube un archivo para comenzar</p>
          </div>
        ) : (
          <div className="overflow-auto max-h-[500px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-[50px]">Estado</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Industria</TableHead>
                  <TableHead className="text-center">Cerrado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => {
                  const isPending = !client.categorization;
                  const isNewPending = pendingClientIds.has(client.id);

                  return (
                    <TableRow key={client.id} className={isNewPending ? 'bg-amber-50' : ''}>
                      <TableCell>
                        {isPending ? (
                          <Clock className="h-4 w-4 text-amber-500" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {client.email}
                      </TableCell>
                      <TableCell className="text-sm">{client.seller || '-'}</TableCell>
                      <TableCell>
                        {client.categorization?.data?.industry ? (
                          <Badge variant="outline" className="text-xs">
                            {client.categorization.data.industry}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {client.closed ? (
                          <Badge variant="secondary" className="text-xs">Sí</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">No</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
