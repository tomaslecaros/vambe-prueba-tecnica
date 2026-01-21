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
exports.PredictionController = void 0;
const common_1 = require("@nestjs/common");
const prediction_service_1 = require("./prediction.service");
const prediction_dto_1 = require("./dto/prediction.dto");
let PredictionController = class PredictionController {
    predictionService;
    constructor(predictionService) {
        this.predictionService = predictionService;
    }
    async getStatus() {
        return this.predictionService.getStatus();
    }
    async train() {
        const result = await this.predictionService.startTraining();
        if ('error' in result) {
            throw new common_1.BadRequestException(result);
        }
        return result;
    }
    async predict(body) {
        const result = await this.predictionService.predict(body.transcription);
        if ('error' in result) {
            throw new common_1.BadRequestException(result);
        }
        return result;
    }
};
exports.PredictionController = PredictionController;
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PredictionController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('train'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PredictionController.prototype, "train", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [prediction_dto_1.PredictRequestDto]),
    __metadata("design:returntype", Promise)
], PredictionController.prototype, "predict", null);
exports.PredictionController = PredictionController = __decorate([
    (0, common_1.Controller)('prediction'),
    __metadata("design:paramtypes", [prediction_service_1.PredictionService])
], PredictionController);
//# sourceMappingURL=prediction.controller.js.map