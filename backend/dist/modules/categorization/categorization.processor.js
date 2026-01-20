"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CategorizationProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategorizationProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/services/prisma.service");
const llm_service_1 = require("../llm/llm.service");
const queue_constants_1 = require("../../common/constants/queue.constants");
let CategorizationProcessor = CategorizationProcessor_1 = class CategorizationProcessor {
    prisma;
    llmService;
    logger = new common_1.Logger(CategorizationProcessor_1.name);
    constructor(prisma, llmService) {
        this.prisma = prisma;
        this.llmService = llmService;
        console.log(`[DEBUG-PROCESSOR] ✅ CategorizationProcessor initialized and listening to queue: ${queue_constants_1.CATEGORIZATION_QUEUE}`);
        this.logger.log(`Processor initialized for queue: ${queue_constants_1.CATEGORIZATION_QUEUE}`);
    }
    async handleCategorization(job) {
        const { clientId, uploadId } = job.data;
        console.log(`[DEBUG-PROCESSOR] 🚀 Job ${job.id} received: clientId=${clientId}, uploadId=${uploadId}`);
        try {
            console.log(`[DEBUG-PROCESSOR] Starting processing job ${job.id} for client ${clientId}`);
            this.logger.log(`🚀 [QUEUE] Starting job ${job.id} for client ${clientId}`);
            const client = await this.prisma.client.findUnique({
                where: { id: clientId },
            });
            if (!client) {
                this.logger.error(`❌ [QUEUE] Client ${clientId} not found`);
                throw new Error(`Client ${clientId} not found`);
            }
            this.logger.log(`📝 [QUEUE] Processing client: ${client.email}`);
            await job.progress(30);
            const categories = await this.llmService.extractCategoriesFromTranscription(client.transcription);
            await job.progress(70);
            const categorization = await this.prisma.categorization.create({
                data: {
                    clientId,
                    data: categories,
                    llmProvider: 'openai',
                    model: 'gpt-4o-mini',
                    promptVersion: 'v1.0',
                },
            });
            await job.progress(100);
            console.log(`[DEBUG-PROCESSOR] ✅ Job ${job.id} completed successfully for client ${client.email}`);
            this.logger.log(`✓ Categorized ${client.email}: ${categories.industry}`);
            return {
                clientId,
                email: client.email,
                categories,
            };
        }
        catch (error) {
            console.error(`[DEBUG-PROCESSOR] ❌ Job ${job.id} FAILED for client ${clientId}:`, error);
            console.error(`[DEBUG-PROCESSOR] Error type: ${error.constructor.name}`);
            console.error(`[DEBUG-PROCESSOR] Error message: ${error.message}`);
            console.error(`[DEBUG-PROCESSOR] Error stack:`, error.stack);
            this.logger.error(`❌ [QUEUE] Failed to categorize client ${clientId}: ${error.message}`);
            this.logger.error(`❌ [QUEUE] Error stack:`, error.stack);
            throw error;
        }
    }
};
exports.CategorizationProcessor = CategorizationProcessor;
__decorate([
    (0, bull_1.Process)({ concurrency: queue_constants_1.MAX_CONCURRENCY }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CategorizationProcessor.prototype, "handleCategorization", null);
exports.CategorizationProcessor = CategorizationProcessor = CategorizationProcessor_1 = __decorate([
    (0, bull_1.Processor)(queue_constants_1.CATEGORIZATION_QUEUE),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_service_1.LlmService])
], CategorizationProcessor);
//# sourceMappingURL=categorization.processor.js.map