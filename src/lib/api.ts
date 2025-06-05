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

      // Use our internal API route to avoid CORS issues
      const url = `/api/matches?date=${targetDate}`;
      console.log('🌐 URL da API interna:', url);

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

  // Get upcoming matches
  static async getUpcomingMatches(days: number = 7): Promise<Match[]> {
    try {
      const matches: Match[] = [];
      const today = new Date();

      console.log('🔍 Buscando próximas partidas para', days, 'dias');

      // Get matches for next few days using our internal API
      for (let i = 1; i <= Math.min(days, 3); i++) { // Limit to 3 days
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        try {
          const url = `/api/matches?date=${dateStr}`;

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
              // Filter for upcoming matches
              const upcomingDayMatches = dayMatches.filter((match: Match) => {
                return match.status === 'incomplete' && match.date_unix * 1000 > Date.now();
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

  // Get live matches
  static async getLiveMatches(): Promise<Match[]> {
    try {
      // Try multiple dates to find live matches
      const dates = [
        new Date().toISOString().split('T')[0], // Today
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday
        new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
      ];

      let allMatches: Match[] = [];

      for (const date of dates) {
        const params = {
          key: API_KEY,
          date: date
        };

        const response = await api.get('/todays-matches', { params });
        const dayMatches = response.data.data || response.data || [];

        if (Array.isArray(dayMatches)) {
          allMatches.push(...dayMatches);
        }
      }

      // Filter for live matches with multiple status checks
      const liveMatches = allMatches.filter((match: Match) =>
        match.status === 'live' ||
        match.status === 'incomplete' ||
        match.status === 'inprogress' ||
        match.status === 'playing' ||
        (match.status === 'complete' && match.homeGoalCount >= 0 && match.awayGoalCount >= 0) // Recently completed
      );

      console.log('🔍 Live matches search - Total matches found:', allMatches.length);
      console.log('🔍 Live matches search - Live matches found:', liveMatches.length);

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

  // Get league list
  static async getLeagues(): Promise<League[]> {
    try {
      const response = await api.get('/leagues');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching leagues:', error);
      throw new Error('Failed to fetch leagues');
    }
  }

  // Get league matches
  static async getLeagueMatches(leagueId: number, season?: string): Promise<Match[]> {
    try {
      const params: any = { league_id: leagueId };
      if (season) params.season = season;
      
      const response = await api.get('/league-matches', { params });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching league matches:', error);
      throw new Error('Failed to fetch league matches');
    }
  }

  // Get team details
  static async getTeamDetails(teamId: number): Promise<Team> {
    try {
      const params = {
        key: API_KEY,
        team_id: teamId
      };

      const response = await api.get('/team', { params });
      return response.data.data || response.data;
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
  static async getLeagueTable(leagueId: number, season?: string): Promise<any[]> {
    try {
      const params: any = { league_id: leagueId };
      if (season) params.season = season;
      
      const response = await api.get('/league-table', { params });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching league table:', error);
      throw new Error('Failed to fetch league table');
    }
  }

  // Get BTTS stats for a league
  static async getBTTSStats(leagueId: number, season?: string): Promise<any[]> {
    try {
      const params: any = { league_id: leagueId };
      if (season) params.season = season;
      
      const response = await api.get('/btts-stats', { params });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching BTTS stats:', error);
      throw new Error('Failed to fetch BTTS stats');
    }
  }

  // Get Over 2.5 stats for a league
  static async getOver25Stats(leagueId: number, season?: string): Promise<any[]> {
    try {
      const params: any = { league_id: leagueId };
      if (season) params.season = season;
      
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
  return match.status === 'live' || match.status === 'incomplete';
};

export const getMatchResult = (match: Match): string => {
  if (match.homeGoalCount > match.awayGoalCount) return 'home';
  if (match.awayGoalCount > match.homeGoalCount) return 'away';
  return 'draw';
};
