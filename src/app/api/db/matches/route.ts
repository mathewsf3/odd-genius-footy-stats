import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const status = searchParams.get('status');
    const leagueId = searchParams.get('league_id');
    const teamId = searchParams.get('team_id');

    console.log('🔍 Buscando partidas do banco local para:', date);

    // Converter data para timestamp Unix (início e fim do dia)
    const startOfDay = Math.floor(new Date(date + 'T00:00:00Z').getTime() / 1000);
    const endOfDay = Math.floor(new Date(date + 'T23:59:59Z').getTime() / 1000);

    const whereClause: any = {
      date_unix: {
        gte: startOfDay,
        lte: endOfDay,
      }
    };

    if (status) {
      whereClause.status = status;
    }

    if (leagueId) {
      whereClause.league_id = parseInt(leagueId);
    }

    if (teamId) {
      const teamIdInt = parseInt(teamId);
      whereClause.OR = [
        { home_team_id: teamIdInt },
        { away_team_id: teamIdInt }
      ];
    }

    const matches = await prisma.match.findMany({
      where: whereClause,
      include: {
        home_team: true,
        away_team: true,
        league: true,
      },
      orderBy: {
        date_unix: 'asc'
      }
    });

    console.log(`📊 Encontradas ${matches.length} partidas no banco`);

    // Transformar para o formato esperado pelo front-end
    const formattedMatches = matches.map(match => ({
      id: match.match_id,
      homeID: match.home_team_id,
      awayID: match.away_team_id,
      homeName: match.home_team.name,
      awayName: match.away_team.name,
      homeGoalCount: match.homeGoalCount,
      awayGoalCount: match.awayGoalCount,
      date_unix: match.date_unix,
      status: match.status,
      stadium_name: match.stadium_name,
      stadium_location: match.stadium_location,
      team_a_possession: match.team_a_possession,
      team_b_possession: match.team_b_possession,
      team_a_shots: match.team_a_shots,
      team_b_shots: match.team_b_shots,
      team_a_shotsOnTarget: match.team_a_shotsOnTarget,
      team_b_shotsOnTarget: match.team_b_shotsOnTarget,
      team_a_fouls: match.team_a_fouls,
      team_b_fouls: match.team_b_fouls,
      team_a_yellow_cards: match.team_a_yellow_cards,
      team_b_yellow_cards: match.team_b_yellow_cards,
      team_a_red_cards: match.team_a_red_cards,
      team_b_red_cards: match.team_b_red_cards,
      odds_ft_1: match.odds_ft_1,
      odds_ft_X: match.odds_ft_X,
      odds_ft_2: match.odds_ft_2,
      btts_potential: match.btts_potential,
      o15_potential: match.o15_potential,
      o25_potential: match.o25_potential,
      o35_potential: match.o35_potential,
      avg_potential: match.avg_potential,
      home_ppg: match.home_ppg,
      away_ppg: match.away_ppg,
      refereeID: match.refereeID,
      league: {
        id: match.league.season_id,
        name: match.league.league_name,
        country: match.league.country,
      },
      // Adicionar logos dos times (se disponível)
      homeLogo: match.home_team.logo_url || '',
      awayLogo: match.away_team.logo_url || '',
    }));

    return NextResponse.json({
      success: true,
      data: formattedMatches,
      count: formattedMatches.length,
      date: date,
    });

  } catch (error) {
    console.error('❌ Erro ao buscar partidas:', error);
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
