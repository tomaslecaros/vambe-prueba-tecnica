'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import type { PredictionStatusResponse } from '@/types';
import { AlertCircle } from 'lucide-react';

interface PredictionStatusCardProps {
  status: PredictionStatusResponse;
  onStatusUpdate?: () => void;
}

export function PredictionStatusCard({ status, onStatusUpdate }: PredictionStatusCardProps) {

  return (
    <Card className="flex flex-col" style={{ height: 'fit-content', maxHeight: '100%' }}>
      <CardHeader className="flex-shrink-0">
        <CardTitle className="!text-base">Modelo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {status.trained && status.accuracy !== undefined ? (
          <>
            <div className="rounded-lg border-2 border-chart-1/30 bg-chart-1/10 p-3">
              <p className="text-xs font-bold" style={{ color: 'var(--chart-1)' }}>
                💡 Mientras más categorizaciones tengas, más preciso será el modelo
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Modelo entrenado con <span className="font-semibold text-chart-1">{status.samplesUsed}</span> categorizaciones
                {status.minimumRequired && (
                  <> (mínimo {status.minimumRequired} para entrenar)</>
                )}
              </p>
              <div className="py-2">
                <p className="text-3xl font-bold" style={{ color: 'var(--chart-1)' }}>
                  {(status.accuracy * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Precisión del modelo</p>
              </div>
            </div>
            {status.lastTrainedAt && (
              <div className="space-y-0.5 pt-1 border-t">
                <p className="text-xs text-muted-foreground">
                  Última actualización: {new Date(status.lastTrainedAt).toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  Entrenado automáticamente al completar la categorización de un archivo
                </p>
                {status.isTraining && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Re-entrenando automáticamente con nuevos datos...
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {status.availableSamples < status.minimumRequired
                ? `Se necesitan ${status.minimumRequired} categorizaciones para entrenar (actualmente: ${status.availableSamples})`
                : 'Modelo listo para entrenar'}
            </p>
            {status.isTraining && status.trainingProgress && (
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-xs">
                  <span>Entrenamiento automático en progreso</span>
                  <span>{status.trainingProgress.progress}%</span>
                </div>
                <Progress value={status.trainingProgress.progress} />
                <p className="text-xs text-muted-foreground">
                  El modelo se entrena automáticamente al completar la categorización de un archivo
                </p>
              </div>
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
