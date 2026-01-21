'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SellerExpertise } from '@/types';
import { AlertCircle, Trophy, Star } from 'lucide-react';

interface SellerExpertiseTableProps {
  data: SellerExpertise[];
}

export function SellerExpertiseTable({ data }: SellerExpertiseTableProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expertise por Vendedor</CardTitle>
          <CardDescription>Especialización de cada vendedor por industria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No hay datos disponibles</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Para cada vendedor, encontrar su mejor industria
  const sellerBestIndustries = data.map((seller) => {
    const bestIndustry = seller.expertise
      .filter((e) => e.totalDeals >= 2) // Al menos 2 deals para ser significativo
      .sort((a, b) => b.closureRate - a.closureRate)[0];

    return {
      name: seller.sellerName,
      bestIndustry: bestIndustry?.industry || 'N/A',
      closureRate: bestIndustry?.closureRate || 0,
      deals: bestIndustry ? `${bestIndustry.closedDeals}/${bestIndustry.totalDeals}` : '-',
      allExpertise: seller.expertise.filter((e) => e.totalDeals >= 2).sort((a, b) => b.closureRate - a.closureRate),
    };
  }).sort((a, b) => b.closureRate - a.closureRate);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Expertise por Industria
        </CardTitle>
        <CardDescription>
          Industria donde cada vendedor tiene mejor rendimiento (mín. 2 clientes)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sellerBestIndustries.map((seller, index) => (
            <div
              key={seller.name}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">{seller.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {seller.bestIndustry !== 'N/A' && (
                      <>
                        <Badge variant="outline" className="text-xs">
                          {seller.bestIndustry}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {seller.deals} clientes
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                {seller.closureRate > 0 ? (
                  <>
                    <p className="text-lg font-bold text-chart-1">
                      {seller.closureRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">cierre</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin datos suficientes</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Insight */}
        <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm">
          <div className="flex items-start gap-2">
            <Star className="h-4 w-4 text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium">Recomendación</p>
              <p className="text-muted-foreground text-xs mt-1">
                Asigna leads según la expertise de cada vendedor para maximizar la tasa de cierre.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
