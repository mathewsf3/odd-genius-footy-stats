import { NextRequest, NextResponse } from 'next/server';
import { FootyStatsAPI } from '@/lib/footyStatsAPI';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const timezone = searchParams.get('timezone');
    const page = parseInt(searchParams.get('page') || '1');
    const type = searchParams.get('type'); // 'live', 'upcoming', 'completed', 'all'

    console.log('🔍 Buscando partidas da FootyStats API...');
    console.log('Parâmetros:', { date, timezone, page, type });

    let matches;

    switch (type) {
      case 'live':
        matches = await FootyStatsAPI.getLiveMatches(date);
        break;
      case 'upcoming':
        matches = await FootyStatsAPI.getUpcomingMatches(date);
        break;
      case 'completed':
        matches = await FootyStatsAPI.getCompletedMatches(date);
        break;
      default:
        matches = await FootyStatsAPI.getTodaysMatches(date, timezone, page);
        break;
    }

    console.log(`📊 Encontradas ${matches.length} partidas (tipo: ${type || 'all'})`);

    // Adicionar informações extras para o frontend
    const enrichedMatches = matches.map(match => ({
      ...match,
      // Converter para formato compatível com o frontend existente
      homeName: `Team ${match.homeID}`, // Será substituído por lookup de times
      awayName: `Team ${match.awayID}`, // Será substituído por lookup de times
      homeLogo: '', // Será preenchido quando tivermos dados de times
      awayLogo: '', // Será preenchido quando tivermos dados de times
      league: {
        id: 0, // Será preenchido quando tivermos dados de liga
        name: 'Liga', // Será preenchido quando tivermos dados de liga
        country: 'País' // Será preenchido quando tivermos dados de liga
      },
      // Informações de debug
      _debug: {
        original_status: match.status,
        date_readable: new Date(match.date_unix * 1000).toLocaleString('pt-BR'),
        hours_from_now: Math.round(((match.date_unix * 1000 - Date.now()) / (1000 * 60 * 60)) * 10) / 10,
        has_stats: !!(match.team_a_possession || match.team_b_possession || match.homeGoalCount || match.awayGoalCount)
      }
    }));

    return NextResponse.json({
      success: true,
      data: enrichedMatches,
      count: enrichedMatches.length,
      source: 'FootyStats API',
      filters: { date, timezone, page, type },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar partidas:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar partidas',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        source: 'FootyStats API'
      },
      { status: 500 }
    );
  }
}
