/**
 * FootyStats API Client
 * Implementação completa seguindo a documentação oficial da FootyStats API
 * API Key: 4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756
 */

// Configuração da API
const FOOTYSTATS_API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const FOOTYSTATS_BASE_URL = 'https://api.football-data-api.com';

// Tipos baseados na documentação da API
export interface FootyStatsLeague {
  name: string;
  league_name: string;
  country: string;
  season: {
    id: number;
    year: string;
  };
  image?: string;
}

export interface FootyStatsMatch {
  id: number;
  homeID: number;
  awayID: number;
  status: string;
  date_unix: number;
  homeGoalCount: number;
  awayGoalCount: number;
  totalGoalCount: number;
  homeGoals: number[];
  awayGoals: number[];
  
  // Estatísticas do jogo
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
  team_a_fouls: number;
  team_b_fouls: number;
  team_a_possession: number;
  team_b_possession: number;
  
  // Informações do jogo
  refereeID: number;
  coach_a_ID: number;
  coach_b_ID: number;
  stadium_name: string;
  stadium_location: string;
  
  // Odds
  odds_ft_1: number;
  odds_ft_X: number;
  odds_ft_2: number;
  odds_btts_yes: number;
  odds_btts_no: number;
  
  // Potenciais (para partidas futuras)
  btts_potential: number;
  o15_potential: number;
  o25_potential: number;
  o35_potential: number;
  o45_potential: number;
  avg_potential: number;
  home_ppg: number;
  away_ppg: number;
}

export interface FootyStatsTeam {
  id: number;
  name: string;
  full_name: string;
  country: string;
  competition_id: number;
  table_position: number;
  performance_rank: number;
  official_sites?: string;
  url: string;
  stats?: FootyStatsTeamStats;
}

export interface FootyStatsTeamStats {
  // Gols
  seasonGoals_overall: number;
  seasonGoals_home: number;
  seasonGoals_away: number;
  seasonConceded_overall: number;
  seasonConceded_home: number;
  seasonConceded_away: number;
  seasonGoalDifference_overall: number;
  
  // Médias
  seasonScoredAVG_overall: number;
  seasonScoredAVG_home: number;
  seasonScoredAVG_away: number;
  seasonConcededAVG_overall: number;
  seasonConcededAVG_home: number;
  seasonConcededAVG_away: number;
  
  // Resultados
  seasonWinsNum_overall: number;
  seasonWinsNum_home: number;
  seasonWinsNum_away: number;
  seasonDrawsNum_overall: number;
  seasonLossesNum_overall: number;
  seasonMatchesPlayed_overall: number;
  seasonMatchesPlayed_home: number;
  seasonMatchesPlayed_away: number;
  
  // Pontos
  seasonPPG_overall: number;
  seasonPPG_home: number;
  seasonPPG_away: number;
  
  // Clean Sheets e BTTS
  cleanSheets_overall: number;
  cleanSheets_home: number;
  cleanSheets_away: number;
  btts_overall: number;
  btts_home: number;
  btts_away: number;
  
  // Over/Under
  over05_overall: number;
  over15_overall: number;
  over25_overall: number;
  over35_overall: number;
  
  // Escanteios
  cornersTotal_overall: number;
  cornersTotal_home: number;
  cornersTotal_away: number;
  cornersAgainst_overall: number;
  cornersAgainst_home: number;
  cornersAgainst_away: number;
  
  // Cartões
  cards_for_overall: number;
  cards_for_home: number;
  cards_for_away: number;
  cards_against_overall: number;
  cards_against_home: number;
  cards_against_away: number;
}

export interface FootyStatsPlayer {
  id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  known_as: string;
  shorthand: string;
  age: number;
  nationality: string;
  continent: string;
  birthday: number;
  club_team_id: number;
  club_team_2_id: number;
  national_team_id: number;
  position: string;
  
  // Estatísticas
  appearances_overall: number;
  appearances_home: number;
  appearances_away: number;
  minutes_played_overall: number;
  minutes_played_home: number;
  minutes_played_away: number;
  goals_overall: number;
  goals_home: number;
  goals_away: number;
  assists_overall: number;
  assists_home: number;
  assists_away: number;
  yellow_cards_overall: number;
  red_cards_overall: number;
  clean_sheets_overall: number;
  conceded_overall: number;
  penalty_goals: number;
  
  // Médias por 90 minutos
  goals_per_90_overall: number;
  assists_per_90_overall: number;
  goals_involved_per_90_overall: number;
  conceded_per_90: number;
  cards_per_90_overall: number;
  
  // Minutos por evento
  min_per_goal: number;
  min_per_assist: number;
  min_per_card: number;
  min_per_match: number;
  
  // Rating
  average_rating_overall: number;
}

export interface FootyStatsReferee {
  id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  known_as: string;
  shorthand: string;
  age: number;
  nationality: string;
  continent: string;
  birthday: number;
  league: string;
  league_type: string;
  season: string;
  competition_id: number;
  
  // Estatísticas de arbitragem
  appearances_overall: number;
  wins_home: number;
  wins_away: number;
  draws_overall: number;
  wins_per_home: number;
  wins_per_away: number;
  draws_percentage: number;
  
  // BTTS
  btts_overall: number;
  btts_percentage: number;
  
  // Gols
  goals_overall: number;
  goals_home: number;
  goals_away: number;
  goals_per_match_overall: number;
  goals_per_match_home: number;
  goals_per_match_away: number;
  
  // Pênaltis
  penalties_given_overall: number;
  penalties_given_home: number;
  penalties_given_away: number;
  penalties_per_match: number;
  
  // Cartões
  cards_overall: number;
  cards_home: number;
  cards_away: number;
  cards_per_match_overall: number;
  yellow_cards_overall: number;
  red_cards_overall: number;
  
  // Tempo médio
  min_per_goal_overall: number;
  min_per_card_overall: number;
}

// Função auxiliar para fazer requisições
async function makeFootyStatsRequest(endpoint: string, params: Record<string, any> = {}) {
  const url = new URL(`${FOOTYSTATS_BASE_URL}${endpoint}`);
  url.searchParams.append('key', FOOTYSTATS_API_KEY);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value.toString());
    }
  });

  console.log(`🔍 FootyStats API Request: ${url.toString()}`);

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'OddGeniusFootyStats/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`FootyStats API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`FootyStats API Error: ${data.message || 'Unknown error'}`);
  }

  return data.data;
}

/**
 * FootyStats API Client Class
 * Implementa todos os endpoints conforme documentação oficial
 */
export class FootyStatsAPI {
  
  /**
   * 1. Listar Ligas Disponíveis (League List)
   * URL: GET https://api.football-data-api.com/league-list?key=YOURKEY
   */
  static async getLeagueList(chosenLeaguesOnly: boolean = true, country?: number): Promise<FootyStatsLeague[]> {
    const params: Record<string, any> = {};
    
    if (chosenLeaguesOnly) {
      params.chosen_leagues_only = 'true';
    }
    
    if (country) {
      params.country = country;
    }
    
    return await makeFootyStatsRequest('/league-list', params);
  }

  /**
   * 2. Listar Países Suportados (Country List)
   * URL: GET https://api.football-data-api.com/country-list?key=YOURKEY
   */
  static async getCountryList(): Promise<Array<{id: number, name: string}>> {
    return await makeFootyStatsRequest('/country-list');
  }

  /**
   * 3. Partidas do Dia / Por Data (Today's Matches)
   * URL: GET https://api.football-data-api.com/todays-matches?key=YOURKEY
   */
  static async getTodaysMatches(date?: string, timezone?: string, page: number = 1): Promise<FootyStatsMatch[]> {
    const params: Record<string, any> = { page };

    if (date) {
      params.date = date;
    }

    if (timezone) {
      params.timezone = timezone;
    }

    return await makeFootyStatsRequest('/todays-matches', params);
  }

  /**
   * 4. Estatísticas da Liga e Times (League Stats / Season Stats)
   * URL: GET https://api.football-data-api.com/league-season?key=YOURKEY&season_id=X
   */
  static async getLeagueSeason(seasonId: number, maxTime?: number): Promise<{
    league: any,
    teams: FootyStatsTeam[]
  }> {
    const params: Record<string, any> = { season_id: seasonId };

    if (maxTime) {
      params.max_time = maxTime;
    }

    return await makeFootyStatsRequest('/league-season', params);
  }

  /**
   * 5. Jogos da Temporada (League Matches)
   * URL: GET https://api.football-data-api.com/league-matches?key=YOURKEY&season_id=X
   */
  static async getLeagueMatches(
    seasonId: number,
    page: number = 1,
    maxPerPage: number = 300,
    maxTime?: number
  ): Promise<FootyStatsMatch[]> {
    const params: Record<string, any> = {
      season_id: seasonId,
      page,
      max_per_page: maxPerPage
    };

    if (maxTime) {
      params.max_time = maxTime;
    }

    return await makeFootyStatsRequest('/league-matches', params);
  }

  /**
   * 6. Tabela da Liga (League Table)
   * URL: GET https://api.football-data-api.com/league-tables?key=YOURKEY&season_id=X
   */
  static async getLeagueTables(seasonId: number, maxTime?: number): Promise<{
    league_table: any[],
    all_matches_table_overall: any[],
    all_matches_table_home: any[],
    all_matches_table_away: any[],
    specific_tables: any[]
  }> {
    const params: Record<string, any> = { season_id: seasonId };

    if (maxTime) {
      params.max_time = maxTime;
    }

    return await makeFootyStatsRequest('/league-tables', params);
  }

  /**
   * 7. Times de uma Liga (League Teams)
   * URL: GET https://api.football-data-api.com/league-teams?key=YOURKEY&season_id=X
   */
  static async getLeagueTeams(
    seasonId: number,
    includeStats: boolean = true,
    page: number = 1,
    maxTime?: number
  ): Promise<FootyStatsTeam[]> {
    const params: Record<string, any> = {
      season_id: seasonId,
      page
    };

    if (includeStats) {
      params.include = 'stats';
    }

    if (maxTime) {
      params.max_time = maxTime;
    }

    return await makeFootyStatsRequest('/league-teams', params);
  }

  /**
   * 8. Dados de um Time Específico (Team)
   * URL: GET https://api.football-data-api.com/team?key=YOURKEY&team_id=TEAMID&include=stats
   */
  static async getTeam(teamId: number, includeStats: boolean = true): Promise<FootyStatsTeam[]> {
    const params: Record<string, any> = { team_id: teamId };

    if (includeStats) {
      params.include = 'stats';
    }

    return await makeFootyStatsRequest('/team', params);
  }

  /**
   * 9. Estatísticas Recentes (Forma) – Últimos 5/6/10 Jogos
   * URL: GET https://api.football-data-api.com/lastx?key=YOURKEY&team_id=TEAMID
   */
  static async getTeamLastX(teamId: number): Promise<{
    team: FootyStatsTeam,
    stats: {
      last5: FootyStatsTeamStats,
      last6: FootyStatsTeamStats,
      last10: FootyStatsTeamStats
    }
  }> {
    const params = { team_id: teamId };

    return await makeFootyStatsRequest('/lastx', params);
  }

  /**
   * 10. Detalhes de uma Partida (Match Details)
   * URL: GET https://api.football-data-api.com/match?key=YOURKEY&match_id=ID
   */
  static async getMatchDetails(matchId: number): Promise<FootyStatsMatch & {
    lineups: any,
    bench: any,
    team_a_card_details: any[],
    team_b_card_details: any[],
    trends: string,
    h2h: any,
    odds_comparison: any
  }> {
    const params = { match_id: matchId };

    return await makeFootyStatsRequest('/match', params);
  }

  /**
   * 11. Lista de Jogadores da Liga (League Players)
   * URL: GET https://api.football-data-api.com/league-players?key=YOURKEY&season_id=X&include=stats
   */
  static async getLeaguePlayers(
    seasonId: number,
    includeStats: boolean = true,
    page: number = 1
  ): Promise<FootyStatsPlayer[]> {
    const params: Record<string, any> = {
      season_id: seasonId,
      page
    };

    if (includeStats) {
      params.include = 'stats';
    }

    return await makeFootyStatsRequest('/league-players', params);
  }

  /**
   * 12. Dados de um Jogador (Player - Individual)
   * URL: GET https://api.football-data-api.com/player-stats?key=YOURKEY&player_id=PID
   */
  static async getPlayerStats(playerId: number): Promise<FootyStatsPlayer[]> {
    const params = { player_id: playerId };

    return await makeFootyStatsRequest('/player-stats', params);
  }

  /**
   * 13. Lista de Árbitros da Liga (League Referees)
   * URL: GET https://api.football-data-api.com/league-referees?key=YOURKEY&season_id=X
   */
  static async getLeagueReferees(seasonId: number, maxTime?: number): Promise<FootyStatsReferee[]> {
    const params: Record<string, any> = { season_id: seasonId };

    if (maxTime) {
      params.max_time = maxTime;
    }

    return await makeFootyStatsRequest('/league-referees', params);
  }

  /**
   * 14. Dados de um Árbitro (Referee - Individual)
   * URL: GET https://api.football-data-api.com/referee?key=YOURKEY&referee_id=RID
   */
  static async getRefereeStats(refereeId: number): Promise<FootyStatsReferee[]> {
    const params = { referee_id: refereeId };

    return await makeFootyStatsRequest('/referee', params);
  }

  /**
   * 15. Ranking de Ambos Marcam – BTTS Stats
   * URL: GET https://api.football-data-api.com/stats-data-btts?key=YOURKEY
   */
  static async getBTTSStats(): Promise<{
    top_teams: Array<{title: string, data: string, list_type: string}>,
    top_fixtures: Array<{title: string, data: string, list_type: string}>,
    top_leagues: Array<{title: string, data: string, list_type: string}>
  }> {
    return await makeFootyStatsRequest('/stats-data-btts');
  }

  /**
   * 16. Ranking de Over 2.5 – Over 2.5 Stats
   * URL: GET https://api.football-data-api.com/stats-data-over25?key=YOURKEY
   */
  static async getOver25Stats(): Promise<{
    top_teams: Array<{title: string, data: string, list_type: string}>,
    top_fixtures: Array<{title: string, data: string, list_type: string}>,
    top_leagues: Array<{title: string, data: string, list_type: string}>
  }> {
    return await makeFootyStatsRequest('/stats-data-over25');
  }

  // Métodos auxiliares para facilitar o uso

  /**
   * Buscar partidas ao vivo (status live, inprogress, playing)
   */
  static async getLiveMatches(date?: string): Promise<FootyStatsMatch[]> {
    const matches = await this.getTodaysMatches(date);
    return matches.filter(match =>
      match.status === 'live' ||
      match.status === 'inprogress' ||
      match.status === 'playing'
    );
  }

  /**
   * Buscar próximas partidas (status incomplete e no futuro)
   */
  static async getUpcomingMatches(date?: string): Promise<FootyStatsMatch[]> {
    const matches = await this.getTodaysMatches(date);
    const now = Math.floor(Date.now() / 1000);

    return matches.filter(match =>
      match.status === 'incomplete' &&
      match.date_unix > now
    );
  }

  /**
   * Buscar partidas completas (status complete, finished)
   */
  static async getCompletedMatches(date?: string): Promise<FootyStatsMatch[]> {
    const matches = await this.getTodaysMatches(date);
    return matches.filter(match =>
      match.status === 'complete' ||
      match.status === 'finished'
    );
  }
}
