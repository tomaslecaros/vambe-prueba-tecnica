export interface MonthlyClosure {
    month: string;
    label: string;
    total: number;
    closed: number;
    closureRate: number;
}
export interface KpiStats {
    totalClients: number;
    categorizedClients: number;
    closureRate: number;
    avgWeeklyInteractions: number;
    monthlyClosures: MonthlyClosure[];
    lastMonthClosureRate: number;
    previousMonthClosureRate: number;
    monthOverMonthChange: number;
}
export interface ClosureByItem {
    name: string;
    total: number;
    closed: number;
    closureRate: number;
}
export interface PainPointIndustryMatrix {
    painPoints: string[];
    industries: string[];
    matrix: {
        painPoint: string;
        industry: string;
        closureRate: number;
        total: number;
        closed: number;
    }[];
}
export interface SellerExpertise {
    sellerName: string;
    expertise: {
        industry: string;
        closureRate: number;
        totalDeals: number;
        closedDeals: number;
    }[];
}
export interface SellerCrossMatrixItem {
    seller: string;
    dimension: string;
    closureRate: number;
    total: number;
    closed: number;
}
export interface SellerCrossMatrix {
    sellers: string[];
    dimensions: string[];
    matrix: SellerCrossMatrixItem[];
}
export interface CategoryCrossMatrixItem {
    row: string;
    col: string;
    closureRate: number;
    total: number;
    closed: number;
}
export interface CategoryCrossMatrix {
    rows: string[];
    cols: string[];
    matrix: CategoryCrossMatrixItem[];
}
export interface DashboardsResponse {
    kpis: KpiStats;
    closureBySeller: ClosureByItem[];
    closureByIndustry: ClosureByItem[];
    closureByPainPoint: ClosureByItem[];
    closureByDiscoverySource: ClosureByItem[];
    painPointIndustryMatrix: PainPointIndustryMatrix;
    sellerExpertiseByIndustry: SellerExpertise[];
    sellerByDiscoverySource: SellerCrossMatrix;
    sellerByPainPoint: SellerCrossMatrix;
    closureByIntegrationNeeds: ClosureByItem[];
    closureByQueryTopics: ClosureByItem[];
    categoryCrossMatrices: Record<string, CategoryCrossMatrix>;
}
