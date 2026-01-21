import { PredictionService } from './prediction.service';
import { PredictRequestDto } from './dto/prediction.dto';
import { PredictionStatusResponseDto, TrainResponseDto, TrainErrorResponseDto, PredictionResponseDto, PredictionErrorResponseDto } from './dto/prediction.dto';
export declare class PredictionController {
    private readonly predictionService;
    constructor(predictionService: PredictionService);
    getStatus(): Promise<PredictionStatusResponseDto>;
    train(): Promise<TrainResponseDto | TrainErrorResponseDto>;
    predict(body: PredictRequestDto): Promise<PredictionResponseDto | PredictionErrorResponseDto>;
}
