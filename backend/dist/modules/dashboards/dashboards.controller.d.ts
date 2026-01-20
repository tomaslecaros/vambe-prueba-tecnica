import { DashboardsService } from './dashboards.service';
import { DashboardsResponse } from './dto/dashboards.dto';
export declare class DashboardsController {
    private readonly dashboardsService;
    constructor(dashboardsService: DashboardsService);
    getDashboards(): Promise<DashboardsResponse>;
}
