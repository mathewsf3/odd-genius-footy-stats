import { NextRequest, NextResponse } from 'next/server';

const FOOTYSTATS_API_KEY = process.env.FOOTYSTATS_API_KEY;
const FOOTYSTATS_BASE_URL = process.env.FOOTYSTATS_BASE_URL || 'https://api.football-data-api.com';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;

    if (!FOOTYSTATS_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'FOOTYSTATS_API_KEY not configured'
      }, { status: 500 });
    }

    if (!matchId) {
      return NextResponse.json({
        success: false,
        error: 'Match ID is required'
      }, { status: 400 });
    }

    const url = `${FOOTYSTATS_BASE_URL}/match?key=${FOOTYSTATS_API_KEY}&id=${matchId}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'OddGeniusFootyStats/1.0',
      },
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      throw new Error(`FootyStats API error: ${response.status}`);
    }

    const apiData = await response.json();
    const match = apiData.data;

    if (!match) {
      return NextResponse.json({
        success: false,
        error: 'Match not found'
      }, { status: 404 });
    }

    // Transform to standardized format
    const transformedMatch = {
      id: match.id,
      homeName: match.home_name,
      awayName: match.away_name,
      homeGoals: match.homeGoalCount || 0,
      awayGoals: match.awayGoalCount || 0,
      minute: match.minute || null,
      status: match.status,
      kickOff: new Date(match.date_unix * 1000).toISOString(),
      homeImage: match.home_image,
      awayImage: match.away_image,
      competition: match.competition_name || match.league_name || 'Unknown League',
      stadium: match.stadium_name || null,
      possession: {
        home: match.team_a_possession || null,
        away: match.team_b_possession || null
      },
      stats: {
        corners: { home: match.team_a_corners || 0, away: match.team_b_corners || 0 },
        shots: { home: match.team_a_shots || 0, away: match.team_b_shots || 0 },
        fouls: { home: match.team_a_fouls || 0, away: match.team_b_fouls || 0 }
      }
    };

    return NextResponse.json({
      success: true,
      data: transformedMatch,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching match details:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
