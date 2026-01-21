'use client';

import { useEffect, useState } from 'react';
import { PredictionStatusCard, PredictionForm } from '@/components/analytics';
import { getPredictionStatus, predictClosure } from '@/lib/api';
import type { PredictionStatusResponse, PredictionResponse, PredictionErrorResponse } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AnalyticsPage() {
  const [status, setStatus] = useState<PredictionStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transcription, setTranscription] = useState('');
  const [isPredicting, setIsPredicting] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [predictionError, setPredictionError] = useState<PredictionErrorResponse | null>(null);

  const loadStatus = async () => {
    try {
      setIsLoading(true);
      const data = await getPredictionStatus();
      setStatus(data);
    } catch (error) {
      console.error('Error loading prediction status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePredict = async (text: string) => {
    if (!text.trim()) {
      toast.error('Por favor ingresa una transcripción');
      return;
    }

    if (!status?.trained) {
      toast.error('El modelo no está entrenado aún');
      return;
    }

    setIsPredicting(true);
    setPrediction(null);
    setPredictionError(null);
    setTranscription(text);

    try {
      const result = await predictClosure(text);

      // Check if the response is an error (has 'error' field)
      if ('error' in result) {
        setPredictionError(result as PredictionErrorResponse);
        toast.warning(result.message);
      } else {
        setPrediction(result as PredictionResponse);
        toast.success('Predicción realizada exitosamente');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al realizar la predicción';
      toast.error(errorMessage);
    } finally {
      setIsPredicting(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  useEffect(() => {
    if (!status?.isTraining) return;

    // Refrescar estado cada 5 segundos si está entrenando
    const interval = setInterval(() => {
      loadStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [status?.isTraining]);

  if (isLoading || !status) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 h-[calc(100vh-8rem)] items-start">
      {/* Left Column */}
      <div className="space-y-4 flex flex-col h-full">
        {/* Top Left: Modelo */}
        <PredictionStatusCard 
          status={status} 
          onStatusUpdate={loadStatus}
        />
        {/* Bottom Left: Input de transcripción */}
        <div className="flex-1 min-h-0">
          <PredictionForm 
            status={status} 
            transcription={transcription}
            setTranscription={setTranscription}
            onPredictClick={handlePredict}
            prediction={prediction}
            isPredicting={isPredicting}
          />
        </div>
      </div>

      {/* Right Column - Results */}
      <div className="h-full">
        {prediction ? (
          <PredictionForm
            status={status}
            transcription={transcription}
            setTranscription={setTranscription}
            onPredictClick={handlePredict}
            prediction={prediction}
            isPredicting={isPredicting}
            showResultsOnly={true}
          />
        ) : predictionError ? (
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="!text-base">Resultados</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {predictionError.message}
                </AlertDescription>
              </Alert>

              {predictionError.categories && (
                <div className="space-y-2 rounded-lg border-2 border-amber-500/20 bg-amber-50 p-3">
                  <p className="text-sm font-bold text-amber-700">Categorías detectadas (incompletas)</p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                    {predictionError.categories.industry && (
                      <div>
                        <span className="text-muted-foreground">Industria:</span>{' '}
                        <span className={`font-medium ${predictionError.categories.industry === 'Otro' ? 'text-red-600' : ''}`}>
                          {predictionError.categories.industry}
                        </span>
                      </div>
                    )}
                    {predictionError.categories.main_pain_point && (
                      <div>
                        <span className="text-muted-foreground">Pain Point:</span>{' '}
                        <span className={`font-medium ${predictionError.categories.main_pain_point === 'Otro' ? 'text-red-600' : ''}`}>
                          {predictionError.categories.main_pain_point}
                        </span>
                      </div>
                    )}
                    {predictionError.categories.company_size && (
                      <div>
                        <span className="text-muted-foreground">Tamaño:</span>{' '}
                        <span className="font-medium">{predictionError.categories.company_size}</span>
                      </div>
                    )}
                    {predictionError.categories.discovery_source && (
                      <div>
                        <span className="text-muted-foreground">Origen:</span>{' '}
                        <span className="font-medium">{predictionError.categories.discovery_source}</span>
                      </div>
                    )}
                    {predictionError.categories.use_case && (
                      <div>
                        <span className="text-muted-foreground">Caso de uso:</span>{' '}
                        <span className="font-medium">{predictionError.categories.use_case}</span>
                      </div>
                    )}
                    {predictionError.categories.summary && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Resumen:</span>{' '}
                        <span className="font-medium">{predictionError.categories.summary}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-amber-600 mt-2">
                    Los campos en rojo no pudieron ser determinados de la transcripción.
                    Proporciona una transcripción con más detalles sobre la industria y el problema del cliente.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="!text-base">Resultados</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <p className="text-sm text-muted-foreground text-center">
                Ingresa una transcripción y presiona &quot;Predecir Probabilidad&quot; para ver los resultados aquí
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
