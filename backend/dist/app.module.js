"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./common/config/prisma.module");
const queue_module_1 = require("./common/config/queue.module");
const uploads_module_1 = require("./modules/uploads/uploads.module");
const llm_module_1 = require("./modules/llm/llm.module");
const categorization_module_1 = require("./modules/categorization/categorization.module");
const clients_module_1 = require("./modules/clients/clients.module");
const dashboards_module_1 = require("./modules/dashboards/dashboards.module");
const prediction_module_1 = require("./modules/prediction/prediction.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            queue_module_1.QueueModule,
            prisma_module_1.PrismaModule,
            uploads_module_1.UploadsModule,
            llm_module_1.LlmModule,
            categorization_module_1.CategorizationModule,
            clients_module_1.ClientsModule,
            dashboards_module_1.DashboardsModule,
            prediction_module_1.PredictionModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map