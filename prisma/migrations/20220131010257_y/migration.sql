/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `Feed` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Feed_url_key" ON "Feed"("url");
