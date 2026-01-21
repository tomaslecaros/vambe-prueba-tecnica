import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PredictionService } from './prediction.service';
import { PREDICTION_TRAINING_QUEUE } from '@common/constants/queue.constants';

@Processor(PREDICTION_TRAINING_QUEUE)
export class PredictionProcessor {
  private readonly logger = new Logger(PredictionProcessor.name);

  constructor(private readonly predictionService: PredictionService) {}

  @Process('train')
  async handleTraining(job: Job<{ modelId: string }>) {
    const { modelId } = job.data;

    try {
      await this.predictionService.trainModel(modelId);
    } catch (error) {
      this.logger.error(`Training job ${job.id} failed: ${error.message}`);
      throw error;
    }
  }
}
