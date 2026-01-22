'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import type { PredictionResponse, PredictionStatusResponse } from '@/types';
import { predictClosure } from '@/lib/api';
import { Loader2, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface PredictionFormProps {
  status: PredictionStatusResponse;
  transcription?: string;
  setTranscription?: (value: string) => void;
  onPredictClick?: (transcription: string) => void;
  prediction?: PredictionResponse | null;
  isPredicting?: boolean;
  showResultsOnly?: boolean;
}

export function PredictionForm({ 
  status, 
  transcription: externalTranscription,
  setTranscription: externalSetTranscription,
  onPredictClick, 
  prediction: externalPrediction, 
  isPredicting: externalIsPredicting,
  showResultsOnly = false
}: PredictionFormProps) {
  const [internalTranscription, setInternalTranscription] = useState('');
  const [internalIsPredicting, setInternalIsPredicting] = useState(false);
  const [internalPrediction, setInternalPrediction] = useState<PredictionResponse | null>(null);

  // Use external state if provided, otherwise use internal
  const transcription = externalTranscription ?? internalTranscription;
  const setTranscription = externalSetTranscription ?? setInternalTranscription;
  const prediction = externalPrediction ?? internalPrediction;
  const isPredicting = externalIsPredicting ?? internalIsPredicting;

  const handlePredict = async () => {
    if (!transcription.trim()) {
      toast.error('Por favor ingresa una transcripción');
      return;
    }

    if (!status.trained) {
      toast.error('El modelo no está entrenado aún');
      return;
    }

    if (onPredictClick) {
      onPredictClick(transcription);
    } else {
      setInternalIsPredicting(true);
      setInternalPrediction(null);

      try {
        const result = await predictClosure(transcription);
        setInternalPrediction(result);
        toast.success('Predicción realizada exitosamente');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Error al realizar la predicción';
        toast.error(errorMessage);
      } finally {
        setInternalIsPredicting(false);
      }
    }
  };

  const getPredictionBadge = () => {
    if (!prediction) return null;

    const variant =
      prediction.prediction === 'high'
        ? 'default'
        : prediction.prediction === 'medium'
          ? 'secondary'
          : 'outline';

    const Icon =
      prediction.prediction === 'high'
        ? TrendingUp
        : prediction.prediction === 'medium'
          ? Minus
          : TrendingDown;

    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {prediction.prediction === 'high'
          ? 'Alta Probabilidad'
          : prediction.prediction === 'medium'
            ? 'Probabilidad Media'
            : 'Baja Probabilidad'}
      </Badge>
    );
  };

  if (!status.trained) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Predicción de Cierre</CardTitle>
          <CardDescription>Predice la probabilidad de cierre de una venta</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              El modelo debe estar entrenado antes de poder hacer predicciones. Entrena el modelo primero.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (showResultsOnly && prediction) {
    // Solo mostrar resultados (Right Side) - Un solo contenedor
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="!text-base">Resultados</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-2">
          <div className="text-center space-y-1 rounded-lg border-2 border-primary/20 bg-primary/5 p-3">
            {(() => {
              const probabilityPercent = prediction.probability * 100;
              let colorClass = 'text-primary';
              if (probabilityPercent >= 70) {
                colorClass = 'text-emerald-600';
              } else if (probabilityPercent >= 30) {
                colorClass = 'text-amber-600';
              } else {
                colorClass = 'text-red-600';
              }
              return (
                <div className={`text-3xl font-bold ${colorClass}`}>
                  {probabilityPercent.toFixed(0)}%
                </div>
              );
            })()}
            <p className="text-sm text-muted-foreground">
              Probabilidad de cierre según el modelo
            </p>
          </div>

          {prediction.topFactors && prediction.topFactors.length > 0 && (
            <div className="space-y-2 rounded-lg border-2 border-primary/20 bg-primary/5 p-3">
              <p className="text-sm font-bold text-primary">Factores clave</p>
              <ul className="space-y-2">
                {prediction.topFactors.map((factor, idx) => {
                  const getFeatureNameInSpanish = (feature: string): string => {
                    const translations: Record<string, string> = {
                      company_size: 'Tamaño de la compañía',
                      industry: 'Industria',
                      main_pain_point: 'Punto de dolor principal',
                      discovery_source: 'Origen de descubrimiento',
                      use_case: 'Caso de uso',
                      volume_trend: 'Tendencia de volumen',
                    };
                    return translations[feature] || feature;
                  };
                  return (
                    <li key={idx} className="flex justify-between items-center bg-background rounded-md p-2 border">
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-foreground">
                          {getFeatureNameInSpanish(factor.feature)}:
                        </span>
                        <span className="text-sm text-muted-foreground ml-1">
                          {factor.value}
                        </span>
                      </div>
                      <span
                        className={
                          factor.impact.startsWith('+')
                            ? 'text-emerald-600 font-bold ml-3 text-sm'
                            : 'text-red-600 font-bold ml-3 text-sm'
                        }
                      >
                        {factor.impact}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="space-y-2 rounded-lg border-2 border-primary/20 bg-primary/5 p-3">
            <p className="text-sm font-bold text-primary">Categorías detectadas</p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
              {prediction.categories.industry && (
                <div>
                  <span className="text-muted-foreground">Industria:</span>{' '}
                  <span className="font-medium">{prediction.categories.industry}</span>
                </div>
              )}
              {prediction.categories.company_size && (
                <div>
                  <span className="text-muted-foreground">Tamaño:</span>{' '}
                  <span className="font-medium">{prediction.categories.company_size}</span>
                </div>
              )}
              {prediction.categories.weekly_contact_volume !== undefined && (
                <div>
                  <span className="text-muted-foreground">Volumen semanal:</span>{' '}
                  <span className="font-medium">{prediction.categories.weekly_contact_volume.toLocaleString()}</span>
                </div>
              )}
              {prediction.categories.volume_trend && (
                <div>
                  <span className="text-muted-foreground">Tendencia de volumen:</span>{' '}
                  <span className="font-medium">{prediction.categories.volume_trend}</span>
                </div>
              )}
              {prediction.categories.main_pain_point && (
                <div>
                  <span className="text-muted-foreground">Pain Point:</span>{' '}
                  <span className="font-medium">{prediction.categories.main_pain_point}</span>
                </div>
              )}
              {prediction.categories.current_solution && (
                <div>
                  <span className="text-muted-foreground">Solución actual:</span>{' '}
                  <span className="font-medium">{prediction.categories.current_solution}</span>
                </div>
              )}
              {prediction.categories.discovery_source && (
                <div>
                  <span className="text-muted-foreground">Origen:</span>{' '}
                  <span className="font-medium">{prediction.categories.discovery_source}</span>
                </div>
              )}
              {prediction.categories.use_case && (
                <div>
                  <span className="text-muted-foreground">Caso de uso:</span>{' '}
                  <span className="font-medium">{prediction.categories.use_case}</span>
                </div>
              )}
              {prediction.categories.integration_needs && prediction.categories.integration_needs.length > 0 && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Necesidades de integración:</span>{' '}
                  <span className="font-medium">{prediction.categories.integration_needs.join(', ')}</span>
                </div>
              )}
              {prediction.categories.query_topics && prediction.categories.query_topics.length > 0 && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Temas de consulta:</span>{' '}
                  <span className="font-medium">{prediction.categories.query_topics.join(', ')}</span>
                </div>
              )}
              {prediction.categories.summary && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Resumen:</span>{' '}
                  <span className="font-medium">{prediction.categories.summary}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Input form - Bottom Left */}
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="!text-base">Predicción de Cierre</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-2">
          <div className="space-y-1">
            <label htmlFor="transcription" className="text-xs font-medium">
              Transcripción de la reunión
            </label>
            <Textarea
              id="transcription"
              placeholder="Pega aquí la transcripción de la reunión con el cliente..."
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              rows={10}
              className="resize-none text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {transcription.length} caracteres
            </p>
            <div className="rounded-md border-2 border-chart-1/30 bg-chart-1/10 p-2 mt-2">
              <p className="text-xs text-chart-1">
                <span className="font-bold">Instrucción:</span> Ingresa un texto que contenga información relevante sobre el cliente, como industria, tamaño de empresa, necesidades, problemas principales y contexto de la reunión para obtener una predicción precisa.
              </p>
            </div>
          </div>
          {status.trained && (
            <Button
              onClick={() => handlePredict()}
              disabled={isPredicting || !transcription.trim()}
              className="w-full bg-chart-1 hover:bg-chart-1/90 text-white"
              size="sm"
            >
              {isPredicting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Analizando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Predecir Probabilidad
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

    </>
  );
}
