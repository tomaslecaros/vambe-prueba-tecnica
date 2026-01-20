'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ClientProgress } from '@/types';

interface ClientDetailModalProps {
  client: ClientProgress | null;
  open: boolean;
  onClose: () => void;
}

export function ClientDetailModal({ client, open, onClose }: ClientDetailModalProps) {
  if (!client) return null;

  const { categories } = client;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-white text-black">
        <DialogHeader>
          <DialogTitle className="text-black">Detalle del Cliente</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-full pr-4">
          <div className="space-y-6">
            {/* Información Básica */}
            <div>
              <h3 className="font-semibold mb-3 text-black">Información Básica</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-black">{client.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-medium text-black">{client.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <Badge variant="secondary">{client.status}</Badge>
                </div>
              </div>
            </div>

            {/* Categorización */}
            {categories && (
              <>
                <div className="border-t pt-4 border-gray-200">
                  <h3 className="font-semibold mb-3 text-black">Categorización</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Industria</p>
                      <p className="font-medium text-black">{categories.industry}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tamaño de Empresa</p>
                      <p className="font-medium text-black">{categories.company_size}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Caso de Uso</p>
                      <p className="font-medium text-black">{categories.use_case}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Solución Actual</p>
                      <Badge variant="outline">{categories.current_solution}</Badge>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 border-gray-200">
                  <h3 className="font-semibold mb-3 text-black">Volumen de Contacto</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Volumen Semanal</p>
                      <p className="font-medium text-black">{categories.weekly_contact_volume.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tendencia</p>
                      <Badge variant="secondary">{categories.volume_trend}</Badge>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 border-gray-200">
                  <h3 className="font-semibold mb-3 text-black">Detalles Adicionales</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pain Point Principal</p>
                      <p className="text-sm text-black">{categories.main_pain_point}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Fuente de Descubrimiento</p>
                      <p className="text-sm text-black">{categories.discovery_source}</p>
                    </div>

                    {categories.integration_needs.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Necesidades de Integración</p>
                        <div className="flex flex-wrap gap-2">
                          {categories.integration_needs.map((req, index) => (
                            <Badge key={index} variant="outline">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {categories.query_topics.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Temas de Consulta</p>
                        <div className="flex flex-wrap gap-2">
                          {categories.query_topics.map((topic, index) => (
                            <Badge key={index} variant="outline">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {categories.summary && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Resumen</p>
                        <p className="text-sm bg-gray-100 text-black p-3 rounded">
                          {categories.summary}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {!categories && (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  Este cliente aún no ha sido categorizado
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
