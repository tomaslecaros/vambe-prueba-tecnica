"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var LlmService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlmService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = __importDefault(require("openai"));
let LlmService = LlmService_1 = class LlmService {
    configService;
    logger = new common_1.Logger(LlmService_1.name);
    openai;
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('OPENAI_API_KEY');
        this.openai = new openai_1.default({ apiKey });
    }
    async extractCategoriesFromTranscription(transcription) {
        this.logger.log('Sending transcription to OpenAI for categorization...');
        const prompt = this.buildCategorizationPrompt(transcription);
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert sales analyst. Extract categories from meeting transcriptions. Return ONLY valid JSON.',
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
    buildCategorizationPrompt(transcription) {
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
};
exports.LlmService = LlmService;
exports.LlmService = LlmService = LlmService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LlmService);
//# sourceMappingURL=llm.service.js.map