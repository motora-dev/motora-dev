/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `ArticleMedia` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `publicId` to the `ArticleMedia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ArticleMedia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ArticleMedia" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "publicId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ArticleMedia_publicId_key" ON "ArticleMedia"("publicId");
