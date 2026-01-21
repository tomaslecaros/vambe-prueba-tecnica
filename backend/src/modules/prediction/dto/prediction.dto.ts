import { IsString, IsNotEmpty } from 'class-validator';
import { CategoriesDto } from '@modules/llm/dto/categories.dto';

// Request DTOs
export class PredictRequestDto {
  @IsString()
  @IsNotEmpty()
  transcription: string;
}

// Response DTOs
export interface TrainingProgressDto {
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  startedAt: string;
}

export interface PredictionStatusResponseDto {
  trained: boolean;
  canTrain: boolean;
  availableSamples: number;
  minimumRequired: number;
  message?: string;
  lastTrainedAt?: string;
  samplesUsed?: number;
  accuracy?: number;
  isTraining?: boolean;
  trainingProgress?: TrainingProgressDto;
  lastError?: string;
}

export interface TrainResponseDto {
  message: string;
  jobId: string;
  samplesUsed: number;
}

export interface TrainErrorResponseDto {
  error: 'TRAINING_IN_PROGRESS' | 'INSUFFICIENT_DATA';
  message: string;
  progress?: number;
  availableSamples?: number;
  minimumRequired?: number;
}

export interface TopFactorDto {
  feature: string;
  value: string;
  impact: string;
}

export interface ModelInfoDto {
  trained: boolean;
  lastTrainedAt: string | null;
  samplesUsed: number;
  accuracy: number | null;
}

export interface PredictionResponseDto {
  probability: number;
  willClose: boolean; // true si cerrará, false si no cerrará
  prediction: 'high' | 'medium' | 'low'; // Mantener para compatibilidad
  categories: Partial<CategoriesDto>;
  topFactors: TopFactorDto[];
  model: ModelInfoDto;
}

export interface PredictionErrorResponseDto {
  error: 'MODEL_NOT_TRAINED' | 'INSUFFICIENT_CATEGORIZATION';
  message: string;
  canTrain?: boolean;
  availableSamples?: number;
  minimumRequired?: number;
  categories?: Partial<CategoriesDto>;
}
