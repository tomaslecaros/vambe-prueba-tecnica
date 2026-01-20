import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { CategoriesDto } from './dto/categories.dto';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.openai = new OpenAI({ apiKey });
  }

  async extractCategoriesFromTranscription(
    transcription: string,
  ): Promise<CategoriesDto> {
    this.logger.log('Sending transcription to OpenAI for categorization...');

    const prompt = this.buildCategorizationPrompt(transcription);

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert sales analyst. Extract categories from meeting transcriptions. Return ONLY valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    this.logger.log('Successfully received categorization from OpenAI');

    return JSON.parse(content);
  }

  private buildCategorizationPrompt(transcription: string): string {
    return `Analiza esta transcripción de reunión de ventas y extrae las siguientes categorías:

TRANSCRIPCIÓN:
${transcription}

Devuelve un objeto JSON con estos campos (sigue el formato exacto):

{
  "industry": "una de: Finanzas | Retail/E-commerce | Salud | Tecnología | Educación | Logística/Transporte | Turismo | Consultoría | Gastronomía | Legal | Eventos | Inmobiliario | ONG | Diseño/Creativos | Construcción | Energía | Moda | Agricultura | Otro",

  "company_size": "una de: Pequeña | Mediana | Grande | No especificado (basado en volumen: <100/semana=Pequeña, 100-500=Mediana, >500=Grande)",

  "weekly_contact_volume": número (extraer el número mencionado de interacciones semanales, 0 si no se menciona),

  "volume_trend": "una de: Creciente | Estable | Estacional | No especificado",

  "main_pain_point": "una de: Alto volumen | Consultas repetitivas | Respuesta lenta | Procesos manuales | Multicanal | Escalabilidad | Soporte técnico | Clientes internacionales | Otro",

  "current_solution": "una de: Manual | Automatización parcial | Otra herramienta | No especificado",

  "discovery_source": "una de: Evento/Conferencia | Búsqueda online | Referido | Redes sociales | Artículo/Podcast | Foro/Comunidad | Otro",

  "use_case": "una de: Atención al cliente | Soporte técnico | Ventas/Pre-venta | E-commerce | Reservas/Citas | Logística | Otro",

  "integration_needs": ["array de: CRM | ERP | E-commerce | Tickets | Calendario/Reservas | Pagos | Sistema propio | Ninguna | Otro"],

  "query_topics": ["array de temas que consultan los clientes, elegir de: Envíos/Logística | Devoluciones | Disponibilidad/Stock | Precios/Cotizaciones | Citas/Reservas | Horarios | Soporte técnico | Información de productos | Programas/Servicios | Pagos/Facturación | Garantías | Promociones/Descuentos | Estado de pedidos | Registro/Inscripción | Otro"],

  "summary": "1-2 oraciones resumiendo la situación y necesidades del cliente"
}

IMPORTANTE: Devuelve SOLO el JSON válido, sin texto adicional.`;
  }
}
