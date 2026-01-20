'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

export function AppNavigation() {
  const pathname = usePathname();

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/home"
              className={cn(
                navigationMenuTriggerStyle(),
                pathname === '/home' && 'border-b-2 border-black rounded-none'
              )}
            >
              Home
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/dashboard"
              className={cn(
                navigationMenuTriggerStyle(),
                pathname === '/dashboard' && 'border-b-2 border-black rounded-none'
              )}
            >
              Dashboard
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/analytics"
              className={cn(
                navigationMenuTriggerStyle(),
                pathname === '/analytics' && 'border-b-2 border-black rounded-none'
              )}
            >
              Analytics
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/uploads"
              className={cn(
                navigationMenuTriggerStyle(),
                pathname === '/uploads' && 'border-b-2 border-black rounded-none'
              )}
            >
              Uploads
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
