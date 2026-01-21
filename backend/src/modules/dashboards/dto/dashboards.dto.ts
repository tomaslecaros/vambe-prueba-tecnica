export interface KpiStats {
  totalClients: number;
  categorizedClients: number;
  closureRate: number;
  avgWeeklyInteractions: number;
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

// Matriz genérica para cruzar vendedor con cualquier dimensión
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

export interface DashboardsResponse {
  kpis: KpiStats;
  closureBySeller: ClosureByItem[];
  closureByIndustry: ClosureByItem[];
  closureByPainPoint: ClosureByItem[];
  closureByDiscoverySource: ClosureByItem[];
  painPointIndustryMatrix: PainPointIndustryMatrix;
  sellerExpertiseByIndustry: SellerExpertise[];
  // Nuevas matrices para el heatmap
  sellerByDiscoverySource: SellerCrossMatrix;
  sellerByPainPoint: SellerCrossMatrix;
}
