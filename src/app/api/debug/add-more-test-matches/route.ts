import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Adicionando mais partidas de teste...');

    const now = Date.now();
    const nowUnix = Math.floor(now / 1000);

    // Criar mais times de teste
    const moreTestTeams = [
      { team_id: 9995, name: 'Santos Test', logo_url: '' },
      { team_id: 9994, name: 'Vasco Test', logo_url: '' },
      { team_id: 9993, name: 'Botafogo Test', logo_url: '' },
      { team_id: 9992, name: 'Grêmio Test', logo_url: '' },
      { team_id: 9991, name: 'Internacional Test', logo_url: '' },
      { team_id: 9990, name: 'Atlético-MG Test', logo_url: '' },
    ];

    for (const team of moreTestTeams) {
      await prisma.team.upsert({
        where: { team_id: team.team_id },
        update: { name: team.name },
        create: team,
      });
    }

    // Criar mais partidas de teste com diferentes cenários
    const moreTestMatches = [
      // Partidas ao vivo com diferentes status
      {
        match_id: 999905,
        home_team_id: 9995,
        away_team_id: 9994,
        league_id: 9999,
        date_unix: nowUnix - 2700, // 45 minutos atrás
        status: 'live',
        homeGoalCount: 1,
        awayGoalCount: 0,
        team_a_possession: 52,
        team_b_possession: 48,
        stadium_name: 'Vila Belmiro Test',
      },
      {
        match_id: 999906,
        home_team_id: 9993,
        away_team_id: 9992,
        league_id: 9999,
        date_unix: nowUnix - 5400, // 1.5 horas atrás
        status: 'inprogress',
        homeGoalCount: 2,
        awayGoalCount: 2,
        team_a_possession: 60,
        team_b_possession: 40,
        stadium_name: 'Nilton Santos Test',
      },
      // Partida recém completada (deve aparecer como ao vivo)
      {
        match_id: 999907,
        home_team_id: 9991,
        away_team_id: 9990,
        league_id: 9999,
        date_unix: nowUnix - 900, // 15 minutos atrás
        status: 'complete',
        homeGoalCount: 1,
        awayGoalCount: 3,
        team_a_possession: 45,
        team_b_possession: 55,
        stadium_name: 'Beira-Rio Test',
      },
      // Partidas futuras (upcoming)
      {
        match_id: 999908,
        home_team_id: 9995,
        away_team_id: 9993,
        league_id: 9999,
        date_unix: nowUnix + 14400, // 4 horas no futuro
        status: 'incomplete',
        homeGoalCount: 0,
        awayGoalCount: 0,
        stadium_name: 'Vila Belmiro Test',
      },
      {
        match_id: 999909,
        home_team_id: 9992,
        away_team_id: 9991,
        league_id: 9999,
        date_unix: nowUnix + 86400, // 1 dia no futuro
        status: 'incomplete',
        homeGoalCount: 0,
        awayGoalCount: 0,
        stadium_name: 'Arena do Grêmio Test',
      },
      {
        match_id: 999910,
        home_team_id: 9994,
        away_team_id: 9990,
        league_id: 9999,
        date_unix: nowUnix + 172800, // 2 dias no futuro
        status: 'incomplete',
        homeGoalCount: 0,
        awayGoalCount: 0,
        stadium_name: 'São Januário Test',
      },
      // Partida que está prestes a começar (deve aparecer como ao vivo se tiver dados)
      {
        match_id: 999911,
        home_team_id: 9999,
        away_team_id: 9995,
        league_id: 9999,
        date_unix: nowUnix + 1800, // 30 minutos no futuro
        status: 'incomplete',
        homeGoalCount: 0,
        awayGoalCount: 0,
        team_a_possession: 0,
        team_b_possession: 0,
        stadium_name: 'Maracanã Test',
      },
    ];

    let createdMatches = 0;

    for (const match of moreTestMatches) {
      await prisma.match.upsert({
        where: { match_id: match.match_id },
        update: {
          status: match.status,
          homeGoalCount: match.homeGoalCount,
          awayGoalCount: match.awayGoalCount,
          team_a_possession: match.team_a_possession,
          team_b_possession: match.team_b_possession,
          updated_at: new Date(),
        },
        create: match,
      });
      createdMatches++;
    }

    console.log(`✅ ${createdMatches} partidas adicionais de teste criadas/atualizadas`);

    return NextResponse.json({
      success: true,
      message: `${createdMatches} partidas adicionais de teste criadas/atualizadas`,
      data: {
        teams_created: moreTestTeams.length,
        matches_created: createdMatches,
        test_scenarios: {
          live_matches: moreTestMatches.filter(m => m.status === 'live' || m.status === 'inprogress').length,
          completed_recent: moreTestMatches.filter(m => m.status === 'complete').length,
          upcoming_matches: moreTestMatches.filter(m => m.status === 'incomplete' && m.date_unix > nowUnix).length,
        },
        test_matches: moreTestMatches.map(m => ({
          id: m.match_id,
          home_team_id: m.home_team_id,
          away_team_id: m.away_team_id,
          status: m.status,
          date_readable: new Date(m.date_unix * 1000).toLocaleString('pt-BR'),
          goals: `${m.homeGoalCount}-${m.awayGoalCount}`,
          hours_from_now: Math.round(((m.date_unix * 1000 - now) / (1000 * 60 * 60)) * 10) / 10,
        }))
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar partidas adicionais de teste:', error);
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
