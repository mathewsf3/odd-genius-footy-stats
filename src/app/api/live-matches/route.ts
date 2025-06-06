import { NextResponse } from 'next/server';

const FOOTYSTATS_API_KEY = process.env.FOOTYSTATS_API_KEY;
const FOOTYSTATS_BASE_URL = process.env.FOOTYSTATS_BASE_URL || 'https://api.football-data-api.com';

interface FootyStatsMatch {
  id: number;
  homeID: number;
  awayID: number;
  home_name: string;
  away_name: string;
  home_image: string;
  away_image: string;
  status: string;
  date_unix: number;
  homeGoalCount: number;
  awayGoalCount: number;
  minute?: number;
  competition_name?: string;
  league_name?: string;
  team_a_possession?: number;
  team_b_possession?: number;
  stadium_name?: string;
}

export async function GET() {
  try {
    if (!FOOTYSTATS_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'FOOTYSTATS_API_KEY not configured',
        data: []
      }, { status: 500 });
    }

    // Get today's date for API call
    const today = new Date().toISOString().split('T')[0];
    const apiUrl = `${FOOTYSTATS_BASE_URL}/todays-matches?key=${FOOTYSTATS_API_KEY}&date=${today}`;

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'OddGeniusFootyStats/1.0',
      },
      next: { revalidate: 30 } // Cache for 30 seconds
    });

    if (!response.ok) {
      throw new Error(`FootyStats API error: ${response.status}`);
    }

    const apiData = await response.json();
    const allMatches = apiData.data || [];

    // Filter for live matches
    const liveStatuses = ['live', 'inprogress', 'playing', 'in_play'];
    const liveMatches = allMatches.filter((match: FootyStatsMatch) => 
      liveStatuses.includes(match.status.toLowerCase())
    );

    // Transform to standardized format
    const transformedMatches = liveMatches.map((match: FootyStatsMatch) => ({
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
      possession: {
        home: match.team_a_possession || null,
        away: match.team_b_possession || null
      },
      stadium: match.stadium_name || null
    }));

    return NextResponse.json({
      success: true,
      data: transformedMatches,
      count: transformedMatches.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching live matches:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    }, { status: 500 });
  }
}
