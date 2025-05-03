/*
  Warnings:

  - Added the required column `isActive` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable

-- Step 1: Add the column as nullable
ALTER TABLE "users" ADD COLUMN "isActive" BOOLEAN;

-- Step 2: Set default value for existing rows
UPDATE "users" SET "isActive" = true;

-- Step 3: Alter the column to NOT NULL
ALTER TABLE "users" ALTER COLUMN "isActive" SET NOT NULL;
