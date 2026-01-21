"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const prediction_controller_1 = require("./prediction.controller");
const prediction_service_1 = require("./prediction.service");
const prediction_processor_1 = require("./prediction.processor");
const prisma_module_1 = require("../../common/config/prisma.module");
const llm_module_1 = require("../llm/llm.module");
const queue_constants_1 = require("../../common/constants/queue.constants");
let PredictionModule = class PredictionModule {
};
exports.PredictionModule = PredictionModule;
exports.PredictionModule = PredictionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            llm_module_1.LlmModule,
            bull_1.BullModule.registerQueue({
                name: queue_constants_1.PREDICTION_TRAINING_QUEUE,
            }),
        ],
        controllers: [prediction_controller_1.PredictionController],
        providers: [prediction_service_1.PredictionService, prediction_processor_1.PredictionProcessor],
        exports: [prediction_service_1.PredictionService],
    })
], PredictionModule);
//# sourceMappingURL=prediction.module.js.map