import { Controller, Get, Param, Query } from '@nestjs/common';
import { CategorizationService } from './categorization.service';
import { ProgressResponseDto } from './dto/categorization.dto';

@Controller('categorization')
export class CategorizationController {
  constructor(private categorizationService: CategorizationService) {}

  @Get()
  async getAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    return this.categorizationService.getAllCategorizations(limitNum, offsetNum);
  }

  @Get(':uploadId/progress')
  async getProgress(
    @Param('uploadId') uploadId: string,
  ): Promise<ProgressResponseDto> {
    return this.categorizationService.getUploadProgress(uploadId);
  }
}
