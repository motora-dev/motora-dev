/*
  Warnings:

  - Added the required column `description` to the `Page` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Add description column (nullable first)
ALTER TABLE "Page" ADD COLUMN "description" TEXT;

-- Update existing records to use title as description
UPDATE "Page" SET "description" = "title";

-- Make description column NOT NULL
ALTER TABLE "Page" ALTER COLUMN "description" SET NOT NULL;
