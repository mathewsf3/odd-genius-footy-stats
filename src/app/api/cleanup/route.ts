import { NextRequest, NextResponse } from 'next/server';
import { DataCleanupService } from '@/lib/dataCleanup';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'full'; // full, cleanup-only, validate-only
    
    console.log(`🧹 Iniciando limpeza de dados: ${action}`);
    
    let result;
    
    switch (action) {
      case 'full':
        // Limpeza completa + re-população
        result = await DataCleanupService.cleanAndRepopulate();
        break;
        
      case 'cleanup-only':
        // Apenas limpeza, sem re-população
        const cleanupResult = await DataCleanupService.cleanupOnly();
        result = {
          success: true,
          cleanup: cleanupResult,
          message: 'Limpeza de dados de teste concluída'
        };
        break;
        
      case 'validate-only':
        // Apenas validação, sem modificar dados
        const validationResult = await DataCleanupService.validateOnly();
        result = {
          success: true,
          validation: validationResult,
          message: 'Validação de dados concluída'
        };
        break;
        
      default:
        return NextResponse.json({
          success: false,
          message: 'Ação inválida. Use: full, cleanup-only, ou validate-only'
        }, { status: 400 });
    }
    
    return NextResponse.json({
      success: result.success,
      message: 'Operação de limpeza concluída',
      action,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro na operação de limpeza:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erro na operação de limpeza',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';
    
    if (action === 'validate') {
      // Executar apenas validação
      const validationResult = await DataCleanupService.validateOnly();
      
      return NextResponse.json({
        success: true,
        message: 'Validação concluída',
        validation: validationResult,
        timestamp: new Date().toISOString()
      });
    }
    
    // Retornar status atual do banco
    const { prisma } = await import('@/lib/database');
    
    const totalMatches = await prisma.match.count();
    const totalTeams = await prisma.team.count();
    const totalLeagues = await prisma.league.count();
    
    // Buscar algumas partidas para análise rápida
    const sampleMatches = await prisma.match.findMany({
      take: 5,
      include: {
        home_team: true,
        away_team: true,
        league: true
      },
      orderBy: {
        updated_at: 'desc'
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Status atual do banco de dados',
      data: {
        counts: {
          matches: totalMatches,
          teams: totalTeams,
          leagues: totalLeagues
        },
        sampleMatches: sampleMatches.map(match => ({
          id: match.match_id,
          homeTeam: match.home_team.name,
          awayTeam: match.away_team.name,
          league: match.league.league_name,
          status: match.status,
          date: new Date(match.date_unix * 1000).toISOString(),
          updatedAt: match.updated_at
        }))
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao obter status:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erro ao obter status do banco',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
