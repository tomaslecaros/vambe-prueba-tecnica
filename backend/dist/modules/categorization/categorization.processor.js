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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CategorizationProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategorizationProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/services/prisma.service");
const llm_service_1 = require("../llm/llm.service");
const prediction_service_1 = require("../prediction/prediction.service");
const queue_constants_1 = require("../../common/constants/queue.constants");
let CategorizationProcessor = CategorizationProcessor_1 = class CategorizationProcessor {
    prisma;
    llmService;
    predictionService;
    logger = new common_1.Logger(CategorizationProcessor_1.name);
    constructor(prisma, llmService, predictionService) {
        this.prisma = prisma;
        this.llmService = llmService;
        this.predictionService = predictionService;
    }
    async handleCategorization(job) {
        const { clientId, uploadId } = job.data;
        try {
            const client = await this.prisma.client.findUnique({
                where: { id: clientId },
            });
            if (!client) {
                throw new Error(`Client ${clientId} not found`);
            }
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
            await this.checkAndTriggerAutoTraining(uploadId);
            return {
                clientId,
                email: client.email,
                categories,
            };
        }
        catch (error) {
            this.logger.error(`Failed to categorize client ${clientId}: ${error.message}`);
            throw error;
        }
    }
    async checkAndTriggerAutoTraining(uploadId) {
        try {
            const totalClients = await this.prisma.client.count({
                where: { uploadId },
            });
            const categorizedClients = await this.prisma.client.count({
                where: {
                    uploadId,
                    categorization: { isNot: null },
                },
            });
            if (totalClients > 0 && categorizedClients === totalClients) {
                this.logger.log(`Upload ${uploadId}: all ${totalClients} categorized. Triggering model training.`);
                const trainingResult = await this.predictionService.startTraining();
                if ('error' in trainingResult) {
                    this.logger.log(`Model training skipped: ${trainingResult.message}`);
                }
                else {
                    this.logger.log(`Model training started (${trainingResult.samplesUsed} samples).`);
                }
            }
        }
        catch (error) {
            this.logger.error(`Error checking auto-training trigger for upload ${uploadId}: ${error.message}`);
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
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => prediction_service_1.PredictionService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_service_1.LlmService,
        prediction_service_1.PredictionService])
], CategorizationProcessor);
//# sourceMappingURL=categorization.processor.js.map