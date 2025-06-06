import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTodayDate, isMatchUpcoming, getTodayRange, getUpcomingRange } from '@/lib/dateUtils';

const FOOTYSTATS_API_KEY = process.env.FOOTYSTATS_API_KEY;
const FOOTYSTATS_BASE_URL = process.env.FOOTYSTATS_BASE_URL;

export async function GET() {
  try {
    console.log('📅 Buscando próximas partidas...');

    const todayRange = getTodayRange();
    const upcomingRange = getUpcomingRange(7); // Próximos 7 dias

    // 1. Buscar partidas do banco local que são upcoming
    const localMatches = await prisma.match.findMany({
      where: {
        date_unix: {
          gte: todayRange.start,
          lte: upcomingRange.end,
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

    // 2. Filtrar partidas que são realmente upcoming
    const upcomingMatches = localMatches.filter(match =>
      isMatchUpcoming(match.status, match.date_unix)
    );

    console.log(`📅 ${upcomingMatches.length} partidas identificadas como upcoming`);

    // 3. Se não há partidas upcoming no banco, buscar da API
    if (upcomingMatches.length === 0) {
      console.log('🌐 Buscando próximas partidas da FootyStats API...');

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

          // Filtrar partidas upcoming da API
          const apiUpcomingMatches = apiMatches.filter((match: any) =>
            isMatchUpcoming(match.status, match.date_unix)
          );

          console.log(`📅 ${apiUpcomingMatches.length} partidas upcoming encontradas na API`);

          // Transformar dados da API para formato esperado
          const transformedMatches = apiUpcomingMatches.map((match: any) => ({
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
            homeGoalCount: 0,
            awayGoalCount: 0,
            team_a_possession: null,
            team_b_possession: null,
            stadium_name: match.stadium_name,
            stadium_location: match.stadium_location,
            // Expected Goals data
            avg_potential: match.avg_potential || null,
            btts_potential: match.btts_potential || null,
            o25_potential: match.o25_potential || null,
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

    // 4. Retornar partidas upcoming do banco local
    const transformedLocalMatches = upcomingMatches.map(match => ({
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
      homeGoalCount: 0,
      awayGoalCount: 0,
      team_a_possession: null,
      team_b_possession: null,
      stadium_name: match.stadium_name,
      stadium_location: match.stadium_location,
      // Expected Goals data
      avg_potential: match.avg_potential,
      btts_potential: match.btts_potential,
      o25_potential: match.o25_potential,
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
    console.error('❌ Erro no endpoint de próximas partidas:', error);

    return NextResponse.json({
      success: false,
      message: 'Erro ao buscar próximas partidas',
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [],
      count: 0,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
