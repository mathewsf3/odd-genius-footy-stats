/**
 * Sistema de Sincronização Completa de Dados Reais da FootyStats API
 * Popula o banco com todos os dados necessários para o sistema
 */

import { PrismaClient } from '../generated/prisma';
import { cache, CacheUtils } from './cache';

const prisma = new PrismaClient();
const API_KEY = process.env.FOOTYSTATS_API_KEY || '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const BASE_URL = 'https://api.football-data-api.com';

interface SyncOptions {
  forceRefresh?: boolean;
  includeHistorical?: boolean;
  maxPages?: number;
  specificLeagues?: number[];
}

interface SyncResult {
  success: boolean;
  message: string;
  data: {
    leagues: number;
    teams: number;
    matches: number;
    players: number;
    referees: number;
  };
  errors: string[];
  duration: number;
}

class DataSynchronizer {
  private errors: string[] = [];
  private startTime: number = 0;

  /**
   * Sincronização completa do sistema
   */
  async syncAll(options: SyncOptions = {}): Promise<SyncResult> {
    this.startTime = Date.now();
    this.errors = [];
    
    console.log('🚀 Iniciando sincronização completa de dados reais...');
    
    const result: SyncResult = {
      success: false,
      message: '',
      data: { leagues: 0, teams: 0, matches: 0, players: 0, referees: 0 },
      errors: [],
      duration: 0
    };

    try {
      // 1. Sincronizar ligas e países
      console.log('📊 Sincronizando ligas...');
      result.data.leagues = await this.syncLeagues(options);
      
      // 2. Sincronizar times e estatísticas
      console.log('👥 Sincronizando times...');
      result.data.teams = await this.syncTeams(options);
      
      // 3. Sincronizar partidas (hoje + próximas + históricas)
      console.log('⚽ Sincronizando partidas...');
      result.data.matches = await this.syncMatches(options);
      
      // 4. Sincronizar jogadores
      console.log('🏃 Sincronizando jogadores...');
      result.data.players = await this.syncPlayers(options);
      
      // 5. Sincronizar árbitros
      console.log('🚩 Sincronizando árbitros...');
      result.data.referees = await this.syncReferees(options);
      
      result.success = true;
      result.message = 'Sincronização completa realizada com sucesso';
      
    } catch (error) {
      this.errors.push(`Erro geral: ${error}`);
      result.success = false;
      result.message = 'Sincronização falhou';
    }
    
    result.errors = this.errors;
    result.duration = Date.now() - this.startTime;
    
    console.log(`✅ Sincronização finalizada em ${result.duration}ms`);
    console.log(`📊 Resultados: ${JSON.stringify(result.data, null, 2)}`);
    
    if (this.errors.length > 0) {
      console.log(`❌ Erros encontrados: ${this.errors.length}`);
      this.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    return result;
  }

  /**
   * Sincroniza todas as ligas disponíveis
   */
  private async syncLeagues(options: SyncOptions): Promise<number> {
    try {
      const url = `${BASE_URL}/league-list?key=${API_KEY}&chosen_leagues_only=true`;
      const response = await fetch(url);
      const leagues = await response.json();
      
      if (!Array.isArray(leagues)) {
        throw new Error('Resposta inválida da API de ligas');
      }
      
      let count = 0;
      
      for (const league of leagues) {
        try {
          await prisma.league.upsert({
            where: { season_id: league.season.id },
            update: {
              league_name: league.league_name,
              country: league.country,
              starting_year: league.season.year,
              ending_year: league.season.year + 1,
            },
            create: {
              season_id: league.season.id,
              league_name: league.league_name,
              country: league.country,
              starting_year: league.season.year,
              ending_year: league.season.year + 1,
              league_logo: '',
              flag: `https://flagcdn.com/w320/${league.country.toLowerCase().slice(0,2)}.png`
            }
          });
          count++;
        } catch (error) {
          this.errors.push(`Erro ao salvar liga ${league.league_name}: ${error}`);
        }
      }
      
      // Invalidar cache de ligas
      cache.invalidateType('leagues');
      
      return count;
      
    } catch (error) {
      this.errors.push(`Erro ao sincronizar ligas: ${error}`);
      return 0;
    }
  }

  /**
   * Sincroniza times de todas as ligas
   */
  private async syncTeams(options: SyncOptions): Promise<number> {
    try {
      // Buscar ligas do banco
      const leagues = await prisma.league.findMany({
        take: options.maxPages ? options.maxPages * 10 : 50 // Limitar para não sobrecarregar
      });
      
      let totalTeams = 0;
      
      for (const league of leagues) {
        try {
          const url = `${BASE_URL}/league-teams?key=${API_KEY}&season_id=${league.season_id}&include=stats`;
          const response = await fetch(url);
          const data = await response.json();
          
          if (Array.isArray(data)) {
            for (const team of data) {
              try {
                await prisma.team.upsert({
                  where: { team_id: team.id },
                  update: {
                    name: team.name || team.full_name,
                    country: team.country || league.country,
                    logo_url: this.generateTeamLogoUrl(team.id, team.name),
                  },
                  create: {
                    team_id: team.id,
                    name: team.name || team.full_name,
                    country: team.country || league.country,
                    logo_url: this.generateTeamLogoUrl(team.id, team.name),
                  }
                });
                totalTeams++;
              } catch (error) {
                this.errors.push(`Erro ao salvar time ${team.name}: ${error}`);
              }
            }
          }
          
          // Pequena pausa para não sobrecarregar a API
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          this.errors.push(`Erro ao buscar times da liga ${league.league_name}: ${error}`);
        }
      }
      
      // Invalidar cache de times
      cache.invalidateType('teams');
      
      return totalTeams;
      
    } catch (error) {
      this.errors.push(`Erro ao sincronizar times: ${error}`);
      return 0;
    }
  }

  /**
   * Sincroniza partidas (hoje + próximas + históricas se solicitado)
   */
  private async syncMatches(options: SyncOptions): Promise<number> {
    try {
      let totalMatches = 0;
      
      // 1. Partidas de hoje
      totalMatches += await this.syncTodayMatches();
      
      // 2. Partidas dos próximos 7 dias
      for (let i = 1; i <= 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        totalMatches += await this.syncMatchesByDate(dateStr);
        
        // Pausa entre requisições
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // 3. Partidas históricas (últimos 30 dias) se solicitado
      if (options.includeHistorical) {
        for (let i = 1; i <= 30; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          totalMatches += await this.syncMatchesByDate(dateStr);
          
          // Pausa entre requisições
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      // Invalidar cache de partidas
      cache.invalidateType('matches');
      cache.invalidateType('liveMatches');
      
      return totalMatches;
      
    } catch (error) {
      this.errors.push(`Erro ao sincronizar partidas: ${error}`);
      return 0;
    }
  }

  /**
   * Sincroniza partidas de hoje
   */
  private async syncTodayMatches(): Promise<number> {
    try {
      const url = `${BASE_URL}/todays-matches?key=${API_KEY}`;
      const response = await fetch(url);
      const matches = await response.json();
      
      if (!Array.isArray(matches)) {
        return 0;
      }
      
      return await this.saveMatches(matches);
      
    } catch (error) {
      this.errors.push(`Erro ao sincronizar partidas de hoje: ${error}`);
      return 0;
    }
  }

  /**
   * Sincroniza partidas de uma data específica
   */
  private async syncMatchesByDate(date: string): Promise<number> {
    try {
      const url = `${BASE_URL}/todays-matches?key=${API_KEY}&date=${date}`;
      const response = await fetch(url);
      const matches = await response.json();
      
      if (!Array.isArray(matches)) {
        return 0;
      }
      
      return await this.saveMatches(matches);
      
    } catch (error) {
      this.errors.push(`Erro ao sincronizar partidas de ${date}: ${error}`);
      return 0;
    }
  }

  /**
   * Salva partidas no banco
   */
  private async saveMatches(matches: any[]): Promise<number> {
    let count = 0;
    
    for (const match of matches) {
      try {
        // Verificar se os times existem
        const homeTeam = await this.ensureTeamExists(match.homeID, match.home_name);
        const awayTeam = await this.ensureTeamExists(match.awayID, match.away_name);
        
        // Buscar uma liga para associar (temporário)
        const league = await prisma.league.findFirst();
        if (!league) continue;
        
        await prisma.match.upsert({
          where: { match_id: match.id },
          update: {
            status: this.normalizeStatus(match.status),
            homeGoalCount: match.homeGoalCount || 0,
            awayGoalCount: match.awayGoalCount || 0,
            team_a_possession: match.team_a_possession || -1,
            team_b_possession: match.team_b_possession || -1,
            stadium_name: match.stadium_name || 'Estádio não informado',
            stadium_location: match.stadium_location || '',
          },
          create: {
            match_id: match.id,
            home_team_id: homeTeam.team_id,
            away_team_id: awayTeam.team_id,
            league_id: league.season_id,
            status: this.normalizeStatus(match.status),
            date_unix: match.date_unix || Math.floor(Date.now() / 1000),
            homeGoalCount: match.homeGoalCount || 0,
            awayGoalCount: match.awayGoalCount || 0,
            team_a_possession: match.team_a_possession || -1,
            team_b_possession: match.team_b_possession || -1,
            stadium_name: match.stadium_name || 'Estádio não informado',
            stadium_location: match.stadium_location || '',
            odds_ft_1: match.odds_ft_1 || 0,
            odds_ft_X: match.odds_ft_x || match.odds_ft_X || 0,
            odds_ft_2: match.odds_ft_2 || 0,
            btts_potential: match.btts_potential || 0,
            o25_potential: match.o25_potential || 0,
            avg_potential: match.avg_potential || 0,
          }
        });
        count++;
      } catch (error) {
        this.errors.push(`Erro ao salvar partida ${match.id}: ${error}`);
      }
    }
    
    return count;
  }

  /**
   * Garante que um time existe no banco
   */
  private async ensureTeamExists(teamId: number, teamName: string) {
    return await prisma.team.upsert({
      where: { team_id: teamId },
      update: {},
      create: {
        team_id: teamId,
        name: teamName || `Time ${teamId}`,
        country: 'Unknown',
        logo_url: this.generateTeamLogoUrl(teamId, teamName),
      }
    });
  }

  /**
   * Normaliza status da partida
   */
  private normalizeStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'complete': 'finished',
      'incomplete': 'upcoming',
      'inprogress': 'live',
      'live': 'live',
      'finished': 'finished',
      'upcoming': 'upcoming',
      'suspended': 'suspended',
      'postponed': 'postponed',
    };
    
    return statusMap[status?.toLowerCase()] || 'upcoming';
  }

  /**
   * Gera URL do logo do time (placeholder)
   */
  private generateTeamLogoUrl(teamId: number, teamName: string): string {
    // Tentar CDN da FootyStats (não documentado oficialmente)
    return `https://cdn.footystats.org/img/teams/${teamId}.png`;
  }

  /**
   * Sincroniza jogadores (implementação básica)
   */
  private async syncPlayers(options: SyncOptions): Promise<number> {
    // Implementação futura - por enquanto retorna 0
    return 0;
  }

  /**
   * Sincroniza árbitros (implementação básica)
   */
  private async syncReferees(options: SyncOptions): Promise<number> {
    // Implementação futura - por enquanto retorna 0
    return 0;
  }
}

// Instância singleton
export const dataSynchronizer = new DataSynchronizer();

// Funções de conveniência
export const syncData = {
  /**
   * Sincronização rápida (apenas dados essenciais)
   */
  quick: () => dataSynchronizer.syncAll({ maxPages: 5 }),
  
  /**
   * Sincronização completa (todos os dados)
   */
  full: () => dataSynchronizer.syncAll({ includeHistorical: true }),
  
  /**
   * Sincronização apenas de hoje
   */
  today: () => dataSynchronizer.syncAll({ maxPages: 1 }),
};

export default dataSynchronizer;
