'use client';

import { Card } from '@/components/ui/card';
import { Target, Users, TrendingUp, Clock } from 'lucide-react';
import type { DashboardsKpiStats, ClosureByItem } from '@/types';

interface ConversionKpisProps {
  kpis: DashboardsKpiStats;
  topIndustry?: ClosureByItem;
  topSeller?: ClosureByItem;
}

export function ConversionKpis({ kpis, topIndustry, topSeller }: ConversionKpisProps) {
  const closedClients = Math.round((kpis.totalClients * kpis.closureRate) / 100);
  const openClients = kpis.totalClients - closedClients;
  const pendingCategorization = kpis.totalClients - kpis.categorizedClients;

  const kpiCards = [
    {
      title: 'Tasa de Cierre',
      value: `${kpis.closureRate.toFixed(1)}%`,
      description: `${closedClients} cerrados de ${kpis.totalClients}`,
      icon: Target,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Clientes Cerrados',
      value: closedClients.toLocaleString(),
      description: 'Ventas concretadas',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Clientes Abiertos',
      value: openClients.toLocaleString(),
      description: 'Oportunidades activas',
      icon: Users,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Sin Categorizar',
      value: pendingCategorization.toLocaleString(),
      description: pendingCategorization === 0 ? 'Todo categorizado' : 'Pendientes de análisis',
      icon: Clock,
      color: pendingCategorization === 0 ? 'text-emerald-600' : 'text-slate-500',
      bgColor: pendingCategorization === 0 ? 'bg-emerald-50' : 'bg-slate-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </p>
                  <p className="text-3xl font-bold tracking-tight">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">
                    {kpi.description}
                  </p>
                </div>
                <div className={`rounded-full p-3 ${kpi.bgColor}`}>
                  <Icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Summary Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        {topSeller && (
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full p-2 bg-emerald-50">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Mejor Vendedor</p>
                <p className="text-xl font-bold">{topSeller.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="text-emerald-600 font-medium">{topSeller.closureRate.toFixed(1)}%</span> de cierre
                  ({topSeller.closed}/{topSeller.total} clientes)
                </p>
              </div>
            </div>
          </Card>
        )}

        {topIndustry && (
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full p-2 bg-blue-50">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">Mejor Industria</p>
                <p className="text-xl font-bold">{topIndustry.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="text-blue-600 font-medium">{topIndustry.closureRate.toFixed(1)}%</span> de cierre
                  ({topIndustry.closed}/{topIndustry.total} clientes)
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
