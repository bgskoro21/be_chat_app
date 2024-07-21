/*
  Warnings:

  - You are about to drop the column `username` on the `personal_access_token` table. All the data in the column will be lost.
  - Added the required column `type` to the `personal_access_token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "personal_access_token" DROP COLUMN "username",
ADD COLUMN     "type" TEXT NOT NULL;
