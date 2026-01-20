import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PrismaService } from '@common/services/prisma.service';
import { CATEGORIZATION_QUEUE } from '@common/constants/queue.constants';
import {
  CategorizationJobDto,
  ProgressResponseDto,
} from './dto/categorization.dto';

@Injectable()
export class CategorizationService {
  private readonly logger = new Logger(CategorizationService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue(CATEGORIZATION_QUEUE) private categorizationQueue: Queue,
  ) {}

  async queueCategorizationForUpload(uploadId: string) {
    try {
      console.log(`[DEBUG-CATEGORIZATION] 🔍 Starting queue process for upload: ${uploadId}`);
      this.logger.log(`🔍 [CATEGORIZATION] Starting queue for upload: ${uploadId}`);
      
      console.log(`[DEBUG-CATEGORIZATION] Searching for clients without categorization for upload ${uploadId}...`);
      const clientsWithoutCategories =
        await this.findClientsWithoutCategories(uploadId);
      const total = clientsWithoutCategories.length;
      console.log(`[DEBUG-CATEGORIZATION] Found ${total} clients without categorization for upload ${uploadId}`);

      if (total === 0) {
        console.log(`[DEBUG-CATEGORIZATION] No clients found to categorize for upload ${uploadId}`);
        this.logger.log(`ℹ️ [CATEGORIZATION] No clients to categorize for upload ${uploadId}`);
        return { jobsCreated: 0 };
      }

      this.logger.log(
        `📝 [CATEGORIZATION] Queueing ${total} clients for categorization (uploadId: ${uploadId})`,
      );

      console.log(`[DEBUG-CATEGORIZATION] Attempting to add ${total} jobs to Redis queue...`);
      const jobs = await Promise.all(
        clientsWithoutCategories.map((client) =>
          this.categorizationQueue.add(
            {
              clientId: client.id,
              uploadId,
            } as CategorizationJobDto,
            {
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 2000,
              },
              removeOnComplete: false,
              removeOnFail: false,
            },
          ),
        ),
      );

      console.log(`[DEBUG-CATEGORIZATION] ✅ Successfully added ${jobs.length} jobs to Redis queue for upload ${uploadId}`);
      this.logger.log(`✅ [CATEGORIZATION] Created ${jobs.length} jobs for upload ${uploadId}`);
      this.logger.log(`📋 [CATEGORIZATION] Job IDs: ${jobs.map((j) => j.id).join(', ')}`);
      
      return {
        jobsCreated: jobs.length,
        jobIds: jobs.map((j) => j.id),
      };
    } catch (error) {
      console.error(`[DEBUG-CATEGORIZATION] ❌ ERROR in queueCategorizationForUpload for upload ${uploadId}:`, error);
      console.error(`[DEBUG-CATEGORIZATION] Error type: ${error.constructor.name}`);
      console.error(`[DEBUG-CATEGORIZATION] Error message: ${error.message}`);
      console.error(`[DEBUG-CATEGORIZATION] Error stack:`, error.stack);
      this.logger.error(`❌ [CATEGORIZATION] Error queueing jobs for upload ${uploadId}:`, error);
      this.logger.error(`❌ [CATEGORIZATION] Error details:`, error.message, error.stack);
      throw error;
    }
  }

    return {
      jobsCreated: jobs.length,
      jobIds: jobs.map((j) => j.id),
    };
  }

  async getUploadProgress(uploadId: string): Promise<ProgressResponseDto> {
    const jobs = await this.categorizationQueue.getJobs([
      'waiting',
      'active',
      'completed',
      'failed',
    ]);

    const uploadJobs = jobs.filter((job) => job.data.uploadId === uploadId);

    const jobStates = await Promise.all(uploadJobs.map((j) => j.getState()));

    const waiting = jobStates.filter((state) => state === 'waiting').length;
    const active = jobStates.filter((state) => state === 'active').length;
    const completed = jobStates.filter((state) => state === 'completed').length;
    const failed = jobStates.filter((state) => state === 'failed').length;

    const total = uploadJobs.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    const clientsData = await Promise.all(
      uploadJobs.slice(0, 20).map(async (job) => {
        const state = await job.getState();
        const client = await this.prisma.client.findUnique({
          where: { id: job.data.clientId },
          include: { categorization: true },
        });

        return {
          jobId: job.id,
          clientId: job.data.clientId,
          email: client?.email || 'unknown',
          name: client?.name || 'unknown',
          status: state,
          progress: job.progress(),
          categories: client?.categorization?.data || null,
        };
      }),
    );

    return {
      uploadId,
      total,
      waiting,
      active,
      completed,
      failed,
      progress,
      clients: clientsData,
    };
  }

  private async findClientsWithoutCategories(uploadId: string) {
    return this.prisma.client.findMany({
      where: {
        uploadId,
        categorization: null,
      },
    });
  }

  async getAllCategorizations(limit: number = 20, offset: number = 0) {
    const [categorizations, total] = await Promise.all([
      this.prisma.categorization.findMany({
        take: limit,
        skip: offset,
        orderBy: { processedAt: 'desc' },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              seller: true,
              closed: true,
              meetingDate: true,
            },
          },
        },
      }),
      this.prisma.categorization.count(),
    ]);

    return {
      categorizations: categorizations.map((cat) => ({
        id: cat.id,
        clientId: cat.clientId,
        clientName: cat.client.name,
        clientEmail: cat.client.email,
        seller: cat.client.seller,
        closed: cat.client.closed,
        meetingDate: cat.client.meetingDate,
        data: cat.data,
        processedAt: cat.processedAt,
      })),
      total,
      limit,
      offset,
    };
  }
}
