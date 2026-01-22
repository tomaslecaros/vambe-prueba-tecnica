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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const uploads_service_1 = require("./uploads.service");
const upload_constants_1 = require("../../common/constants/upload.constants");
let UploadsController = class UploadsController {
    uploadsService;
    constructor(uploadsService) {
        this.uploadsService = uploadsService;
    }
    async uploadFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        this.validateFileExtension(file.originalname);
        const upload = await this.uploadsService.createUpload(file.originalname, 0);
        const result = await this.uploadsService.processFile(upload.id, file.buffer);
        return {
            message: 'File uploaded and processed successfully',
            uploadId: upload.id,
            filename: upload.filename,
            totalRows: result.total,
            newClients: result.processedRows,
            duplicates: result.duplicates,
            errors: result.errors,
            errorDetails: result.errorDetails,
            warning: result.warning,
        };
    }
    async getUploads(limit, offset, status) {
        const limitNum = limit ? parseInt(limit, 10) : 20;
        const offsetNum = offset ? parseInt(offset, 10) : 0;
        return this.uploadsService.getUploads(limitNum, offsetNum, status);
    }
    async getUploadStatus(id) {
        return this.uploadsService.getUploadStatus(id);
    }
    async getUploadClients(id) {
        return this.uploadsService.getUploadClientsWithProgress(id);
    }
    validateFileExtension(filename) {
        const fileExtension = filename.substring(filename.lastIndexOf('.'));
        if (!upload_constants_1.ALLOWED_FILE_EXTENSIONS.includes(fileExtension.toLowerCase())) {
            throw new common_1.BadRequestException('Invalid file type. Only .xlsx and .csv files are allowed');
        }
    }
};
exports.UploadsController = UploadsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "getUploads", null);
__decorate([
    (0, common_1.Get)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "getUploadStatus", null);
__decorate([
    (0, common_1.Get)(':id/clients'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadsController.prototype, "getUploadClients", null);
exports.UploadsController = UploadsController = __decorate([
    (0, common_1.Controller)('uploads'),
    __metadata("design:paramtypes", [uploads_service_1.UploadsService])
], UploadsController);
//# sourceMappingURL=uploads.controller.js.map