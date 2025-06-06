import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Adicionando partidas de teste...');

    const now = Date.now();
    const nowUnix = Math.floor(now / 1000);

    // Criar times de teste se não existirem
    const testTeams = [
      { team_id: 9999, name: 'Flamengo Test', logo_url: '' },
      { team_id: 9998, name: 'Palmeiras Test', logo_url: '' },
      { team_id: 9997, name: 'São Paulo Test', logo_url: '' },
      { team_id: 9996, name: 'Corinthians Test', logo_url: '' },
    ];

    for (const team of testTeams) {
      await prisma.team.upsert({
        where: { team_id: team.team_id },
        update: { name: team.name },
        create: team,
      });
    }

    // Criar liga de teste se não existir
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

    // Criar partidas de teste
    const testMatches = [
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
        home_team_id: 9999,
        away_team_id: 9997,
        league_id: 9999,
        date_unix: nowUnix + 7200, // 2 horas no futuro
        status: 'incomplete',
        homeGoalCount: 0,
        awayGoalCount: 0,
        stadium_name: 'Arena Test',
      },
      {
        match_id: 999904,
        home_team_id: 9998,
        away_team_id: 9996,
        league_id: 9999,
        date_unix: nowUnix - 7200, // 2 horas atrás
        status: 'complete',
        homeGoalCount: 3,
        awayGoalCount: 2,
        team_a_possession: 58,
        team_b_possession: 42,
        stadium_name: 'Allianz Test',
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

    return NextResponse.json({
      success: true,
      message: `${createdMatches} partidas de teste criadas/atualizadas`,
      data: {
        teams_created: testTeams.length,
        matches_created: createdMatches,
        test_matches: testMatches.map(m => ({
          id: m.match_id,
          home_team_id: m.home_team_id,
          away_team_id: m.away_team_id,
          status: m.status,
          date_readable: new Date(m.date_unix * 1000).toLocaleString('pt-BR'),
          goals: `${m.homeGoalCount}-${m.awayGoalCount}`,
        }))
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar partidas de teste:', error);
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
