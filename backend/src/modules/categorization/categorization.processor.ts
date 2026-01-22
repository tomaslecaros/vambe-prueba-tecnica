import { Process, Processor } from '@nestjs/bull';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '@common/services/prisma.service';
import { LlmService } from '@modules/llm/llm.service';
import { PredictionService } from '@modules/prediction/prediction.service';
import {
  CATEGORIZATION_QUEUE,
  MAX_CONCURRENCY,
} from '@common/constants/queue.constants';
import { CategorizationJobDto } from './dto/categorization.dto';

@Processor(CATEGORIZATION_QUEUE)
export class CategorizationProcessor {
  private readonly logger = new Logger(CategorizationProcessor.name);

  constructor(
    private prisma: PrismaService,
    private llmService: LlmService,
    @Inject(forwardRef(() => PredictionService))
    private predictionService: PredictionService,
  ) {}

  @Process({ concurrency: MAX_CONCURRENCY })
  async handleCategorization(job: Job<CategorizationJobDto>) {
    const { clientId, uploadId } = job.data;

    try {
      const client = await this.prisma.client.findUnique({
        where: { id: clientId },
      });

      if (!client) {
        throw new Error(`Client ${clientId} not found`);
      }

      await job.progress(30);

      const categories =
        await this.llmService.extractCategoriesFromTranscription(
          client.transcription,
        );

      await job.progress(70);

      const categorization = await this.prisma.categorization.create({
        data: {
          clientId,
          data: categories as any,
          llmProvider: 'openai',
          model: 'gpt-4o-mini',
          promptVersion: 'v1.0',
        },
      });

      await job.progress(100);

      await this.checkAndTriggerAutoTraining(uploadId);

      return {
        clientId,
        email: client.email,
        categories,
      };
    } catch (error) {
      this.logger.error(
        `Failed to categorize client ${clientId}: ${error.message}`,
      );
      throw error;
    }
  }

  private async checkAndTriggerAutoTraining(uploadId: string): Promise<void> {
    try {
      // Get all clients from this upload
      const totalClients = await this.prisma.client.count({
        where: { uploadId },
      });

      // Count clients that have categorization
      const categorizedClients = await this.prisma.client.count({
        where: {
          uploadId,
          categorization: { isNot: null },
        },
      });

      if (totalClients > 0 && categorizedClients === totalClients) {
        this.logger.log(
          `Upload ${uploadId}: all ${totalClients} categorized. Triggering model training.`,
        );

        const trainingResult = await this.predictionService.startTraining();

        if ('error' in trainingResult) {
          this.logger.log(`Model training skipped: ${trainingResult.message}`);
        } else {
          this.logger.log(
            `Model training started (${trainingResult.samplesUsed} samples).`,
          );
        }
      }
    } catch (error) {
      // Log error but don't throw - we don't want categorization to fail if auto-training fails
      this.logger.error(
        `Error checking auto-training trigger for upload ${uploadId}: ${error.message}`,
      );
    }
  }
}
