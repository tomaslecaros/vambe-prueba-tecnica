export interface UploadResponse {
  message: string;
  uploadId: string;
  filename: string;
  status?: string;
}

export interface UploadStatus {
  id: string;
  filename: string;
  status: string;
  totalRows: number;
  processedRows: number;
  clientsSaved: number;
  clientsCategorized: number;
  progress: number;
  categorizationProgress: number;
  createdAt: string;
  completedAt: string | null;
  errors?: any;
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
export interface MonthlyClosure {
  month: string; // Format: "YYYY-MM"
  label: string; // Format: "Enero 2024"
  total: number;
  closed: number;
  closureRate: number;
}

export interface DashboardsKpiStats {
  totalClients: number;
  categorizedClients: number;
  closureRate: number;
  avgWeeklyInteractions: number;
  monthlyClosures?: MonthlyClosure[];
  lastMonthClosureRate?: number; // Closure rate of last month
  previousMonthClosureRate?: number; // Closure rate of previous month
  monthOverMonthChange?: number; // Change in closure rate percentage points
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
  kpis: DashboardsKpiStats;
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

// Prediction types
export interface TrainingProgressDto {
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  startedAt: string;
}

export interface PredictionStatusResponse {
  trained: boolean;
  canTrain: boolean;
  availableSamples: number;
  minimumRequired: number;
  message?: string;
  lastTrainedAt?: string;
  samplesUsed?: number;
  accuracy?: number;
  isTraining?: boolean;
  trainingProgress?: TrainingProgressDto;
  lastError?: string;
}

export interface TrainResponse {
  message: string;
  jobId: string;
  samplesUsed: number;
}

export interface TrainErrorResponse {
  error: 'TRAINING_IN_PROGRESS' | 'INSUFFICIENT_DATA';
  message: string;
  progress?: number;
  availableSamples?: number;
  minimumRequired?: number;
}

export interface TopFactorDto {
  feature: string;
  value: string;
  impact: string;
}

export interface ModelInfoDto {
  trained: boolean;
  lastTrainedAt: string | null;
  samplesUsed: number;
  accuracy: number | null;
}

export interface PredictionResponse {
  probability: number;
  willClose: boolean; // true si cerrará, false si no cerrará
  prediction: 'high' | 'medium' | 'low'; // Mantener para compatibilidad
  categories: Partial<Categories>;
  topFactors: TopFactorDto[];
  model: ModelInfoDto;
}

export interface PredictionErrorResponse {
  error: 'MODEL_NOT_TRAINED' | 'INSUFFICIENT_CATEGORIZATION';
  message: string;
  canTrain?: boolean;
  availableSamples?: number;
  minimumRequired?: number;
  categories?: Partial<Categories>;
}
