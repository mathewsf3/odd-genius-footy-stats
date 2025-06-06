import { NextRequest, NextResponse } from 'next/server';
import { FootyStatsAPI } from '@/lib/footyStatsAPI';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: seasonId } = await params;
    const { searchParams } = new URL(request.url);
    const maxTime = searchParams.get('max_time');

    if (!seasonId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Season ID é obrigatório' 
        },
        { status: 400 }
      );
    }

    console.log(`🔍 Buscando dados da temporada ${seasonId} na FootyStats API...`);

    const seasonData = await FootyStatsAPI.getLeagueSeason(
      parseInt(seasonId),
      maxTime ? parseInt(maxTime) : undefined
    );

    console.log(`✅ Dados da temporada encontrados: ${seasonData.teams.length} times`);

    // Enriquecer dados dos times com informações calculadas
    const enrichedTeams = seasonData.teams.map(team => ({
      ...team,
      // Calcular pontos se não estiver disponível
      calculated_points: team.stats ? 
        (team.stats.seasonWinsNum_overall * 3) + team.stats.seasonDrawsNum_overall : 0,
      
      // Adicionar informações de debug
      _debug: {
        has_stats: !!team.stats,
        position: team.table_position,
        performance_rank: team.performance_rank
      }
    }));

    return NextResponse.json({
      success: true,
      data: {
        league: seasonData.league,
        teams: enrichedTeams,
        summary: {
          total_teams: enrichedTeams.length,
          league_name: seasonData.league?.name || 'Liga',
          country: seasonData.league?.country || 'País',
          season_id: parseInt(seasonId)
        }
      },
      source: 'FootyStats API',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar dados da temporada:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar dados da temporada',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        source: 'FootyStats API'
      },
      { status: 500 }
    );
  }
}
