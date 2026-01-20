import { ClientsService } from './clients.service';
export declare class ClientsController {
    private clientsService;
    constructor(clientsService: ClientsService);
    getAll(limit?: string, offset?: string): Promise<{
        clients: ({
            upload: {
                createdAt: Date;
                filename: string;
            };
            categorization: {
                id: string;
                clientId: string;
                data: import("@prisma/client/runtime/library").JsonValue;
                llmProvider: string;
                model: string;
                promptVersion: string;
                processedAt: Date;
            } | null;
        } & {
            id: string;
            uploadId: string;
            name: string;
            email: string;
            phone: string;
            meetingDate: Date;
            seller: string;
            closed: boolean;
            transcription: string;
            createdAt: Date;
        })[];
        total: number;
        limit: number;
        offset: number;
    }>;
}
