import { UploadsService } from './uploads.service';
import { UploadResponseDto } from './dto/upload-response.dto';
export declare class UploadsController {
    private uploadsService;
    constructor(uploadsService: UploadsService);
    uploadFile(file: any): Promise<UploadResponseDto>;
    getUploads(limit?: string, offset?: string, status?: string): Promise<{
        uploads: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.UploadStatus;
            filename: string;
            totalRows: number;
            processedRows: number;
            errors: import("@prisma/client/runtime/library").JsonValue | null;
            completedAt: Date | null;
        }[];
        total: number;
        limit: number;
        offset: number;
    }>;
    getUploadStatus(id: string): Promise<{
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
    getUploadClients(id: string): Promise<{
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
    private validateFileExtension;
}
