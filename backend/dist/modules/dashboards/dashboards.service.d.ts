import { PrismaService } from '@common/services/prisma.service';
import { DashboardsResponse } from './dto/dashboards.dto';
export declare class DashboardsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboards(): Promise<DashboardsResponse>;
    private calculateKpis;
    private calculateMonthlyClosures;
    private calculateClosureBySeller;
    private calculateClosureByIndustry;
    private calculateClosureByPainPoint;
    private calculateClosureByDiscoverySource;
    private calculatePainPointIndustryMatrix;
    private calculateSellerExpertiseByIndustry;
    private calculateSellerCrossMatrix;
    private calculateClosureByArrayField;
    private calculateCategoryCrossMatrices;
    private calculateCategoryCrossMatrix;
}
