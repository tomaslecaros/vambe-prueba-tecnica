export interface CategorizationJobDto {
    clientId: string;
    uploadId: string;
}
export declare class ProgressResponseDto {
    uploadId: string;
    total: number;
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    progress: number;
    clients: ClientProgressDto[];
}
export declare class ClientProgressDto {
    jobId: string | number;
    clientId: string;
    email: string;
    name: string;
    status: string;
    progress: number | object;
    categories: any;
}
