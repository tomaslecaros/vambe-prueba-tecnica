"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/services/prisma.service");
let DashboardsService = class DashboardsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboards() {
        const clientsWithCategories = await this.prisma.client.findMany({
            include: {
                categorization: true,
            },
        });
        const categorizedClients = clientsWithCategories.filter((c) => c.categorization !== null);
        const kpis = this.calculateKpis(clientsWithCategories, categorizedClients);
        const closureBySeller = this.calculateClosureBySeller(clientsWithCategories);
        const closureByIndustry = this.calculateClosureByIndustry(categorizedClients);
        const closureByPainPoint = this.calculateClosureByPainPoint(categorizedClients);
        const closureByDiscoverySource = this.calculateClosureByDiscoverySource(categorizedClients);
        const painPointIndustryMatrix = this.calculatePainPointIndustryMatrix(categorizedClients);
        const sellerExpertiseByIndustry = this.calculateSellerExpertiseByIndustry(clientsWithCategories);
        return {
            kpis,
            closureBySeller,
            closureByIndustry,
            closureByPainPoint,
            closureByDiscoverySource,
            painPointIndustryMatrix,
            sellerExpertiseByIndustry,
        };
    }
    calculateKpis(allClients, categorizedClients) {
        const totalClients = allClients.length;
        const categorizedCount = categorizedClients.length;
        const closedCount = allClients.filter((c) => c.closed).length;
        const closureRate = totalClients > 0 ? (closedCount / totalClients) * 100 : 0;
        const weeklyInteractions = categorizedClients
            .map((c) => c.categorization?.data?.weekly_contact_volume || 0)
            .filter((v) => v > 0);
        const avgWeeklyInteractions = weeklyInteractions.length > 0
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
    calculateClosureBySeller(clients) {
        const sellerStats = {};
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
            closureRate: stats.total > 0
                ? Math.round((stats.closed / stats.total) * 1000) / 10
                : 0,
        }))
            .sort((a, b) => b.closureRate - a.closureRate);
    }
    calculateClosureByIndustry(clients) {
        const industryStats = {};
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
            closureRate: stats.total > 0
                ? Math.round((stats.closed / stats.total) * 1000) / 10
                : 0,
        }))
            .sort((a, b) => b.total - a.total);
    }
    calculateClosureByPainPoint(clients) {
        const painPointStats = {};
        clients.forEach((client) => {
            const painPoint = client.categorization?.data?.main_pain_point || 'No especificado';
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
            closureRate: stats.total > 0
                ? Math.round((stats.closed / stats.total) * 1000) / 10
                : 0,
        }))
            .sort((a, b) => b.closureRate - a.closureRate);
    }
    calculateClosureByDiscoverySource(clients) {
        const sourceStats = {};
        clients.forEach((client) => {
            const source = client.categorization?.data?.discovery_source || 'No especificado';
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
            closureRate: stats.total > 0
                ? Math.round((stats.closed / stats.total) * 1000) / 10
                : 0,
        }))
            .sort((a, b) => b.closureRate - a.closureRate);
    }
    calculatePainPointIndustryMatrix(clients) {
        const painPointsSet = new Set();
        const industriesSet = new Set();
        const matrixData = {};
        clients.forEach((client) => {
            const painPoint = client.categorization?.data?.main_pain_point || 'No especificado';
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
        const matrix = [];
        for (const painPoint of painPoints) {
            for (const industry of industries) {
                const stats = matrixData[painPoint]?.[industry] || { total: 0, closed: 0 };
                const closureRate = stats.total > 0
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
    calculateSellerExpertiseByIndustry(clients) {
        const sellerData = {};
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
        return Object.entries(sellerData).map(([sellerName, industries]) => {
            const expertise = Object.entries(industries)
                .map(([industry, stats]) => {
                const closureRate = stats.total > 0
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
};
exports.DashboardsService = DashboardsService;
exports.DashboardsService = DashboardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardsService);
//# sourceMappingURL=dashboards.service.js.map