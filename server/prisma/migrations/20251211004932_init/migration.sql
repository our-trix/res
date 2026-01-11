-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "team1_player1" TEXT NOT NULL,
    "team1_player2" TEXT NOT NULL,
    "team2_player1" TEXT NOT NULL,
    "team2_player2" TEXT NOT NULL,
    "starter_player" TEXT NOT NULL,
    "winner_team" TEXT NOT NULL,
    "final_score" INTEGER NOT NULL,
    "notes" TEXT,
    "match_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" SERIAL NOT NULL,
    "match_id" INTEGER NOT NULL,
    "round_number" INTEGER NOT NULL,
    "game_type" TEXT NOT NULL,
    "round_score" INTEGER NOT NULL,
    "round_details" TEXT,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
