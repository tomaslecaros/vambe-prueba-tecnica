import { Controller, Get } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { DashboardsResponse } from './dto/dashboards.dto';

@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Get()
  async getDashboards(): Promise<DashboardsResponse> {
    return this.dashboardsService.getDashboards();
  }
}
