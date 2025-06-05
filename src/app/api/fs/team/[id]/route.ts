import { NextRequest, NextResponse } from 'next/server';

const FOOTYSTATS_API_KEY = process.env.FOOTYSTATS_API_KEY;
const FOOTYSTATS_BASE_URL = 'https://api.football-data-api.com';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;

    if (!FOOTYSTATS_API_KEY) {
      return NextResponse.json(
        { error: 'FootyStats API key não configurada' },
        { status: 500 }
      );
    }

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`🔍 Buscando team stats para team ID: ${teamId}`);

    // Busca dados completos do time na API FootyStats
    const url = `${FOOTYSTATS_BASE_URL}/team?key=${FOOTYSTATS_API_KEY}&team_id=${teamId}&include=stats`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'OddGeniusFootyStats/1.0',
      },
    });

    if (!response.ok) {
      console.log(`❌ Erro HTTP ${response.status} ao buscar team ${teamId}`);
      return NextResponse.json(
        { error: `Erro HTTP ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      console.log(`❌ Dados inválidos para team ${teamId}:`, data);
      return NextResponse.json(
        { error: 'Dados inválidos retornados pela API' },
        { status: 404 }
      );
    }

    const teamData = data.data;

    // Log completo dos dados para debug
    console.log(`🔍 Dados COMPLETOS da API team para ${teamId}:`, JSON.stringify(teamData, null, 2));

    console.log(`✅ Team stats obtidos para team ${teamId}:`, {
      name: teamData.name,
      seasonAVG_overall: teamData.stats?.seasonAVG_overall,
      seasonAVG_home: teamData.stats?.seasonAVG_home,
      seasonAVG_away: teamData.stats?.seasonAVG_away,
      seasonConcededAVG_overall: teamData.stats?.seasonConcededAVG_overall,
      seasonConcededAVG_home: teamData.stats?.seasonConcededAVG_home,
      seasonConcededAVG_away: teamData.stats?.seasonConcededAVG_away,
      prediction_risk: teamData.prediction_risk,
      risk: teamData.risk
    });

    return NextResponse.json({
      success: true,
      data: {
        id: teamData.id,
        name: teamData.name,
        // Campos reais para Expected Goals baseados na estrutura da API
        seasonAVG_overall: teamData.stats?.seasonAVG_overall || 0,     // Média geral de gols
        seasonAVG_home: teamData.stats?.seasonAVG_home || 0,           // Média de gols em casa
        seasonAVG_away: teamData.stats?.seasonAVG_away || 0,           // Média de gols fora
        seasonConcededAVG_overall: teamData.stats?.seasonConcededAVG_overall || 0, // Média geral de gols sofridos
        seasonConcededAVG_home: teamData.stats?.seasonConcededAVG_home || 0, // Média de gols sofridos em casa
        seasonConcededAVG_away: teamData.stats?.seasonConcededAVG_away || 0, // Média de gols sofridos fora
        prediction_risk: teamData.prediction_risk || 5,        // Índice de risco de predição
        risk: teamData.risk || 5,                               // Índice de risco (fallback)
        stats: {
          matchesPlayed_overall: teamData.stats?.matchesPlayed_overall || 0,
          matchesPlayed_home: teamData.stats?.matchesPlayed_home || 0,
          matchesPlayed_away: teamData.stats?.matchesPlayed_away || 0,
        },
        source: 'FootyStats'
      }
    });

  } catch (error) {
    console.error('❌ Erro na API fs/team:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
