import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bull';
import { CATEGORIZATION_QUEUE } from '@common/constants/queue.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware simple para loggear todas las requests ANTES de CORS
  app.use((req, res, next) => {
    console.log(`📥 [BACKEND] ${req.method} ${req.url}`);
    console.log(`📥 [BACKEND] Origin: ${req.headers.origin || 'none'}`);
    next();
  });

  // Configurar CORS para permitir requests del frontend
  const frontendUrl = process.env.FRONTEND_URL;
  app.enableCors({
    origin: frontendUrl ? [frontendUrl] : true, // Permitir frontend específico o todos en desarrollo
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  console.log(`🚀 [BACKEND] CORS configured for origin: ${frontendUrl || 'all origins'}`);

  const categorizationQueue = app.get<Queue>(
    `BullQueue_${CATEGORIZATION_QUEUE}`,
  );

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  createBullBoard({
    queues: [new BullAdapter(categorizationQueue)],
    serverAdapter: serverAdapter,
  });

  app.use('/admin/queues', serverAdapter.getRouter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  console.log(`🚀 [BACKEND] Application is running on port: ${port}`);
  console.log(`🚀 [BACKEND] Bull Board is running on: http://localhost:${port}/admin/queues`);
  console.log(`🚀 [BACKEND] CORS origin configured for: ${process.env.FRONTEND_URL || 'all origins'}`);
  
  // Middleware simple para loggear todas las requests
  app.use((req, res, next) => {
    console.log(`📥 [BACKEND] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'}`);
    next();
  });
}
bootstrap();
