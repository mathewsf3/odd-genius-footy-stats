import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTodayDate, isMatchLive, getTodayRange } from '@/lib/dateUtils';

const FOOTYSTATS_API_KEY = process.env.FOOTYSTATS_API_KEY;
const FOOTYSTATS_BASE_URL = process.env.FOOTYSTATS_BASE_URL;

export async function GET() {
  try {
    console.log('🔴 Buscando partidas ao vivo...');

    const todayRange = getTodayRange();

    // 1. Primeiro, buscar partidas do banco local que podem estar ao vivo
    const localMatches = await prisma.match.findMany({
      where: {
        date_unix: {
          gte: todayRange.start - (3 * 60 * 60), // 3 horas antes de hoje
          lte: todayRange.end + (3 * 60 * 60),   // 3 horas depois de hoje
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

    console.log(`📊 Encontradas ${localMatches.length} partidas locais no período`);

    // 2. Filtrar partidas que estão realmente ao vivo
    const liveMatches = localMatches.filter(match =>
      isMatchLive(match.status, match.date_unix)
    );

    console.log(`🔴 ${liveMatches.length} partidas identificadas como ao vivo`);

    // 3. Se não há partidas ao vivo no banco, buscar da API
    if (liveMatches.length === 0) {
      console.log('🌐 Buscando partidas ao vivo da FootyStats API...');

      try {
        const today = getTodayDate();
        const apiUrl = `${FOOTYSTATS_BASE_URL}/todays-matches?key=${FOOTYSTATS_API_KEY}&date=${today}`;

        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'OddGeniusFootyStats/1.0',
          },
        });

        if (response.ok) {
          const apiData = await response.json();
          const apiMatches = apiData.data || [];

          console.log(`📡 API retornou ${apiMatches.length} partidas`);

          // Filtrar partidas ao vivo da API
          const apiLiveMatches = apiMatches.filter((match: any) =>
            isMatchLive(match.status, match.date_unix)
          );

          console.log(`🔴 ${apiLiveMatches.length} partidas ao vivo encontradas na API`);

          // Transformar dados da API para formato esperado
          const transformedMatches = apiLiveMatches.map((match: any) => ({
            id: match.id,
            match_id: match.id,
            home_team: {
              team_id: match.homeID,
              name: match.home_name,
              image: match.home_image
            },
            away_team: {
              team_id: match.awayID,
              name: match.away_name,
              image: match.away_image
            },
            league: {
              season_id: match.season_id || 0,
              name: match.competition_name || match.league_name || 'Liga desconhecida'
            },
            status: match.status,
            date_unix: match.date_unix,
            homeGoalCount: match.homeGoalCount || 0,
            awayGoalCount: match.awayGoalCount || 0,
            team_a_possession: match.team_a_possession || null,
            team_b_possession: match.team_b_possession || null,
            stadium_name: match.stadium_name,
            stadium_location: match.stadium_location,
            minute: match.minute || null,
            _isFromAPI: true
          }));

          return NextResponse.json({
            success: true,
            data: transformedMatches,
            count: transformedMatches.length,
            source: 'footystats-api',
            timestamp: new Date().toISOString()
          });
        }
      } catch (apiError) {
        console.error('❌ Erro ao buscar da API:', apiError);
      }
    }

    // 4. Retornar partidas ao vivo do banco local
    const transformedLocalMatches = liveMatches.map(match => ({
      id: match.id,
      match_id: match.match_id,
      home_team: {
        team_id: match.home_team.team_id,
        name: match.home_team.name,
        image: match.home_team.logo_url || ''
      },
      away_team: {
        team_id: match.away_team.team_id,
        name: match.away_team.name,
        image: match.away_team.logo_url || ''
      },
      league: {
        season_id: match.league.season_id,
        name: match.league.league_name
      },
      status: match.status,
      date_unix: match.date_unix,
      homeGoalCount: match.homeGoalCount,
      awayGoalCount: match.awayGoalCount,
      team_a_possession: match.team_a_possession,
      team_b_possession: match.team_b_possession,
      stadium_name: match.stadium_name,
      stadium_location: match.stadium_location,
      minute: null, // Calcular se necessário
      _isFromDB: true
    }));

    return NextResponse.json({
      success: true,
      data: transformedLocalMatches,
      count: transformedLocalMatches.length,
      source: 'local-database',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro no endpoint de partidas ao vivo:', error);

    return NextResponse.json({
      success: false,
      message: 'Erro ao buscar partidas ao vivo',
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [],
      count: 0,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
