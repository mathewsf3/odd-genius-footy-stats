import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Criando dados de teste completos...');

    const now = Date.now();
    const nowUnix = Math.floor(now / 1000);

    // Criar times de teste
    const testTeams = [
      { team_id: 9999, name: 'Flamengo Test', logo_url: '' },
      { team_id: 9998, name: 'Palmeiras Test', logo_url: '' },
      { team_id: 9997, name: 'São Paulo Test', logo_url: '' },
      { team_id: 9996, name: 'Corinthians Test', logo_url: '' },
      { team_id: 9995, name: 'Santos Test', logo_url: '' },
      { team_id: 9994, name: 'Vasco Test', logo_url: '' },
      { team_id: 9993, name: 'Botafogo Test', logo_url: '' },
      { team_id: 9992, name: 'Grêmio Test', logo_url: '' },
      { team_id: 9991, name: 'Internacional Test', logo_url: '' },
      { team_id: 9990, name: 'Atlético-MG Test', logo_url: '' },
    ];

    for (const team of testTeams) {
      await prisma.team.upsert({
        where: { team_id: team.team_id },
        update: { name: team.name },
        create: team,
      });
    }

    // Criar liga de teste
    await prisma.league.upsert({
      where: { season_id: 9999 },
      update: { league_name: 'Liga Teste' },
      create: {
        season_id: 9999,
        league_name: 'Liga Teste',
        country: 'Brasil',
        is_current: true,
      },
    });

    // Criar partidas de teste com diferentes cenários
    const testMatches = [
      // Partidas ao vivo
      {
        match_id: 999901,
        home_team_id: 9999,
        away_team_id: 9998,
        league_id: 9999,
        date_unix: nowUnix - 3600, // 1 hora atrás
        status: 'live',
        homeGoalCount: 2,
        awayGoalCount: 1,
        team_a_possession: 65,
        team_b_possession: 35,
        stadium_name: 'Maracanã Test',
      },
      {
        match_id: 999902,
        home_team_id: 9997,
        away_team_id: 9996,
        league_id: 9999,
        date_unix: nowUnix - 1800, // 30 minutos atrás
        status: 'inprogress',
        homeGoalCount: 0,
        awayGoalCount: 1,
        team_a_possession: 45,
        team_b_possession: 55,
        stadium_name: 'Morumbi Test',
      },
      {
        match_id: 999903,
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
        match_id: 999904,
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
        match_id: 999905,
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
        match_id: 999906,
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
        match_id: 999907,
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
        match_id: 999908,
        home_team_id: 9994,
        away_team_id: 9990,
        league_id: 9999,
        date_unix: nowUnix + 172800, // 2 dias no futuro
        status: 'incomplete',
        homeGoalCount: 0,
        awayGoalCount: 0,
        stadium_name: 'São Januário Test',
      },
    ];

    let createdMatches = 0;

    for (const match of testMatches) {
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

    console.log(`✅ ${createdMatches} partidas de teste criadas/atualizadas`);

    // Contar partidas por categoria
    const liveMatches = testMatches.filter(m => 
      m.status === 'live' || 
      m.status === 'inprogress' || 
      (m.status === 'complete' && (nowUnix - m.date_unix) < 3600)
    ).length;

    const upcomingMatches = testMatches.filter(m => 
      m.status === 'incomplete' && m.date_unix > nowUnix
    ).length;

    return NextResponse.json({
      success: true,
      message: `Dados de teste criados com sucesso!`,
      data: {
        teams_created: testTeams.length,
        matches_created: createdMatches,
        live_matches: liveMatches,
        upcoming_matches: upcomingMatches,
        test_matches: testMatches.map(m => ({
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
    console.error('❌ Erro ao criar dados de teste:', error);
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
