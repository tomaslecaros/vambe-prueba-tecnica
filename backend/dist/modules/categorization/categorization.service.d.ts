import type { Queue } from 'bull';
import { PrismaService } from '@common/services/prisma.service';
export declare class CategorizationService {
    private prisma;
    private categorizationQueue;
    private readonly logger;
    constructor(prisma: PrismaService, categorizationQueue: Queue);
    queueCategorizationForUpload(uploadId: string): Promise<{
        jobsCreated: number;
        jobIds?: undefined;
    } | {
        jobsCreated: any;
        jobIds: any;
    }>;
}
