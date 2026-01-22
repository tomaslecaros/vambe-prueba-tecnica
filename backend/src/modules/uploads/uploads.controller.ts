import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { UploadResponseDto } from './dto/upload-response.dto';
import { ALLOWED_FILE_EXTENSIONS } from '@common/constants/upload.constants';

@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    this.validateFileExtension(file.originalname);

    const upload = await this.uploadsService.createUpload(file.originalname, 0);
    const result = await this.uploadsService.processFile(upload.id, file.buffer);

    return {
      message: 'File uploaded and processed successfully',
      uploadId: upload.id,
      filename: upload.filename,
      totalRows: result.total,
      newClients: result.processedRows,
      duplicates: result.duplicates,
      errors: result.errors,
      errorDetails: result.errorDetails,
      warning: result.warning,
    };
  }

  @Get()
  async getUploads(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('status') status?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    return this.uploadsService.getUploads(limitNum, offsetNum, status);
  }

  @Get(':id/status')
  async getUploadStatus(@Param('id') id: string) {
    return this.uploadsService.getUploadStatus(id);
  }

  @Get(':id/clients')
  async getUploadClients(@Param('id') id: string) {
    return this.uploadsService.getUploadClientsWithProgress(id);
  }

  private validateFileExtension(filename: string) {
    const fileExtension = filename.substring(filename.lastIndexOf('.'));

    if (!ALLOWED_FILE_EXTENSIONS.includes(fileExtension.toLowerCase() as any)) {
      throw new BadRequestException(
        'Invalid file type. Only .xlsx and .csv files are allowed',
      );
    }
  }
}
