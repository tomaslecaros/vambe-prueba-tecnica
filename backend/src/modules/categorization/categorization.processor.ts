import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '@common/services/prisma.service';
import { LlmService } from '@modules/llm/llm.service';
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
  ) {
    console.log(`[DEBUG-PROCESSOR] ✅ CategorizationProcessor initialized and listening to queue: ${CATEGORIZATION_QUEUE}`);
    this.logger.log(`Processor initialized for queue: ${CATEGORIZATION_QUEUE}`);
  }

  @Process({ concurrency: MAX_CONCURRENCY })
  async handleCategorization(job: Job<CategorizationJobDto>) {
    const { clientId, uploadId } = job.data;

    console.log(`[DEBUG-PROCESSOR] 🚀 Job ${job.id} received: clientId=${clientId}, uploadId=${uploadId}`);
    
    try {
      console.log(`[DEBUG-PROCESSOR] Starting processing job ${job.id} for client ${clientId}`);
      this.logger.log(`🚀 [QUEUE] Starting job ${job.id} for client ${clientId}`);

      const client = await this.prisma.client.findUnique({
        where: { id: clientId },
      });

      if (!client) {
        this.logger.error(`❌ [QUEUE] Client ${clientId} not found`);
        throw new Error(`Client ${clientId} not found`);
      }

      this.logger.log(`📝 [QUEUE] Processing client: ${client.email}`);

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

      console.log(`[DEBUG-PROCESSOR] ✅ Job ${job.id} completed successfully for client ${client.email}`);
      this.logger.log(`✓ Categorized ${client.email}: ${categories.industry}`);

      return {
        clientId,
        email: client.email,
        categories,
      };
    } catch (error) {
      console.error(`[DEBUG-PROCESSOR] ❌ Job ${job.id} FAILED for client ${clientId}:`, error);
      console.error(`[DEBUG-PROCESSOR] Error type: ${error.constructor.name}`);
      console.error(`[DEBUG-PROCESSOR] Error message: ${error.message}`);
      console.error(`[DEBUG-PROCESSOR] Error stack:`, error.stack);
      this.logger.error(
        `❌ [QUEUE] Failed to categorize client ${clientId}: ${error.message}`,
      );
      this.logger.error(`❌ [QUEUE] Error stack:`, error.stack);
      throw error;
    }
  }
}
