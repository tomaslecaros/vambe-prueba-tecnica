import { AnalyticsService } from './analytics.service';
import { AnalyticsResponse } from './dto/analytics.dto';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getAnalytics(): Promise<AnalyticsResponse>;
}
