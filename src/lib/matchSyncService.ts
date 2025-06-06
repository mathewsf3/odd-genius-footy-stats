/**
 * Serviço de sincronização de partidas com a FootyStats API
 */

import { prisma } from '@/lib/database';
import { getTodayDate, getCurrentUnixTimestamp } from '@/lib/dateUtils';

const FOOTYSTATS_API_KEY = process.env.FOOTYSTATS_API_KEY;
const FOOTYSTATS_BASE_URL = process.env.FOOTYSTATS_BASE_URL;

interface FootyStatsMatch {
  id: number;
  homeID: number;
  awayID: number;
  home_name: string;
  away_name: string;
  home_image: string;
  away_image: string;
  season_id: number;
  status: string;
  date_unix: number;
  homeGoalCount: number;
  awayGoalCount: number;
  team_a_possession?: number;
  team_b_possession?: number;
  stadium_name?: string;
  stadium_location?: string;
  competition_name?: string;
  league_name?: string;
  avg_potential?: number;
  btts_potential?: number;
  o25_potential?: number;
  odds_ft_1?: number;
  odds_ft_X?: number;
  odds_ft_2?: number;
}

export class MatchSyncService {
  /**
   * Sincroniza partidas de hoje da FootyStats API
   */
  static async syncTodayMatches(): Promise<{ success: boolean; synced: number; errors: string[] }> {
    const errors: string[] = [];
    let syncedCount = 0;

    try {
      console.log('🔄 Iniciando sincronização de partidas de hoje...');
      
      const today = getTodayDate();
      const apiUrl = `${FOOTYSTATS_BASE_URL}/todays-matches?key=${FOOTYSTATS_API_KEY}&date=${today}`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'OddGeniusFootyStats/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const apiData = await response.json();
      const matches = apiData.data || [];
      
      console.log(`📡 API retornou ${matches.length} partidas para ${today}`);

      for (const match of matches) {
        try {
          await this.syncSingleMatch(match);
          syncedCount++;
        } catch (error) {
          const errorMsg = `Erro ao sincronizar partida ${match.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      console.log(`✅ Sincronização concluída: ${syncedCount} partidas sincronizadas, ${errors.length} erros`);

      return {
        success: errors.length === 0,
        synced: syncedCount,
        errors
      };

    } catch (error) {
      const errorMsg = `Erro geral na sincronização: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMsg);
      errors.push(errorMsg);
      
      return {
        success: false,
        synced: syncedCount,
        errors
      };
    }
  }

  /**
   * Sincroniza uma única partida
   */
  private static async syncSingleMatch(match: FootyStatsMatch): Promise<void> {
    // 1. Verificar/criar times
    const homeTeam = await this.ensureTeamExists({
      team_id: match.homeID,
      name: match.home_name,
      logo_url: match.home_image
    });

    const awayTeam = await this.ensureTeamExists({
      team_id: match.awayID,
      name: match.away_name,
      logo_url: match.away_image
    });

    // 2. Verificar/criar liga
    const league = await this.ensureLeagueExists({
      season_id: match.season_id || 0, // Usar 0 como fallback se season_id for undefined
      league_name: match.competition_name || match.league_name || 'Liga desconhecida'
    });

    // 3. Criar/atualizar partida
    await prisma.match.upsert({
      where: {
        match_id: match.id
      },
      update: {
        status: match.status,
        homeGoalCount: match.homeGoalCount || 0,
        awayGoalCount: match.awayGoalCount || 0,
        team_a_possession: match.team_a_possession || null,
        team_b_possession: match.team_b_possession || null,
        stadium_name: match.stadium_name || null,
        stadium_location: match.stadium_location || null,
        avg_potential: match.avg_potential || null,
        btts_potential: match.btts_potential || null,
        o25_potential: match.o25_potential || null,
        odds_ft_1: match.odds_ft_1 || null,
        odds_ft_X: match.odds_ft_X || null,
        odds_ft_2: match.odds_ft_2 || null,
        updated_at: new Date()
      },
      create: {
        match_id: match.id,
        home_team_id: homeTeam.team_id,
        away_team_id: awayTeam.team_id,
        league_id: league.season_id,
        date_unix: match.date_unix,
        status: match.status,
        homeGoalCount: match.homeGoalCount || 0,
        awayGoalCount: match.awayGoalCount || 0,
        team_a_possession: match.team_a_possession || null,
        team_b_possession: match.team_b_possession || null,
        stadium_name: match.stadium_name || null,
        stadium_location: match.stadium_location || null,
        avg_potential: match.avg_potential || null,
        btts_potential: match.btts_potential || null,
        o25_potential: match.o25_potential || null,
        odds_ft_1: match.odds_ft_1 || null,
        odds_ft_X: match.odds_ft_X || null,
        odds_ft_2: match.odds_ft_2 || null,
      }
    });
  }

  /**
   * Garante que um time existe no banco
   */
  private static async ensureTeamExists(teamData: { team_id: number; name: string; logo_url?: string }) {
    return await prisma.team.upsert({
      where: {
        team_id: teamData.team_id
      },
      update: {
        name: teamData.name,
        logo_url: teamData.logo_url || null,
        updated_at: new Date()
      },
      create: {
        team_id: teamData.team_id,
        name: teamData.name,
        logo_url: teamData.logo_url || null,
        country: null
      }
    });
  }

  /**
   * Garante que uma liga existe no banco
   */
  private static async ensureLeagueExists(leagueData: { season_id: number; league_name: string }) {
    return await prisma.league.upsert({
      where: {
        season_id: leagueData.season_id
      },
      update: {
        league_name: leagueData.league_name,
        updated_at: new Date()
      },
      create: {
        season_id: leagueData.season_id,
        league_name: leagueData.league_name,
        country: 'Unknown',
        is_current: true
      }
    });
  }

  /**
   * Remove partidas antigas do banco (mais de 7 dias)
   */
  static async cleanupOldMatches(): Promise<number> {
    const sevenDaysAgo = getCurrentUnixTimestamp() - (7 * 24 * 60 * 60);
    
    const result = await prisma.match.deleteMany({
      where: {
        date_unix: {
          lt: sevenDaysAgo
        },
        status: {
          in: ['complete', 'finished', 'ended']
        }
      }
    });

    console.log(`🗑️ Removidas ${result.count} partidas antigas`);
    return result.count;
  }

  /**
   * Atualiza status de partidas que podem ter mudado
   */
  static async updateMatchStatuses(): Promise<number> {
    const now = getCurrentUnixTimestamp();
    const threeHoursAgo = now - (3 * 60 * 60);
    
    // Buscar partidas que podem ter mudado de status
    const matches = await prisma.match.findMany({
      where: {
        date_unix: {
          gte: threeHoursAgo,
          lte: now + (60 * 60) // 1 hora no futuro
        },
        status: {
          in: ['incomplete', 'live', 'inprogress', 'playing']
        }
      }
    });

    let updatedCount = 0;

    for (const match of matches) {
      // Lógica para atualizar status baseado no tempo
      const timeDiff = now - match.date_unix;
      const hoursFromStart = timeDiff / 3600;

      let newStatus = match.status;

      if (hoursFromStart > 2.5 && match.status !== 'complete') {
        // Partida provavelmente terminou
        newStatus = 'complete';
      } else if (hoursFromStart > 0 && hoursFromStart <= 2.5 && match.status === 'incomplete') {
        // Partida provavelmente está ao vivo
        newStatus = 'live';
      }

      if (newStatus !== match.status) {
        await prisma.match.update({
          where: { id: match.id },
          data: { status: newStatus }
        });
        updatedCount++;
      }
    }

    console.log(`🔄 Atualizados ${updatedCount} status de partidas`);
    return updatedCount;
  }
}
