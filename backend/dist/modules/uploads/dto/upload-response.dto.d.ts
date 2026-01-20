export declare class UploadResponseDto {
    message: string;
    uploadId: string;
    filename: string;
    totalRows: number;
    newClients: number;
    duplicates: number;
    errors: number;
    errorDetails?: Array<{
        email: string;
        error: string;
    }>;
    warning?: string;
}
