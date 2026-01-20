"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const api_1 = require("@bull-board/api");
const bullAdapter_1 = require("@bull-board/api/bullAdapter");
const express_1 = require("@bull-board/express");
const queue_constants_1 = require("./common/constants/queue.constants");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    const categorizationQueue = app.get(`BullQueue_${queue_constants_1.CATEGORIZATION_QUEUE}`);
    const serverAdapter = new express_1.ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');
    (0, api_1.createBullBoard)({
        queues: [new bullAdapter_1.BullAdapter(categorizationQueue)],
        serverAdapter: serverAdapter,
    });
    app.use('/admin/queues', serverAdapter.getRouter());
    await app.listen(process.env.PORT ?? 3000);
    console.log(`Application is running on: http://localhost:3000`);
    console.log(`Bull Board is running on: http://localhost:3000/admin/queues`);
}
bootstrap();
//# sourceMappingURL=main.js.map