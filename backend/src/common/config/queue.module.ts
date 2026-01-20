import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Soporte para REDIS_URL (Upstash, Railway, etc.)
        const redisUrl = configService.get<string>('REDIS_URL');
        
        if (redisUrl) {
          // Parsear la URL de Redis (rediss:// o redis://)
          try {
            const url = new URL(redisUrl);
            const redisConfig: any = {
              host: url.hostname,
              port: parseInt(url.port) || (url.protocol === 'rediss:' ? 6380 : 6379),
            };
            
            // Agregar password si existe
            if (url.password) {
              redisConfig.password = decodeURIComponent(url.password);
            }
            
            // Agregar TLS si es rediss://
            if (url.protocol === 'rediss:') {
              redisConfig.tls = {
                rejectUnauthorized: false, // Para Upstash
              };
            }
            
            return { redis: redisConfig };
          } catch (error) {
            // Fall through to individual vars
          }
        }
        
        // Fallback a variables individuales
        const host = configService.get('REDIS_HOST', 'localhost');
        const port = configService.get('REDIS_PORT', 6379);
        const password = configService.get('REDIS_PASSWORD');
        return {
          redis: {
            host,
            port,
            password,
            tls: configService.get('REDIS_TLS') === 'true' ? { rejectUnauthorized: false } : undefined,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
