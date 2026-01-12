export interface Player {
  id: number;
  name: string;
}

export interface Team {
  id: number;
  name: string;
  players: Player[];
}

export interface Round {
  id: number;
  round_number: number;
  game_type: string;
  round_score: number;
  round_details?: string;
}

export interface Match {
  id: number;
  teamA: Team;
  teamB: Team;
  rounds: Round[];
  starter_player_id?: number;
  winner_team_id?: number;
  final_score: number;
  notes?: string;
  winnerName?: string;
  starterName?: string;
}
