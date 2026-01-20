'use client';

import { useState, useEffect, Fragment } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { UploadProgressCard } from '@/components/uploads/upload-progress-card';
import { AllClientsTable } from '@/components/uploads/all-clients-table';
import { uploadFile, getUploads, getUploadClientsWithProgress } from '@/lib/api';
import { toast } from 'sonner';
import { Upload, UploadClientProgress } from '@/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Loader2, Eye, CheckCircle2, Clock, XCircle, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function UploadsPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [allUploads, setAllUploads] = useState<Upload[]>([]);
  const [uploadProgress, setUploadProgress] = useState<
    Record<string, UploadClientProgress>
  >({});
  const [isLoadingUploads, setIsLoadingUploads] = useState(true);
  const [selectedUploadId, setSelectedUploadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof Upload | 'progress'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Cargar todos los uploads al montar
  useEffect(() => {
    loadAllUploads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling solo para uploads en proceso
  useEffect(() => {
    const processingUploads = allUploads.filter(
      (u) => u.status === 'processing'
    );

    if (processingUploads.length === 0) return;

    const interval = setInterval(() => {
      processingUploads.forEach((upload) => {
        fetchUploadProgress(upload.id);
      });
    }, 3000); // Cada 3 segundos

    return () => clearInterval(interval);
  }, [allUploads]);

  const loadAllUploads = async () => {
    try {
      setIsLoadingUploads(true);
      const response = await getUploads(100, 0); // Get first 100 uploads
      setAllUploads(response.uploads);

      // Cargar progreso inicial solo de los que están en proceso
      const processingUploads = response.uploads.filter(
        (u: Upload) => u.status === 'processing'
      );
      for (const upload of processingUploads) {
        await fetchUploadProgress(upload.id);
      }
    } catch (error) {
      console.error('Error loading uploads:', error);
    } finally {
      setIsLoadingUploads(false);
    }
  };

  const fetchUploadProgress = async (uploadId: string) => {
    try {
      const data = await getUploadClientsWithProgress(uploadId);
      setUploadProgress((prev) => ({ ...prev, [uploadId]: data }));

      // Si se completó, actualizar la lista
      if (data.upload.status === 'completed') {
        setAllUploads((prev) =>
          prev.map((u) =>
            u.id === uploadId ? { ...u, status: 'completed' } : u
          )
        );
      }
    } catch (error) {
      console.error(`Error fetching progress for ${uploadId}:`, error);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const response = await uploadFile(file);

      if (response.warning) {
        toast.warning(response.warning, {
          description: `${response.duplicates} clientes duplicados`,
        });
      } else {
        toast.success('Archivo subido correctamente', {
          description: `${response.newClients} clientes nuevos, ${response.duplicates} duplicados`,
        });
      }

      // Agregar a la lista si tiene clientes nuevos
      if (response.newClients > 0) {
        const newUpload: Upload = {
          id: response.uploadId,
          filename: response.filename,
          status: 'processing',
          totalRows: response.totalRows,
          processedRows: response.newClients,
          createdAt: new Date().toISOString(),
          completedAt: null,
        };
        setAllUploads((prev) => [newUpload, ...prev]);
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('lastUploadId', response.uploadId);
      }
    } catch (error) {
      toast.error('Error al subir el archivo', {
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const processingCount = allUploads.filter((u) => u.status === 'processing').length;

  const filteredUploads = allUploads.filter((upload) =>
    upload.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedUploads = [...filteredUploads].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    if (sortColumn === 'progress') {
      aValue = uploadProgress[a.id]?.progress.percentage || (a.status === 'completed' ? 100 : 0);
      bValue = uploadProgress[b.id]?.progress.percentage || (b.status === 'completed' ? 100 : 0);
    } else if (sortColumn === 'createdAt') {
      aValue = new Date(a.createdAt).getTime();
      bValue = new Date(b.createdAt).getTime();
    } else if (sortColumn === 'processedRows') {
      aValue = a.processedRows || 0;
      bValue = b.processedRows || 0;
    } else {
      aValue = a[sortColumn];
      bValue = b[sortColumn];
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (column: keyof Upload | 'progress') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }: { column: keyof Upload | 'progress' }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 text-slate-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-slate-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-slate-600" />
    );
  };

  const handleViewProgress = async (uploadId: string) => {
    if (!uploadProgress[uploadId]) {
      await fetchUploadProgress(uploadId);
    }
    setSelectedUploadId(selectedUploadId === uploadId ? null : uploadId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-slate-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-slate-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-slate-300" />;
      default:
        return <Clock className="h-4 w-4 text-slate-300" />;
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">Uploads</h1>
        <p className="text-sm text-gray-600">
          Sube archivos y visualiza el progreso de categorización
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList>
          <TabsTrigger value="upload">Subir Nuevo</TabsTrigger>
          <TabsTrigger value="history">
            Historial {processingCount > 0 && `(${processingCount} en proceso)`}
          </TabsTrigger>
          <TabsTrigger value="clients">Todos los Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <FileValidator onValidFile={handleFileUpload} isUploading={isUploading} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {isLoadingUploads ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : allUploads.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500">No hay uploads registrados</p>
              <p className="text-sm text-gray-400">Los archivos que subas aparecerán aquí</p>
            </Card>
          ) : (
            <>
              {/* Buscador */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Buscar por nombre de archivo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                  >
                    Limpiar
                  </Button>
                )}
              </div>

              {filteredUploads.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-gray-500">No se encontraron resultados</p>
                  <p className="text-sm text-gray-400">
                    Intenta con otro término de búsqueda
                  </p>
                </Card>
              ) : (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer select-none hover:bg-slate-50"
                          onClick={() => handleSort('filename')}
                        >
                          <div className="flex items-center gap-2">
                            Archivo
                            <SortIcon column="filename" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-center cursor-pointer select-none hover:bg-slate-50"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center justify-center gap-2">
                            Estado
                            <SortIcon column="status" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-center cursor-pointer select-none hover:bg-slate-50"
                          onClick={() => handleSort('progress')}
                        >
                          <div className="flex items-center justify-center gap-2">
                            Progreso
                            <SortIcon column="progress" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer select-none hover:bg-slate-50"
                          onClick={() => handleSort('processedRows')}
                        >
                          <div className="flex items-center gap-2">
                            Procesados
                            <SortIcon column="processedRows" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer select-none hover:bg-slate-50"
                          onClick={() => handleSort('createdAt')}
                        >
                          <div className="flex items-center gap-2">
                            Fecha
                            <SortIcon column="createdAt" />
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedUploads.map((upload) => (
                        <Fragment key={upload.id}>
                          <TableRow 
                            className={(upload.status === 'processing' || uploadProgress[upload.id]) ? 'cursor-pointer hover:bg-slate-50' : ''}
                            onClick={() => (upload.status === 'processing' || uploadProgress[upload.id]) && handleViewProgress(upload.id)}
                          >
                            <TableCell className="font-medium">{upload.filename}</TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                {getStatusIcon(upload.status)}
                                <span className="text-sm capitalize">{upload.status}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {upload.status === 'processing' && uploadProgress[upload.id] ? (
                                <span className="text-sm font-medium">
                                  {uploadProgress[upload.id].progress.percentage}%
                                </span>
                              ) : upload.status === 'completed' ? (
                                <span className="text-sm text-slate-500">100%</span>
                              ) : (
                                <span className="text-sm text-slate-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {upload.processedRows || 0} / {upload.totalRows}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-slate-600">
                              {new Date(upload.createdAt).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </TableCell>
                          </TableRow>
                          {selectedUploadId === upload.id && uploadProgress[upload.id] && (
                            <TableRow>
                              <TableCell colSpan={5} className="bg-slate-50 p-4">
                                <UploadProgressCard data={uploadProgress[upload.id]} />
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="clients">
          <AllClientsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
