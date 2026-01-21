'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, TrendingUp, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navigationItems = [
  {
    href: '/home',
    label: 'Inicio',
    icon: Home,
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: BarChart3,
  },
  {
    href: '/analytics',
    label: 'Analytics',
    icon: TrendingUp,
  },
  {
    href: '/uploads',
    label: 'Uploads',
    icon: Upload,
  },
];

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Button
            key={item.href}
            asChild
            variant={isActive ? 'secondary' : 'ghost'}
            className={cn(
              'relative h-10 px-4 gap-2 font-medium transition-all',
              isActive && 'bg-primary/10 text-primary hover:bg-primary/15'
            )}
          >
            <Link href={item.href}>
              <Icon className={cn('h-4 w-4', isActive && 'text-primary')} />
              <span>{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
