import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Analisando partidas no banco...');

    // Buscar todas as partidas dos últimos 3 dias
    const threeDaysAgo = Math.floor((Date.now() - 3 * 24 * 60 * 60 * 1000) / 1000);
    const threeDaysFromNow = Math.floor((Date.now() + 3 * 24 * 60 * 60 * 1000) / 1000);

    const matches = await prisma.match.findMany({
      where: {
        date_unix: {
          gte: threeDaysAgo,
          lte: threeDaysFromNow,
        }
      },
      include: {
        home_team: true,
        away_team: true,
        league: true,
      },
      orderBy: {
        date_unix: 'asc'
      }
    });

    console.log(`📊 Encontradas ${matches.length} partidas nos últimos/próximos 3 dias`);

    // Analisar status das partidas
    const statusCount: Record<string, number> = {};
    const now = Date.now();

    const analysis = matches.map(match => {
      const matchTime = match.date_unix * 1000;
      const timeDiff = matchTime - now;
      const hoursFromNow = timeDiff / (1000 * 60 * 60);
      
      // Contar status
      statusCount[match.status] = (statusCount[match.status] || 0) + 1;

      return {
        id: match.match_id,
        home_team: match.home_team.name,
        away_team: match.away_team.name,
        league: match.league.league_name,
        status: match.status,
        date_unix: match.date_unix,
        date_readable: new Date(match.date_unix * 1000).toLocaleString('pt-BR'),
        hours_from_now: Math.round(hoursFromNow * 10) / 10,
        is_past: timeDiff < 0,
        is_live_time: Math.abs(hoursFromNow) < 2, // Dentro de 2 horas
        home_goals: match.homeGoalCount,
        away_goals: match.awayGoalCount,
        possession_a: match.team_a_possession,
        possession_b: match.team_b_possession,
      };
    });

    // Filtrar por categorias
    const liveMatches = analysis.filter(m => 
      m.status === 'live' || 
      m.status === 'incomplete' ||
      m.status === 'inprogress' ||
      m.status === 'playing'
    );

    const upcomingMatches = analysis.filter(m => 
      m.status === 'incomplete' && 
      m.hours_from_now > 0 &&
      !liveMatches.some(live => live.id === m.id)
    );

    const completedMatches = analysis.filter(m => 
      m.status === 'complete' || 
      m.status === 'finished'
    );

    return NextResponse.json({
      success: true,
      summary: {
        total_matches: matches.length,
        status_breakdown: statusCount,
        live_matches: liveMatches.length,
        upcoming_matches: upcomingMatches.length,
        completed_matches: completedMatches.length,
      },
      matches: {
        live: liveMatches.slice(0, 10),
        upcoming: upcomingMatches.slice(0, 10),
        completed: completedMatches.slice(0, 5),
        all_recent: analysis.slice(0, 20),
      },
      debug_info: {
        current_time: new Date().toISOString(),
        current_unix: Math.floor(Date.now() / 1000),
        search_range: {
          from: new Date(threeDaysAgo * 1000).toISOString(),
          to: new Date(threeDaysFromNow * 1000).toISOString(),
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro no debug de partidas:', error);
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
