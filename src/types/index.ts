// Match Types
export interface Match {
  id: number;
  homeID: number;
  awayID: number;
  home_name: string;
  away_name: string;
  home_image: string;
  away_image: string;
  season: string;
  status: 'complete' | 'suspended' | 'canceled' | 'incomplete' | 'live' | 'inprogress' | 'playing' | 'scheduled' | 'upcoming';
  roundID: number;
  game_week: number;
  revised_game_week: number;
  homeGoals: number[];
  awayGoals: number[];
  homeGoalCount: number;
  awayGoalCount: number;
  totalGoalCount: number;
  // Additional fields for live matches and competition info
  competition_name?: string;
  league_name?: string;
  country?: string;
  minute?: number;
  team_a_corners: number;
  team_b_corners: number;
  totalCornerCount: number;
  team_a_offsides: number;
  team_b_offsides: number;
  team_a_yellow_cards: number;
  team_b_yellow_cards: number;
  team_a_red_cards: number;
  team_b_red_cards: number;
  team_a_shotsOnTarget: number;
  team_b_shotsOnTarget: number;
  team_a_shotsOffTarget: number;
  team_b_shotsOffTarget: number;
  team_a_shots: number;
  team_b_shots: number;
  team_a_fouls: number;
  team_b_fouls: number;
  team_a_possession: number;
  team_b_possession: number;
  refereeID: number;
  coach_a_ID: number;
  coach_b_ID: number;
  stadium_name: string;
  stadium_location: string;
  team_a_cards_num: number;
  team_b_cards_num: number;
  odds_ft_1: number;
  odds_ft_X: number;
  odds_ft_2: number;
  date_unix: number;
  winningTeam: number;
  btts_potential: number;
  o15_potential: number;
  o25_potential: number;
  o35_potential: number;
  corners_potential: number;
  avg_potential: number;
  home_ppg: number;
  away_ppg: number;
  competition_id: number;
  over05: boolean;
  over15: boolean;
  over25: boolean;
  over35: boolean;
  btts: boolean;
}

// Team Types
export interface Team {
  id: number;
  name: string;
  cleanName: string;
  shortName: string;
  logo: string;
  country: string;
  founded: number;
  venue: string;
  capacity: number;
}

// League Types
export interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  season: string;
  seasonStart: string;
  seasonEnd: string;
}

// H2H Types
export interface H2HStats {
  total_matches: number;
  team_a_wins: number;
  team_b_wins: number;
  draws: number;
  team_a_win_percentage: number;
  team_b_win_percentage: number;
  draw_percentage: number;
  over15_count: number;
  over25_count: number;
  over35_count: number;
  btts_count: number;
  avg_goals_per_match: number;
  recent_matches: RecentMatch[];
}

export interface RecentMatch {
  id: number;
  date: string;
  home_team: string;
  away_team: string;
  home_goals: number;
  away_goals: number;
  result: string;
}

// Player Types
export interface Player {
  id: number;
  name: string;
  position: string;
  age: number;
  nationality: string;
  team_id: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  minutes_played: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface MatchesResponse {
  data: Match[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_matches: number;
  };
}

// Betting Insights Types
export interface BettingInsight {
  match_id: number;
  prediction_type: 'over_under' | 'btts' | 'result' | 'corners';
  prediction: string;
  confidence: number;
  odds: number;
  reasoning: string;
}

// Filter Types
export interface MatchFilters {
  league_id?: number;
  date?: string;
  status?: string;
  team_id?: number;
}
