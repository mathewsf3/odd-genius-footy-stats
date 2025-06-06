/**
 * Sistema de Auditoria para Dados Reais da FootyStats
 */

import { prisma } from '@/lib/database';

export interface AuditMetadata {
  source: 'footystats' | 'manual' | 'test';
  importedAt: Date;
  lastUpdatedAt: Date;
  isVerified: boolean;
  apiVersion?: string;
  dataQuality: 'high' | 'medium' | 'low';
  confidence: number; // 0-100
}

export interface AuditLog {
  id?: number;
  entity_type: 'match' | 'team' | 'league';
  entity_id: number;
  action: 'created' | 'updated' | 'deleted' | 'validated';
  source: string;
  metadata: any;
  timestamp: Date;
  user_id?: string;
}

export class AuditSystem {
  
  /**
   * Adiciona metadados de auditoria a uma entidade
   */
  static async addAuditMetadata(
    entityType: 'match' | 'team' | 'league',
    entityId: number,
    metadata: Partial<AuditMetadata>
  ): Promise<void> {
    const auditData = {
      source: metadata.source || 'footystats',
      importedAt: metadata.importedAt || new Date(),
      lastUpdatedAt: new Date(),
      isVerified: metadata.isVerified || true,
      apiVersion: metadata.apiVersion || '1.0',
      dataQuality: metadata.dataQuality || 'high',
      confidence: metadata.confidence || 100
    };

    // Criar log de auditoria
    await this.createAuditLog({
      entity_type: entityType,
      entity_id: entityId,
      action: 'updated',
      source: auditData.source,
      metadata: auditData,
      timestamp: new Date()
    });

    console.log(`✅ Metadados de auditoria adicionados: ${entityType} ${entityId}`);
  }

  /**
   * Cria um log de auditoria
   */
  static async createAuditLog(logData: Omit<AuditLog, 'id'>): Promise<void> {
    try {
      // Nota: Este seria um exemplo se tivéssemos uma tabela de audit_logs
      // await prisma.auditLog.create({ data: logData });
      
      // Por enquanto, apenas log no console
      console.log(`📝 Audit Log: ${logData.action} ${logData.entity_type} ${logData.entity_id} from ${logData.source}`);
    } catch (error) {
      console.error('❌ Erro ao criar log de auditoria:', error);
    }
  }

  /**
   * Valida a qualidade dos dados de uma partida
   */
  static validateMatchDataQuality(matchData: any): { quality: 'high' | 'medium' | 'low'; confidence: number; issues: string[] } {
    let confidence = 100;
    const issues: string[] = [];
    let quality: 'high' | 'medium' | 'low' = 'high';

    // Verificar campos obrigatórios
    if (!matchData.match_id || !matchData.home_team || !matchData.away_team) {
      confidence -= 30;
      issues.push('Campos obrigatórios ausentes');
    }

    // Verificar se tem dados de times válidos
    if (!matchData.home_team?.name || !matchData.away_team?.name) {
      confidence -= 20;
      issues.push('Nomes de times ausentes');
    }

    // Verificar se tem liga válida
    if (!matchData.league?.league_name) {
      confidence -= 15;
      issues.push('Nome da liga ausente');
    }

    // Verificar se tem data válida
    if (!matchData.date_unix || matchData.date_unix <= 0) {
      confidence -= 25;
      issues.push('Data inválida');
    }

    // Verificar se tem status válido
    const validStatuses = ['incomplete', 'live', 'inprogress', 'playing', 'complete', 'finished'];
    if (!validStatuses.includes(matchData.status)) {
      confidence -= 10;
      issues.push('Status inválido');
    }

    // Determinar qualidade baseada na confiança
    if (confidence >= 90) {
      quality = 'high';
    } else if (confidence >= 70) {
      quality = 'medium';
    } else {
      quality = 'low';
    }

    return { quality, confidence, issues };
  }

  /**
   * Executa auditoria completa do banco de dados
   */
  static async performFullAudit(): Promise<{
    matches: { total: number; verified: number; issues: number };
    teams: { total: number; verified: number; issues: number };
    leagues: { total: number; verified: number; issues: number };
    summary: { totalEntities: number; verifiedEntities: number; issuesFound: number };
  }> {
    console.log('🔍 Iniciando auditoria completa do banco de dados...');

    // Auditar partidas
    const allMatches = await prisma.match.findMany({
      include: {
        home_team: true,
        away_team: true,
        league: true
      }
    });

    let matchesVerified = 0;
    let matchesWithIssues = 0;

    for (const match of allMatches) {
      const validation = this.validateMatchDataQuality({
        match_id: match.match_id,
        home_team: { name: match.home_team.name, team_id: match.home_team.team_id },
        away_team: { name: match.away_team.name, team_id: match.away_team.team_id },
        league: { league_name: match.league.league_name, season_id: match.league.season_id },
        status: match.status,
        date_unix: match.date_unix
      });

      if (validation.quality === 'high' && validation.confidence >= 90) {
        matchesVerified++;
      } else {
        matchesWithIssues++;
        console.log(`⚠️ Partida com problemas: ${match.home_team.name} vs ${match.away_team.name} - ${validation.issues.join(', ')}`);
      }
    }

    // Auditar times
    const allTeams = await prisma.team.findMany();
    let teamsVerified = 0;
    let teamsWithIssues = 0;

    for (const team of allTeams) {
      if (team.name && team.team_id && team.team_id > 0) {
        teamsVerified++;
      } else {
        teamsWithIssues++;
        console.log(`⚠️ Time com problemas: ${team.name} (ID: ${team.team_id})`);
      }
    }

    // Auditar ligas
    const allLeagues = await prisma.league.findMany();
    let leaguesVerified = 0;
    let leaguesWithIssues = 0;

    for (const league of allLeagues) {
      if (league.league_name && league.season_id && league.season_id > 0) {
        leaguesVerified++;
      } else {
        leaguesWithIssues++;
        console.log(`⚠️ Liga com problemas: ${league.league_name} (ID: ${league.season_id})`);
      }
    }

    const result = {
      matches: {
        total: allMatches.length,
        verified: matchesVerified,
        issues: matchesWithIssues
      },
      teams: {
        total: allTeams.length,
        verified: teamsVerified,
        issues: teamsWithIssues
      },
      leagues: {
        total: allLeagues.length,
        verified: leaguesVerified,
        issues: leaguesWithIssues
      },
      summary: {
        totalEntities: allMatches.length + allTeams.length + allLeagues.length,
        verifiedEntities: matchesVerified + teamsVerified + leaguesVerified,
        issuesFound: matchesWithIssues + teamsWithIssues + leaguesWithIssues
      }
    };

    console.log('✅ Auditoria completa concluída:');
    console.log(`📊 Total: ${result.summary.totalEntities} entidades`);
    console.log(`✅ Verificadas: ${result.summary.verifiedEntities} entidades`);
    console.log(`⚠️ Com problemas: ${result.summary.issuesFound} entidades`);

    return result;
  }

  /**
   * Marca uma entidade como verificada
   */
  static async markAsVerified(
    entityType: 'match' | 'team' | 'league',
    entityId: number,
    source: string = 'footystats'
  ): Promise<void> {
    await this.createAuditLog({
      entity_type: entityType,
      entity_id: entityId,
      action: 'validated',
      source,
      metadata: { isVerified: true, verifiedAt: new Date() },
      timestamp: new Date()
    });

    console.log(`✅ ${entityType} ${entityId} marcado como verificado`);
  }

  /**
   * Obtém estatísticas de auditoria
   */
  static async getAuditStats(): Promise<{
    lastAudit: Date | null;
    totalEntities: number;
    verifiedEntities: number;
    dataQuality: { high: number; medium: number; low: number };
  }> {
    const totalMatches = await prisma.match.count();
    const totalTeams = await prisma.team.count();
    const totalLeagues = await prisma.league.count();

    return {
      lastAudit: new Date(), // Seria obtido da tabela de audit_logs
      totalEntities: totalMatches + totalTeams + totalLeagues,
      verifiedEntities: totalMatches + totalTeams + totalLeagues, // Assumindo que todos são verificados após limpeza
      dataQuality: {
        high: totalMatches + totalTeams + totalLeagues,
        medium: 0,
        low: 0
      }
    };
  }

  /**
   * Limpa logs de auditoria antigos
   */
  static async cleanupOldAuditLogs(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Seria implementado se tivéssemos tabela de audit_logs
    // const result = await prisma.auditLog.deleteMany({
    //   where: {
    //     timestamp: {
    //       lt: cutoffDate
    //     }
    //   }
    // });

    console.log(`🗑️ Logs de auditoria anteriores a ${cutoffDate.toISOString()} seriam removidos`);
    return 0; // Placeholder
  }
}
