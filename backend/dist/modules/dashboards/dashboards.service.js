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
        const sellerByDiscoverySource = this.calculateSellerCrossMatrix(clientsWithCategories, 'discovery_source');
        const sellerByPainPoint = this.calculateSellerCrossMatrix(clientsWithCategories, 'main_pain_point');
        const closureByIntegrationNeeds = this.calculateClosureByArrayField(categorizedClients, 'integration_needs');
        const closureByQueryTopics = this.calculateClosureByArrayField(categorizedClients, 'query_topics');
        const categoryCrossMatrices = this.calculateCategoryCrossMatrices(categorizedClients);
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
            closureByIntegrationNeeds,
            closureByQueryTopics,
            categoryCrossMatrices,
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
        const monthlyClosures = this.calculateMonthlyClosures(allClients);
        const sortedMonths = [...monthlyClosures].sort((a, b) => b.month.localeCompare(a.month));
        const lastMonth = sortedMonths[0] || { closed: 0, total: 0, closureRate: 0 };
        const previousMonth = sortedMonths[1] || { closed: 0, total: 0, closureRate: 0 };
        const monthOverMonthChange = previousMonth.closureRate > 0
            ? lastMonth.closureRate - previousMonth.closureRate
            : lastMonth.closureRate > 0 ? lastMonth.closureRate : 0;
        return {
            totalClients,
            categorizedClients: categorizedCount,
            closureRate: Math.round(closureRate * 10) / 10,
            avgWeeklyInteractions: Math.round(avgWeeklyInteractions),
            monthlyClosures,
            lastMonthClosureRate: Math.round(lastMonth.closureRate * 10) / 10,
            previousMonthClosureRate: Math.round(previousMonth.closureRate * 10) / 10,
            monthOverMonthChange: Math.round(monthOverMonthChange * 10) / 10,
        };
    }
    calculateMonthlyClosures(clients) {
        const monthlyStats = {};
        clients.forEach((client) => {
            const meetingDate = new Date(client.meetingDate);
            const monthKey = `${meetingDate.getFullYear()}-${String(meetingDate.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyStats[monthKey]) {
                monthlyStats[monthKey] = { total: 0, closed: 0 };
            }
            monthlyStats[monthKey].total++;
            if (client.closed) {
                monthlyStats[monthKey].closed++;
            }
        });
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return Object.entries(monthlyStats)
            .map(([monthKey, stats]) => {
            const [year, month] = monthKey.split('-');
            const monthIndex = parseInt(month, 10) - 1;
            return {
                month: monthKey,
                label: `${monthNames[monthIndex]} ${year}`,
                total: stats.total,
                closed: stats.closed,
                closureRate: stats.total > 0
                    ? Math.round((stats.closed / stats.total) * 1000) / 10
                    : 0,
            };
        })
            .sort((a, b) => b.month.localeCompare(a.month));
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
    calculateSellerCrossMatrix(clients, dimensionField) {
        const sellersSet = new Set();
        const dimensionsSet = new Set();
        const matrixData = {};
        clients.forEach((client) => {
            const seller = client.seller || 'Sin asignar';
            const dimension = client.categorization?.data?.[dimensionField] || 'No especificado';
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
        const matrix = [];
        for (const seller of sellers) {
            for (const dimension of dimensions) {
                const stats = matrixData[seller]?.[dimension] || { total: 0, closed: 0 };
                const closureRate = stats.total > 0
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
    calculateClosureByArrayField(clients, fieldName) {
        const stats = {};
        clients.forEach((client) => {
            const values = client.categorization?.data?.[fieldName] || [];
            const isClosed = client.closed;
            values.forEach((value) => {
                if (!value)
                    return;
                if (!stats[value]) {
                    stats[value] = { total: 0, closed: 0 };
                }
                stats[value].total++;
                if (isClosed) {
                    stats[value].closed++;
                }
            });
        });
        return Object.entries(stats)
            .map(([name, data]) => ({
            name,
            total: data.total,
            closed: data.closed,
            closureRate: data.total > 0
                ? Math.round((data.closed / data.total) * 1000) / 10
                : 0,
        }))
            .sort((a, b) => b.closureRate - a.closureRate);
    }
    calculateCategoryCrossMatrices(clients) {
        const combinations = [
            { key: 'industryByPainPoint', row: 'industry', col: 'main_pain_point' },
            { key: 'industryByDiscoverySource', row: 'industry', col: 'discovery_source' },
            { key: 'industryByUseCase', row: 'industry', col: 'use_case' },
            { key: 'painPointByDiscoverySource', row: 'main_pain_point', col: 'discovery_source' },
            { key: 'painPointByUseCase', row: 'main_pain_point', col: 'use_case' },
            { key: 'discoverySourceByUseCase', row: 'discovery_source', col: 'use_case' },
        ];
        const result = {};
        for (const combo of combinations) {
            result[combo.key] = this.calculateCategoryCrossMatrix(clients, combo.row, combo.col);
        }
        return result;
    }
    calculateCategoryCrossMatrix(clients, rowField, colField) {
        const rowsSet = new Set();
        const colsSet = new Set();
        const matrixData = {};
        clients.forEach((client) => {
            const rowValue = client.categorization?.data?.[rowField] || 'No especificado';
            const colValue = client.categorization?.data?.[colField] || 'No especificado';
            rowsSet.add(rowValue);
            colsSet.add(colValue);
            if (!matrixData[rowValue]) {
                matrixData[rowValue] = {};
            }
            if (!matrixData[rowValue][colValue]) {
                matrixData[rowValue][colValue] = { total: 0, closed: 0 };
            }
            matrixData[rowValue][colValue].total++;
            if (client.closed) {
                matrixData[rowValue][colValue].closed++;
            }
        });
        const rows = Array.from(rowsSet).sort();
        const cols = Array.from(colsSet).sort();
        const matrix = [];
        for (const row of rows) {
            for (const col of cols) {
                const stats = matrixData[row]?.[col] || { total: 0, closed: 0 };
                const closureRate = stats.total > 0
                    ? Math.round((stats.closed / stats.total) * 1000) / 10
                    : 0;
                matrix.push({
                    row,
                    col,
                    closureRate,
                    total: stats.total,
                    closed: stats.closed,
                });
            }
        }
        return {
            rows,
            cols,
            matrix,
        };
    }
};
exports.DashboardsService = DashboardsService;
exports.DashboardsService = DashboardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardsService);
//# sourceMappingURL=dashboards.service.js.map