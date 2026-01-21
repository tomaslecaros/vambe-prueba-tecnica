import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PredictionController } from './prediction.controller';
import { PredictionService } from './prediction.service';
import { PredictionProcessor } from './prediction.processor';
import { PrismaModule } from '@common/config/prisma.module';
import { LlmModule } from '@modules/llm/llm.module';
import { PREDICTION_TRAINING_QUEUE } from '@common/constants/queue.constants';

@Module({
  imports: [
    PrismaModule,
    LlmModule,
    BullModule.registerQueue({
      name: PREDICTION_TRAINING_QUEUE,
    }),
  ],
  controllers: [PredictionController],
  providers: [PredictionService, PredictionProcessor],
  exports: [PredictionService],
})
export class PredictionModule {}
