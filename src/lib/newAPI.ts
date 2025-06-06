/**
 * 🚀 COMPLETE BACKEND API CLIENT - FULL UPDATE
 * Sistema completo para FootyStats API com dados reais
 * Implementação robusta com fallbacks e cache
 */

import { Match, Team, League } from '@/types';
import { cache, CacheUtils } from './cache';

/**
 * 🔥 COMPLETE FootyStats API Client - DADOS REAIS
 */
export class NewFootyStatsAPI {
  
  /**
   * Buscar ligas disponíveis
   */
  static async getLeagues(chosenOnly: boolean = true): Promise<League[]> {
    try {
      console.log('🔍 Buscando ligas...');
      
      const params = new URLSearchParams();
      if (chosenOnly) {
        params.append('chosen_leagues_only', 'true');
      }
      
      const response = await fetch(`/api/footystats/leagues?${params}`, {
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

      console.log(`📊 Encontradas ${data.data.length} ligas`);
      
      // Transformar para formato esperado pelo frontend
      return data.data.map((league: any) => ({
        id: league.season.id,
        name: league.name,
        country: league.country,
        current: true, // FootyStats retorna apenas ligas ativas quando chosen_leagues_only=true
        image: league.image || '',
        season: league.season
      }));
      
    } catch (error) {
      console.error('❌ Erro ao buscar ligas:', error);
      throw new Error('Failed to fetch leagues');
    }
  }

  /**
   * Buscar partidas de hoje
   */
  static async getTodaysMatches(date?: string): Promise<Match[]> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      console.log('🔍 Buscando partidas para:', targetDate);

      const params = new URLSearchParams();
      params.append('date', targetDate);
      params.append('type', 'all');

      const response = await fetch(`/api/footystats/matches?${params}`, {
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
        throw new Error(data.message || 'Failed to fetch matches');
      }

      console.log(`📊 Encontradas ${data.data.length} partidas`);
      return data.data || [];
      
    } catch (error) {
      console.error('❌ Erro ao buscar partidas de hoje:', error);
      throw new Error('Failed to fetch today matches');
    }
  }

  /**
   * 🔴 Buscar partidas ao vivo - ENDPOINT CORRIGIDO
   * Usa novo endpoint com timezone e filtros corretos
   */
  static async getLiveMatches(date?: string): Promise<Match[]> {
    return await CacheUtils.withCache(
      'liveMatches',
      { date: date || 'today' },
      async () => {
        console.log('🔴 BUSCANDO PARTIDAS AO VIVO - ENDPOINT CORRIGIDO...');

        // Usar novo endpoint corrigido
        const response = await fetch('/api/matches/live', {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch live matches');
        }

        const liveMatches = data.data || [];

        console.log(`🔴 PARTIDAS AO VIVO ENCONTRADAS: ${liveMatches.length}`);
        console.log(`📊 Fonte: ${data.source}`);

        return liveMatches;
      },
      30 // Cache por 30 segundos para dados ao vivo
    );
  }

  /**
   * 📅 Buscar próximas partidas - ENDPOINT CORRIGIDO
   * Usa novo endpoint com timezone e filtros corretos
   */
  static async getUpcomingMatches(days: number = 7): Promise<Match[]> {
    return await CacheUtils.withCache(
      'upcomingMatches',
      { days },
      async () => {
        console.log(`📅 BUSCANDO PRÓXIMAS PARTIDAS - ENDPOINT CORRIGIDO...`);

        // Usar novo endpoint corrigido
        const response = await fetch('/api/matches/upcoming', {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch upcoming matches');
        }

        const upcomingMatches = data.data || [];

        console.log(`📅 PRÓXIMAS PARTIDAS ENCONTRADAS: ${upcomingMatches.length}`);
        console.log(`📊 Fonte: ${data.source}`);

        return upcomingMatches;
      },
      300 // Cache por 5 minutos para próximas partidas
    );
  }



  /**
   * Buscar detalhes de um time
   */
  static async getTeamDetails(teamId: number): Promise<Team> {
    try {
      console.log(`🔍 Buscando dados do time ${teamId}...`);
      
      const response = await fetch(`/api/footystats/teams/${teamId}`, {
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

      console.log(`✅ Dados do time encontrados: ${data.data.name}`);
      return data.data;
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados do time:', error);
      // Retorna um time fallback em caso de erro
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

  /**
   * Buscar dados de uma temporada/liga
   */
  static async getLeagueSeason(seasonId: number): Promise<any> {
    try {
      console.log(`🔍 Buscando dados da temporada ${seasonId}...`);
      
      const response = await fetch(`/api/footystats/league-season/${seasonId}`, {
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
        throw new Error(data.message || 'Failed to fetch league season');
      }

      console.log(`✅ Dados da temporada encontrados: ${data.data.summary.total_teams} times`);
      return data.data;
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados da temporada:', error);
      throw new Error('Failed to fetch league season');
    }
  }
}

// Função auxiliar para verificar se uma partida está ao vivo
export const isMatchLive = (match: Match): boolean => {
  return match.status === 'live' || 
         match.status === 'inprogress' || 
         match.status === 'playing';
};

// Função auxiliar para verificar se uma partida é futura
export const isMatchUpcoming = (match: Match): boolean => {
  const now = Date.now();
  const matchTime = match.date_unix * 1000;
  
  return match.status === 'incomplete' && matchTime > now;
};

// Função auxiliar para verificar se uma partida está completa
export const isMatchCompleted = (match: Match): boolean => {
  return match.status === 'complete' || 
         match.status === 'finished';
};
