import { NextRequest, NextResponse } from 'next/server';

// FootyStats API Configuration
const FOOTYSTATS_API_KEY = process.env.FOOTYSTATS_API_KEY || '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const FOOTYSTATS_BASE_URL = 'https://api.football-data-api.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    console.log('🔍 Buscando partidas FootyStats para:', date);

    const url = `${FOOTYSTATS_BASE_URL}/todays-matches?key=${FOOTYSTATS_API_KEY}&date=${date}`;

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

    console.log('📊 FootyStats Response:', {
      success: data.success,
      dataLength: data.data?.length || 0,
      message: data.message
    });

    // Usar apenas dados do FootyStats - logos serão buscados via team-info API
    const matches = data.data || [];

    console.log(`✅ ${matches.length} partidas obtidas do FootyStats (logos via team-info API)`);

    return NextResponse.json({
      success: true,
      data: matches,
      count: matches?.length || 0,
      date: date
    });

  } catch (error) {
    console.error('❌ Erro na API:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      data: [],
      count: 0
    }, { status: 500 });
  }
}


