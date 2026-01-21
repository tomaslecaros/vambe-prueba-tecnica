'use client';

import { SellerConversionChart } from './seller-conversion-chart';
import type { ClosureByItem } from '@/types';

interface DiscoverySourceDonutChartProps {
  data: ClosureByItem[];
}

export function DiscoverySourceDonutChart({ data }: DiscoverySourceDonutChartProps) {
  return (
    <SellerConversionChart
      data={data}
      title="Fuentes de Descubrimiento"
      description={`${data.length} fuentes - Distribución y tasa de cierre`}
      sortBy="total"
      primaryMetric="total"
      maxItems={data.length}
      showMetrics={false}
    />
  );
}
