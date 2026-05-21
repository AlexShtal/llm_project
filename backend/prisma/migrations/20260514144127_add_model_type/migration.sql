/*
  Warnings:

  - You are about to drop the column `maxTokens` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the column `temperature` on the `user_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_settings" DROP COLUMN "maxTokens",
DROP COLUMN "temperature",
ADD COLUMN     "currentModelType" TEXT DEFAULT 'local';
