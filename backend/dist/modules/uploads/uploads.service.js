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
var UploadsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/services/prisma.service");
const categorization_service_1 = require("../categorization/categorization.service");
const upload_constants_1 = require("../../common/constants/upload.constants");
const data_parser_util_1 = require("../../common/utils/data-parser.util");
const XLSX = __importStar(require("xlsx"));
let UploadsService = UploadsService_1 = class UploadsService {
    prisma;
    categorizationService;
    logger = new common_1.Logger(UploadsService_1.name);
    constructor(prisma, categorizationService) {
        this.prisma = prisma;
        this.categorizationService = categorizationService;
    }
    async createUpload(filename, totalRows) {
        return this.prisma.upload.create({
            data: {
                filename,
                totalRows,
                status: 'pending',
            },
        });
    }
    async processFile(uploadId, fileBuffer) {
        try {
            const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet);
            if (rows.length === 0) {
                throw new common_1.BadRequestException('File is empty');
            }
            this.validateColumns(rows[0]);
            await this.prisma.upload.update({
                where: { id: uploadId },
                data: {
                    totalRows: rows.length,
                    status: 'processing',
                },
            });
            const { processedCount, duplicatesCount, errorsCount, errorDetails } = await this.processRows(uploadId, rows);
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
                return {
                    success: processedCount === 0 && duplicatesCount > 0,
                    processedRows: processedCount,
                    duplicates: duplicatesCount,
                    errors: errorsCount,
                    errorDetails: errorDetails.length > 0 ? errorDetails : undefined,
                    total: rows.length,
                    warning: processedCount === 0 && duplicatesCount === rows.length
                        ? 'All clients already exist in the database'
                        : errorsCount === rows.length
                            ? 'All rows failed validation'
                            : undefined,
                };
            }
            await this.prisma.upload.update({
                where: { id: uploadId },
                data: {
                    status: 'completed',
                    completedAt: new Date(),
                    processedRows: processedCount,
                },
            });
            if (processedCount > 0) {
                this.logger.log(`🔄 [UPLOAD] Queueing categorization for ${processedCount} new clients`);
                this.categorizationService
                    .queueCategorizationForUpload(uploadId)
                    .then((result) => {
                    this.logger.log(`✅ [UPLOAD] Categorization queued successfully: ${result.jobsCreated} jobs created`);
                })
                    .catch((error) => {
                    this.logger.error(`❌ [UPLOAD] Categorization queue error:`, error);
                    this.logger.error(`❌ [UPLOAD] Error details:`, error.message, error.stack);
                });
            }
            else {
                this.logger.log('ℹ️ [UPLOAD] No new clients to categorize');
            }
            return {
                success: true,
                processedRows: processedCount,
                duplicates: duplicatesCount,
                errors: errorsCount,
                errorDetails: errorDetails.length > 0 ? errorDetails : undefined,
                total: rows.length,
            };
        }
        catch (error) {
            await this.markUploadAsFailed(uploadId, error.message);
            throw error;
        }
    }
    async processRows(uploadId, rows) {
        let processedCount = 0;
        let duplicatesCount = 0;
        let errorsCount = 0;
        const errorDetails = [];
        for (const row of rows) {
            const result = await this.saveClient(uploadId, row);
            if (result.created) {
                processedCount++;
            }
            else if (result.reason === 'duplicate') {
                duplicatesCount++;
            }
            else if (result.reason === 'error') {
                errorsCount++;
                errorDetails.push({
                    email: String(row['Correo Electronico'] || 'unknown'),
                    error: result.error || 'Unknown error',
                });
            }
        }
        return { processedCount, duplicatesCount, errorsCount, errorDetails };
    }
    async markUploadAsFailed(uploadId, errorMessage) {
        await this.prisma.upload.update({
            where: { id: uploadId },
            data: {
                status: 'failed',
                errors: { message: errorMessage },
            },
        });
    }
    validateColumns(firstRow) {
        const fileColumns = Object.keys(firstRow);
        const missingColumns = upload_constants_1.REQUIRED_COLUMNS.filter((col) => !fileColumns.includes(col));
        if (missingColumns.length > 0) {
            throw new common_1.BadRequestException(`Missing columns: ${missingColumns.join(', ')}`);
        }
    }
    async saveClient(uploadId, row) {
        try {
            const email = String(row['Correo Electronico'] || '').trim();
            const phone = String(row['Numero de Telefono'] || '').trim();
            if (!email || !phone) {
                return {
                    created: false,
                    reason: 'error',
                    error: 'Email or phone is missing',
                };
            }
            const existingClient = await this.findClientByEmailAndPhone(email, phone);
            if (existingClient) {
                this.logger.debug(`Duplicate client: ${email} - ${phone}`);
                return { created: false, reason: 'duplicate' };
            }
            const meetingDate = (0, data_parser_util_1.parseMeetingDate)(row['Fecha de la Reunion']);
            const closed = (0, data_parser_util_1.parseClosedValue)(row['closed']);
            await this.prisma.client.create({
                data: {
                    uploadId,
                    name: String(row['Nombre'] || '').trim(),
                    email,
                    phone,
                    meetingDate,
                    seller: String(row['Vendedor asignado'] || '').trim(),
                    closed,
                    transcription: String(row['Transcripcion'] || '').trim(),
                },
            });
            return { created: true };
        }
        catch (error) {
            this.logger.error(`Error saving client: ${error.message}`);
            return { created: false, reason: 'error', error: error.message };
        }
    }
    async findClientByEmailAndPhone(email, phone) {
        return this.prisma.client.findUnique({
            where: {
                email_phone: {
                    email,
                    phone,
                },
            },
        });
    }
    async getUploads(limit = 20, offset = 0, status) {
        const where = status ? { status: status } : undefined;
        const [uploads, total] = await Promise.all([
            this.prisma.upload.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            this.prisma.upload.count({ where }),
        ]);
        return {
            uploads,
            total,
            limit,
            offset,
        };
    }
    async getUploadClientsWithProgress(uploadId) {
        const upload = await this.prisma.upload.findUnique({
            where: { id: uploadId },
        });
        if (!upload) {
            throw new common_1.BadRequestException('Upload not found');
        }
        const clients = await this.prisma.client.findMany({
            where: { uploadId },
            include: {
                categorization: true,
            },
            orderBy: { createdAt: 'asc' },
        });
        const total = clients.length;
        const categorized = clients.filter((c) => c.categorization !== null).length;
        const pending = total - categorized;
        return {
            upload: {
                id: upload.id,
                filename: upload.filename,
                status: upload.status,
                totalRows: upload.totalRows,
                processedRows: upload.processedRows,
                createdAt: upload.createdAt,
                completedAt: upload.completedAt,
            },
            progress: {
                total,
                categorized,
                pending,
                percentage: total > 0 ? Math.round((categorized / total) * 100) : 0,
            },
            clients: clients.map((client) => ({
                id: client.id,
                name: client.name,
                email: client.email,
                status: client.categorization ? 'completed' : 'pending',
                categorizedAt: client.categorization?.processedAt,
            })),
        };
    }
};
exports.UploadsService = UploadsService;
exports.UploadsService = UploadsService = UploadsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        categorization_service_1.CategorizationService])
], UploadsService);
//# sourceMappingURL=uploads.service.js.map