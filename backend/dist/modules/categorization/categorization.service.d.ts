import type { Queue } from 'bull';
import { PrismaService } from '@common/services/prisma.service';
import { ProgressResponseDto } from './dto/categorization.dto';
export declare class CategorizationService {
    private prisma;
    private categorizationQueue;
    private readonly logger;
    constructor(prisma: PrismaService, categorizationQueue: Queue);
    queueCategorizationForUpload(uploadId: string): Promise<{
        jobsCreated: number;
        jobIds?: undefined;
    } | {
        jobsCreated: number;
        jobIds: import("bull").JobId[];
    }>;
    getUploadProgress(uploadId: string): Promise<ProgressResponseDto>;
    private findClientsWithoutCategories;
    getAllCategorizations(limit?: number, offset?: number): Promise<{
        categorizations: {
            id: string;
            clientId: string;
            clientName: string;
            clientEmail: string;
            seller: string;
            closed: boolean;
            meetingDate: Date;
            data: import("@prisma/client/runtime/library").JsonValue;
            processedAt: Date;
        }[];
        total: number;
        limit: number;
        offset: number;
    }>;
}
