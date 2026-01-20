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
    private processRows;
    private markUploadAsFailed;
    private validateColumns;
    private saveClient;
    private findClientByEmailAndPhone;
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
