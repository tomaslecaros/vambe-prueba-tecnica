import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@common/config/prisma.module';
import { QueueModule } from '@common/config/queue.module';
import { UploadsModule } from '@modules/uploads/uploads.module';
import { LlmModule } from '@modules/llm/llm.module';
import { CategorizationModule } from '@modules/categorization/categorization.module';
import { ClientsModule } from '@modules/clients/clients.module';
import { DashboardsModule } from '@modules/dashboards/dashboards.module';
import { PredictionModule } from '@modules/prediction/prediction.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    QueueModule,
    PrismaModule,
    UploadsModule,
    LlmModule,
    CategorizationModule,
    ClientsModule,
    DashboardsModule,
    PredictionModule,
  ],
})
export class AppModule {}
