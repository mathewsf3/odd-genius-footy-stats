// Enhanced Team Logo Service - Uses AllSports fixtures for comprehensive logo coverage

interface TeamLogoResult {
  success: boolean;
  logoUrl?: string;
  source?: string;
  error?: string;
}

interface AllSportsFixture {
  event_home_team: string;
  event_away_team: string;
  home_team_logo: string;
  away_team_logo: string;
  home_team_key: string;
  away_team_key: string;
  league_name: string;
  event_date: string;
}

interface AllSportsFixturesResponse {
  success: boolean;
  data: AllSportsFixture[];
  count: number;
}

// Cache for team logos and fixtures to avoid repeated API calls
const logoCache = new Map<string, TeamLogoResult>();
const fixturesCache = new Map<string, AllSportsFixture[]>();

/**
 * Get team logo using comprehensive AllSports fixtures matching
 */
export async function getTeamLogo(teamName: string, teamId?: number, matchDate?: string): Promise<TeamLogoResult> {
  if (!teamName) {
    return { success: false, error: 'Team name is required' };
  }

  // Check cache first
  const cacheKey = `${teamName.toLowerCase()}_${teamId || 'no-id'}_${matchDate || 'no-date'}`;
  if (logoCache.has(cacheKey)) {
    return logoCache.get(cacheKey)!;
  }

  try {
    console.log(`🔍 Buscando logo para: ${teamName} (ID: ${teamId}) em ${matchDate}`);

    // Strategy 1: Try to find logo in AllSports fixtures for the same date
    if (matchDate) {
      const fixtureResult = await findLogoInFixtures(teamName, matchDate);
      if (fixtureResult.success) {
        logoCache.set(cacheKey, fixtureResult);
        return fixtureResult;
      }
    }

    // Strategy 2: Try direct team search in AllSportsAPI
    const directResult = await searchTeamDirectly(teamName, teamId);
    if (directResult.success) {
      logoCache.set(cacheKey, directResult);
      return directResult;
    }

    // Strategy 3: Try alternative search strategies
    const alternativeResult = await tryAlternativeSearch(teamName, teamId);

    // Cache the result (even if failed)
    logoCache.set(cacheKey, alternativeResult);

    return alternativeResult;

  } catch (error) {
    console.error(`❌ Erro ao buscar logo para ${teamName}:`, error);

    const result: TeamLogoResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };

    // Cache the error result to avoid repeated failed requests
    logoCache.set(cacheKey, result);

    return result;
  }
}

/**
 * Find team logo in AllSports fixtures for a specific date
 */
async function findLogoInFixtures(teamName: string, matchDate: string): Promise<TeamLogoResult> {
  try {
    // Check fixtures cache first
    const cacheKey = matchDate;
    let fixtures: AllSportsFixture[] = [];

    if (fixturesCache.has(cacheKey)) {
      fixtures = fixturesCache.get(cacheKey)!;
    } else {
      // Fetch fixtures for the date
      const response = await fetch(`/api/allsports/fixtures?from=${matchDate}&to=${matchDate}`);
      const data: AllSportsFixturesResponse = await response.json();

      if (data.success && data.data) {
        fixtures = data.data;
        fixturesCache.set(cacheKey, fixtures);
        console.log(`📅 Fixtures carregadas para ${matchDate}: ${fixtures.length} partidas`);
      }
    }

    // Search for team in fixtures with detailed logging
    console.log(`🔍 Procurando "${teamName}" em ${fixtures.length} fixtures...`);

    for (const fixture of fixtures) {
      // Check home team
      if (isTeamMatch(teamName, fixture.event_home_team) && fixture.home_team_logo) {
        console.log(`✅ MATCH FOUND! ${teamName} → ${fixture.event_home_team} → ${fixture.home_team_logo}`);
        return {
          success: true,
          logoUrl: fixture.home_team_logo,
          source: 'AllSports Fixtures (Home)'
        };
      }

      // Check away team
      if (isTeamMatch(teamName, fixture.event_away_team) && fixture.away_team_logo) {
        console.log(`✅ MATCH FOUND! ${teamName} → ${fixture.event_away_team} → ${fixture.away_team_logo}`);
        return {
          success: true,
          logoUrl: fixture.away_team_logo,
          source: 'AllSports Fixtures (Away)'
        };
      }
    }

    // Log some sample team names for debugging
    const sampleTeams = fixtures.slice(0, 5).map(f => `${f.event_home_team} vs ${f.event_away_team}`);
    console.log(`❌ "${teamName}" não encontrado. Exemplos de times: ${sampleTeams.join(', ')}`);

    // Try fuzzy matching with more details
    for (const fixture of fixtures.slice(0, 10)) {
      const homeMatch = isTeamMatch(teamName, fixture.event_home_team);
      const awayMatch = isTeamMatch(teamName, fixture.event_away_team);
      if (homeMatch || awayMatch) {
        console.log(`🔍 Possível match: "${teamName}" vs "${homeMatch ? fixture.event_home_team : fixture.event_away_team}"`);
      }
    }

    console.log(`❌ Time não encontrado em fixtures: ${teamName}`);
    return { success: false, error: 'Team not found in fixtures' };

  } catch (error) {
    console.error(`❌ Erro ao buscar em fixtures:`, error);
    return { success: false, error: 'Error searching fixtures' };
  }
}

/**
 * Search team directly in AllSports Teams API
 */
async function searchTeamDirectly(teamName: string, teamId?: number): Promise<TeamLogoResult> {
  try {
    const searchParams = new URLSearchParams();
    searchParams.append('teamName', teamName);
    if (teamId) {
      searchParams.append('teamId', teamId.toString());
    }

    const response = await fetch(`/api/allsports/teams?${searchParams.toString()}`);
    const data: any = await response.json();

    if (data.success && data.data?.team_logo) {
      console.log(`✅ Logo encontrado via busca direta: ${teamName} → ${data.data.team_logo}`);
      return {
        success: true,
        logoUrl: data.data.team_logo,
        source: 'AllSports Teams API'
      };
    }

    return { success: false, error: 'Team not found in direct search' };
  } catch (error) {
    return { success: false, error: 'Error in direct search' };
  }
}

/**
 * Check if two team names match using fuzzy matching
 */
function isTeamMatch(footyStatsName: string, allSportsName: string): boolean {
  if (!footyStatsName || !allSportsName) return false;

  const normalize = (name: string) => name.toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim();

  const name1 = normalize(footyStatsName);
  const name2 = normalize(allSportsName);

  // Exact match
  if (name1 === name2) return true;

  // Contains match (either direction)
  if (name1.includes(name2) || name2.includes(name1)) return true;

  // Word-based matching
  const words1 = name1.split(' ').filter(w => w.length > 2);
  const words2 = name2.split(' ').filter(w => w.length > 2);

  // Check if significant words match
  const commonWords = words1.filter(w => words2.includes(w));
  if (commonWords.length >= Math.min(words1.length, words2.length) * 0.6) {
    return true;
  }

  return false;
}

/**
 * Try alternative search strategies for team logos
 */
async function tryAlternativeSearch(teamName: string, teamId?: number): Promise<TeamLogoResult> {
  // Strategy 1: Try with simplified team name (remove common suffixes)
  const simplifiedName = simplifyTeamName(teamName);
  if (simplifiedName !== teamName) {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('teamName', simplifiedName);
      
      const response = await fetch(`/api/allsports/teams?${searchParams.toString()}`);
      const data: AllSportsTeamResponse = await response.json();

      if (data.success && data.data?.team_logo) {
        console.log(`✅ Logo encontrado com nome simplificado "${simplifiedName}": ${data.data.team_logo}`);
        return {
          success: true,
          logoUrl: data.data.team_logo,
          source: 'AllSportsAPI (simplified)'
        };
      }
    } catch (error) {
      console.log(`⚠️ Busca alternativa falhou para ${simplifiedName}`);
    }
  }

  // Strategy 2: Try with just the first word
  const firstWord = teamName.split(' ')[0];
  if (firstWord !== teamName && firstWord.length > 2) {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('teamName', firstWord);
      
      const response = await fetch(`/api/allsports/teams?${searchParams.toString()}`);
      const data: AllSportsTeamResponse = await response.json();

      if (data.success && data.data?.team_logo) {
        console.log(`✅ Logo encontrado com primeira palavra "${firstWord}": ${data.data.team_logo}`);
        return {
          success: true,
          logoUrl: data.data.team_logo,
          source: 'AllSportsAPI (first word)'
        };
      }
    } catch (error) {
      console.log(`⚠️ Busca por primeira palavra falhou para ${firstWord}`);
    }
  }

  console.log(`❌ Nenhum logo encontrado para ${teamName}`);
  return {
    success: false,
    error: 'No logo found with any search strategy'
  };
}

/**
 * Simplify team name by removing common suffixes and words
 */
function simplifyTeamName(teamName: string): string {
  return teamName
    .replace(/\s+(FC|SC|CF|United|City|Town|Rovers|Wanderers|Athletic|Club|Team|II|2|Jr|Junior)$/i, '')
    .replace(/\s+(Football|Soccer|Sports|Academy)$/i, '')
    .trim();
}

/**
 * Clear the logo cache (useful for testing or memory management)
 */
export function clearLogoCache(): void {
  logoCache.clear();
  console.log('🧹 Cache de logos limpo');
}

/**
 * Get cache statistics
 */
export function getLogoCacheStats(): { size: number; keys: string[] } {
  return {
    size: logoCache.size,
    keys: Array.from(logoCache.keys())
  };
}
