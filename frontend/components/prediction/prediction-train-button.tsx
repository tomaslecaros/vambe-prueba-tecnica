'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { PredictionStatusResponse } from '@/types';
import { trainPredictionModel, getPredictionStatus } from '@/lib/api';
import { Loader2, Play } from 'lucide-react';
import { toast } from 'sonner';

interface PredictionTrainButtonProps {
  status: PredictionStatusResponse;
  onStatusUpdate: () => void;
}

export function PredictionTrainButton({ status, onStatusUpdate }: PredictionTrainButtonProps) {
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
      
      // Refrescar estado después de un breve delay
      setTimeout(() => {
        onStatusUpdate();
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

  if (!status.canTrain) {
    return (
      <Alert>
        <AlertDescription>
          {status.isTraining
            ? 'Ya hay un entrenamiento en curso. El modelo actual sigue disponible mientras se entrena uno nuevo.'
            : 'No hay suficientes datos para entrenar el modelo. Se necesitan al menos 50 muestras con cierre conocido.'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Button
      onClick={handleTrain}
      disabled={isTraining || status.isTraining}
      className="w-full"
      size="lg"
    >
      {isTraining || status.isTraining ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {status.isTraining ? 'Entrenamiento en curso...' : 'Iniciando entrenamiento...'}
        </>
      ) : (
        <>
          <Play className="h-4 w-4" />
          {status.trained ? 'Re-entrenar Modelo' : 'Entrenar Modelo'}
        </>
      )}
    </Button>
  );
}
