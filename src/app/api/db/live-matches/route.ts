import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Buscando partidas ao vivo do banco local...');

    // Buscar partidas dos últimos 2 dias até próximas 6 horas
    const twoDaysAgo = Math.floor((Date.now() - 2 * 24 * 60 * 60 * 1000) / 1000);
    const sixHoursFromNow = Math.floor((Date.now() + 6 * 60 * 60 * 1000) / 1000);

    const matches = await prisma.match.findMany({
      where: {
        date_unix: {
          gte: twoDaysAgo,
          lte: sixHoursFromNow,
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

    console.log(`📊 Encontradas ${matches.length} partidas no período de busca`);

    const now = Date.now();

    // Filtrar partidas ao vivo com critérios inteligentes
    const liveMatches = matches.filter(match => {
      const matchTime = match.date_unix * 1000;
      const timeDiff = Math.abs(matchTime - now);
      const hoursFromMatch = timeDiff / (1000 * 60 * 60);

      // Critério 1: Status explicitamente ao vivo
      const isLiveStatus = match.status === 'live' || 
                         match.status === 'inprogress' ||
                         match.status === 'playing';

      // Critério 2: Dentro da janela de jogo (3 horas) E tem dados de jogo
      const isInGameWindow = hoursFromMatch <= 3;
      const hasGameData = (match.homeGoalCount > 0 || match.awayGoalCount > 0) ||
                         (match.team_a_possession && match.team_a_possession > 0) ||
                         (match.team_b_possession && match.team_b_possession > 0);

      // Critério 3: Recentemente completada (até 2 horas) com dados
      const isRecentlyCompleted = match.status === 'complete' && 
                                hoursFromMatch <= 2 && 
                                hasGameData;

      // Critério 4: Status incomplete mas com horário de jogo próximo E tem dados
      const isIncompleteWithData = match.status === 'incomplete' &&
                                 hoursFromMatch <= 1.5 &&
                                 hasGameData;

      return isLiveStatus || (isInGameWindow && hasGameData) || isRecentlyCompleted || isIncompleteWithData;
    });

    console.log(`🔴 Partidas ao vivo encontradas: ${liveMatches.length}`);

    // Transformar para o formato esperado pelo front-end
    const formattedMatches = liveMatches.map(match => ({
      id: match.match_id,
      homeID: match.home_team_id,
      awayID: match.away_team_id,
      // Campos que o frontend espera
      home_name: match.home_team?.name || 'Time Casa',
      away_name: match.away_team?.name || 'Time Visitante',
      home_image: match.home_team?.logo_url || '',
      away_image: match.away_team?.logo_url || '',
      // Campos alternativos para compatibilidade
      homeName: match.home_team?.name || 'Time Casa',
      awayName: match.away_team?.name || 'Time Visitante',
      homeLogo: match.home_team?.logo_url || '',
      awayLogo: match.away_team?.logo_url || '',
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
      // Campos de liga que o frontend espera
      competition_name: match.league?.league_name || 'Liga Desconhecida',
      country: match.league?.country || 'País Desconhecido',
      league: {
        id: match.league?.season_id,
        name: match.league?.league_name,
        country: match.league?.country,
      },
      // Adicionar informações de debug
      _debug: {
        hours_from_match: Math.round((Math.abs(match.date_unix * 1000 - now) / (1000 * 60 * 60)) * 10) / 10,
        match_time_readable: new Date(match.date_unix * 1000).toLocaleString('pt-BR'),
        has_game_data: (match.homeGoalCount > 0 || match.awayGoalCount > 0) ||
                      (match.team_a_possession && match.team_a_possession > 0) ||
                      (match.team_b_possession && match.team_b_possession > 0),
      }
    }));

    // Log das partidas encontradas para debug
    if (formattedMatches.length > 0) {
      console.log('🔴 Partidas ao vivo detalhadas:');
      formattedMatches.forEach(match => {
        console.log(`  - ${match.homeName} vs ${match.awayName} (${match.status}) - ${match._debug.match_time_readable} - ${match._debug.hours_from_match}h`);
      });
    }

    return NextResponse.json({
      success: true,
      data: formattedMatches,
      count: formattedMatches.length,
      debug: {
        total_matches_searched: matches.length,
        live_matches_found: formattedMatches.length,
        search_period: {
          from: new Date(twoDaysAgo * 1000).toISOString(),
          to: new Date(sixHoursFromNow * 1000).toISOString(),
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar partidas ao vivo:', error);
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
