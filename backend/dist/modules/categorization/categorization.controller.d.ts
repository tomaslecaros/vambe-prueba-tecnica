import { CategorizationService } from './categorization.service';
import { ProgressResponseDto } from './dto/categorization.dto';
export declare class CategorizationController {
    private categorizationService;
    constructor(categorizationService: CategorizationService);
    getAll(limit?: string, offset?: string): Promise<{
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
    getProgress(uploadId: string): Promise<ProgressResponseDto>;
}
