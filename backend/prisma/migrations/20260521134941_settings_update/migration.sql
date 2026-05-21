/*
  Warnings:

  - You are about to drop the column `API` on the `models` table. All the data in the column will be lost.
  - You are about to drop the column `currentModelType` on the `users` table. All the data in the column will be lost.
  - Added the required column `apiOrIP` to the `models` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `models` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "models_name_key";

-- AlterTable
ALTER TABLE "models" DROP COLUMN "API",
ADD COLUMN     "apiOrIP" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "currentModelType",
ADD COLUMN     "currentModelId" INTEGER;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_currentModelId_fkey" FOREIGN KEY ("currentModelId") REFERENCES "models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "models" ADD CONSTRAINT "models_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
