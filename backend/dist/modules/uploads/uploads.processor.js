"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var UploadProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/services/prisma.service");
const categorization_service_1 = require("../categorization/categorization.service");
const queue_constants_1 = require("../../common/constants/queue.constants");
const data_parser_util_1 = require("../../common/utils/data-parser.util");
const XLSX = __importStar(require("xlsx"));
let UploadProcessor = UploadProcessor_1 = class UploadProcessor {
    prisma;
    categorizationService;
    logger = new common_1.Logger(UploadProcessor_1.name);
    constructor(prisma, categorizationService) {
        this.prisma = prisma;
        this.categorizationService = categorizationService;
    }
    async handleUploadProcessing(job) {
        const { uploadId, fileBuffer } = job.data;
        try {
            await job.progress(5);
            this.logger.log(`Processing upload ${uploadId}`);
            const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rawRows = XLSX.utils.sheet_to_json(worksheet);
            if (rawRows.length === 0) {
                await this.prisma.upload.update({
                    where: { id: uploadId },
                    data: { status: 'failed', errors: { message: 'File is empty' } },
                });
                throw new Error('File is empty');
            }
            const rows = rawRows.map((row) => (0, data_parser_util_1.fixRowEncoding)(row));
            this.validateColumns(rows[0]);
            await this.prisma.upload.update({
                where: { id: uploadId },
                data: {
                    totalRows: rows.length,
                    status: 'processing',
                },
            });
            await job.progress(10);
            const { processedCount, duplicatesCount, errorsCount, errorDetails } = await this.processRowsInBatches(uploadId, rows, (progress) => {
                job.progress(10 + Math.floor(progress * 80));
            });
            if (processedCount === 0 && rows.length > 0) {
                const status = errorsCount === rows.length
                    ? 'failed'
                    : duplicatesCount === rows.length
                        ? 'completed'
                        : 'completed';
                await this.prisma.upload.update({
                    where: { id: uploadId },
                    data: {
                        status,
                        completedAt: new Date(),
                        processedRows: processedCount,
                        errors: errorsCount > 0
                            ? { message: 'All rows failed or were duplicates', details: errorDetails }
                            : undefined,
                    },
                });
                if (duplicatesCount === rows.length) {
                    this.logger.warn(`Upload ${uploadId}: All ${rows.length} clients are duplicates. No categorization needed.`);
                }
                return;
            }
            await this.prisma.upload.update({
                where: { id: uploadId },
                data: {
                    status: 'completed',
                    completedAt: new Date(),
                    processedRows: processedCount,
                },
            });
            await job.progress(95);
            if (processedCount > 0) {
                this.categorizationService
                    .queueCategorizationForUpload(uploadId)
                    .catch((error) => this.logger.error('Categorization queue error:', error));
            }
            await job.progress(100);
            this.logger.log(`Upload ${uploadId} processed: ${processedCount} new clients`);
        }
        catch (error) {
            this.logger.error(`Upload processing failed for ${uploadId}: ${error.message}`);
            await this.prisma.upload.update({
                where: { id: uploadId },
                data: {
                    status: 'failed',
                    errors: { message: error.message },
                },
            });
            throw error;
        }
    }
    validateColumns(firstRow) {
        const REQUIRED_COLUMNS = [
            'Nombre',
            'Correo Electronico',
            'Numero de Telefono',
            'Fecha de la Reunion',
            'Vendedor asignado',
            'closed',
            'Transcripcion',
        ];
        const fileColumns = Object.keys(firstRow);
        const missingColumns = REQUIRED_COLUMNS.filter((col) => !fileColumns.includes(col));
        if (missingColumns.length > 0) {
            throw new Error(`Missing columns: ${missingColumns.join(', ')}`);
        }
    }
    async processRowsInBatches(uploadId, rows, onProgress) {
        let processedCount = 0;
        let duplicatesCount = 0;
        let errorsCount = 0;
        const errorDetails = [];
        const existingClientsMap = await this.getExistingClientsMap(rows);
        const clientsToCreate = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const email = String(row['Correo Electronico'] || '').trim();
            const phone = String(row['Numero de Telefono'] || '').trim();
            if (!email || !phone) {
                errorsCount++;
                errorDetails.push({
                    email: email || 'unknown',
                    error: 'Email or phone is missing',
                });
                continue;
            }
            const key = `${email}|${phone}`;
            if (existingClientsMap.has(key)) {
                duplicatesCount++;
                continue;
            }
            const meetingDate = (0, data_parser_util_1.parseMeetingDate)(row['Fecha de la Reunion']);
            const closed = (0, data_parser_util_1.parseClosedValue)(row['closed']);
            clientsToCreate.push({
                uploadId,
                name: String(row['Nombre'] || '').trim(),
                email,
                phone,
                meetingDate,
                seller: String(row['Vendedor asignado'] || '').trim(),
                closed,
                transcription: String(row['Transcripcion'] || '').trim(),
            });
            if (clientsToCreate.length >= queue_constants_1.UPLOAD_BATCH_SIZE) {
                const result = await this.saveBatch(clientsToCreate);
                processedCount += result.success;
                duplicatesCount += result.duplicates;
                errorsCount += result.errors;
                errorDetails.push(...result.errorDetails);
                clientsToCreate.forEach((c) => {
                    existingClientsMap.set(`${c.email}|${c.phone}`, true);
                });
                clientsToCreate.length = 0;
                onProgress((i + 1) / rows.length);
            }
        }
        if (clientsToCreate.length > 0) {
            const result = await this.saveBatch(clientsToCreate);
            processedCount += result.success;
            duplicatesCount += result.duplicates;
            errorsCount += result.errors;
            errorDetails.push(...result.errorDetails);
            onProgress(1);
        }
        return { processedCount, duplicatesCount, errorsCount, errorDetails };
    }
    async getExistingClientsMap(rows) {
        const map = new Map();
        const clientKeys = new Set();
        rows.forEach((row) => {
            const email = String(row['Correo Electronico'] || '').trim();
            const phone = String(row['Numero de Telefono'] || '').trim();
            if (email && phone) {
                clientKeys.add(`${email}|${phone}`);
            }
        });
        const keysArray = Array.from(clientKeys);
        for (let i = 0; i < keysArray.length; i += queue_constants_1.UPLOAD_BATCH_SIZE) {
            const batch = keysArray.slice(i, i + queue_constants_1.UPLOAD_BATCH_SIZE);
            const conditions = batch.map((key) => {
                const [email, phone] = key.split('|');
                return { email, phone };
            });
            const existing = await this.prisma.client.findMany({
                where: {
                    OR: conditions.map((c) => ({
                        AND: [{ email: c.email }, { phone: c.phone }],
                    })),
                },
                select: { email: true, phone: true },
            });
            existing.forEach((client) => {
                map.set(`${client.email}|${client.phone}`, true);
            });
        }
        return map;
    }
    async saveBatch(clients) {
        let success = 0;
        let duplicates = 0;
        let errors = 0;
        const errorDetails = [];
        try {
            const result = await this.prisma.client.createMany({
                data: clients,
                skipDuplicates: true,
            });
            success = result.count;
            duplicates = clients.length - result.count;
        }
        catch (error) {
            this.logger.error(`Batch save error: ${error.message}`);
            for (const client of clients) {
                try {
                    await this.prisma.client.create({ data: client });
                    success++;
                }
                catch (err) {
                    if (err.code === 'P2002') {
                        duplicates++;
                    }
                    else {
                        errors++;
                        errorDetails.push({
                            email: client.email || 'unknown',
                            error: err.message || 'Unknown error',
                        });
                    }
                }
            }
        }
        return { success, duplicates, errors, errorDetails };
    }
};
exports.UploadProcessor = UploadProcessor;
__decorate([
    (0, bull_1.Process)({ concurrency: 1 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadProcessor.prototype, "handleUploadProcessing", null);
exports.UploadProcessor = UploadProcessor = UploadProcessor_1 = __decorate([
    (0, bull_1.Processor)(queue_constants_1.UPLOAD_PROCESSING_QUEUE),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        categorization_service_1.CategorizationService])
], UploadProcessor);
//# sourceMappingURL=uploads.processor.js.map