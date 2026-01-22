import type { Job } from 'bull';
import { PrismaService } from '@common/services/prisma.service';
import { CategorizationService } from '@modules/categorization/categorization.service';
interface UploadProcessingJobDto {
    uploadId: string;
    fileBuffer: Buffer;
}
export declare class UploadProcessor {
    private prisma;
    private categorizationService;
    private readonly logger;
    constructor(prisma: PrismaService, categorizationService: CategorizationService);
    handleUploadProcessing(job: Job<UploadProcessingJobDto>): Promise<void>;
    private validateColumns;
    private processRowsInBatches;
    private getExistingClientsMap;
    private saveBatch;
}
export {};
