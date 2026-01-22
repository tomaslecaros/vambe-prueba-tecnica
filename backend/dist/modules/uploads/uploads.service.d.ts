import { PrismaService } from '@common/services/prisma.service';
import { CategorizationService } from '@modules/categorization/categorization.service';
export declare class UploadsService {
    private prisma;
    private categorizationService;
    private readonly logger;
    constructor(prisma: PrismaService, categorizationService: CategorizationService);
    createUpload(filename: string, totalRows: number): Promise<{
        id: string;
        filename: string;
        status: import(".prisma/client").$Enums.UploadStatus;
        totalRows: number;
        processedRows: number;
        errors: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        completedAt: Date | null;
    }>;
    processFile(uploadId: string, fileBuffer: Buffer): Promise<{
        success: boolean;
        processedRows: number;
        duplicates: number;
        errors: number;
        errorDetails: {
            email: string;
            error: string;
        }[] | undefined;
        total: number;
        warning: string | undefined;
    } | {
        success: boolean;
        processedRows: number;
        duplicates: number;
        errors: number;
        errorDetails: {
            email: string;
            error: string;
        }[] | undefined;
        total: number;
        warning?: undefined;
    }>;
    private markUploadAsFailed;
    private validateColumns;
    private processRowsInBatches;
    private getExistingClientsMap;
    private saveBatch;
    getUploads(limit?: number, offset?: number, status?: string): Promise<{
        uploads: {
            id: string;
            filename: string;
            status: import(".prisma/client").$Enums.UploadStatus;
            totalRows: number;
            processedRows: number;
            errors: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            completedAt: Date | null;
        }[];
        total: number;
        limit: number;
        offset: number;
    }>;
    getUploadStatus(uploadId: string): Promise<{
        id: string;
        filename: string;
        status: import(".prisma/client").$Enums.UploadStatus;
        totalRows: number;
        processedRows: number;
        clientsSaved: number;
        clientsCategorized: number;
        progress: number;
        categorizationProgress: number;
        createdAt: Date;
        completedAt: Date | null;
        errors: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getUploadClientsWithProgress(uploadId: string): Promise<{
        upload: {
            id: string;
            filename: string;
            status: import(".prisma/client").$Enums.UploadStatus;
            totalRows: number;
            processedRows: number;
            createdAt: Date;
            completedAt: Date | null;
        };
        progress: {
            total: number;
            categorized: number;
            pending: number;
            percentage: number;
        };
        clients: {
            id: string;
            name: string;
            email: string;
            status: string;
            categorizedAt: Date | undefined;
        }[];
    }>;
}
