import type { Job } from 'bull';
import { PrismaService } from '@common/services/prisma.service';
import { LlmService } from '@modules/llm/llm.service';
import { PredictionService } from '@modules/prediction/prediction.service';
import { CategorizationJobDto } from './dto/categorization.dto';
export declare class CategorizationProcessor {
    private prisma;
    private llmService;
    private predictionService;
    private readonly logger;
    constructor(prisma: PrismaService, llmService: LlmService, predictionService: PredictionService);
    handleCategorization(job: Job<CategorizationJobDto>): Promise<{
        clientId: string;
        email: string;
        categories: import("../llm/dto/categories.dto").CategoriesDto;
    }>;
    private checkAndTriggerAutoTraining;
}
