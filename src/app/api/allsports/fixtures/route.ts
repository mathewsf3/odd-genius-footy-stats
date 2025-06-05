import { NextRequest, NextResponse } from 'next/server';

const ALLSPORTS_API_KEY = 'a395e9aacd8a43a76e0f745da1520f95066c0c1342a9d7318e791e19b79241c0';
const ALLSPORTS_BASE_URL = 'https://apiv2.allsportsapi.com/football';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!from || !to) {
      return NextResponse.json({
        success: false,
        error: 'from and to date parameters are required (YYYY-MM-DD format)'
      }, { status: 400 });
    }

    console.log('🔍 Buscando fixtures na AllSportsAPI:', { from, to });

    // Build the API URL
    const apiUrl = `${ALLSPORTS_BASE_URL}?met=Fixtures&APIkey=${ALLSPORTS_API_KEY}&from=${from}&to=${to}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('📊 Resposta da AllSportsAPI Fixtures:', {
      success: data.success,
      resultCount: data.result?.length || 0,
      from,
      to
    });

    if (data.success && data.result) {
      // Log some sample team names and logos for analysis
      const sampleMatches = data.result.slice(0, 5);
      console.log('🎯 Sample AllSports matches:', sampleMatches.map(match => ({
        home: match.event_home_team,
        away: match.event_away_team,
        homeLogo: match.home_team_logo ? 'Available' : 'Missing',
        awayLogo: match.away_team_logo ? 'Available' : 'Missing',
        league: match.league_name
      })));

      return NextResponse.json({
        success: true,
        data: data.result,
        count: data.result.length
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'No fixtures found in AllSportsAPI',
        data: []
      });
    }

  } catch (error) {
    console.error('❌ Erro ao buscar fixtures na AllSportsAPI:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: []
    }, { status: 500 });
  }
}
