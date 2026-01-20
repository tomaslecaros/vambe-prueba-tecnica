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
var CategorizationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategorizationService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../../common/services/prisma.service");
const queue_constants_1 = require("../../common/constants/queue.constants");
const categorization_dto_1 = require("./dto/categorization.dto");
let CategorizationService = CategorizationService_1 = class CategorizationService {
    prisma;
    categorizationQueue;
    logger = new common_1.Logger(CategorizationService_1.name);
    constructor(prisma, categorizationQueue) {
        this.prisma = prisma;
        this.categorizationQueue = categorizationQueue;
    }
    async queueCategorizationForUpload(uploadId) {
        try {
            console.log(`[DEBUG-CATEGORIZATION] 🔍 Starting queue process for upload: ${uploadId}`);
            this.logger.log(`🔍 [CATEGORIZATION] Starting queue for upload: ${uploadId}`);
            console.log(`[DEBUG-CATEGORIZATION] Searching for clients without categorization for upload ${uploadId}...`);
            const clientsWithoutCategories = await this.findClientsWithoutCategories(uploadId);
            const total = clientsWithoutCategories.length;
            console.log(`[DEBUG-CATEGORIZATION] Found ${total} clients without categorization for upload ${uploadId}`);
            if (total === 0) {
                console.log(`[DEBUG-CATEGORIZATION] No clients found to categorize for upload ${uploadId}`);
                this.logger.log(`ℹ️ [CATEGORIZATION] No clients to categorize for upload ${uploadId}`);
                return { jobsCreated: 0 };
            }
            this.logger.log(`📝 [CATEGORIZATION] Queueing ${total} clients for categorization (uploadId: ${uploadId})`);
            console.log(`[DEBUG-CATEGORIZATION] Attempting to add ${total} jobs to Redis queue...`);
            const jobs = await Promise.all(clientsWithoutCategories.map((client) => this.categorizationQueue.add({
                clientId: client.id,
                uploadId,
            }, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
                removeOnComplete: false,
                removeOnFail: false,
            })));
            console.log(`[DEBUG-CATEGORIZATION] ✅ Successfully added ${jobs.length} jobs to Redis queue for upload ${uploadId}`);
            this.logger.log(`✅ [CATEGORIZATION] Created ${jobs.length} jobs for upload ${uploadId}`);
            this.logger.log(`📋 [CATEGORIZATION] Job IDs: ${jobs.map((j) => j.id).join(', ')}`);
            return {
                jobsCreated: jobs.length,
                jobIds: jobs.map((j) => j.id),
            };
        }
        catch (error) {
            console.error(`[DEBUG-CATEGORIZATION] ❌ ERROR in queueCategorizationForUpload for upload ${uploadId}:`, error);
            console.error(`[DEBUG-CATEGORIZATION] Error type: ${error.constructor.name}`);
            console.error(`[DEBUG-CATEGORIZATION] Error message: ${error.message}`);
            console.error(`[DEBUG-CATEGORIZATION] Error stack:`, error.stack);
            this.logger.error(`❌ [CATEGORIZATION] Error queueing jobs for upload ${uploadId}:`, error);
            this.logger.error(`❌ [CATEGORIZATION] Error details:`, error.message, error.stack);
            throw error;
        }
    }
};
exports.CategorizationService = CategorizationService;
exports.CategorizationService = CategorizationService = CategorizationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bull_1.InjectQueue)(queue_constants_1.CATEGORIZATION_QUEUE)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], CategorizationService);
return {
    jobsCreated: jobs.length,
    jobIds: jobs.map((j) => j.id),
};
async;
getUploadProgress(uploadId, string);
Promise < categorization_dto_1.ProgressResponseDto > {
    const: jobs = await this.categorizationQueue.getJobs([
        'waiting',
        'active',
        'completed',
        'failed',
    ]),
    const: uploadJobs = jobs.filter((job) => job.data.uploadId === uploadId),
    const: jobStates = await Promise.all(uploadJobs.map((j) => j.getState())),
    const: waiting = jobStates.filter((state) => state === 'waiting').length,
    const: active = jobStates.filter((state) => state === 'active').length,
    const: completed = jobStates.filter((state) => state === 'completed').length,
    const: failed = jobStates.filter((state) => state === 'failed').length,
    const: total = uploadJobs.length,
    const: progress = total > 0 ? Math.round((completed / total) * 100) : 0,
    const: clientsData = await Promise.all(uploadJobs.slice(0, 20).map(async (job) => {
        const state = await job.getState();
        const client = await this.prisma.client.findUnique({
            where: { id: job.data.clientId },
            include: { categorization: true },
        });
        return {
            jobId: job.id,
            clientId: job.data.clientId,
            email: client?.email || 'unknown',
            name: client?.name || 'unknown',
            status: state,
            progress: job.progress(),
            categories: client?.categorization?.data || null,
        };
    })),
    return: {
        uploadId,
        total,
        waiting,
        active,
        completed,
        failed,
        progress,
        clients: clientsData,
    }
};
async;
findClientsWithoutCategories(uploadId, string);
{
    return this.prisma.client.findMany({
        where: {
            uploadId,
            categorization: null,
        },
    });
}
async;
getAllCategorizations(limit, number = 20, offset, number = 0);
{
    const [categorizations, total] = await Promise.all([
        this.prisma.categorization.findMany({
            take: limit,
            skip: offset,
            orderBy: { processedAt: 'desc' },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        seller: true,
                        closed: true,
                        meetingDate: true,
                    },
                },
            },
        }),
        this.prisma.categorization.count(),
    ]);
    return {
        categorizations: categorizations.map((cat) => ({
            id: cat.id,
            clientId: cat.clientId,
            clientName: cat.client.name,
            clientEmail: cat.client.email,
            seller: cat.client.seller,
            closed: cat.client.closed,
            meetingDate: cat.client.meetingDate,
            data: cat.data,
            processedAt: cat.processedAt,
        })),
        total,
        limit,
        offset,
    };
}
//# sourceMappingURL=categorization.service.js.map