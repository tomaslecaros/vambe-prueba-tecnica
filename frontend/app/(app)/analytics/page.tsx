export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-2">
        <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Gráfico por Industria</p>
        </div>
        <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Conversión por Vendedor</p>
        </div>
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Analytics</h2>
          <p className="text-muted-foreground">Métricas y gráficos detallados</p>
        </div>
      </div>
    </div>
  );
}
