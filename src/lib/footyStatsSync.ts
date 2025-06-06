import { prisma } from './database';

const FOOTYSTATS_API_KEY = process.env.FOOTYSTATS_API_KEY;
const FOOTYSTATS_BASE_URL = process.env.FOOTYSTATS_BASE_URL || 'https://api.football-data-api.com';

interface FootyStatsLeague {
  id: number;
  name: string;
  country: string;
  current: boolean;
}

interface FootyStatsTeam {
  id: number;
  name: string;
  short_name?: string;
  country?: string;
  image?: string;
  founded?: number;
  venue?: string;
  capacity?: number;
}

interface FootyStatsMatch {
  id: number;
  homeID: number;
  awayID: number;
  season_id: number;
  date_unix: number;
  status: string;
  homeGoalCount: number;
  awayGoalCount: number;
  stadium_name?: string;
  stadium_location?: string;
  refereeID?: number;
  team_a_possession?: number;
  team_b_possession?: number;
  team_a_shots?: number;
  team_b_shots?: number;
  team_a_shotsOnTarget?: number;
  team_b_shotsOnTarget?: number;
  team_a_fouls?: number;
  team_b_fouls?: number;
  team_a_yellow_cards?: number;
  team_b_yellow_cards?: number;
  team_a_red_cards?: number;
  team_b_red_cards?: number;
  odds_ft_1?: number;
  odds_ft_X?: number;
  odds_ft_2?: number;
  btts_potential?: number;
  o15_potential?: number;
  o25_potential?: number;
  o35_potential?: number;
  avg_potential?: number;
  home_ppg?: number;
  away_ppg?: number;
}

interface FootyStatsTeamSeason {
  id: number;
  name: string;
  stats?: {
    seasonScoredAVG?: number;
    seasonConcededAVG?: number;
    seasonScoredAVG_home?: number;
    seasonScoredAVG_away?: number;
    points?: number;
    position?: number;
    matches_played?: number;
    wins?: number;
    draws?: number;
    losses?: number;
    goals_for?: number;
    goals_against?: number;
    goal_difference?: number;
  };
}

// Função para fazer requisições à API FootyStats com retry
async function fetchFootyStats(endpoint: string, params: Record<string, any> = {}) {
  const url = new URL(`${FOOTYSTATS_BASE_URL}${endpoint}`);
  url.searchParams.append('key', FOOTYSTATS_API_KEY!);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value.toString());
    }
  });

  console.log(`🔍 Fazendo requisição para: ${url.toString()}`);

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'OddGeniusFootyStats/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`API Error: ${data.message || 'Unknown error'}`);
  }

  return data.data;
}

// Função para sincronizar ligas
export async function syncLeagues() {
  try {
    console.log('🔄 Sincronizando ligas...');

    const leagues = await fetchFootyStats('/league-list', {
      chosen_leagues_only: true
    });

    console.log(`📊 Encontradas ${leagues.length} ligas`);

    let totalSeasons = 0;

    for (const league of leagues) {
      // Cada liga tem múltiplas temporadas
      if (league.season && Array.isArray(league.season)) {
        for (const season of league.season) {
          // Considerar apenas temporadas recentes (2020+)
          if (season.year >= 2020) {
            await prisma.league.upsert({
              where: { season_id: season.id },
              update: {
                league_name: `${league.name} ${season.year}`,
                country: league.country,
                is_current: season.year >= 2024, // Temporadas 2024+ são consideradas atuais
                updated_at: new Date(),
              },
              create: {
                season_id: season.id,
                league_name: `${league.name} ${season.year}`,
                country: league.country,
                is_current: season.year >= 2024,
              },
            });
            totalSeasons++;
          }
        }
      }
    }

    console.log(`✅ ${totalSeasons} temporadas sincronizadas com sucesso`);
    return totalSeasons;
  } catch (error) {
    console.error('❌ Erro ao sincronizar ligas:', error);
    throw error;
  }
}

// Função para sincronizar times de uma liga
export async function syncLeagueTeams(seasonId: number) {
  try {
    console.log(`🔄 Sincronizando times da liga ${seasonId}...`);
    
    const seasonData = await fetchFootyStats('/league-season', {
      season_id: seasonId
    });

    if (!seasonData.teams || !Array.isArray(seasonData.teams)) {
      console.log(`⚠️ Nenhum time encontrado para a liga ${seasonId}`);
      return 0;
    }

    const teams: FootyStatsTeamSeason[] = seasonData.teams;
    console.log(`📊 Encontrados ${teams.length} times na liga ${seasonId}`);

    for (const teamData of teams) {
      // Inserir/atualizar time
      await prisma.team.upsert({
        where: { team_id: teamData.id },
        update: {
          name: teamData.name,
          updated_at: new Date(),
        },
        create: {
          team_id: teamData.id,
          name: teamData.name,
        },
      });

      // Inserir/atualizar estatísticas da temporada
      await prisma.teamSeason.upsert({
        where: {
          team_id_league_id: {
            team_id: teamData.id,
            league_id: seasonId,
          },
        },
        update: {
          points: teamData.stats?.points,
          position: teamData.stats?.position,
          matches_played: teamData.stats?.matches_played,
          wins: teamData.stats?.wins,
          draws: teamData.stats?.draws,
          losses: teamData.stats?.losses,
          goals_for: teamData.stats?.goals_for,
          goals_against: teamData.stats?.goals_against,
          goal_difference: teamData.stats?.goal_difference,
          seasonScoredAVG: teamData.stats?.seasonScoredAVG,
          seasonConcededAVG: teamData.stats?.seasonConcededAVG,
          seasonScoredAVG_home: teamData.stats?.seasonScoredAVG_home,
          seasonScoredAVG_away: teamData.stats?.seasonScoredAVG_away,
          stats_json: JSON.stringify(teamData.stats),
          updated_at: new Date(),
        },
        create: {
          team_id: teamData.id,
          league_id: seasonId,
          points: teamData.stats?.points,
          position: teamData.stats?.position,
          matches_played: teamData.stats?.matches_played,
          wins: teamData.stats?.wins,
          draws: teamData.stats?.draws,
          losses: teamData.stats?.losses,
          goals_for: teamData.stats?.goals_for,
          goals_against: teamData.stats?.goals_against,
          goal_difference: teamData.stats?.goal_difference,
          seasonScoredAVG: teamData.stats?.seasonScoredAVG,
          seasonConcededAVG: teamData.stats?.seasonConcededAVG,
          seasonScoredAVG_home: teamData.stats?.seasonScoredAVG_home,
          seasonScoredAVG_away: teamData.stats?.seasonScoredAVG_away,
          stats_json: JSON.stringify(teamData.stats),
        },
      });
    }

    console.log(`✅ Times da liga ${seasonId} sincronizados com sucesso`);
    return teams.length;
  } catch (error) {
    console.error(`❌ Erro ao sincronizar times da liga ${seasonId}:`, error);
    throw error;
  }
}

// Função para sincronizar partidas de uma liga
export async function syncLeagueMatches(seasonId: number, page: number = 1) {
  try {
    console.log(`🔄 Sincronizando partidas da liga ${seasonId} (página ${page})...`);
    
    const matches: FootyStatsMatch[] = await fetchFootyStats('/league-matches', {
      season_id: seasonId,
      page: page,
      max_per_page: 500
    });

    console.log(`📊 Encontradas ${matches.length} partidas na página ${page}`);

    for (const match of matches) {
      await prisma.match.upsert({
        where: { match_id: match.id },
        update: {
          status: match.status,
          homeGoalCount: match.homeGoalCount || 0,
          awayGoalCount: match.awayGoalCount || 0,
          stadium_name: match.stadium_name,
          stadium_location: match.stadium_location,
          refereeID: match.refereeID,
          team_a_possession: match.team_a_possession,
          team_b_possession: match.team_b_possession,
          team_a_shots: match.team_a_shots,
          team_b_shots: match.team_b_shots,
          team_a_shotsOnTarget: match.team_a_shotsOnTarget,
          team_b_shotsOnTarget: match.team_b_shotsOnTarget,
          team_a_fouls: match.team_a_fouls,
          team_b_fouls: match.team_b_fouls,
          team_a_yellow_cards: match.team_a_yellow_cards,
          team_b_yellow_cards: match.team_b_yellow_cards,
          team_a_red_cards: match.team_a_red_cards,
          team_b_red_cards: match.team_b_red_cards,
          odds_ft_1: match.odds_ft_1,
          odds_ft_X: match.odds_ft_X,
          odds_ft_2: match.odds_ft_2,
          btts_potential: match.btts_potential,
          o15_potential: match.o15_potential,
          o25_potential: match.o25_potential,
          o35_potential: match.o35_potential,
          avg_potential: match.avg_potential,
          home_ppg: match.home_ppg,
          away_ppg: match.away_ppg,
          updated_at: new Date(),
        },
        create: {
          match_id: match.id,
          home_team_id: match.homeID,
          away_team_id: match.awayID,
          league_id: match.season_id,
          date_unix: match.date_unix,
          status: match.status,
          homeGoalCount: match.homeGoalCount || 0,
          awayGoalCount: match.awayGoalCount || 0,
          stadium_name: match.stadium_name,
          stadium_location: match.stadium_location,
          refereeID: match.refereeID,
          team_a_possession: match.team_a_possession,
          team_b_possession: match.team_b_possession,
          team_a_shots: match.team_a_shots,
          team_b_shots: match.team_b_shots,
          team_a_shotsOnTarget: match.team_a_shotsOnTarget,
          team_b_shotsOnTarget: match.team_b_shotsOnTarget,
          team_a_fouls: match.team_a_fouls,
          team_b_fouls: match.team_b_fouls,
          team_a_yellow_cards: match.team_a_yellow_cards,
          team_b_yellow_cards: match.team_b_yellow_cards,
          team_a_red_cards: match.team_a_red_cards,
          team_b_red_cards: match.team_b_red_cards,
          odds_ft_1: match.odds_ft_1,
          odds_ft_X: match.odds_ft_X,
          odds_ft_2: match.odds_ft_2,
          btts_potential: match.btts_potential,
          o15_potential: match.o15_potential,
          o25_potential: match.o25_potential,
          o35_potential: match.o35_potential,
          avg_potential: match.avg_potential,
          home_ppg: match.home_ppg,
          away_ppg: match.away_ppg,
        },
      });
    }

    console.log(`✅ Partidas da liga ${seasonId} (página ${page}) sincronizadas com sucesso`);
    return matches.length;
  } catch (error) {
    console.error(`❌ Erro ao sincronizar partidas da liga ${seasonId}:`, error);
    throw error;
  }
}
