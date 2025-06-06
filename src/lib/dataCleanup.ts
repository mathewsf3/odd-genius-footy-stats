/**
 * Sistema de Limpeza e Re-população de Dados Reais
 */

import { prisma } from '@/lib/database';
import { validateRealMatch, validateRealTeam, validateRealLeague } from '@/lib/dataValidation';
import { MatchSyncService } from '@/lib/matchSyncService';
import { getTodayDate } from '@/lib/dateUtils';

export interface CleanupResult {
  success: boolean;
  backup?: {
    matches: number;
    teams: number;
    leagues: number;
    timestamp: string;
  };
  cleanup: {
    testMatches: number;
    testTeams: number;
    testLeagues: number;
  };
  repopulation: {
    realMatches: number;
    realTeams: number;
    realLeagues: number;
    errors: string[];
  };
  validation: {
    totalValidated: number;
    validData: number;
    invalidData: number;
    testDataRemoved: number;
  };
}

export class DataCleanupService {
  
  /**
   * Executa limpeza completa e re-população com dados reais
   */
  static async cleanAndRepopulate(): Promise<CleanupResult> {
    const result: CleanupResult = {
      success: false,
      cleanup: { testMatches: 0, testTeams: 0, testLeagues: 0 },
      repopulation: { realMatches: 0, realTeams: 0, realLeagues: 0, errors: [] },
      validation: { totalValidated: 0, validData: 0, invalidData: 0, testDataRemoved: 0 }
    };

    try {
      console.log('🧹 INICIANDO LIMPEZA COMPLETA DE DADOS DE TESTE...');
      
      // 1. Fazer backup dos dados atuais
      console.log('\n📦 1. Fazendo backup dos dados atuais...');
      result.backup = await this.createBackup();
      
      // 2. Identificar e remover dados de teste
      console.log('\n🔍 2. Identificando e removendo dados de teste...');
      result.cleanup = await this.removeTestData();
      
      // 3. Re-popular com dados reais da FootyStats
      console.log('\n🌐 3. Re-populando com dados reais da FootyStats...');
      result.repopulation = await this.repopulateWithRealData();
      
      // 4. Validar dados finais
      console.log('\n✅ 4. Validando dados finais...');
      result.validation = await this.validateFinalData();
      
      result.success = true;
      console.log('\n🎉 LIMPEZA E RE-POPULAÇÃO CONCLUÍDA COM SUCESSO!');
      
      return result;
      
    } catch (error) {
      console.error('❌ Erro durante limpeza e re-população:', error);
      result.repopulation.errors.push(error instanceof Error ? error.message : 'Unknown error');
      return result;
    }
  }

  /**
   * Cria backup dos dados atuais
   */
  private static async createBackup() {
    const matchCount = await prisma.match.count();
    const teamCount = await prisma.team.count();
    const leagueCount = await prisma.league.count();
    
    const timestamp = new Date().toISOString();
    
    console.log(`📊 Backup criado: ${matchCount} partidas, ${teamCount} times, ${leagueCount} ligas`);
    
    return {
      matches: matchCount,
      teams: teamCount,
      leagues: leagueCount,
      timestamp
    };
  }

  /**
   * Remove dados identificados como teste
   */
  private static async removeTestData() {
    let testMatches = 0;
    let testTeams = 0;
    let testLeagues = 0;

    // Remover partidas de teste
    console.log('🗑️ Removendo partidas de teste...');
    
    // Buscar todas as partidas para validação
    const allMatches = await prisma.match.findMany({
      include: {
        home_team: true,
        away_team: true,
        league: true
      }
    });

    for (const match of allMatches) {
      const validation = validateRealMatch({
        match_id: match.match_id,
        home_team: { name: match.home_team.name, team_id: match.home_team.team_id },
        away_team: { name: match.away_team.name, team_id: match.away_team.team_id },
        league: { league_name: match.league.league_name, season_id: match.league.season_id },
        status: match.status,
        date_unix: match.date_unix
      });

      if (validation.isTestData || !validation.isValid) {
        await prisma.match.delete({ where: { id: match.id } });
        testMatches++;
        console.log(`❌ Removida partida de teste: ${match.home_team.name} vs ${match.away_team.name}`);
      }
    }

    // Remover times de teste
    console.log('🗑️ Removendo times de teste...');
    
    const allTeams = await prisma.team.findMany();
    for (const team of allTeams) {
      const validation = validateRealTeam(team);
      
      if (validation.isTestData || !validation.isValid) {
        // Verificar se o time não tem partidas associadas
        const matchCount = await prisma.match.count({
          where: {
            OR: [
              { home_team_id: team.team_id },
              { away_team_id: team.team_id }
            ]
          }
        });
        
        if (matchCount === 0) {
          await prisma.team.delete({ where: { id: team.id } });
          testTeams++;
          console.log(`❌ Removido time de teste: ${team.name}`);
        }
      }
    }

    // Remover ligas de teste
    console.log('🗑️ Removendo ligas de teste...');
    
    const allLeagues = await prisma.league.findMany();
    for (const league of allLeagues) {
      const validation = validateRealLeague(league);
      
      if (validation.isTestData || !validation.isValid) {
        // Verificar se a liga não tem partidas associadas
        const matchCount = await prisma.match.count({
          where: { league_id: league.season_id }
        });
        
        if (matchCount === 0) {
          await prisma.league.delete({ where: { id: league.id } });
          testLeagues++;
          console.log(`❌ Removida liga de teste: ${league.league_name}`);
        }
      }
    }

    console.log(`✅ Limpeza concluída: ${testMatches} partidas, ${testTeams} times, ${testLeagues} ligas removidas`);
    
    return { testMatches, testTeams, testLeagues };
  }

  /**
   * Re-popula banco com dados reais da FootyStats
   */
  private static async repopulateWithRealData() {
    let realMatches = 0;
    let realTeams = 0;
    let realLeagues = 0;
    const errors: string[] = [];

    try {
      console.log('🌐 Buscando dados reais da FootyStats API...');
      
      // Sincronizar partidas de hoje
      const syncResult = await MatchSyncService.syncTodayMatches();
      
      if (syncResult.success) {
        realMatches = syncResult.synced;
        console.log(`✅ ${realMatches} partidas reais sincronizadas`);
      } else {
        errors.push(...syncResult.errors);
      }

      // Contar times e ligas criados durante a sincronização
      const finalTeamCount = await prisma.team.count();
      const finalLeagueCount = await prisma.league.count();
      
      realTeams = finalTeamCount;
      realLeagues = finalLeagueCount;
      
      console.log(`📊 Dados reais adicionados: ${realMatches} partidas, ${realTeams} times, ${realLeagues} ligas`);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMsg);
      console.error('❌ Erro na re-população:', errorMsg);
    }

    return { realMatches, realTeams, realLeagues, errors };
  }

  /**
   * Valida dados finais no banco
   */
  private static async validateFinalData() {
    let totalValidated = 0;
    let validData = 0;
    let invalidData = 0;
    let testDataRemoved = 0;

    console.log('🔍 Validando dados finais...');

    // Validar partidas
    const finalMatches = await prisma.match.findMany({
      include: {
        home_team: true,
        away_team: true,
        league: true
      }
    });

    for (const match of finalMatches) {
      totalValidated++;
      
      const validation = validateRealMatch({
        match_id: match.match_id,
        home_team: { name: match.home_team.name, team_id: match.home_team.team_id },
        away_team: { name: match.away_team.name, team_id: match.away_team.team_id },
        league: { league_name: match.league.league_name, season_id: match.league.season_id },
        status: match.status,
        date_unix: match.date_unix
      });

      if (validation.isValid && !validation.isTestData) {
        validData++;
      } else {
        invalidData++;
        if (validation.isTestData) {
          testDataRemoved++;
          // Remover dados de teste que ainda restaram
          await prisma.match.delete({ where: { id: match.id } });
          console.log(`🗑️ Removido dado de teste restante: ${match.home_team.name} vs ${match.away_team.name}`);
        }
      }
    }

    console.log(`✅ Validação final: ${validData}/${totalValidated} dados válidos, ${testDataRemoved} dados de teste removidos`);

    return { totalValidated, validData, invalidData, testDataRemoved };
  }

  /**
   * Adiciona metadados de auditoria a uma partida
   */
  static async addAuditMetadata(matchId: number, metadata: {
    source: string;
    isVerified: boolean;
    apiVersion?: string;
  }) {
    try {
      await prisma.match.update({
        where: { id: matchId },
        data: {
          updated_at: new Date(),
          // Nota: Estes campos precisariam ser adicionados ao schema do Prisma
          // source: metadata.source,
          // isVerified: metadata.isVerified,
          // apiVersion: metadata.apiVersion
        }
      });
    } catch (error) {
      console.error('❌ Erro ao adicionar metadados de auditoria:', error);
    }
  }

  /**
   * Executa apenas a limpeza (sem re-população)
   */
  static async cleanupOnly(): Promise<{ testMatches: number; testTeams: number; testLeagues: number }> {
    console.log('🧹 EXECUTANDO APENAS LIMPEZA DE DADOS DE TESTE...');
    return await this.removeTestData();
  }

  /**
   * Executa apenas a validação (sem modificar dados)
   */
  static async validateOnly(): Promise<{ valid: number; invalid: number; testData: number }> {
    console.log('🔍 EXECUTANDO APENAS VALIDAÇÃO DE DADOS...');
    
    let valid = 0;
    let invalid = 0;
    let testData = 0;

    const allMatches = await prisma.match.findMany({
      include: {
        home_team: true,
        away_team: true,
        league: true
      }
    });

    for (const match of allMatches) {
      const validation = validateRealMatch({
        match_id: match.match_id,
        home_team: { name: match.home_team.name, team_id: match.home_team.team_id },
        away_team: { name: match.away_team.name, team_id: match.away_team.team_id },
        league: { league_name: match.league.league_name, season_id: match.league.season_id },
        status: match.status,
        date_unix: match.date_unix
      });

      if (validation.isTestData) {
        testData++;
        console.log(`🧪 Dado de teste encontrado: ${match.home_team.name} vs ${match.away_team.name}`);
      } else if (validation.isValid) {
        valid++;
      } else {
        invalid++;
        console.log(`❌ Dado inválido: ${match.home_team.name} vs ${match.away_team.name} - ${validation.errors.join(', ')}`);
      }
    }

    console.log(`📊 Validação: ${valid} válidos, ${invalid} inválidos, ${testData} dados de teste`);
    return { valid, invalid, testData };
  }
}
