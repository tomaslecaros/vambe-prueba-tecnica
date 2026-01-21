'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import type { PredictionStatusResponse } from '@/types';
import { CheckCircle2, AlertCircle, Clock, XCircle, Play, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { trainPredictionModel } from '@/lib/api';
import { toast } from 'sonner';

interface PredictionStatusCardProps {
  status: PredictionStatusResponse;
  onStatusUpdate?: () => void;
}

export function PredictionStatusCard({ status, onStatusUpdate }: PredictionStatusCardProps) {
  const [isTraining, setIsTraining] = useState(false);

  const handleTrain = async () => {
    if (!status.canTrain || status.isTraining) {
      return;
    }

    setIsTraining(true);
    try {
      const result = await trainPredictionModel();
      toast.success('Entrenamiento iniciado', {
        description: `Se están usando ${result.samplesUsed} muestras para entrenar el modelo.`,
      });
      
      setTimeout(() => {
        onStatusUpdate?.();
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al iniciar el entrenamiento';
      toast.error('Error', {
        description: errorMessage,
      });
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <Card className="flex flex-col" style={{ height: 'fit-content', maxHeight: '100%' }}>
      <CardHeader className="flex-shrink-0">
        <CardTitle className="!text-base">Modelo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {status.trained && status.accuracy !== undefined ? (
          <>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-2">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                💡 Mientras más categorizaciones tengas, más preciso tiende a ser el modelo.
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">
                Entrenado con {status.samplesUsed} categorizaciones (mínimo {status.minimumRequired} para entrenar)
              </p>
              <p className="text-2xl font-bold text-primary">
                {(status.accuracy * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Precisión del modelo</p>
            </div>
            {status.lastTrainedAt && (
              <p className="text-xs text-muted-foreground">
                Última actualización: {new Date(status.lastTrainedAt).toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            )}
            <div className="pt-1">
              <Button
                onClick={handleTrain}
                disabled={isTraining || status.isTraining || !status.canTrain}
                variant="outline"
                className="w-full"
                size="sm"
              >
                {isTraining || status.isTraining ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Entrenando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Re-entrenar Modelo
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {status.availableSamples < status.minimumRequired
                ? `Se necesitan ${status.minimumRequired} categorizaciones para entrenar (actualmente: ${status.availableSamples})`
                : 'Modelo listo para entrenar'}
            </p>
            {status.isTraining && status.trainingProgress && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progreso del entrenamiento</span>
                  <span>{status.trainingProgress.progress}%</span>
                </div>
                <Progress value={status.trainingProgress.progress} />
              </div>
            )}
            {status.canTrain && (
              <Button
                onClick={handleTrain}
                disabled={isTraining || status.isTraining}
                className="w-full"
                size="sm"
              >
                {isTraining || status.isTraining ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Entrenando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Entrenar Modelo
                  </>
                )}
              </Button>
            )}
          </>
        )}

        {status.lastError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{status.lastError}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
