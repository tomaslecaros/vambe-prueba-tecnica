import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PrismaService } from '@common/services/prisma.service';
import { PREDICTION_TRAINING_QUEUE, MINIMUM_TRAINING_SAMPLES } from '@common/constants/queue.constants';
import {
  INDUSTRY_VALUES,
  COMPANY_SIZE_VALUES,
  PAIN_POINT_VALUES,
  DISCOVERY_SOURCE_VALUES,
  USE_CASE_VALUES,
  VOLUME_TREND_VALUES,
} from '@common/constants/prediction.constants';
import { LlmService } from '@modules/llm/llm.service';
import { CategoriesDto } from '@modules/llm/dto/categories.dto';
import {
  PredictionStatusResponseDto,
  TrainResponseDto,
  TrainErrorResponseDto,
  PredictionResponseDto,
  PredictionErrorResponseDto,
  TopFactorDto,
} from './dto/prediction.dto';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const LogisticRegression = require('ml-logistic-regression');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Matrix } = require('ml-matrix');

@Injectable()
export class PredictionService {
  private readonly logger = new Logger(PredictionService.name);
  private model: typeof LogisticRegression | null = null;
  private featureNames: string[] = [];

  constructor(
    private readonly prisma: PrismaService,
    private readonly llmService: LlmService,
    @InjectQueue(PREDICTION_TRAINING_QUEUE)
    private readonly trainingQueue: Queue,
  ) {
    this.initializeFeatureNames();
    this.loadModelFromDatabase();
  }

  private initializeFeatureNames(): void {
    this.featureNames = [
      ...INDUSTRY_VALUES.map(v => `industry_${v}`),
      ...COMPANY_SIZE_VALUES.map(v => `company_size_${v}`),
      ...PAIN_POINT_VALUES.map(v => `pain_point_${v}`),
      ...DISCOVERY_SOURCE_VALUES.map(v => `discovery_source_${v}`),
      ...USE_CASE_VALUES.map(v => `use_case_${v}`),
      ...VOLUME_TREND_VALUES.map(v => `volume_trend_${v}`),
      'weekly_contact_volume_normalized',
    ];
  }

  private async loadModelFromDatabase(): Promise<void> {
    try {
      const modelRecord = await this.prisma.predictionModel.findFirst({
        where: { trained: true },
        orderBy: { trainedAt: 'desc' },
      });

      if (modelRecord?.modelData) {
        const modelData = modelRecord.modelData as { classifiers: object[] };
        this.model = LogisticRegression.load(modelData);
      }
    } catch (error) {
      this.logger.error('Failed to load model from database', error);
    }
  }

  async getStatus(): Promise<PredictionStatusResponseDto> {
    const availableSamples = await this.getAvailableSamplesCount();
    const modelRecord = await this.prisma.predictionModel.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    const canTrain = availableSamples >= MINIMUM_TRAINING_SAMPLES && !modelRecord?.isTraining;

    if (!modelRecord || !modelRecord.trained) {
      if (availableSamples < MINIMUM_TRAINING_SAMPLES) {
        return {
          trained: false,
          canTrain: false,
          availableSamples,
          minimumRequired: MINIMUM_TRAINING_SAMPLES,
          message: `Se necesitan al menos ${MINIMUM_TRAINING_SAMPLES} clientes con cierre conocido (actualmente: ${availableSamples})`,
        };
      }

      return {
        trained: false,
        canTrain: true,
        availableSamples,
        minimumRequired: MINIMUM_TRAINING_SAMPLES,
        message: 'Modelo listo para entrenar',
      };
    }

    if (modelRecord.isTraining) {
      return {
        trained: modelRecord.trained,
        canTrain: false,
        availableSamples,
        minimumRequired: MINIMUM_TRAINING_SAMPLES,
        lastTrainedAt: modelRecord.trainedAt?.toISOString(),
        samplesUsed: modelRecord.samplesUsed,
        accuracy: modelRecord.accuracy ?? undefined,
        isTraining: true,
        trainingProgress: {
          status: 'processing',
          progress: modelRecord.trainingProgress ?? 0,
          startedAt: modelRecord.trainingStartedAt?.toISOString() ?? '',
        },
      };
    }

    if (modelRecord.lastError) {
      return {
        trained: modelRecord.trained,
        canTrain: true,
        availableSamples,
        minimumRequired: MINIMUM_TRAINING_SAMPLES,
        lastTrainedAt: modelRecord.trainedAt?.toISOString(),
        samplesUsed: modelRecord.samplesUsed,
        accuracy: modelRecord.accuracy ?? undefined,
        isTraining: false,
        lastError: modelRecord.lastError,
      };
    }

    return {
      trained: true,
      canTrain,
      availableSamples,
      minimumRequired: MINIMUM_TRAINING_SAMPLES,
      lastTrainedAt: modelRecord.trainedAt?.toISOString(),
      samplesUsed: modelRecord.samplesUsed,
      accuracy: modelRecord.accuracy ?? undefined,
      isTraining: false,
    };
  }

  async startTraining(): Promise<TrainResponseDto | TrainErrorResponseDto> {
    const availableSamples = await this.getAvailableSamplesCount();

    if (availableSamples < MINIMUM_TRAINING_SAMPLES) {
      return {
        error: 'INSUFFICIENT_DATA',
        message: `Se necesitan al menos ${MINIMUM_TRAINING_SAMPLES} clientes con cierre conocido`,
        availableSamples,
        minimumRequired: MINIMUM_TRAINING_SAMPLES,
      };
    }

    const existingModel = await this.prisma.predictionModel.findFirst({
      where: { isTraining: true },
    });

    if (existingModel) {
      return {
        error: 'TRAINING_IN_PROGRESS',
        message: 'Ya hay un entrenamiento en curso',
        progress: existingModel.trainingProgress ?? 0,
      };
    }

    const modelRecord = await this.prisma.predictionModel.create({
      data: {
        isTraining: true,
        trainingStartedAt: new Date(),
        trainingProgress: 0,
        trainingJobId: '', // Will be set after job creation
      },
    });

    const job = await this.trainingQueue.add('train', {
      modelId: modelRecord.id,
    });

    await this.prisma.predictionModel.update({
      where: { id: modelRecord.id },
      data: { trainingJobId: job.id.toString() },
    });

    return {
      message: 'Entrenamiento iniciado',
      jobId: job.id.toString(),
      samplesUsed: availableSamples,
    };
  }

  async trainModel(modelId: string): Promise<void> {
    try {
      const clients = await this.prisma.client.findMany({
        where: {
          categorization: { isNot: null },
        },
        include: { categorization: true },
      });

      const trainingData = clients.map(client => ({
        categories: client.categorization!.data as unknown as CategoriesDto,
        closed: client.closed,
      }));

      await this.updateTrainingProgress(modelId, 10);

      const X: number[][] = [];
      const y: number[] = [];

      for (const data of trainingData) {
        const features = this.encodeCategoriesToFeatures(data.categories);
        X.push(features);
        y.push(data.closed ? 1 : 0);
      }

      await this.updateTrainingProgress(modelId, 30);

      const splitIndex = Math.floor(X.length * 0.8);
      const XTrain = X.slice(0, splitIndex);
      const yTrain = y.slice(0, splitIndex);
      const XTest = X.slice(splitIndex);
      const yTest = y.slice(splitIndex);

      await this.updateTrainingProgress(modelId, 50);

      const newModel = new LogisticRegression({
        numSteps: 1000,
        learningRate: 0.1,
      });

      const XTrainMatrix = new Matrix(XTrain);
      const yTrainMatrix = new Matrix([yTrain]).transpose();
      
      newModel.train(XTrainMatrix, yTrainMatrix);

      await this.updateTrainingProgress(modelId, 80);

      let correct = 0;
      const XTestMatrix = new Matrix(XTest);
      for (let i = 0; i < XTest.length; i++) {
        const testSampleArray = XTestMatrix.getRow(i);
        const testSampleMatrix = new Matrix([testSampleArray]);
        const predictions = newModel.predict(testSampleMatrix);
        const prediction = predictions[0];
        
        if (prediction === yTest[i]) {
          correct++;
        }
      }
      const accuracy = XTest.length > 0 ? correct / XTest.length : 0;

      await this.updateTrainingProgress(modelId, 90);

      const modelData = newModel.toJSON();
      
      await this.prisma.predictionModel.update({
        where: { id: modelId },
        data: {
          trained: true,
          samplesUsed: trainingData.length,
          accuracy,
          modelData,
          trainedAt: new Date(),
          isTraining: false,
          trainingProgress: 100,
        },
      });

      this.model = newModel;
    } catch (error) {
      this.logger.error(`Model training failed: ${error.message}`);
      await this.prisma.predictionModel.update({
        where: { id: modelId },
        data: {
          isTraining: false,
          lastError: error instanceof Error ? error.message : 'Error desconocido',
        },
      });
      throw error;
    }
  }

  async predict(transcription: string): Promise<PredictionResponseDto | PredictionErrorResponseDto> {
    await this.loadModelFromDatabase();
    
    const modelRecord = await this.prisma.predictionModel.findFirst({
      where: { trained: true },
      orderBy: { trainedAt: 'desc' },
    });

    if (!modelRecord || !this.model) {
      const availableSamples = await this.getAvailableSamplesCount();
      return {
        error: 'MODEL_NOT_TRAINED',
        message: 'El modelo no está entrenado aún',
        canTrain: availableSamples >= MINIMUM_TRAINING_SAMPLES,
        availableSamples,
        minimumRequired: MINIMUM_TRAINING_SAMPLES,
      };
    }

    const categories = await this.llmService.extractCategoriesFromTranscription(transcription);

    if (categories.industry === 'Otro' || categories.main_pain_point === 'Otro') {
      const missingFields: string[] = [];
      if (categories.industry === 'Otro') missingFields.push('Industria');
      if (categories.main_pain_point === 'Otro') missingFields.push('Pain Point');

      return {
        error: 'INSUFFICIENT_CATEGORIZATION',
        message: `No se puede predecir: ${missingFields.join(' y ')} no se pudieron determinar de la transcripción`,
        categories: {
          industry: categories.industry,
          company_size: categories.company_size,
          weekly_contact_volume: categories.weekly_contact_volume,
          volume_trend: categories.volume_trend,
          main_pain_point: categories.main_pain_point,
          current_solution: categories.current_solution,
          discovery_source: categories.discovery_source,
          use_case: categories.use_case,
          integration_needs: categories.integration_needs,
          query_topics: categories.query_topics,
          summary: categories.summary,
        },
      };
    }

    const features = this.encodeCategoriesToFeatures(categories);
    const featuresMatrix = new Matrix([features]);
    const predictionClass = this.model.predict(featuresMatrix);
    const weightsArray = this.model.classifiers[0].weights.to1DArray();
    
    let z = 0;
    if (weightsArray.length === features.length + 1) {
      z = weightsArray[0]; // bias term
      for (let i = 0; i < features.length; i++) {
        z += weightsArray[i + 1] * features[i];
      }
    } else {
      for (let i = 0; i < features.length && i < weightsArray.length; i++) {
        z += weightsArray[i] * features[i];
      }
    }
    
    const probability = 1 / (1 + Math.exp(-z));
    const willClose = probability >= 0.5;
    let prediction: 'high' | 'medium' | 'low';
    if (probability >= 0.7) {
      prediction = 'high';
    } else if (probability >= 0.4) {
      prediction = 'medium';
    } else {
      prediction = 'low';
    }

    const topFactors = this.calculateTopFactors(categories, features, z, probability, weightsArray);

    return {
      probability: Math.round(probability * 100) / 100,
      willClose,
      prediction,
      categories: {
        industry: categories.industry,
        company_size: categories.company_size,
        weekly_contact_volume: categories.weekly_contact_volume,
        volume_trend: categories.volume_trend,
        main_pain_point: categories.main_pain_point,
        current_solution: categories.current_solution,
        discovery_source: categories.discovery_source,
        use_case: categories.use_case,
        integration_needs: categories.integration_needs,
        query_topics: categories.query_topics,
        summary: categories.summary,
      },
      topFactors,
      model: {
        trained: true,
        lastTrainedAt: modelRecord.trainedAt?.toISOString() ?? null,
        samplesUsed: modelRecord.samplesUsed,
        accuracy: modelRecord.accuracy,
      },
    };
  }

  private encodeCategoriesToFeatures(categories: CategoriesDto): number[] {
    const features: number[] = [];

    for (const value of INDUSTRY_VALUES) {
      features.push(categories.industry === value ? 1 : 0);
    }

    for (const value of COMPANY_SIZE_VALUES) {
      features.push(categories.company_size === value ? 1 : 0);
    }

    for (const value of PAIN_POINT_VALUES) {
      features.push(categories.main_pain_point === value ? 1 : 0);
    }

    for (const value of DISCOVERY_SOURCE_VALUES) {
      features.push(categories.discovery_source === value ? 1 : 0);
    }

    for (const value of USE_CASE_VALUES) {
      features.push(categories.use_case === value ? 1 : 0);
    }

    for (const value of VOLUME_TREND_VALUES) {
      features.push(categories.volume_trend === value ? 1 : 0);
    }

    const normalizedVolume = Math.min(categories.weekly_contact_volume / 1000, 1);
    features.push(normalizedVolume);

    return features;
  }

  private calculateTopFactors(categories: CategoriesDto, features: number[], baselineZ: number, baselineProb: number, coefficients: number[]): TopFactorDto[] {
    if (!coefficients || coefficients.length === 0) {
      return [];
    }
    
    const featureImpacts: { feature: string; value: string; probChange: number }[] = [];
    const featureCategories = [
      { name: 'industry', values: INDUSTRY_VALUES },
      { name: 'company_size', values: COMPANY_SIZE_VALUES },
      { name: 'main_pain_point', values: PAIN_POINT_VALUES },
      { name: 'discovery_source', values: DISCOVERY_SOURCE_VALUES },
      { name: 'use_case', values: USE_CASE_VALUES },
      { name: 'volume_trend', values: VOLUME_TREND_VALUES },
    ];

    let featureIndex = 0;
    const hasBias = coefficients.length === features.length + 1;

    for (const category of featureCategories) {
      for (let i = 0; i < category.values.length; i++) {
        const idx = featureIndex + i;
        if (features[idx] === 1) {
          const coeffIdx = hasBias ? idx + 1 : idx;
          if (coeffIdx < coefficients.length) {
            const coeff = coefficients[coeffIdx];
            const newZ = baselineZ - coeff;
            const newProb = 1 / (1 + Math.exp(-newZ));
            const probChange = baselineProb - newProb;
            
        featureImpacts.push({
              feature: category.name,
              value: category.values[i],
              probChange,
        });
      }
    }
      }
      featureIndex += category.values.length;
    }

    featureImpacts.sort((a, b) => Math.abs(b.probChange) - Math.abs(a.probChange));

    return featureImpacts.slice(0, 3).map(f => {
      const impactPercent = Math.round(f.probChange * 100);
      const sign = impactPercent >= 0 ? '+' : '';
      const description = impactPercent >= 0 ? 'Aumenta probabilidad' : 'Reduce probabilidad';
      
      return {
        feature: f.feature,
        value: f.value,
        impact: `${sign}${impactPercent}% (${description})`,
      };
      });
  }

  private async getAvailableSamplesCount(): Promise<number> {
    return this.prisma.client.count({
      where: {
        categorization: { isNot: null },
      },
    });
  }

  private async updateTrainingProgress(modelId: string, progress: number): Promise<void> {
    await this.prisma.predictionModel.update({
      where: { id: modelId },
      data: { trainingProgress: progress },
    });
  }
}
