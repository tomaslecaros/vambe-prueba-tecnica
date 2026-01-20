import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsResponse } from './dto/analytics.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  async getAnalytics(): Promise<AnalyticsResponse> {
    return this.analyticsService.getAnalytics();
  }
}
