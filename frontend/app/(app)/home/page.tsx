import { Card } from '@/components/ui/card';
import { Upload, TrendingUp, BarChart3, FileText, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Bienvenido a Vambe</h1>
        <p className="text-gray-600">
          Sistema de Categorización de Clientes con IA
        </p>
      </div>

      {/* Cómo Usar */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Cómo Usar la Aplicación</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-semibold">Prepara tu Archivo</h3>
            </div>
            <p className="text-sm text-gray-600">
              Necesitas un archivo Excel (.xlsx) o CSV con las siguientes columnas:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 pl-4">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Nombre</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Correo Electronico</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Numero de Telefono</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Fecha de la Reunion</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Vendedor asignado</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>closed (true/false)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Transcripcion</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-semibold">Sube tu Archivo</h3>
            </div>
            <p className="text-sm text-gray-600">
              Ve a la sección <strong>Uploads</strong> y arrastra tu archivo o haz clic para seleccionarlo.
            </p>
            <ul className="text-sm text-gray-600 space-y-2 pl-4">
              <li>• El sistema validará automáticamente el formato</li>
              <li>• Los clientes duplicados (email + teléfono) se detectarán</li>
              <li>• Verás el progreso en tiempo real</li>
            </ul>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-semibold">Visualiza Resultados</h3>
            </div>
            <p className="text-sm text-gray-600">
              Una vez procesado, podrás ver toda la información categorizada automáticamente por IA.
            </p>
            <ul className="text-sm text-gray-600 space-y-2 pl-4">
              <li>• Dashboard con métricas clave</li>
              <li>• Analytics de conversión</li>
              <li>• Tabla completa de clientes</li>
              <li>• Detalles de categorización</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Funcionalidades Principales</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <Upload className="h-8 w-8" />
              <h3 className="font-semibold">Uploads</h3>
            </div>
            <p className="text-sm text-gray-600">
              Sube archivos Excel o CSV, visualiza el progreso de procesamiento en tiempo real
              y accede a la tabla completa de todos los clientes con sus categorizaciones.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8" />
              <h3 className="font-semibold">Analytics</h3>
            </div>
            <p className="text-sm text-gray-600">
              Próximamente: gráficos de conversión por industria, tendencias temporales,
              análisis de sentimiento y más métricas para optimizar tu proceso de ventas.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8" />
              <h3 className="font-semibold">Dashboard</h3>
            </div>
            <p className="text-sm text-gray-600">
              Próximamente: vista general con KPIs, resúmenes ejecutivos y accesos rápidos
              a las funcionalidades más importantes del sistema.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8" />
              <h3 className="font-semibold">Categorización IA</h3>
            </div>
            <p className="text-sm text-gray-600">
              Extracción automática de: Industria, Pain Points, Sentimiento, Presupuesto,
              Objeciones, Siguientes Pasos y Probabilidad de Cierre usando GPT.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
