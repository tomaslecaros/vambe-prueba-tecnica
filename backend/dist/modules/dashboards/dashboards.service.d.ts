import { PrismaService } from '@common/services/prisma.service';
import { DashboardsResponse } from './dto/dashboards.dto';
export declare class DashboardsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboards(): Promise<DashboardsResponse>;
    private calculateKpis;
    private calculateClosureBySeller;
    private calculateClosureByIndustry;
    private calculateClosureByPainPoint;
    private calculateClosureByDiscoverySource;
    private calculatePainPointIndustryMatrix;
    private calculateSellerExpertiseByIndustry;
    private calculateSellerCrossMatrix;
}
