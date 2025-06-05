import { NextRequest, NextResponse } from 'next/server';

const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const API_BASE_URL = 'https://api.footystats.org';

// Generate logo URL using multiple strategies
function generateLogoUrl(teamName: string, country: string): string {
  // Strategy 1: Try FootyStats CDN format
  const cleanName = teamName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const countryCode = country.toLowerCase().replace(/\s+/g, '-');
  const footyStatsUrl = `https://cdn.footystats.org/img/${countryCode}-${cleanName}.png`;

  // Strategy 2: Try alternative logo services
  // const logoApiUrl = `https://logo.clearbit.com/${cleanName}.com`;

  // Strategy 3: Try sports logo API
  // const sportsLogoUrl = `https://logos-world.net/wp-content/uploads/2020/06/${cleanName}-Logo.png`;

  // For now, return the FootyStats URL as primary
  return footyStatsUrl;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamIds = searchParams.get('ids')?.split(',') || [];
    
    if (teamIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No team IDs provided',
        data: {}
      }, { status: 400 });
    }
    
    console.log('🔍 Buscando dados dos times:', teamIds);
    
    const teamData: { [key: string]: { id: number; name: string; cleanName: string; shortName: string; logo: string; country: string; founded: number; venue: string; capacity: number } } = {};
    
    // Fetch team data for each team ID
    for (const teamId of teamIds) {
      try {
        const url = `${API_BASE_URL}/team?key=${API_KEY}&team_id=${teamId}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'OddGeniusFootyStats/1.0',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const teamInfo = data.data || data;

          // Generate logo URL based on team name
          const logoUrl = generateLogoUrl(teamInfo.name || `Time ${teamId}`, teamInfo.country || 'Brasil');

          teamData[teamId] = {
            ...teamInfo,
            logo: logoUrl
          };
          console.log(`✅ Time ${teamId}:`, teamInfo.name || 'Nome não encontrado', `Logo: ${logoUrl}`);
        } else {
          console.warn(`❌ Erro para time ${teamId}:`, response.status);
          // Provide fallback data
          const fallbackName = `Time ${teamId}`;
          teamData[teamId] = {
            id: parseInt(teamId),
            name: fallbackName,
            cleanName: fallbackName,
            shortName: `T${teamId}`,
            logo: generateLogoUrl(fallbackName, 'Brasil'),
            country: 'Brasil',
            founded: 0,
            venue: 'Estádio',
            capacity: 0
          };
        }
      } catch (error) {
        console.error(`❌ Erro ao buscar time ${teamId}:`, error);
        // Provide fallback data
        const fallbackName = `Time ${teamId}`;
        teamData[teamId] = {
          id: parseInt(teamId),
          name: fallbackName,
          cleanName: fallbackName,
          shortName: `T${teamId}`,
          logo: generateLogoUrl(fallbackName, 'Brasil'),
          country: 'Brasil',
          founded: 0,
          venue: 'Estádio',
          capacity: 0
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      data: teamData,
      count: Object.keys(teamData).length
    });
    
  } catch (error) {
    console.error('❌ Erro na API de times:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      data: {}
    }, { status: 500 });
  }
}
