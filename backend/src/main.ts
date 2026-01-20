import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bull';
import { CATEGORIZATION_QUEUE } from '@common/constants/queue.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

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

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:3000`);
  console.log(`Bull Board is running on: http://localhost:3000/admin/queues`);
}
bootstrap();
