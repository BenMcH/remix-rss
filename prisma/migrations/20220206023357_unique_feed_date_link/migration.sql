/*
  Warnings:

  - A unique constraint covering the columns `[feedId,date,link]` on the table `FeedPost` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FeedPost_feedId_date_link_key" ON "FeedPost"("feedId", "date", "link");
