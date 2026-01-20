import { AppNavigation } from '@/components/app-navigation';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-bold">Vambe</div>
          <div className="flex-1 flex justify-center">
            <AppNavigation />
          </div>
          <div className="w-[80px]"></div>
        </div>
      </header>
      <main className="container mx-auto">{children}</main>
    </div>
  );
}
