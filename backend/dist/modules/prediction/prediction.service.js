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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PredictionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../../common/services/prisma.service");
const queue_constants_1 = require("../../common/constants/queue.constants");
const prediction_constants_1 = require("../../common/constants/prediction.constants");
const llm_service_1 = require("../llm/llm.service");
const LogisticRegression = require('ml-logistic-regression');
const { Matrix } = require('ml-matrix');
let PredictionService = PredictionService_1 = class PredictionService {
    prisma;
    llmService;
    trainingQueue;
    logger = new common_1.Logger(PredictionService_1.name);
    model = null;
    featureNames = [];
    constructor(prisma, llmService, trainingQueue) {
        this.prisma = prisma;
        this.llmService = llmService;
        this.trainingQueue = trainingQueue;
        this.initializeFeatureNames();
        this.loadModelFromDatabase();
    }
    initializeFeatureNames() {
        this.featureNames = [
            ...prediction_constants_1.INDUSTRY_VALUES.map(v => `industry_${v}`),
            ...prediction_constants_1.COMPANY_SIZE_VALUES.map(v => `company_size_${v}`),
            ...prediction_constants_1.PAIN_POINT_VALUES.map(v => `pain_point_${v}`),
            ...prediction_constants_1.DISCOVERY_SOURCE_VALUES.map(v => `discovery_source_${v}`),
            ...prediction_constants_1.USE_CASE_VALUES.map(v => `use_case_${v}`),
            ...prediction_constants_1.VOLUME_TREND_VALUES.map(v => `volume_trend_${v}`),
            'weekly_contact_volume_normalized',
        ];
    }
    async loadModelFromDatabase() {
        try {
            const modelRecord = await this.prisma.predictionModel.findFirst({
                where: { trained: true },
                orderBy: { trainedAt: 'desc' },
            });
            if (modelRecord?.modelData) {
                const modelData = modelRecord.modelData;
                this.model = LogisticRegression.load(modelData);
            }
        }
        catch (error) {
            this.logger.error('Failed to load model from database', error);
        }
    }
    async getStatus() {
        const availableSamples = await this.getAvailableSamplesCount();
        const modelRecord = await this.prisma.predictionModel.findFirst({
            orderBy: { createdAt: 'desc' },
        });
        const canTrain = availableSamples >= queue_constants_1.MINIMUM_TRAINING_SAMPLES && !modelRecord?.isTraining;
        if (!modelRecord || !modelRecord.trained) {
            if (availableSamples < queue_constants_1.MINIMUM_TRAINING_SAMPLES) {
                return {
                    trained: false,
                    canTrain: false,
                    availableSamples,
                    minimumRequired: queue_constants_1.MINIMUM_TRAINING_SAMPLES,
                    message: `Se necesitan al menos ${queue_constants_1.MINIMUM_TRAINING_SAMPLES} clientes con cierre conocido (actualmente: ${availableSamples})`,
                };
            }
            return {
                trained: false,
                canTrain: true,
                availableSamples,
                minimumRequired: queue_constants_1.MINIMUM_TRAINING_SAMPLES,
                message: 'Modelo listo para entrenar',
            };
        }
        if (modelRecord.isTraining) {
            return {
                trained: modelRecord.trained,
                canTrain: false,
                availableSamples,
                minimumRequired: queue_constants_1.MINIMUM_TRAINING_SAMPLES,
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
                minimumRequired: queue_constants_1.MINIMUM_TRAINING_SAMPLES,
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
            minimumRequired: queue_constants_1.MINIMUM_TRAINING_SAMPLES,
            lastTrainedAt: modelRecord.trainedAt?.toISOString(),
            samplesUsed: modelRecord.samplesUsed,
            accuracy: modelRecord.accuracy ?? undefined,
            isTraining: false,
        };
    }
    async startTraining() {
        const availableSamples = await this.getAvailableSamplesCount();
        if (availableSamples < queue_constants_1.MINIMUM_TRAINING_SAMPLES) {
            return {
                error: 'INSUFFICIENT_DATA',
                message: `Se necesitan al menos ${queue_constants_1.MINIMUM_TRAINING_SAMPLES} clientes con cierre conocido`,
                availableSamples,
                minimumRequired: queue_constants_1.MINIMUM_TRAINING_SAMPLES,
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
                trainingJobId: '',
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
    async trainModel(modelId) {
        try {
            const clients = await this.prisma.client.findMany({
                where: {
                    categorization: { isNot: null },
                },
                include: { categorization: true },
            });
            const trainingData = clients.map(client => ({
                categories: client.categorization.data,
                closed: client.closed,
            }));
            await this.updateTrainingProgress(modelId, 10);
            const X = [];
            const y = [];
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
        }
        catch (error) {
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
    async predict(transcription) {
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
                canTrain: availableSamples >= queue_constants_1.MINIMUM_TRAINING_SAMPLES,
                availableSamples,
                minimumRequired: queue_constants_1.MINIMUM_TRAINING_SAMPLES,
            };
        }
        const categories = await this.llmService.extractCategoriesFromTranscription(transcription);
        if (categories.industry === 'Otro' || categories.main_pain_point === 'Otro') {
            const missingFields = [];
            if (categories.industry === 'Otro')
                missingFields.push('Industria');
            if (categories.main_pain_point === 'Otro')
                missingFields.push('Pain Point');
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
            z = weightsArray[0];
            for (let i = 0; i < features.length; i++) {
                z += weightsArray[i + 1] * features[i];
            }
        }
        else {
            for (let i = 0; i < features.length && i < weightsArray.length; i++) {
                z += weightsArray[i] * features[i];
            }
        }
        const probability = 1 / (1 + Math.exp(-z));
        const willClose = probability >= 0.5;
        let prediction;
        if (probability >= 0.7) {
            prediction = 'high';
        }
        else if (probability >= 0.4) {
            prediction = 'medium';
        }
        else {
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
    encodeCategoriesToFeatures(categories) {
        const features = [];
        for (const value of prediction_constants_1.INDUSTRY_VALUES) {
            features.push(categories.industry === value ? 1 : 0);
        }
        for (const value of prediction_constants_1.COMPANY_SIZE_VALUES) {
            features.push(categories.company_size === value ? 1 : 0);
        }
        for (const value of prediction_constants_1.PAIN_POINT_VALUES) {
            features.push(categories.main_pain_point === value ? 1 : 0);
        }
        for (const value of prediction_constants_1.DISCOVERY_SOURCE_VALUES) {
            features.push(categories.discovery_source === value ? 1 : 0);
        }
        for (const value of prediction_constants_1.USE_CASE_VALUES) {
            features.push(categories.use_case === value ? 1 : 0);
        }
        for (const value of prediction_constants_1.VOLUME_TREND_VALUES) {
            features.push(categories.volume_trend === value ? 1 : 0);
        }
        const normalizedVolume = Math.min(categories.weekly_contact_volume / 1000, 1);
        features.push(normalizedVolume);
        return features;
    }
    calculateTopFactors(categories, features, baselineZ, baselineProb, coefficients) {
        if (!coefficients || coefficients.length === 0) {
            return [];
        }
        const featureImpacts = [];
        const featureCategories = [
            { name: 'industry', values: prediction_constants_1.INDUSTRY_VALUES },
            { name: 'company_size', values: prediction_constants_1.COMPANY_SIZE_VALUES },
            { name: 'main_pain_point', values: prediction_constants_1.PAIN_POINT_VALUES },
            { name: 'discovery_source', values: prediction_constants_1.DISCOVERY_SOURCE_VALUES },
            { name: 'use_case', values: prediction_constants_1.USE_CASE_VALUES },
            { name: 'volume_trend', values: prediction_constants_1.VOLUME_TREND_VALUES },
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
    async getAvailableSamplesCount() {
        return this.prisma.client.count({
            where: {
                categorization: { isNot: null },
            },
        });
    }
    async updateTrainingProgress(modelId, progress) {
        await this.prisma.predictionModel.update({
            where: { id: modelId },
            data: { trainingProgress: progress },
        });
    }
};
exports.PredictionService = PredictionService;
exports.PredictionService = PredictionService = PredictionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bull_1.InjectQueue)(queue_constants_1.PREDICTION_TRAINING_QUEUE)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        llm_service_1.LlmService, Object])
], PredictionService);
//# sourceMappingURL=prediction.service.js.map