import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import { CategorizationService } from '@modules/categorization/categorization.service';
import {
  REQUIRED_COLUMNS,
  UPLOAD_BATCH_SIZE,
} from '@common/constants/upload.constants';
import {
  parseMeetingDate,
  parseClosedValue,
  fixRowEncoding,
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
      const rawRows = XLSX.utils.sheet_to_json(worksheet);

      if (rawRows.length === 0) {
        throw new BadRequestException('File is empty');
      }

      const rows = rawRows.map((row) => fixRowEncoding(row as Record<string, unknown>));
      this.validateColumns(rows[0]);

      await this.prisma.upload.update({
        where: { id: uploadId },
        data: {
          totalRows: rows.length,
          status: 'processing',
        },
      });

    const { processedCount, duplicatesCount, errorsCount, errorDetails } =
      await this.processRowsInBatches(uploadId, rows);

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

      if (duplicatesCount === rows.length) {
        this.logger.log(
          `Upload ${uploadId} complete: 0 new, ${duplicatesCount} duplicates (no categorization).`,
        );
      } else {
        this.logger.log(
          `Upload ${uploadId} complete: 0 new, ${duplicatesCount} duplicates, ${errorsCount} errors.`,
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

    if (processedCount > 0) {
      this.categorizationService
        .queueCategorizationForUpload(uploadId)
        .catch((error) => this.logger.error('Categorization queue error:', error));
    }

    this.logger.log(
      `Upload ${uploadId} complete: ${processedCount} new, ${duplicatesCount} duplicates, ${errorsCount} errors`,
    );

      return {
        success: true,
        processedRows: processedCount,
        duplicates: duplicatesCount,
        errors: errorsCount,
        errorDetails: errorDetails.length > 0 ? errorDetails : undefined,
        total: rows.length,
      };
    } catch (error) {
      await this.markUploadAsFailed(uploadId, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  private async markUploadAsFailed(uploadId: string, errorMessage: string) {
    await this.prisma.upload.update({
      where: { id: uploadId },
      data: { status: 'failed', errors: { message: errorMessage } },
    });
  }

  private validateColumns(firstRow: Record<string, unknown>) {
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

  private async processRowsInBatches(uploadId: string, rows: any[]) {
    let processedCount = 0;
    let duplicatesCount = 0;
    let errorsCount = 0;
    const errorDetails: Array<{ email: string; error: string }> = [];

    const existingClientsMap = await this.getExistingClientsMap(rows);
    const clientsToCreate: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const email = String(row['Correo Electronico'] || '').trim();
      const phone = String(row['Numero de Telefono'] || '').trim();

      if (!email || !phone) {
        errorsCount++;
        errorDetails.push({
          email: email || 'unknown',
          error: 'Email or phone is missing',
        });
        continue;
      }

      const key = `${email}|${phone}`;
      if (existingClientsMap.has(key)) {
        duplicatesCount++;
        continue;
      }

      const meetingDate = parseMeetingDate(row['Fecha de la Reunion']);
      const closed = parseClosedValue(row['closed']);

      clientsToCreate.push({
        uploadId,
        name: String(row['Nombre'] || '').trim(),
        email,
        phone,
        meetingDate,
        seller: String(row['Vendedor asignado'] || '').trim(),
        closed,
        transcription: String(row['Transcripcion'] || '').trim(),
      });

      if (clientsToCreate.length >= UPLOAD_BATCH_SIZE) {
        const result = await this.saveBatch(clientsToCreate);
        processedCount += result.success;
        duplicatesCount += result.duplicates;
        errorsCount += result.errors;
        errorDetails.push(...result.errorDetails);

        clientsToCreate.forEach((c) => {
          existingClientsMap.set(`${c.email}|${c.phone}`, true);
        });
        clientsToCreate.length = 0;
      }
    }

    if (clientsToCreate.length > 0) {
      const result = await this.saveBatch(clientsToCreate);
      processedCount += result.success;
      duplicatesCount += result.duplicates;
      errorsCount += result.errors;
      errorDetails.push(...result.errorDetails);
    }

    return { processedCount, duplicatesCount, errorsCount, errorDetails };
  }

  private async getExistingClientsMap(rows: any[]) {
    const map = new Map<string, boolean>();
    const clientKeys = new Set<string>();

    rows.forEach((row) => {
      const email = String(row['Correo Electronico'] || '').trim();
      const phone = String(row['Numero de Telefono'] || '').trim();
      if (email && phone) {
        clientKeys.add(`${email}|${phone}`);
      }
    });

    const keysArray = Array.from(clientKeys);

    for (let i = 0; i < keysArray.length; i += UPLOAD_BATCH_SIZE) {
      const batch = keysArray.slice(i, i + UPLOAD_BATCH_SIZE);
      const conditions = batch.map((key) => {
        const idx = key.indexOf('|');
        const email = idx >= 0 ? key.slice(0, idx) : key;
        const phone = idx >= 0 ? key.slice(idx + 1) : '';
        return { email, phone };
      });

      const existing = await this.prisma.client.findMany({
        where: {
          OR: conditions.map((c) => ({ email: c.email, phone: c.phone })),
        },
        select: { email: true, phone: true },
      });

      existing.forEach((client) => {
        map.set(`${client.email}|${client.phone}`, true);
      });
    }

    return map;
  }

  private async saveBatch(clients: any[]) {
    let success = 0;
    let duplicates = 0;
    let errors = 0;
    const errorDetails: Array<{ email: string; error: string }> = [];

    try {
      const result = await this.prisma.client.createMany({
        data: clients,
        skipDuplicates: true,
      });
      success = result.count;
      duplicates = clients.length - result.count;
    } catch (error: unknown) {
      const err = error as { message?: string };
      this.logger.error(`Batch save error: ${err.message ?? 'Unknown'}`);

      for (const client of clients) {
        try {
          await this.prisma.client.create({ data: client });
          success++;
        } catch (innerErr: unknown) {
          const e = innerErr as { code?: string; message?: string };
          if (e.code === 'P2002') {
            duplicates++;
          } else {
            errors++;
            errorDetails.push({
              email: client.email || 'unknown',
              error: e.message || 'Unknown error',
            });
          }
        }
      }
    }

    return { success, duplicates, errors, errorDetails };
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

  async getUploadStatus(uploadId: string) {
    const upload = await this.prisma.upload.findUnique({
      where: { id: uploadId },
    });

    if (!upload) {
      throw new BadRequestException('Upload not found');
    }

    const clientsCount = await this.prisma.client.count({
      where: { uploadId },
    });

    const categorizedCount = await this.prisma.client.count({
      where: {
        uploadId,
        categorization: { isNot: null },
      },
    });

    return {
      id: upload.id,
      filename: upload.filename,
      status: upload.status,
      totalRows: upload.totalRows || 0,
      processedRows: upload.processedRows || 0,
      clientsSaved: clientsCount,
      clientsCategorized: categorizedCount,
      progress: upload.totalRows
        ? Math.round(((upload.processedRows || 0) / upload.totalRows) * 100)
        : 0,
      categorizationProgress: clientsCount
        ? Math.round((categorizedCount / clientsCount) * 100)
        : 0,
      createdAt: upload.createdAt,
      completedAt: upload.completedAt,
      errors: upload.errors,
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
