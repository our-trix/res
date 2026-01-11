/*
  Warnings:

  - You are about to drop the column `team1_player1` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `team1_player2` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `team2_player1` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `team2_player2` on the `Match` table. All the data in the column will be lost.
  - Added the required column `teamA_id` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamB_id` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Match" DROP COLUMN "team1_player1",
DROP COLUMN "team1_player2",
DROP COLUMN "team2_player1",
DROP COLUMN "team2_player2",
ADD COLUMN     "teamA_id" INTEGER NOT NULL,
ADD COLUMN     "teamB_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "player1" TEXT NOT NULL,
    "player2" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamA_id_fkey" FOREIGN KEY ("teamA_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamB_id_fkey" FOREIGN KEY ("teamB_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
