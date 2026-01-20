'use client';

import { Card } from '@/components/ui/card';
import { Users, UserPlus, UserX, AlertCircle } from 'lucide-react';

interface StatsCardsProps {
  total: number;
  newClients: number;
  duplicates: number;
  errors: number;
}

export function StatsCards({ total, newClients, duplicates, errors }: StatsCardsProps) {
  const stats = [
    {
      label: 'Total Registros',
      value: total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Nuevos Clientes',
      value: newClients,
      icon: UserPlus,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Duplicados',
      value: duplicates,
      icon: UserX,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Errores',
      value: errors,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
