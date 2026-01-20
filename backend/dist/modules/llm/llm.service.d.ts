import { ConfigService } from '@nestjs/config';
import { CategoriesDto } from './dto/categories.dto';
export declare class LlmService {
    private configService;
    private readonly logger;
    private openai;
    constructor(configService: ConfigService);
    extractCategoriesFromTranscription(transcription: string): Promise<CategoriesDto>;
    private buildCategorizationPrompt;
}
