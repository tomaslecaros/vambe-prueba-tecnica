'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';
import { getProgress } from '@/lib/api';
import { POLLING_INTERVAL } from '@/lib/constants';
import type { ProgressResponse } from '@/types';

interface ProgressCardProps {
  uploadId: string;
}

export function ProgressCard({ uploadId }: ProgressCardProps) {
  const [progressData, setProgressData] = useState<ProgressResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await getProgress(uploadId);
        setProgressData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching progress:', error);
        setIsLoading(false);
      }
    };

    fetchProgress();
    const interval = setInterval(fetchProgress, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [uploadId]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  if (!progressData) {
    return null;
  }

  const { progress, total, waiting, active, completed, failed } = progressData;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Progreso de Categorización</h2>
          <Badge variant={progress === 100 ? 'default' : 'secondary'}>
            {progress}%
          </Badge>
        </div>

        <Progress value={progress} className="h-2" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium">{completed}</p>
              <p className="text-xs text-muted-foreground">Completados</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
            <div>
              <p className="text-sm font-medium">{active}</p>
              <p className="text-xs text-muted-foreground">En progreso</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-600" />
            <div>
              <p className="text-sm font-medium">{waiting}</p>
              <p className="text-xs text-muted-foreground">En espera</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <div>
              <p className="text-sm font-medium">{failed}</p>
              <p className="text-xs text-muted-foreground">Fallidos</p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground">
            Total: {completed + active + waiting + failed} de {total} clientes
          </p>
        </div>
      </div>
    </Card>
  );
}
