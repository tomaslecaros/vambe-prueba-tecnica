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
var PredictionProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const prediction_service_1 = require("./prediction.service");
const queue_constants_1 = require("../../common/constants/queue.constants");
let PredictionProcessor = PredictionProcessor_1 = class PredictionProcessor {
    predictionService;
    logger = new common_1.Logger(PredictionProcessor_1.name);
    constructor(predictionService) {
        this.predictionService = predictionService;
    }
    async handleTraining(job) {
        const { modelId } = job.data;
        try {
            await this.predictionService.trainModel(modelId);
        }
        catch (error) {
            this.logger.error(`Training job ${job.id} failed: ${error.message}`);
            throw error;
        }
    }
};
exports.PredictionProcessor = PredictionProcessor;
__decorate([
    (0, bull_1.Process)('train'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PredictionProcessor.prototype, "handleTraining", null);
exports.PredictionProcessor = PredictionProcessor = PredictionProcessor_1 = __decorate([
    (0, bull_1.Processor)(queue_constants_1.PREDICTION_TRAINING_QUEUE),
    __metadata("design:paramtypes", [prediction_service_1.PredictionService])
], PredictionProcessor);
//# sourceMappingURL=prediction.processor.js.map