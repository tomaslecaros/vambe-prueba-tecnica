import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CategorizationService } from './categorization.service';
import { CategorizationProcessor } from './categorization.processor';
import { CategorizationController } from './categorization.controller';
import { PrismaModule } from '@common/config/prisma.module';
import { LlmModule } from '@modules/llm/llm.module';
import { PredictionModule } from '@modules/prediction/prediction.module';
import { CATEGORIZATION_QUEUE } from '@common/constants/queue.constants';

@Module({
  imports: [
    PrismaModule,
    LlmModule,
    forwardRef(() => PredictionModule),
    BullModule.registerQueue({
      name: CATEGORIZATION_QUEUE,
    }),
  ],
  providers: [CategorizationService, CategorizationProcessor],
  controllers: [CategorizationController],
  exports: [CategorizationService],
})
export class CategorizationModule {}
