import { NextRequest, NextResponse } from 'next/server';

const ALLSPORTS_API_KEY = 'a395e9aacd8a43a76e0f745da1520f95066c0c1342a9d7318e791e19b79241c0';
const ALLSPORTS_BASE_URL = 'https://apiv2.allsportsapi.com/football';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamName = searchParams.get('teamName');
    const teamId = searchParams.get('teamId');

    if (!teamName && !teamId) {
      return NextResponse.json({
        success: false,
        error: 'teamName or teamId parameter is required'
      }, { status: 400 });
    }

    console.log('🔍 Buscando logo do time na AllSportsAPI:', { teamName, teamId });

    // Build the API URL
    let apiUrl = `${ALLSPORTS_BASE_URL}?met=Teams&APIkey=${ALLSPORTS_API_KEY}`;
    
    if (teamId) {
      apiUrl += `&teamId=${teamId}`;
    } else if (teamName) {
      apiUrl += `&teamName=${encodeURIComponent(teamName)}`;
    }

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
    
    console.log('📊 Resposta da AllSportsAPI:', {
      success: data.success,
      resultCount: data.result?.length || 0,
      teamName,
      teamId
    });

    if (data.success && data.result && data.result.length > 0) {
      const team = data.result[0];
      
      return NextResponse.json({
        success: true,
        data: {
          team_key: team.team_key,
          team_name: team.team_name,
          team_logo: team.team_logo,
          source: 'AllSportsAPI'
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Team not found in AllSportsAPI',
        data: null
      });
    }

  } catch (error) {
    console.error('❌ Erro ao buscar logo do time na AllSportsAPI:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    }, { status: 500 });
  }
}
