import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';
import {
  DashboardsResponse,
  KpiStats,
  ClosureByItem,
  PainPointIndustryMatrix,
  SellerExpertise,
  SellerCrossMatrix,
} from './dto/dashboards.dto';

@Injectable()
export class DashboardsService {
  constructor(private prisma: PrismaService) {}

  async getDashboards(): Promise<DashboardsResponse> {
    const clientsWithCategories = await this.prisma.client.findMany({
      include: {
        categorization: true,
      },
    });

    const categorizedClients = clientsWithCategories.filter(
      (c) => c.categorization !== null,
    );

    const kpis = this.calculateKpis(clientsWithCategories, categorizedClients);
    const closureBySeller = this.calculateClosureBySeller(clientsWithCategories);
    const closureByIndustry = this.calculateClosureByIndustry(categorizedClients);
    const closureByPainPoint =
      this.calculateClosureByPainPoint(categorizedClients);
    const closureByDiscoverySource =
      this.calculateClosureByDiscoverySource(categorizedClients);
    const painPointIndustryMatrix =
      this.calculatePainPointIndustryMatrix(categorizedClients);
    const sellerExpertiseByIndustry =
      this.calculateSellerExpertiseByIndustry(clientsWithCategories);
    const sellerByDiscoverySource =
      this.calculateSellerCrossMatrix(clientsWithCategories, 'discovery_source');
    const sellerByPainPoint =
      this.calculateSellerCrossMatrix(clientsWithCategories, 'main_pain_point');

    return {
      kpis,
      closureBySeller,
      closureByIndustry,
      closureByPainPoint,
      closureByDiscoverySource,
      painPointIndustryMatrix,
      sellerExpertiseByIndustry,
      sellerByDiscoverySource,
      sellerByPainPoint,
    };
  }

  private calculateKpis(
    allClients: any[],
    categorizedClients: any[],
  ): KpiStats {
    const totalClients = allClients.length;
    const categorizedCount = categorizedClients.length;
    const closedCount = allClients.filter((c) => c.closed).length;
    const closureRate =
      totalClients > 0 ? (closedCount / totalClients) * 100 : 0;

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
      closureRate: Math.round(closureRate * 10) / 10,
      avgWeeklyInteractions: Math.round(avgWeeklyInteractions),
    };
  }

  private calculateClosureBySeller(clients: any[]): ClosureByItem[] {
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
        closureRate:
          stats.total > 0
            ? Math.round((stats.closed / stats.total) * 1000) / 10
            : 0,
      }))
      .sort((a, b) => b.closureRate - a.closureRate);
  }

  private calculateClosureByIndustry(clients: any[]): ClosureByItem[] {
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
        closureRate:
          stats.total > 0
            ? Math.round((stats.closed / stats.total) * 1000) / 10
            : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }

  private calculateClosureByPainPoint(clients: any[]): ClosureByItem[] {
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
        closureRate:
          stats.total > 0
            ? Math.round((stats.closed / stats.total) * 1000) / 10
            : 0,
      }))
      .sort((a, b) => b.closureRate - a.closureRate);
  }

  private calculateClosureByDiscoverySource(clients: any[]): ClosureByItem[] {
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
        closureRate:
          stats.total > 0
            ? Math.round((stats.closed / stats.total) * 1000) / 10
            : 0,
      }))
      .sort((a, b) => b.closureRate - a.closureRate);
  }

  private calculatePainPointIndustryMatrix(
    clients: any[],
  ): PainPointIndustryMatrix {
    const painPointsSet = new Set<string>();
    const industriesSet = new Set<string>();
    const matrixData: Record<string, Record<string, { total: number; closed: number }>> = {};

    // Collect all unique pain points and industries, and build matrix data
    clients.forEach((client) => {
      const painPoint =
        client.categorization?.data?.main_pain_point || 'No especificado';
      const industry = client.categorization?.data?.industry || 'Sin categoría';

      painPointsSet.add(painPoint);
      industriesSet.add(industry);

      if (!matrixData[painPoint]) {
        matrixData[painPoint] = {};
      }
      if (!matrixData[painPoint][industry]) {
        matrixData[painPoint][industry] = { total: 0, closed: 0 };
      }

      matrixData[painPoint][industry].total++;
      if (client.closed) {
        matrixData[painPoint][industry].closed++;
      }
    });

    const painPoints = Array.from(painPointsSet).sort();
    const industries = Array.from(industriesSet).sort();

    // Build matrix array
    const matrix: {
      painPoint: string;
      industry: string;
      closureRate: number;
      total: number;
      closed: number;
    }[] = [];
    for (const painPoint of painPoints) {
      for (const industry of industries) {
        const stats = matrixData[painPoint]?.[industry] || { total: 0, closed: 0 };
        const closureRate =
          stats.total > 0
            ? Math.round((stats.closed / stats.total) * 1000) / 10
            : 0;

        matrix.push({
          painPoint,
          industry,
          closureRate,
          total: stats.total,
          closed: stats.closed,
        });
      }
    }

    return {
      painPoints,
      industries,
      matrix,
    };
  }

  private calculateSellerExpertiseByIndustry(
    clients: any[],
  ): SellerExpertise[] {
    const sellerData: Record<
      string,
      Record<string, { total: number; closed: number }>
    > = {};

    // Group by seller and industry
    clients.forEach((client) => {
      const seller = client.seller || 'Sin asignar';
      const industry = client.categorization?.data?.industry || 'Sin categoría';

      if (!sellerData[seller]) {
        sellerData[seller] = {};
      }
      if (!sellerData[seller][industry]) {
        sellerData[seller][industry] = { total: 0, closed: 0 };
      }

      sellerData[seller][industry].total++;
      if (client.closed) {
        sellerData[seller][industry].closed++;
      }
    });

    // Build expertise array for each seller
    return Object.entries(sellerData).map(([sellerName, industries]) => {
      const expertise = Object.entries(industries)
        .map(([industry, stats]) => {
          const closureRate =
            stats.total > 0
              ? Math.round((stats.closed / stats.total) * 1000) / 10
              : 0;

          return {
            industry,
            closureRate,
            totalDeals: stats.total,
            closedDeals: stats.closed,
          };
        })
        .sort((a, b) => b.closureRate - a.closureRate);

      return {
        sellerName,
        expertise,
      };
    });
  }

  private calculateSellerCrossMatrix(
    clients: any[],
    dimensionField: string,
  ): SellerCrossMatrix {
    const sellersSet = new Set<string>();
    const dimensionsSet = new Set<string>();
    const matrixData: Record<
      string,
      Record<string, { total: number; closed: number }>
    > = {};

    clients.forEach((client) => {
      const seller = client.seller || 'Sin asignar';
      const dimension =
        client.categorization?.data?.[dimensionField] || 'No especificado';

      sellersSet.add(seller);
      dimensionsSet.add(dimension);

      if (!matrixData[seller]) {
        matrixData[seller] = {};
      }
      if (!matrixData[seller][dimension]) {
        matrixData[seller][dimension] = { total: 0, closed: 0 };
      }

      matrixData[seller][dimension].total++;
      if (client.closed) {
        matrixData[seller][dimension].closed++;
      }
    });

    const sellers = Array.from(sellersSet).sort();
    const dimensions = Array.from(dimensionsSet).sort();

    const matrix: SellerCrossMatrix['matrix'] = [];
    for (const seller of sellers) {
      for (const dimension of dimensions) {
        const stats = matrixData[seller]?.[dimension] || { total: 0, closed: 0 };
        const closureRate =
          stats.total > 0
            ? Math.round((stats.closed / stats.total) * 1000) / 10
            : 0;

        matrix.push({
          seller,
          dimension,
          closureRate,
          total: stats.total,
          closed: stats.closed,
        });
      }
    }

    return {
      sellers,
      dimensions,
      matrix,
    };
  }
}
