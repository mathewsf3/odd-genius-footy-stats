import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const current = searchParams.get('current');

    console.log('🔍 Buscando ligas do banco local...');

    const whereClause: any = {};
    
    if (country) {
      whereClause.country = country;
    }
    
    if (current === 'true') {
      whereClause.is_current = true;
    }

    const leagues = await prisma.league.findMany({
      where: whereClause,
      orderBy: [
        { is_current: 'desc' },
        { league_name: 'asc' }
      ],
      include: {
        _count: {
          select: {
            teams: true,
            matches: true,
          }
        }
      }
    });

    console.log(`📊 Encontradas ${leagues.length} ligas no banco`);

    // Transformar para o formato esperado pelo front-end
    const formattedLeagues = leagues.map(league => ({
      id: league.season_id,
      name: league.league_name,
      country: league.country,
      current: league.is_current,
      teams_count: league._count.teams,
      matches_count: league._count.matches,
      created_at: league.created_at,
      updated_at: league.updated_at,
    }));

    return NextResponse.json({
      success: true,
      data: formattedLeagues,
      count: formattedLeagues.length,
    });

  } catch (error) {
    console.error('❌ Erro ao buscar ligas:', error);
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
