/*
  Warnings:

  - You are about to drop the column `winner_team` on the `Match` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Match" DROP COLUMN "winner_team",
ADD COLUMN     "winner_team_id" INTEGER;
