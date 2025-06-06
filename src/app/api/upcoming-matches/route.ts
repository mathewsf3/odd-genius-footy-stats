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
  competition_name?: string;
  league_name?: string;
  stadium_name?: string;
  avg_potential?: number;
  btts_potential?: number;
  o25_potential?: number;
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

    // For now, fetch only next 3 days to avoid timeout
    const upcomingMatches: any[] = [];
    const now = Math.floor(Date.now() / 1000);
    const threeDaysFromNow = now + (3 * 24 * 60 * 60);
    const sevenDaysFromNow = now + (7 * 24 * 60 * 60);

    // Fetch matches for the next 3 days only (faster response)
    for (let i = 1; i <= 3; i++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + i);
      const dateStr = targetDate.toISOString().split('T')[0];

      const apiUrl = `${FOOTYSTATS_BASE_URL}/todays-matches?key=${FOOTYSTATS_API_KEY}&date=${dateStr}`;

      try {
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'OddGeniusFootyStats/1.0',
          },
          next: { revalidate: 300 } // Cache for 5 minutes
        });

        if (response.ok) {
          const apiData = await response.json();
          const dayMatches = apiData.data || [];

          // Filter for upcoming matches (incomplete status and within date range)
          const filteredMatches = dayMatches.filter((match: FootyStatsMatch) =>
            match.status === 'incomplete' &&
            match.date_unix >= now &&
            match.date_unix <= sevenDaysFromNow
          );

          upcomingMatches.push(...filteredMatches);
        }
      } catch (dayError) {
        console.warn(`Failed to fetch matches for ${dateStr}:`, dayError);
        continue;
      }

      // Rate limiting - small delay between requests
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Sort by date and limit to reasonable number
    upcomingMatches.sort((a, b) => a.date_unix - b.date_unix);
    const limitedMatches = upcomingMatches.slice(0, 50);

    // Transform to standardized format
    const transformedMatches = limitedMatches.map((match: FootyStatsMatch) => ({
      id: match.id,
      homeName: match.home_name,
      awayName: match.away_name,
      homeGoals: 0,
      awayGoals: 0,
      minute: null,
      status: match.status,
      kickOff: new Date(match.date_unix * 1000).toISOString(),
      homeImage: match.home_image,
      awayImage: match.away_image,
      competition: match.competition_name || match.league_name || 'Unknown League',
      stadium: match.stadium_name || null,
      expectedGoals: {
        total: match.avg_potential || null,
        btts: match.btts_potential || null,
        over25: match.o25_potential || null
      }
    }));

    return NextResponse.json({
      success: true,
      data: transformedMatches,
      count: transformedMatches.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching upcoming matches:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    }, { status: 500 });
  }
}
