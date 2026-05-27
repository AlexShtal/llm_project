-- AlterTable
ALTER TABLE "models" ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'openai-compatible',
ADD COLUMN     "providerConfig" JSONB;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "storageProvider" TEXT NOT NULL DEFAULT 'minio';
