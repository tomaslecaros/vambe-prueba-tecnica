export interface MonthlyClosure {
  month: string; // Format: "YYYY-MM"
  label: string; // Format: "Enero 2024"
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
  lastMonthClosureRate: number; // Closure rate of last month
  previousMonthClosureRate: number; // Closure rate of previous month
  monthOverMonthChange: number; // Percentage change in closure rate
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

// Matriz genérica para cruzar categorías entre sí
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
  // Matrices para vendedor × dimensión
  sellerByDiscoverySource: SellerCrossMatrix;
  sellerByPainPoint: SellerCrossMatrix;
  // Nuevos campos para categorías
  closureByIntegrationNeeds: ClosureByItem[];
  closureByQueryTopics: ClosureByItem[];
  // Matrices cruzadas de categorías
  categoryCrossMatrices: Record<string, CategoryCrossMatrix>;
}
