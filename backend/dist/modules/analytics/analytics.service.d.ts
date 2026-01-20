import { PrismaService } from '@common/services/prisma.service';
import { AnalyticsResponse } from './dto/analytics.dto';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getAnalytics(): Promise<AnalyticsResponse>;
    private calculateKpis;
    private calculateIndustryDistribution;
    private calculateConversionBySeller;
    private calculateConversionByIndustry;
    private calculateClosingLikelihoodDistribution;
    private calculateSentimentConversion;
    private calculatePainPointDistribution;
    private calculateDiscoverySourceDistribution;
    private calculateCompanySizeConversion;
    private calculateConversionByPainPoint;
    private calculateConversionByDiscoverySource;
}
