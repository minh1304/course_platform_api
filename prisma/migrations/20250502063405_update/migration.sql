/*
  Warnings:

  - Made the column `codeExpired` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "codeExpired" SET NOT NULL;
