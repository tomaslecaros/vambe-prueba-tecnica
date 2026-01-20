import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { PrismaModule } from '@common/config/prisma.module';
import { CategorizationModule } from '@modules/categorization/categorization.module';

@Module({
  imports: [PrismaModule, CategorizationModule],
  providers: [UploadsService],
  controllers: [UploadsController],
})
export class UploadsModule {}
