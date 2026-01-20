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
