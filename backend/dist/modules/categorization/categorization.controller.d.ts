import { CategorizationService } from './categorization.service';
import { ProgressResponseDto } from './dto/categorization.dto';
export declare class CategorizationController {
    private categorizationService;
    constructor(categorizationService: CategorizationService);
    getAll(limit?: string, offset?: string): Promise<any>;
    getProgress(uploadId: string): Promise<ProgressResponseDto>;
}
