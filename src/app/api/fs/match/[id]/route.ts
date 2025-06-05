import { NextRequest, NextResponse } from 'next/server';

const FOOTYSTATS_API_KEY = process.env.FOOTYSTATS_API_KEY;
const FOOTYSTATS_BASE_URL = 'https://api.football-data-api.com';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;

    if (!FOOTYSTATS_API_KEY) {
      return NextResponse.json(
        { error: 'FootyStats API key não configurada' },
        { status: 500 }
      );
    }

    if (!matchId) {
      return NextResponse.json(
        { error: 'Match ID é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`🔍 Buscando match details para match ID: ${matchId}`);

    // Busca dados do match na API FootyStats
    const url = `${FOOTYSTATS_BASE_URL}/match?key=${FOOTYSTATS_API_KEY}&match_id=${matchId}`;
    
    const fetchResponse = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'OddGeniusFootyStats/1.0',
      },
    });

    if (!fetchResponse.ok) {
      console.log(`❌ Erro HTTP ${fetchResponse.status} ao buscar match ${matchId}`);
      return NextResponse.json(
        { error: `Erro HTTP ${fetchResponse.status}` },
        { status: fetchResponse.status }
      );
    }

    const data = await fetchResponse.json();

    if (!data.success || !data.data) {
      console.log(`❌ Dados inválidos para match ${matchId}:`, data);
      return NextResponse.json(
        { error: 'Dados inválidos retornados pela API' },
        { status: 404 }
      );
    }

    const matchData = data.data;

    // Log completo dos dados para debug
    console.log(`🔍 Dados COMPLETOS da API para match ${matchId}:`, JSON.stringify(matchData, null, 2));

    console.log(`✅ Match details obtidos para match ${matchId}:`, {
      avg_potential: matchData.avg_potential,
      home_name: matchData.home_name,
      away_name: matchData.away_name,
      status: matchData.status,
      homeGoalCount: matchData.homeGoalCount,
      awayGoalCount: matchData.awayGoalCount,
      team_a_possession: matchData.team_a_possession,
      team_b_possession: matchData.team_b_possession,
      minute: matchData.minute
    });

    // Log dos dados recebidos para debug
    console.log(`📊 Match data recebido para ${matchId}:`, {
      status: matchData.status,
      homeGoals: matchData.homeGoalCount,
      awayGoals: matchData.awayGoalCount,
      possessionA: matchData.team_a_possession,
      possessionB: matchData.team_b_possession,
      minute: matchData.minute
    });

    const apiResponse = NextResponse.json({
      success: true,
      data: {
        id: matchData.id,
        home_name: matchData.home_name,
        away_name: matchData.away_name,
        avg_potential: matchData.avg_potential || 0, // Campo real de Expected Goals
        status: matchData.status,
        date_unix: matchData.date_unix,
        home_id: matchData.home_id,
        away_id: matchData.away_id,
        // Live Match Data - Dados reais da FootyStats API
        homeGoalCount: matchData.homeGoalCount ?? 0,
        awayGoalCount: matchData.awayGoalCount ?? 0,
        team_a_possession: matchData.team_a_possession ?? null,
        team_b_possession: matchData.team_b_possession ?? null,
        minute: matchData.minute ?? null,
        // Campos adicionais para partidas ao vivo
        totalGoalCount: matchData.totalGoalCount ?? 0,
        team_a_corners: matchData.team_a_corners ?? 0,
        team_b_corners: matchData.team_b_corners ?? 0,
        team_a_yellow_cards: matchData.team_a_yellow_cards ?? 0,
        team_b_yellow_cards: matchData.team_b_yellow_cards ?? 0,
        team_a_red_cards: matchData.team_a_red_cards ?? 0,
        team_b_red_cards: matchData.team_b_red_cards ?? 0,
        source: 'FootyStats',
        lastUpdated: new Date().toISOString()
      }
    });

    // Cache mais agressivo para live matches (20 segundos)
    apiResponse.headers.set('Cache-Control', 's-maxage=20, stale-while-revalidate=60');

    return apiResponse;

  } catch (error) {
    console.error('❌ Erro na API fs/match:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
