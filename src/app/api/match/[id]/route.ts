import { NextRequest, NextResponse } from 'next/server';

const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const API_BASE_URL = 'https://api.football-data-api.com';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;
    
    if (!matchId) {
      return NextResponse.json({
        success: false,
        error: 'ID da partida é obrigatório',
        data: null
      }, { status: 400 });
    }
    
    console.log('🔍 Buscando detalhes da partida:', matchId);
    
    const url = `${API_BASE_URL}/match?key=${API_KEY}&match_id=${matchId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'OddGeniusFootyStats/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();

    console.log('📊 Resposta da API de detalhes:', {
      success: data.success,
      hasData: !!data.data,
      message: data.message
    });

    return NextResponse.json({
      success: true,
      data: data.data || data,
      matchId: matchId
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar detalhes da partida:', error);

    const { id: errorMatchId } = await params;

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      data: null,
      matchId: errorMatchId
    }, { status: 500 });
  }
}
