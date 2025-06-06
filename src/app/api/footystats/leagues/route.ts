import { NextRequest, NextResponse } from 'next/server';
import { FootyStatsAPI } from '@/lib/footyStatsAPI';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chosenOnly = searchParams.get('chosen_leagues_only') === 'true';
    const country = searchParams.get('country');

    console.log('🔍 Buscando ligas da FootyStats API...');
    console.log('Parâmetros:', { chosenOnly, country });

    const leagues = await FootyStatsAPI.getLeagueList(
      chosenOnly, 
      country ? parseInt(country) : undefined
    );

    console.log(`📊 Encontradas ${leagues.length} ligas`);

    return NextResponse.json({
      success: true,
      data: leagues,
      count: leagues.length,
      source: 'FootyStats API',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao buscar ligas:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao buscar ligas',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        source: 'FootyStats API'
      },
      { status: 500 }
    );
  }
}
