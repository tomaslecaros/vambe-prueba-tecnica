import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { CategorizationService } from '@modules/categorization/categorization.service';
import {
  REQUIRED_COLUMNS,
  ALLOWED_FILE_EXTENSIONS,
} from '@common/constants/upload.constants';
import {
  parseMeetingDate,
  parseClosedValue,
} from '@common/utils/data-parser.util';
import * as XLSX from 'xlsx';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(
    private prisma: PrismaService,
    private categorizationService: CategorizationService,
  ) {}

  async createUpload(filename: string, totalRows: number) {
    return this.prisma.upload.create({
      data: {
        filename,
        totalRows,
        status: 'pending',
      },
    });
  }

  async processFile(uploadId: string, fileBuffer: Buffer) {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      if (rows.length === 0) {
        throw new BadRequestException('File is empty');
      }

      this.validateColumns(rows[0]);

      await this.prisma.upload.update({
        where: { id: uploadId },
        data: {
          totalRows: rows.length,
          status: 'processing',
        },
      });

      const { processedCount, duplicatesCount, errorsCount, errorDetails } =
        await this.processRows(uploadId, rows);

      // Validar si se procesó al menos un cliente
      if (processedCount === 0 && rows.length > 0) {
        const status =
          errorsCount === rows.length
            ? 'failed'
            : duplicatesCount === rows.length
              ? 'completed'
              : 'completed';

        await this.prisma.upload.update({
          where: { id: uploadId },
          data: {
            status,
            completedAt: new Date(),
            processedRows: processedCount,
            errors:
              errorsCount > 0
                ? { message: 'All rows failed or were duplicates', details: errorDetails }
                : undefined,
          },
        });

        // Si todos son duplicados, no hay nada que categorizar
        if (duplicatesCount === rows.length) {
          this.logger.warn(
            `Upload ${uploadId}: All ${rows.length} clients are duplicates. No categorization needed.`,
          );
        }

        return {
          success: processedCount === 0 && duplicatesCount > 0,
          processedRows: processedCount,
          duplicates: duplicatesCount,
          errors: errorsCount,
          errorDetails: errorDetails.length > 0 ? errorDetails : undefined,
          total: rows.length,
          warning:
            processedCount === 0 && duplicatesCount === rows.length
              ? 'All clients already exist in the database'
              : errorsCount === rows.length
                ? 'All rows failed validation'
                : undefined,
        };
      }

      await this.prisma.upload.update({
        where: { id: uploadId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          processedRows: processedCount,
        },
      });

      // Categorize all new clients in background (solo si hay clientes nuevos)
      console.log(`[DEBUG-UPLOAD] Checking if categorization needed: processedCount=${processedCount}, uploadId=${uploadId}`);
      
      if (processedCount > 0) {
        console.log(`[DEBUG-UPLOAD] Attempting to queue categorization for ${processedCount} new clients from upload ${uploadId}`);
        this.logger.log(`🔄 [UPLOAD] Queueing categorization for ${processedCount} new clients`);
        
        this.categorizationService
          .queueCategorizationForUpload(uploadId)
          .then((result) => {
            console.log(`[DEBUG-UPLOAD] ✅ Successfully queued ${result.jobsCreated} categorization jobs for upload ${uploadId}`);
            this.logger.log(`✅ [UPLOAD] Categorization queued successfully: ${result.jobsCreated} jobs created`);
          })
          .catch((error) => {
            console.error(`[DEBUG-UPLOAD] ❌ FAILED to queue categorization for upload ${uploadId}:`, error);
            console.error(`[DEBUG-UPLOAD] Error message: ${error.message}`);
            console.error(`[DEBUG-UPLOAD] Error stack:`, error.stack);
            this.logger.error(`❌ [UPLOAD] Categorization queue error:`, error);
            this.logger.error(`❌ [UPLOAD] Error details:`, error.message, error.stack);
          });
      } else {
        console.log(`[DEBUG-UPLOAD] No clients to categorize (processedCount=${processedCount})`);
        this.logger.log('ℹ️ [UPLOAD] No new clients to categorize');
      }

      return {
        success: true,
        processedRows: processedCount,
        duplicates: duplicatesCount,
        errors: errorsCount,
        errorDetails: errorDetails.length > 0 ? errorDetails : undefined,
        total: rows.length,
      };
    } catch (error) {
      await this.markUploadAsFailed(uploadId, error.message);
      throw error;
    }
  }

  private async processRows(uploadId: string, rows: any[]) {
    let processedCount = 0;
    let duplicatesCount = 0;
    let errorsCount = 0;
    const errorDetails: Array<{ email: string; error: string }> = [];

    for (const row of rows) {
      const result = await this.saveClient(uploadId, row);

      if (result.created) {
        processedCount++;
      } else if (result.reason === 'duplicate') {
        duplicatesCount++;
      } else if (result.reason === 'error') {
        errorsCount++;
        errorDetails.push({
          email: String(row['Correo Electronico'] || 'unknown'),
          error: result.error || 'Unknown error',
        });
      }
    }

    return { processedCount, duplicatesCount, errorsCount, errorDetails };
  }

  private async markUploadAsFailed(uploadId: string, errorMessage: string) {
    await this.prisma.upload.update({
      where: { id: uploadId },
      data: {
        status: 'failed',
        errors: { message: errorMessage },
      },
    });
  }

  private validateColumns(firstRow: any) {
    const fileColumns = Object.keys(firstRow);
    const missingColumns = REQUIRED_COLUMNS.filter(
      (col) => !fileColumns.includes(col),
    );

    if (missingColumns.length > 0) {
      throw new BadRequestException(
        `Missing columns: ${missingColumns.join(', ')}`,
      );
    }
  }

  private async saveClient(uploadId: string, row: any) {
    try {
      const email = String(row['Correo Electronico'] || '').trim();
      const phone = String(row['Numero de Telefono'] || '').trim();

      // Validar que email y phone no estén vacíos
      if (!email || !phone) {
        return {
          created: false,
          reason: 'error',
          error: 'Email or phone is missing',
        };
      }

      const existingClient = await this.findClientByEmailAndPhone(email, phone);

      if (existingClient) {
        this.logger.debug(`Duplicate client: ${email} - ${phone}`);
        return { created: false, reason: 'duplicate' };
      }

      const meetingDate = parseMeetingDate(row['Fecha de la Reunion']);
      const closed = parseClosedValue(row['closed']);

      await this.prisma.client.create({
        data: {
          uploadId,
          name: String(row['Nombre'] || '').trim(),
          email,
          phone,
          meetingDate,
          seller: String(row['Vendedor asignado'] || '').trim(),
          closed,
          transcription: String(row['Transcripcion'] || '').trim(),
        },
      });

      return { created: true };
    } catch (error) {
      this.logger.error(`Error saving client: ${error.message}`);
      return { created: false, reason: 'error', error: error.message };
    }
  }

  private async findClientByEmailAndPhone(email: string, phone: string) {
    return this.prisma.client.findUnique({
      where: {
        email_phone: {
          email,
          phone,
        },
      },
    });
  }

  async getUploads(limit: number = 20, offset: number = 0, status?: string) {
    const where = status ? { status: status as any } : undefined;

    const [uploads, total] = await Promise.all([
      this.prisma.upload.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.upload.count({ where }),
    ]);

    return {
      uploads,
      total,
      limit,
      offset,
    };
  }

  async getUploadClientsWithProgress(uploadId: string) {
    const upload = await this.prisma.upload.findUnique({
      where: { id: uploadId },
    });

    if (!upload) {
      throw new BadRequestException('Upload not found');
    }

    const clients = await this.prisma.client.findMany({
      where: { uploadId },
      include: {
        categorization: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const total = clients.length;
    const categorized = clients.filter((c) => c.categorization !== null).length;
    const pending = total - categorized;

    return {
      upload: {
        id: upload.id,
        filename: upload.filename,
        status: upload.status,
        totalRows: upload.totalRows,
        processedRows: upload.processedRows,
        createdAt: upload.createdAt,
        completedAt: upload.completedAt,
      },
      progress: {
        total,
        categorized,
        pending,
        percentage: total > 0 ? Math.round((categorized / total) * 100) : 0,
      },
      clients: clients.map((client) => ({
        id: client.id,
        name: client.name,
        email: client.email,
        status: client.categorization ? 'completed' : 'pending',
        categorizedAt: client.categorization?.processedAt,
      })),
    };
  }
}
