"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategorizationModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const categorization_service_1 = require("./categorization.service");
const categorization_processor_1 = require("./categorization.processor");
const categorization_controller_1 = require("./categorization.controller");
const prisma_module_1 = require("../../common/config/prisma.module");
const llm_module_1 = require("../llm/llm.module");
const prediction_module_1 = require("../prediction/prediction.module");
const queue_constants_1 = require("../../common/constants/queue.constants");
let CategorizationModule = class CategorizationModule {
};
exports.CategorizationModule = CategorizationModule;
exports.CategorizationModule = CategorizationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            llm_module_1.LlmModule,
            (0, common_1.forwardRef)(() => prediction_module_1.PredictionModule),
            bull_1.BullModule.registerQueue({
                name: queue_constants_1.CATEGORIZATION_QUEUE,
            }),
        ],
        providers: [categorization_service_1.CategorizationService, categorization_processor_1.CategorizationProcessor],
        controllers: [categorization_controller_1.CategorizationController],
        exports: [categorization_service_1.CategorizationService],
    })
], CategorizationModule);
//# sourceMappingURL=categorization.module.js.map