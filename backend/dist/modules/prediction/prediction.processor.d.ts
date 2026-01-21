import type { Job } from 'bull';
import { PredictionService } from './prediction.service';
export declare class PredictionProcessor {
    private readonly predictionService;
    private readonly logger;
    constructor(predictionService: PredictionService);
    handleTraining(job: Job<{
        modelId: string;
    }>): Promise<void>;
}
