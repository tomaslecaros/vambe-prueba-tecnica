import type { Job } from 'bull';
import { PrismaService } from '@common/services/prisma.service';
import { LlmService } from '@modules/llm/llm.service';
import { CategorizationJobDto } from './dto/categorization.dto';
export declare class CategorizationProcessor {
    private prisma;
    private llmService;
    private readonly logger;
    constructor(prisma: PrismaService, llmService: LlmService);
    handleCategorization(job: Job<CategorizationJobDto>): Promise<{
        clientId: string;
        email: string;
        categories: import("../llm/dto/categories.dto").CategoriesDto;
    }>;
}
