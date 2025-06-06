import axios from 'axios';
import { Match, Team, League, H2HStats, MatchesResponse, ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_FOOTY_STATS_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_FOOTY_STATS_API_KEY;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// API Service Class
export class FootyStatsAPI {
  // Get today's matches
  static async getTodaysMatches(date?: string): Promise<Match[]> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      console.log('🔍 Buscando partidas para:', targetDate);

      // Use our local database API route
      const url = `/api/db/matches?date=${targetDate}`;
      console.log('🗄️ URL da API local (banco):', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Resposta da API:', {
        success: data.success,
        dataLength: data.data?.length || 0,
        count: data.count,
        date: data.date
      });

      return data.data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar partidas de hoje:', error);
      return [];
    }
  }

  // Get upcoming matches (now using local database)
  static async getUpcomingMatches(days: number = 7): Promise<Match[]> {
    try {
      const matches: Match[] = [];
      const today = new Date();

      console.log('🔍 Buscando próximas partidas do banco local para', days, 'dias');

      // Get matches for next few days using our local database API
      for (let i = 0; i <= Math.min(days, 14); i++) { // Removido limite de 3 dias
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        try {
          const url = `/api/db/matches?date=${dateStr}`;

          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            const dayMatches = data.data || [];

            if (Array.isArray(dayMatches)) {
              // Filter for upcoming matches (futuras e não ao vivo)
              const upcomingDayMatches = dayMatches.filter((match: Match) => {
                const matchTime = match.date_unix * 1000;
                const now = Date.now();
                const timeDiff = matchTime - now;
                const hoursFromNow = timeDiff / (1000 * 60 * 60);

                // Considerar upcoming se:
                // 1. Status é incomplete E está no futuro
                // 2. E NÃO está dentro da janela de "ao vivo" (3 horas)
                return match.status === 'incomplete' &&
                       matchTime > now &&
                       hoursFromNow > 3; // Mais de 3 horas no futuro
              });

              matches.push(...upcomingDayMatches);
              console.log(`📅 ${dateStr}: ${upcomingDayMatches.length} próximas partidas`);
            }
          }
        } catch (dayError) {
          console.warn(`❌ Erro para ${dateStr}:`, dayError);
        }
      }

      console.log('📅 Total de próximas partidas encontradas:', matches.length);
      return matches;
    } catch (error) {
      console.error('❌ Erro ao buscar próximas partidas:', error);
      return [];
    }
  }

  // Get live matches (now using local database with smart endpoint)
  static async getLiveMatches(): Promise<Match[]> {
    try {
      console.log('🔍 Buscando partidas ao vivo do banco local...');

      const response = await fetch('/api/db/live-matches', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch live matches');
      }

      const liveMatches = data.data || [];

      console.log('🔍 Live matches search - Live matches found:', liveMatches.length);
      console.log('🔍 Debug info:', data.debug);

      if (liveMatches.length > 0) {
        console.log('🔴 Partidas ao vivo encontradas:', liveMatches.map((m: Match) =>
          `${m.homeName} vs ${m.awayName} (${m.status}) - ${new Date(m.date_unix * 1000).toLocaleString('pt-BR')}`
        ));
      }

      return liveMatches;
    } catch (error) {
      console.error('Error fetching live matches:', error);
      return [];
    }
  }

  // Get match details with H2H and stats
  static async getMatchDetails(matchId: number): Promise<Match & { h2h?: H2HStats }> {
    try {
      console.log('🔍 Buscando detalhes da partida:', matchId);

      // Use our internal API route to avoid CORS issues
      const url = `/api/match/${matchId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Detalhes da partida recebidos:', {
        success: data.success,
        hasData: !!data.data,
        matchId: data.matchId
      });

      if (!data.success) {
        throw new Error(data.error || 'Falha ao buscar detalhes da partida');
      }

      return data.data;
    } catch (error) {
      console.error('❌ Erro ao buscar detalhes da partida:', error);
      throw new Error('Falha ao carregar detalhes da partida');
    }
  }

  // Get league list (now using local database)
  static async getLeagues(): Promise<League[]> {
    try {
      console.log('🔍 Buscando ligas do banco local...');

      const response = await fetch('/api/db/leagues?current=true', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch leagues');
      }

      console.log(`📊 Encontradas ${data.data.length} ligas no banco`);
      return data.data || [];
    } catch (error) {
      console.error('Error fetching leagues:', error);
      throw new Error('Failed to fetch leagues');
    }
  }

  // Get league matches
  static async getLeagueMatches(seasonId: number, page: number = 1): Promise<Match[]> {
    try {
      const params: any = {
        key: API_KEY,
        season_id: seasonId,
        page: page,
        max_per_page: 500
      };

      const response = await api.get('/league-matches', { params });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching league matches:', error);
      throw new Error('Failed to fetch league matches');
    }
  }

  // Get team details (now using local database)
  static async getTeamDetails(teamId: number): Promise<Team> {
    try {
      console.log(`🔍 Buscando dados do time ${teamId} no banco local...`);

      const response = await fetch(`/api/db/teams/${teamId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch team details');
      }

      // Transform to expected format
      const teamData = data.data;
      return {
        id: teamData.id,
        name: teamData.name,
        cleanName: teamData.name,
        shortName: teamData.short_name || teamData.name,
        logo: teamData.logo || '',
        country: teamData.country || '',
        founded: teamData.founded || 0,
        venue: teamData.venue || '',
        capacity: teamData.capacity || 0
      };
    } catch (error) {
      console.error('Error fetching team details:', error);
      // Return a fallback team object instead of throwing
      return {
        id: teamId,
        name: `Team ${teamId}`,
        cleanName: `Team ${teamId}`,
        shortName: `T${teamId}`,
        logo: '',
        country: '',
        founded: 0,
        venue: '',
        capacity: 0
      };
    }
  }

  // Get multiple team details
  static async getMultipleTeamDetails(teamIds: number[]): Promise<{ [key: number]: Team }> {
    try {
      const teamPromises = teamIds.map(id => this.getTeamDetails(id));
      const teams = await Promise.all(teamPromises);

      const teamMap: { [key: number]: Team } = {};
      teams.forEach((team, index) => {
        teamMap[teamIds[index]] = team;
      });

      return teamMap;
    } catch (error) {
      console.error('Error fetching multiple team details:', error);
      return {};
    }
  }

  // Get league table/standings
  static async getLeagueTable(seasonId: number): Promise<any[]> {
    try {
      const params: any = {
        key: API_KEY,
        season_id: seasonId,
        include: 'stats'
      };

      const response = await api.get('/league-tables', { params });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching league table:', error);
      throw new Error('Failed to fetch league table');
    }
  }

  // Get BTTS stats for a league
  static async getBTTSStats(seasonId: number): Promise<any[]> {
    try {
      const params: any = {
        key: API_KEY,
        season_id: seasonId
      };

      const response = await api.get('/btts-stats', { params });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching BTTS stats:', error);
      throw new Error('Failed to fetch BTTS stats');
    }
  }

  // Get Over 2.5 stats for a league
  static async getOver25Stats(seasonId: number): Promise<any[]> {
    try {
      const params: any = {
        key: API_KEY,
        season_id: seasonId
      };

      const response = await api.get('/over-2.5-stats', { params });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching Over 2.5 stats:', error);
      throw new Error('Failed to fetch Over 2.5 stats');
    }
  }
}

// Utility functions
export const formatMatchTime = (unixTimestamp: number): string => {
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatMatchDate = (unixTimestamp: number): string => {
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const isMatchLive = (match: Match): boolean => {
  const now = Date.now();
  const matchTime = match.date_unix * 1000;
  const timeDiff = Math.abs(matchTime - now);
  const hoursFromMatch = timeDiff / (1000 * 60 * 60);

  // Considerar ao vivo se:
  // 1. Status indica explicitamente ao vivo
  const isLiveStatus = match.status === 'live' ||
                     match.status === 'inprogress' ||
                     match.status === 'playing';

  // 2. OU se está dentro de 3 horas do horário da partida E tem dados de jogo
  const isInGameWindow = hoursFromMatch <= 3;
  const hasGameData = (match.homeGoalCount > 0 || match.awayGoalCount > 0) ||
                     (match.team_a_possession && match.team_a_possession > 0) ||
                     (match.team_b_possession && match.team_b_possession > 0);

  // 3. OU se é recentemente completada (até 2 horas após) e tem dados
  const isRecentlyCompleted = match.status === 'complete' &&
                            hoursFromMatch <= 2 &&
                            hasGameData;

  return isLiveStatus || (isInGameWindow && hasGameData) || isRecentlyCompleted;
};

export const getMatchResult = (match: Match): string => {
  if (match.homeGoalCount > match.awayGoalCount) return 'home';
  if (match.awayGoalCount > match.homeGoalCount) return 'away';
  return 'draw';
};
