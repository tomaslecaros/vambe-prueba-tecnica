-- CreateTable
CREATE TABLE "prediction_models" (
    "id" TEXT NOT NULL,
    "trained" BOOLEAN NOT NULL DEFAULT false,
    "samples_used" INTEGER NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION,
    "model_data" JSONB,
    "trained_at" TIMESTAMP(3),
    "is_training" BOOLEAN NOT NULL DEFAULT false,
    "training_job_id" TEXT,
    "training_started_at" TIMESTAMP(3),
    "training_progress" INTEGER DEFAULT 0,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prediction_models_pkey" PRIMARY KEY ("id")
);
