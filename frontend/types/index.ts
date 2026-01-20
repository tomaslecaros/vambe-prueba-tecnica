export interface UploadResponse {
  message: string;
  uploadId: string;
  filename: string;
  totalRows: number;
  newClients: number;
  duplicates: number;
  errors: number;
  errorDetails?: ErrorDetail[];
  warning?: string;
}

export interface ErrorDetail {
  email: string;
  error: string;
}

export interface ProgressResponse {
  uploadId: string;
  total: number;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  progress: number;
  clients: ClientProgress[];
}

export interface ClientProgress {
  jobId: string | number;
  clientId: string;
  email: string;
  name: string;
  status: string;
  progress: number | object;
  categories: Categories | null;
}

export interface Categories {
  industry: string;
  company_size: string;
  weekly_contact_volume: number;
  volume_trend: string;
  main_pain_point: string;
  current_solution: string;
  discovery_source: string;
  use_case: string;
  integration_needs: string[];
  query_topics: string[];
  summary: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  meetingDate: string;
  seller: string;
  closed: boolean;
  transcription: string;
  uploadId: string;
  createdAt: string;
  categorization: {
    id: string;
    data: Categories;
    createdAt: string;
  } | null;
  upload: {
    filename: string;
    createdAt: string;
  };
}

export interface ClientsResponse {
  clients: Client[];
  total: number;
  limit: number;
  offset: number;
}

export interface Upload {
  id: string;
  filename: string;
  status: string;
  totalRows: number;
  processedRows: number | null;
  createdAt: string;
  completedAt: string | null;
}

export interface UploadClientProgress {
  upload: Upload;
  progress: {
    total: number;
    categorized: number;
    pending: number;
    percentage: number;
  };
  clients: {
    id: string;
    name: string;
    email: string;
    status: 'completed' | 'pending';
    categorizedAt: string | null;
  }[];
}

// Analytics types
export interface KpiStats {
  totalClients: number;
  categorizedClients: number;
  conversionRate: number;
  avgClosingLikelihood: number;
  avgWeeklyInteractions: number;
}

export interface DistributionItem {
  name: string;
  value: number;
  percentage: number;
}

export interface ConversionByItem {
  name: string;
  total: number;
  closed: number;
  conversionRate: number;
}

export interface SentimentConversion {
  sentiment: string;
  total: number;
  closed: number;
  conversionRate: number;
}

export interface AnalyticsResponse {
  kpis: KpiStats;
  industryDistribution: DistributionItem[];
  conversionBySeller: ConversionByItem[];
  conversionByIndustry: ConversionByItem[];
  closingLikelihoodDistribution: DistributionItem[];
  sentimentConversion: SentimentConversion[];
  painPointDistribution: DistributionItem[];
  discoverySourceDistribution: DistributionItem[];
  companySizeConversion: ConversionByItem[];
  conversionByPainPoint: ConversionByItem[];
  conversionByDiscoverySource: ConversionByItem[];
}

// Uploads response with pagination
export interface UploadsResponse {
  uploads: Upload[];
  total: number;
  limit: number;
  offset: number;
}

// Categorization item for list
export interface CategorizationItem {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  seller: string;
  closed: boolean;
  meetingDate: string | null;
  data: Categories;
  processedAt: string;
}

// Categorizations response with pagination
export interface CategorizationsResponse {
  categorizations: CategorizationItem[];
  total: number;
  limit: number;
  offset: number;
}

// Dashboards types
export interface DashboardsKpiStats {
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

export interface DashboardsResponse {
  kpis: DashboardsKpiStats;
  closureBySeller: ClosureByItem[];
  closureByIndustry: ClosureByItem[];
  closureByPainPoint: ClosureByItem[];
  closureByDiscoverySource: ClosureByItem[];
  painPointIndustryMatrix: PainPointIndustryMatrix;
  sellerExpertiseByIndustry: SellerExpertise[];
}
