import { AppNavigation } from '@/components/app-navigation';
import { Sparkles } from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Vambe
              </span>
            </div>

            {/* Navigation */}
            <div className="flex-1 flex justify-center">
              <AppNavigation />
            </div>

            {/* Right spacer for balance */}
            <div className="w-[120px]"></div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6">{children}</main>
    </div>
  );
}
