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
    app.use((req, res, next) => {
        console.log(`📥 [BACKEND] ${req.method} ${req.url}`);
        console.log(`📥 [BACKEND] Origin: ${req.headers.origin || 'none'}`);
        next();
    });
    const frontendUrl = process.env.FRONTEND_URL;
    app.enableCors({
        origin: frontendUrl ? [frontendUrl] : true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    console.log(`🚀 [BACKEND] CORS configured for origin: ${frontendUrl || 'all origins'}`);
    const categorizationQueue = app.get(`BullQueue_${queue_constants_1.CATEGORIZATION_QUEUE}`);
    const serverAdapter = new express_1.ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');
    (0, api_1.createBullBoard)({
        queues: [new bullAdapter_1.BullAdapter(categorizationQueue)],
        serverAdapter: serverAdapter,
    });
    app.use('/admin/queues', serverAdapter.getRouter());
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`🚀 [BACKEND] Application is running on port: ${port}`);
    console.log(`🚀 [BACKEND] Bull Board is running on: http://localhost:${port}/admin/queues`);
    console.log(`🚀 [BACKEND] CORS origin configured for: ${process.env.FRONTEND_URL || 'all origins'}`);
    app.use((req, res, next) => {
        console.log(`📥 [BACKEND] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'}`);
        next();
    });
}
bootstrap();
//# sourceMappingURL=main.js.map