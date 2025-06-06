import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`🔍 Buscando dados do time ${teamId} no banco local...`);

    const team = await prisma.team.findUnique({
      where: { team_id: parseInt(teamId) },
      include: {
        seasons: {
          include: {
            league: true,
          },
          orderBy: {
            league: {
              is_current: 'desc'
            }
          }
        },
        home_matches: {
          take: 10,
          orderBy: { date_unix: 'desc' },
          include: {
            away_team: true,
            league: true,
          }
        },
        away_matches: {
          take: 10,
          orderBy: { date_unix: 'desc' },
          include: {
            home_team: true,
            league: true,
          }
        }
      }
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Time não encontrado' },
        { status: 404 }
      );
    }

    // Buscar estatísticas da temporada atual
    const currentSeason = team.seasons.find(season => season.league.is_current);

    // Combinar últimas partidas (casa + fora)
    const allMatches = [
      ...team.home_matches.map(match => ({
        ...match,
        isHome: true,
        opponent: match.away_team,
      })),
      ...team.away_matches.map(match => ({
        ...match,
        isHome: false,
        opponent: match.home_team,
      }))
    ].sort((a, b) => b.date_unix - a.date_unix).slice(0, 10);

    // Transformar para o formato esperado pelo front-end
    const formattedTeam = {
      id: team.team_id,
      name: team.name,
      short_name: team.short_name,
      country: team.country,
      logo: team.logo_url || '',
      founded: team.founded,
      venue: team.venue,
      capacity: team.capacity,
      current_season: currentSeason ? {
        league: {
          id: currentSeason.league.season_id,
          name: currentSeason.league.league_name,
          country: currentSeason.league.country,
        },
        stats: {
          points: currentSeason.points,
          position: currentSeason.position,
          matches_played: currentSeason.matches_played,
          wins: currentSeason.wins,
          draws: currentSeason.draws,
          losses: currentSeason.losses,
          goals_for: currentSeason.goals_for,
          goals_against: currentSeason.goals_against,
          goal_difference: currentSeason.goal_difference,
          seasonScoredAVG: currentSeason.seasonScoredAVG,
          seasonConcededAVG: currentSeason.seasonConcededAVG,
          seasonScoredAVG_home: currentSeason.seasonScoredAVG_home,
          seasonScoredAVG_away: currentSeason.seasonScoredAVG_away,
        }
      } : null,
      recent_matches: allMatches.map(match => ({
        id: match.match_id,
        date_unix: match.date_unix,
        status: match.status,
        isHome: match.isHome,
        opponent: {
          id: match.opponent.team_id,
          name: match.opponent.name,
          logo: match.opponent.logo_url || '',
        },
        goals_for: match.isHome ? match.homeGoalCount : match.awayGoalCount,
        goals_against: match.isHome ? match.awayGoalCount : match.homeGoalCount,
        league: {
          id: match.league.season_id,
          name: match.league.league_name,
        }
      })),
      all_seasons: team.seasons.map(season => ({
        league: {
          id: season.league.season_id,
          name: season.league.league_name,
          country: season.league.country,
          is_current: season.league.is_current,
        },
        stats: {
          points: season.points,
          position: season.position,
          matches_played: season.matches_played,
          wins: season.wins,
          draws: season.draws,
          losses: season.losses,
          goals_for: season.goals_for,
          goals_against: season.goals_against,
          goal_difference: season.goal_difference,
          seasonScoredAVG: season.seasonScoredAVG,
          seasonConcededAVG: season.seasonConcededAVG,
          seasonScoredAVG_home: season.seasonScoredAVG_home,
          seasonScoredAVG_away: season.seasonScoredAVG_away,
        }
      }))
    };

    console.log(`✅ Dados do time ${team.name} encontrados`);

    return NextResponse.json({
      success: true,
      data: formattedTeam,
    });

  } catch (error) {
    console.error('❌ Erro ao buscar dados do time:', error);
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
