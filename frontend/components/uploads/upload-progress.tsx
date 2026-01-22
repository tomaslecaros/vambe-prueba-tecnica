'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getUploadStatus } from '@/lib/api';
import { CheckCircle2, Clock, Loader2, Database, Sparkles } from 'lucide-react';
import type { UploadStatus } from '@/types';

interface UploadProgressProps {
  uploadId: string;
  onComplete?: () => void;
}

export function UploadProgress({ uploadId, onComplete }: UploadProgressProps) {
  const [status, setStatus] = useState<UploadStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getUploadStatus(uploadId);
        setStatus(data);
        setIsLoading(false);

        if (data.status === 'completed' || data.status === 'failed') {
          onComplete?.();
        }
      } catch (error) {
        console.error('Error fetching upload status:', error);
        setIsLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);

    return () => clearInterval(interval);
  }, [uploadId, onComplete]);

  if (isLoading || !status) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  const isCompleted = status.status === 'completed';
  const isFailed = status.status === 'failed';
  const isProcessing = status.status === 'processing';

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{status.filename}</span>
          <Badge
            variant={
              isCompleted
                ? 'default'
                : isFailed
                  ? 'destructive'
                  : 'secondary'
            }
            className="text-xs"
          >
            {isCompleted
              ? 'Completado'
              : isFailed
                ? 'Error'
                : isProcessing
                  ? 'Procesando'
                  : status.status}
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Database className="h-3 w-3" />
              Guardando clientes
            </span>
            <span className="text-xs font-medium">{status.progress}%</span>
          </div>
          <Progress value={status.progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {status.processedRows} de {status.totalRows} filas procesadas
          </p>
        </div>

        {status.clientsSaved > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Categorizando clientes
              </span>
              <span className="text-xs font-medium">
                {status.categorizationProgress}%
              </span>
            </div>
            <Progress value={status.categorizationProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {status.clientsCategorized} de {status.clientsSaved} clientes categorizados
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-6 pt-2 border-t">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Database className="h-4 w-4 text-blue-500" />
            <span className="text-lg font-bold">{status.clientsSaved}</span>
          </div>
          <span className="text-xs text-muted-foreground">Guardados</span>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
            ) : isCompleted ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Clock className="h-4 w-4 text-amber-500" />
            )}
            <span className="text-lg font-bold">{status.clientsCategorized}</span>
          </div>
          <span className="text-xs text-muted-foreground">Categorizados</span>
        </div>
      </div>

      {isFailed && status.errors && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2">
          <p className="text-xs text-destructive font-medium">
            {status.errors.message || 'Error al procesar el archivo'}
          </p>
        </div>
      )}
    </Card>
  );
}
