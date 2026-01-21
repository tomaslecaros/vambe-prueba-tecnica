import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';
import { PredictionService } from './prediction.service';
import { PredictRequestDto } from './dto/prediction.dto';
import {
  PredictionStatusResponseDto,
  TrainResponseDto,
  TrainErrorResponseDto,
  PredictionResponseDto,
  PredictionErrorResponseDto,
} from './dto/prediction.dto';

@Controller('prediction')
export class PredictionController {
  constructor(private readonly predictionService: PredictionService) {}

  @Get('status')
  async getStatus(): Promise<PredictionStatusResponseDto> {
    return this.predictionService.getStatus();
  }

  @Post('train')
  async train(): Promise<TrainResponseDto | TrainErrorResponseDto> {
    const result = await this.predictionService.startTraining();
    
    if ('error' in result) {
      throw new BadRequestException(result);
    }
    
    return result;
  }

  @Post()
  async predict(
    @Body() body: PredictRequestDto,
  ): Promise<PredictionResponseDto | PredictionErrorResponseDto> {
    const result = await this.predictionService.predict(body.transcription);
    
    if ('error' in result) {
      throw new BadRequestException(result);
    }
    
    return result;
  }
}
