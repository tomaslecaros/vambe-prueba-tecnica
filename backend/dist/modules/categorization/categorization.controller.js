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
exports.CategorizationController = void 0;
const common_1 = require("@nestjs/common");
const categorization_service_1 = require("./categorization.service");
let CategorizationController = class CategorizationController {
    categorizationService;
    constructor(categorizationService) {
        this.categorizationService = categorizationService;
    }
    async getAll(limit, offset) {
        const limitNum = limit ? parseInt(limit, 10) : 20;
        const offsetNum = offset ? parseInt(offset, 10) : 0;
        return this.categorizationService.getAllCategorizations(limitNum, offsetNum);
    }
    async getProgress(uploadId) {
        return this.categorizationService.getUploadProgress(uploadId);
    }
};
exports.CategorizationController = CategorizationController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CategorizationController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':uploadId/progress'),
    __param(0, (0, common_1.Param)('uploadId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategorizationController.prototype, "getProgress", null);
exports.CategorizationController = CategorizationController = __decorate([
    (0, common_1.Controller)('categorization'),
    __metadata("design:paramtypes", [categorization_service_1.CategorizationService])
], CategorizationController);
//# sourceMappingURL=categorization.controller.js.map