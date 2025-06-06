import { NextRequest, NextResponse } from 'next/server';
import { FootyStatsAPI } from '@/lib/footyStatsAPI';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;

    if (!teamId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Team ID é obrigatório' 
        },
        { status: 400 }
      );
    }

    console.log(`🔍 Buscando dados do time ${teamId} na FootyStats API...`);

    const teamData = await FootyStatsAPI.getTeam(parseInt(teamId), true);

    if (!teamData || teamData.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Time não encontrado' 
        },
        { status: 404 }
      );
    }

    const team = teamData[0]; // API retorna array, pegamos o primeiro

    // Buscar estatísticas recentes (últimos jogos)
    let recentStats = null;
    try {
      recentStats = await FootyStatsAPI.getTeamLastX(parseInt(teamId));
    } catch (error) {
      console.warn('⚠️ Não foi possível buscar estatísticas recentes:', error);
    }

    // Transformar para formato compatível com o frontend
    const formattedTeam = {
      id: team.id,
      name: team.name || team.full_name,
      cleanName: team.name || team.full_name,
      shortName: team.name || team.full_name,
      logo: '', // FootyStats não fornece logos diretamente
      country: team.country,
      founded: 0, // Não disponível na API
      venue: '', // Não disponível na API
      capacity: 0, // Não disponível na API
      
      // Estatísticas da temporada atual
      current_season: team.stats ? {
        league: {
          id: team.competition_id,
          name: 'Liga', // Será preenchido quando tivermos dados de liga
          country: team.country,
        },
        stats: {
          position: team.table_position,
          performance_rank: team.performance_rank,
          matches_played: team.stats.seasonMatchesPlayed_overall,
          wins: team.stats.seasonWinsNum_overall,
          draws: team.stats.seasonDrawsNum_overall,
          losses: team.stats.seasonLossesNum_overall || 0,
          goals_for: team.stats.seasonGoals_overall,
          goals_against: team.stats.seasonConceded_overall,
          goal_difference: team.stats.seasonGoalDifference_overall,
          points: 0, // Calcular: vitórias * 3 + empates
          seasonScoredAVG: team.stats.seasonScoredAVG_overall,
          seasonConcededAVG: team.stats.seasonConcededAVG_overall,
          seasonScoredAVG_home: team.stats.seasonScoredAVG_home,
          seasonScoredAVG_away: team.stats.seasonScoredAVG_away,
          seasonPPG: team.stats.seasonPPG_overall,
          cleanSheets: team.stats.cleanSheets_overall,
          btts: team.stats.btts_overall,
          over25: team.stats.over25_overall,
          corners: team.stats.cornersTotal_overall,
          cards: team.stats.cards_for_overall
        }
      } : null,

      // Estatísticas recentes se disponível
      recent_form: recentStats ? {
        last5: recentStats.stats.last5,
        last6: recentStats.stats.last6,
        last10: recentStats.stats.last10
      } : null,

      // Informações de debug
      _debug: {
        source: 'FootyStats API',
        team_url: team.url,
        official_sites: team.official_sites,
        has_stats: !!team.stats,
        has_recent_stats: !!recentStats
      }
    };

    console.log(`✅ Dados do time ${team.name} encontrados`);

    return NextResponse.json({
      success: true,
      data: formattedTeam,
      source: 'FootyStats API',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar dados do time:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar dados do time',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        source: 'FootyStats API'
      },
      { status: 500 }
    );
  }
}
