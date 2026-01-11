/*
  Warnings:

  - You are about to drop the column `starter_player` on the `Match` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Match" DROP COLUMN "starter_player",
ADD COLUMN     "starter_player_id" INTEGER;
