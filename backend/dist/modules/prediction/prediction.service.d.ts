import type { Queue } from 'bull';
import { PrismaService } from '@common/services/prisma.service';
import { LlmService } from '@modules/llm/llm.service';
import { PredictionStatusResponseDto, TrainResponseDto, TrainErrorResponseDto, PredictionResponseDto, PredictionErrorResponseDto } from './dto/prediction.dto';
export declare class PredictionService {
    private readonly prisma;
    private readonly llmService;
    private readonly trainingQueue;
    private readonly logger;
    private model;
    private featureNames;
    constructor(prisma: PrismaService, llmService: LlmService, trainingQueue: Queue);
    private initializeFeatureNames;
    private loadModelFromDatabase;
    getStatus(): Promise<PredictionStatusResponseDto>;
    startTraining(): Promise<TrainResponseDto | TrainErrorResponseDto>;
    trainModel(modelId: string): Promise<void>;
    predict(transcription: string): Promise<PredictionResponseDto | PredictionErrorResponseDto>;
    private encodeCategoriesToFeatures;
    private calculateTopFactors;
    private getAvailableSamplesCount;
    private updateTrainingProgress;
}
