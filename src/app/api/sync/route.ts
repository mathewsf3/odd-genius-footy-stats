import { NextRequest, NextResponse } from 'next/server';
import { syncAllData, syncTodayData, getSyncStatus } from '@/lib/syncAll';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';

    switch (action) {
      case 'status':
        console.log('🔍 Verificando status da sincronização...');
        const status = await getSyncStatus();
        return NextResponse.json({
          success: true,
          data: status,
        });

      case 'today':
        console.log('🔄 Iniciando sincronização dos dados de hoje...');
        const todayResult = await syncTodayData();
        return NextResponse.json({
          success: true,
          message: `${todayResult} partidas de hoje sincronizadas`,
          data: { matches_updated: todayResult },
        });

      case 'full':
        console.log('🚀 Iniciando sincronização completa...');
        const fullResult = await syncAllData();
        return NextResponse.json({
          success: true,
          message: 'Sincronização completa finalizada',
          data: fullResult,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Ação inválida',
            message: 'Ações disponíveis: status, today, full'
          },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, league_id } = body;

    if (action === 'sync_league' && league_id) {
      console.log(`🔄 Sincronizando liga específica: ${league_id}`);
      
      const { syncLeagueTeams, syncLeagueMatches } = await import('@/lib/footyStatsSync');
      
      // Sincronizar times da liga
      const teamCount = await syncLeagueTeams(league_id);
      
      // Sincronizar partidas da liga
      let totalMatches = 0;
      let page = 1;
      let pageMatches = 0;
      
      do {
        pageMatches = await syncLeagueMatches(league_id, page);
        totalMatches += pageMatches;
        page++;
        
        if (pageMatches > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } while (pageMatches === 500);
      
      return NextResponse.json({
        success: true,
        message: `Liga ${league_id} sincronizada`,
        data: {
          league_id,
          teams: teamCount,
          matches: totalMatches,
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Ação inválida',
        message: 'Ações disponíveis: sync_league (com league_id)'
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
