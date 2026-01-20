import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import {
  AnalyticsResponse,
  KpiStats,
  DistributionItem,
  ConversionByItem,
  SentimentConversion,
} from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getAnalytics(): Promise<AnalyticsResponse> {
    const clientsWithCategories = await this.prisma.client.findMany({
      include: {
        categorization: true,
      },
    });

    const categorizedClients = clientsWithCategories.filter(
      (c) => c.categorization !== null,
    );

    const kpis = this.calculateKpis(clientsWithCategories, categorizedClients);
    const industryDistribution =
      this.calculateIndustryDistribution(categorizedClients);
    const conversionBySeller =
      this.calculateConversionBySeller(clientsWithCategories);
    const conversionByIndustry =
      this.calculateConversionByIndustry(categorizedClients);
    const closingLikelihoodDistribution =
      this.calculateClosingLikelihoodDistribution(categorizedClients);
    const sentimentConversion =
      this.calculateSentimentConversion(categorizedClients);
    const painPointDistribution =
      this.calculatePainPointDistribution(categorizedClients);
    const discoverySourceDistribution =
      this.calculateDiscoverySourceDistribution(categorizedClients);
    const companySizeConversion =
      this.calculateCompanySizeConversion(categorizedClients);

    const conversionByPainPoint =
      this.calculateConversionByPainPoint(categorizedClients);
    const conversionByDiscoverySource =
      this.calculateConversionByDiscoverySource(categorizedClients);

    return {
      kpis,
      industryDistribution,
      conversionBySeller,
      conversionByIndustry,
      closingLikelihoodDistribution,
      sentimentConversion,
      painPointDistribution,
      discoverySourceDistribution,
      companySizeConversion,
      conversionByPainPoint,
      conversionByDiscoverySource,
    };
  }

  private calculateKpis(
    allClients: any[],
    categorizedClients: any[],
  ): KpiStats {
    const totalClients = allClients.length;
    const categorizedCount = categorizedClients.length;
    const closedCount = allClients.filter((c) => c.closed).length;
    const conversionRate =
      totalClients > 0 ? (closedCount / totalClients) * 100 : 0;

    // Calculate average closing likelihood (High=3, Medium=2, Low=1)
    const likelihoodScores = categorizedClients
      .map((c) => {
        const likelihood = c.categorization?.data?.closing_likelihood;
        if (likelihood === 'High') return 3;
        if (likelihood === 'Medium') return 2;
        if (likelihood === 'Low') return 1;
        return 0;
      })
      .filter((score) => score > 0);

    const avgClosingLikelihood =
      likelihoodScores.length > 0
        ? likelihoodScores.reduce((a, b) => a + b, 0) / likelihoodScores.length
        : 0;

    // Calculate average weekly interactions
    const weeklyInteractions = categorizedClients
      .map((c) => c.categorization?.data?.weekly_contact_volume || 0)
      .filter((v) => v > 0);

    const avgWeeklyInteractions =
      weeklyInteractions.length > 0
        ? weeklyInteractions.reduce((a, b) => a + b, 0) /
          weeklyInteractions.length
        : 0;

    return {
      totalClients,
      categorizedClients: categorizedCount,
      conversionRate: Math.round(conversionRate * 10) / 10,
      avgClosingLikelihood: Math.round(avgClosingLikelihood * 100) / 100,
      avgWeeklyInteractions: Math.round(avgWeeklyInteractions),
    };
  }

  private calculateIndustryDistribution(clients: any[]): DistributionItem[] {
    const industryCount: Record<string, number> = {};

    clients.forEach((client) => {
      const industry = client.categorization?.data?.industry || 'Sin categoría';
      industryCount[industry] = (industryCount[industry] || 0) + 1;
    });

    const total = clients.length;
    return Object.entries(industryCount)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? Math.round((value / total) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }

  private calculateConversionBySeller(clients: any[]): ConversionByItem[] {
    const sellerStats: Record<string, { total: number; closed: number }> = {};

    clients.forEach((client) => {
      const seller = client.seller || 'Sin asignar';
      if (!sellerStats[seller]) {
        sellerStats[seller] = { total: 0, closed: 0 };
      }
      sellerStats[seller].total++;
      if (client.closed) {
        sellerStats[seller].closed++;
      }
    });

    return Object.entries(sellerStats)
      .map(([name, stats]) => ({
        name,
        total: stats.total,
        closed: stats.closed,
        conversionRate:
          stats.total > 0
            ? Math.round((stats.closed / stats.total) * 1000) / 10
            : 0,
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate);
  }

  private calculateConversionByIndustry(clients: any[]): ConversionByItem[] {
    const industryStats: Record<string, { total: number; closed: number }> = {};

    clients.forEach((client) => {
      const industry = client.categorization?.data?.industry || 'Sin categoría';
      if (!industryStats[industry]) {
        industryStats[industry] = { total: 0, closed: 0 };
      }
      industryStats[industry].total++;
      if (client.closed) {
        industryStats[industry].closed++;
      }
    });

    return Object.entries(industryStats)
      .map(([name, stats]) => ({
        name,
        total: stats.total,
        closed: stats.closed,
        conversionRate:
          stats.total > 0
            ? Math.round((stats.closed / stats.total) * 1000) / 10
            : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }

  private calculateClosingLikelihoodDistribution(
    clients: any[],
  ): DistributionItem[] {
    const likelihoodCount: Record<string, number> = {
      High: 0,
      Medium: 0,
      Low: 0,
    };

    clients.forEach((client) => {
      const likelihood = client.categorization?.data?.closing_likelihood;
      if (likelihood && likelihoodCount.hasOwnProperty(likelihood)) {
        likelihoodCount[likelihood]++;
      }
    });

    const total = Object.values(likelihoodCount).reduce((a, b) => a + b, 0);
    return Object.entries(likelihoodCount).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? Math.round((value / total) * 1000) / 10 : 0,
    }));
  }

  private calculateSentimentConversion(clients: any[]): SentimentConversion[] {
    const sentimentStats: Record<string, { total: number; closed: number }> = {};

    clients.forEach((client) => {
      const sentiment =
        client.categorization?.data?.sentiment || 'No especificado';
      if (!sentimentStats[sentiment]) {
        sentimentStats[sentiment] = { total: 0, closed: 0 };
      }
      sentimentStats[sentiment].total++;
      if (client.closed) {
        sentimentStats[sentiment].closed++;
      }
    });

    return Object.entries(sentimentStats)
      .map(([sentiment, stats]) => ({
        sentiment,
        total: stats.total,
        closed: stats.closed,
        conversionRate:
          stats.total > 0
            ? Math.round((stats.closed / stats.total) * 1000) / 10
            : 0,
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate);
  }

  private calculatePainPointDistribution(clients: any[]): DistributionItem[] {
    const painPointCount: Record<string, number> = {};

    clients.forEach((client) => {
      const painPoint =
        client.categorization?.data?.main_pain_point || 'No especificado';
      painPointCount[painPoint] = (painPointCount[painPoint] || 0) + 1;
    });

    const total = clients.length;
    return Object.entries(painPointCount)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? Math.round((value / total) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }

  private calculateDiscoverySourceDistribution(
    clients: any[],
  ): DistributionItem[] {
    const sourceCount: Record<string, number> = {};

    clients.forEach((client) => {
      const source =
        client.categorization?.data?.discovery_source || 'No especificado';
      sourceCount[source] = (sourceCount[source] || 0) + 1;
    });

    const total = clients.length;
    return Object.entries(sourceCount)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? Math.round((value / total) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }

  private calculateCompanySizeConversion(clients: any[]): ConversionByItem[] {
    const sizeStats: Record<string, { total: number; closed: number }> = {
      small: { total: 0, closed: 0 },
      medium: { total: 0, closed: 0 },
      large: { total: 0, closed: 0 },
    };

    clients.forEach((client) => {
      const size = client.categorization?.data?.company_size;
      if (size && sizeStats.hasOwnProperty(size)) {
        sizeStats[size].total++;
        if (client.closed) {
          sizeStats[size].closed++;
        }
      }
    });

    const sizeLabels: Record<string, string> = {
      small: 'Pequeña (<100)',
      medium: 'Mediana (100-500)',
      large: 'Grande (>500)',
    };

    return Object.entries(sizeStats)
      .filter(([, stats]) => stats.total > 0)
      .map(([size, stats]) => ({
        name: sizeLabels[size] || size,
        total: stats.total,
        closed: stats.closed,
        conversionRate:
          stats.total > 0
            ? Math.round((stats.closed / stats.total) * 1000) / 10
            : 0,
      }));
  }

  private calculateConversionByPainPoint(clients: any[]): ConversionByItem[] {
    const painPointStats: Record<string, { total: number; closed: number }> = {};

    clients.forEach((client) => {
      const painPoint =
        client.categorization?.data?.main_pain_point || 'No especificado';
      if (!painPointStats[painPoint]) {
        painPointStats[painPoint] = { total: 0, closed: 0 };
      }
      painPointStats[painPoint].total++;
      if (client.closed) {
        painPointStats[painPoint].closed++;
      }
    });

    return Object.entries(painPointStats)
      .map(([name, stats]) => ({
        name,
        total: stats.total,
        closed: stats.closed,
        conversionRate:
          stats.total > 0
            ? Math.round((stats.closed / stats.total) * 1000) / 10
            : 0,
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate);
  }

  private calculateConversionByDiscoverySource(
    clients: any[],
  ): ConversionByItem[] {
    const sourceStats: Record<string, { total: number; closed: number }> = {};

    clients.forEach((client) => {
      const source =
        client.categorization?.data?.discovery_source || 'No especificado';
      if (!sourceStats[source]) {
        sourceStats[source] = { total: 0, closed: 0 };
      }
      sourceStats[source].total++;
      if (client.closed) {
        sourceStats[source].closed++;
      }
    });

    return Object.entries(sourceStats)
      .map(([name, stats]) => ({
        name,
        total: stats.total,
        closed: stats.closed,
        conversionRate:
          stats.total > 0
            ? Math.round((stats.closed / stats.total) * 1000) / 10
            : 0,
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate);
  }
}
