/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `personal_access_token` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "personal_access_token_token_key" ON "personal_access_token"("token");
