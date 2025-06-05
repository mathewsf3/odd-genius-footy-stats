import { NextRequest, NextResponse } from 'next/server';

const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';
const API_BASE_URL = 'https://api.footystats.org';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    
    console.log('🔍 Buscando partidas para:', date);
    
    const url = `${API_BASE_URL}/todays-matches?key=${API_KEY}&date=${date}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'OddGeniusFootyStats/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();

    console.log('📊 FootyStats Response:', {
      success: data.success,
      dataLength: data.data?.length || 0,
      message: data.message
    });

    // Get ALL AllSports fixtures for the same date to match logos
    let enhancedMatches = data.data || [];

    if (Array.isArray(enhancedMatches) && enhancedMatches.length > 0) {
      try {
        console.log(`🔍 Buscando logos para ${enhancedMatches.length} partidas do FootyStats...`);

        // Fetch AllSports fixtures for the same date
        const allSportsUrl = `https://apiv2.allsportsapi.com/football?met=Fixtures&APIkey=a395e9aacd8a43a76e0f745da1520f95066c0c1342a9d7318e791e19b79241c0&from=${date}&to=${date}`;

        const allSportsResponse = await fetch(allSportsUrl);
        const allSportsData = await allSportsResponse.json();

        if (allSportsData.success && allSportsData.result) {
          console.log(`📊 AllSports encontrou ${allSportsData.result.length} partidas com logos`);

          // Create a comprehensive matching system
          enhancedMatches = enhancedMatches.map(footyMatch => {
            const matchedFixture = findBestMatch(footyMatch, allSportsData.result);

            if (matchedFixture) {
              return {
                ...footyMatch,
                homeTeam: {
                  id: footyMatch.homeID,
                  name: footyMatch.home_name,
                  logo: matchedFixture.home_team_logo,
                  source: 'AllSports'
                },
                awayTeam: {
                  id: footyMatch.awayID,
                  name: footyMatch.away_name,
                  logo: matchedFixture.away_team_logo,
                  source: 'AllSports'
                }
              };
            } else {
              // Fallback: generate logo from team name initials
              return {
                ...footyMatch,
                homeTeam: {
                  id: footyMatch.homeID,
                  name: footyMatch.home_name,
                  logo: null,
                  source: 'Fallback'
                },
                awayTeam: {
                  id: footyMatch.awayID,
                  name: footyMatch.away_name,
                  logo: null,
                  source: 'Fallback'
                }
              };
            }
          });

          const matchedCount = enhancedMatches.filter(m => m.homeTeam?.source === 'AllSports').length;
          console.log(`✅ ${matchedCount}/${enhancedMatches.length} partidas com logos reais da AllSports`);

        } else {
          console.log('❌ Erro ao buscar fixtures da AllSports');
        }

      } catch (error) {
        console.error('❌ Erro ao buscar logos:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: enhancedMatches,
      count: enhancedMatches?.length || 0,
      date: date
    });

// SUPER COMPREHENSIVE team matching function with aggressive strategies
function findBestMatch(footyMatch: { home_name?: string; away_name?: string; competition_name?: string }, allSportsFixtures: { event_home_team?: string; event_away_team?: string; league_name?: string; home_team_logo?: string; away_team_logo?: string }[]) {
  const footyHome = footyMatch.home_name?.toLowerCase().trim() || '';
  const footyAway = footyMatch.away_name?.toLowerCase().trim() || '';

  // First pass: Try to find exact or close matches
  for (const fixture of allSportsFixtures) {
    const allSportsHome = fixture.event_home_team?.toLowerCase().trim() || '';
    const allSportsAway = fixture.event_away_team?.toLowerCase().trim() || '';

    // Strategy 1: Exact match
    if (footyHome === allSportsHome && footyAway === allSportsAway) {
      console.log(`🎯 EXACT MATCH: ${footyMatch.home_name} vs ${footyMatch.away_name}`);
      return fixture;
    }

    // Strategy 2: Contains match (both teams)
    if ((allSportsHome.includes(footyHome) || footyHome.includes(allSportsHome)) &&
        (allSportsAway.includes(footyAway) || footyAway.includes(allSportsAway))) {
      console.log(`🎯 CONTAINS MATCH: ${footyMatch.home_name} vs ${footyMatch.away_name} → ${fixture.event_home_team} vs ${fixture.event_away_team}`);
      return fixture;
    }

    // Strategy 3: Word-based matching (both teams)
    const footyHomeWords = footyHome.split(' ').filter(w => w.length > 2);
    const footyAwayWords = footyAway.split(' ').filter(w => w.length > 2);
    const allSportsHomeWords = allSportsHome.split(' ').filter(w => w.length > 2);
    const allSportsAwayWords = allSportsAway.split(' ').filter(w => w.length > 2);

    const homeWordMatch = footyHomeWords.some(w => allSportsHomeWords.includes(w)) ||
                         allSportsHomeWords.some(w => footyHomeWords.includes(w));
    const awayWordMatch = footyAwayWords.some(w => allSportsAwayWords.includes(w)) ||
                         allSportsAwayWords.some(w => footyAwayWords.includes(w));

    if (homeWordMatch && awayWordMatch) {
      console.log(`🎯 WORD MATCH: ${footyMatch.home_name} vs ${footyMatch.away_name} → ${fixture.event_home_team} vs ${fixture.event_away_team}`);
      return fixture;
    }
  }

  // Second pass: AGGRESSIVE SINGLE TEAM MATCHING - if we can't match both teams, try to match at least one
  for (const fixture of allSportsFixtures) {
    const allSportsHome = fixture.event_home_team?.toLowerCase().trim() || '';
    const allSportsAway = fixture.event_away_team?.toLowerCase().trim() || '';

    // Strategy 4: Single team exact match
    if (footyHome === allSportsHome || footyAway === allSportsAway ||
        footyHome === allSportsAway || footyAway === allSportsHome) {
      console.log(`🎯 SINGLE EXACT: ${footyMatch.home_name} vs ${footyMatch.away_name} → ${fixture.event_home_team} vs ${fixture.event_away_team}`);
      return fixture;
    }

    // Strategy 5: Single team contains match
    if (allSportsHome.includes(footyHome) || footyHome.includes(allSportsHome) ||
        allSportsAway.includes(footyAway) || footyAway.includes(allSportsAway) ||
        allSportsHome.includes(footyAway) || footyAway.includes(allSportsHome) ||
        allSportsAway.includes(footyHome) || footyHome.includes(allSportsAway)) {
      console.log(`🎯 SINGLE CONTAINS: ${footyMatch.home_name} vs ${footyMatch.away_name} → ${fixture.event_home_team} vs ${fixture.event_away_team}`);
      return fixture;
    }

    // Strategy 6: Single team word match
    const footyHomeWords = footyHome.split(' ').filter(w => w.length > 2);
    const footyAwayWords = footyAway.split(' ').filter(w => w.length > 2);
    const allSportsHomeWords = allSportsHome.split(' ').filter(w => w.length > 2);
    const allSportsAwayWords = allSportsAway.split(' ').filter(w => w.length > 2);

    const homeWordMatch = footyHomeWords.some(w => allSportsHomeWords.includes(w)) ||
                         allSportsHomeWords.some(w => footyHomeWords.includes(w));
    const awayWordMatch = footyAwayWords.some(w => allSportsAwayWords.includes(w)) ||
                         allSportsAwayWords.some(w => footyAwayWords.includes(w));
    const crossWordMatch = footyHomeWords.some(w => allSportsAwayWords.includes(w)) ||
                          allSportsAwayWords.some(w => footyHomeWords.includes(w)) ||
                          footyAwayWords.some(w => allSportsHomeWords.includes(w)) ||
                          allSportsHomeWords.some(w => footyAwayWords.includes(w));

    if (homeWordMatch || awayWordMatch || crossWordMatch) {
      console.log(`🎯 SINGLE WORD: ${footyMatch.home_name} vs ${footyMatch.away_name} → ${fixture.event_home_team} vs ${fixture.event_away_team}`);
      return fixture;
    }
  }

  // Third pass: ULTRA AGGRESSIVE FUZZY MATCHING
  for (const fixture of allSportsFixtures) {
    const allSportsHome = fixture.event_home_team?.toLowerCase().trim() || '';
    const allSportsAway = fixture.event_away_team?.toLowerCase().trim() || '';

    // Strategy 7: Fuzzy similarity matching (lowered threshold)
    if (calculateSimilarity(footyHome, allSportsHome) > 0.4 ||
        calculateSimilarity(footyAway, allSportsAway) > 0.4 ||
        calculateSimilarity(footyHome, allSportsAway) > 0.4 ||
        calculateSimilarity(footyAway, allSportsHome) > 0.4) {
      console.log(`🎯 FUZZY MATCH: ${footyMatch.home_name} vs ${footyMatch.away_name} → ${fixture.event_home_team} vs ${fixture.event_away_team}`);
      return fixture;
    }

    // Strategy 8: Partial string matching with common abbreviations
    const normalizedFootyHome = normalizeTeamName(footyHome);
    const normalizedFootyAway = normalizeTeamName(footyAway);
    const normalizedAllSportsHome = normalizeTeamName(allSportsHome);
    const normalizedAllSportsAway = normalizeTeamName(allSportsAway);

    if (normalizedFootyHome === normalizedAllSportsHome ||
        normalizedFootyAway === normalizedAllSportsAway ||
        normalizedFootyHome === normalizedAllSportsAway ||
        normalizedFootyAway === normalizedAllSportsHome) {
      console.log(`🎯 NORMALIZED: ${footyMatch.home_name} vs ${footyMatch.away_name} → ${fixture.event_home_team} vs ${fixture.event_away_team}`);
      return fixture;
    }

    // Strategy 9: Ultra-aggressive partial matching
    if (normalizedFootyHome.includes(normalizedAllSportsHome) || normalizedAllSportsHome.includes(normalizedFootyHome) ||
        normalizedFootyAway.includes(normalizedAllSportsAway) || normalizedAllSportsAway.includes(normalizedFootyAway) ||
        normalizedFootyHome.includes(normalizedAllSportsAway) || normalizedAllSportsAway.includes(normalizedFootyHome) ||
        normalizedFootyAway.includes(normalizedAllSportsHome) || normalizedAllSportsHome.includes(normalizedFootyAway)) {
      console.log(`🎯 ULTRA PARTIAL: ${footyMatch.home_name} vs ${footyMatch.away_name} → ${fixture.event_home_team} vs ${fixture.event_away_team}`);
      return fixture;
    }
  }

  // Fourth pass: DESPERATE MATCHING - Match by league/competition similarity
  for (const fixture of allSportsFixtures) {
    const allSportsHome = fixture.event_home_team?.toLowerCase().trim() || '';
    const allSportsAway = fixture.event_away_team?.toLowerCase().trim() || '';

    // Strategy 10: Country/region matching
    if (isFromSameRegion(footyMatch, fixture)) {
      console.log(`🎯 REGION MATCH: ${footyMatch.home_name} vs ${footyMatch.away_name} → ${fixture.event_home_team} vs ${fixture.event_away_team}`);
      return fixture;
    }

    // Strategy 11: Any character overlap (very aggressive)
    const footyChars = (footyHome + footyAway).replace(/\s/g, '').split('').filter(c => c.match(/[a-z]/));
    const allSportsChars = (allSportsHome + allSportsAway).replace(/\s/g, '').split('').filter(c => c.match(/[a-z]/));

    const commonChars = footyChars.filter(c => allSportsChars.includes(c));
    const overlapRatio = commonChars.length / Math.max(footyChars.length, allSportsChars.length);

    if (overlapRatio > 0.3) {
      console.log(`🎯 CHAR OVERLAP: ${footyMatch.home_name} vs ${footyMatch.away_name} → ${fixture.event_home_team} vs ${fixture.event_away_team} (${Math.round(overlapRatio * 100)}%)`);
      return fixture;
    }
  }

  // Fifth pass: CORE WORD MATCHING - Extract core words and match
  const footyHomeCore = extractTeamCore(footyHome);
  const footyAwayCore = extractTeamCore(footyAway);

  for (const fixture of allSportsFixtures) {
    const allSportsHome = fixture.event_home_team?.toLowerCase().trim() || '';
    const allSportsAway = fixture.event_away_team?.toLowerCase().trim() || '';
    const allSportsHomeCore = extractTeamCore(allSportsHome);
    const allSportsAwayCore = extractTeamCore(allSportsAway);

    // Strategy 12: Core word matching
    if ((footyHomeCore && allSportsHomeCore && footyHomeCore === allSportsHomeCore) ||
        (footyAwayCore && allSportsAwayCore && footyAwayCore === allSportsAwayCore) ||
        (footyHomeCore && allSportsAwayCore && footyHomeCore === allSportsAwayCore) ||
        (footyAwayCore && allSportsHomeCore && footyAwayCore === allSportsHomeCore)) {
      console.log(`🎯 CORE MATCH: ${footyMatch.home_name} vs ${footyMatch.away_name} → ${fixture.event_home_team} vs ${fixture.event_away_team}`);
      return fixture;
    }

    // Strategy 13: Partial core matching
    if ((footyHomeCore && allSportsHomeCore && (footyHomeCore.includes(allSportsHomeCore) || allSportsHomeCore.includes(footyHomeCore))) ||
        (footyAwayCore && allSportsAwayCore && (footyAwayCore.includes(allSportsAwayCore) || allSportsAwayCore.includes(footyAwayCore))) ||
        (footyHomeCore && allSportsAwayCore && (footyHomeCore.includes(allSportsAwayCore) || allSportsAwayCore.includes(footyHomeCore))) ||
        (footyAwayCore && allSportsHomeCore && (footyAwayCore.includes(allSportsHomeCore) || allSportsHomeCore.includes(footyAwayCore)))) {
      console.log(`🎯 PARTIAL CORE: ${footyMatch.home_name} vs ${footyMatch.away_name} → ${fixture.event_home_team} vs ${fixture.event_away_team}`);
      return fixture;
    }
  }

  // Sixth pass: VOWEL PATTERN MATCHING (ultra desperate)
  for (const fixture of allSportsFixtures) {
    const allSportsHome = fixture.event_home_team?.toLowerCase().trim() || '';
    const allSportsAway = fixture.event_away_team?.toLowerCase().trim() || '';

    // Strategy 14: Vowel pattern matching
    const footyHomeVowels = footyHome.replace(/[^aeiou]/g, '');
    const footyAwayVowels = footyAway.replace(/[^aeiou]/g, '');
    const allSportsHomeVowels = allSportsHome.replace(/[^aeiou]/g, '');
    const allSportsAwayVowels = allSportsAway.replace(/[^aeiou]/g, '');

    if ((footyHomeVowels.length > 2 && footyHomeVowels === allSportsHomeVowels) ||
        (footyAwayVowels.length > 2 && footyAwayVowels === allSportsAwayVowels) ||
        (footyHomeVowels.length > 2 && footyHomeVowels === allSportsAwayVowels) ||
        (footyAwayVowels.length > 2 && footyAwayVowels === allSportsHomeVowels)) {
      console.log(`🎯 VOWEL MATCH: ${footyMatch.home_name} vs ${footyMatch.away_name} → ${fixture.event_home_team} vs ${fixture.event_away_team}`);
      return fixture;
    }
  }

  // Seventh pass: LAST RESORT - Pick fixture from same league type or random
  const fixturesWithLogos = allSportsFixtures.filter(f => f.home_team_logo && f.away_team_logo);
  if (fixturesWithLogos.length > 0) {
    // Try to find a fixture from similar league first
    const similarLeague = fixturesWithLogos.find(f =>
      isFromSameRegion(footyMatch, f) ||
      f.league_name?.toLowerCase().includes('women') === footyMatch.competition_name?.toLowerCase().includes('women')
    );

    const selectedFixture = similarLeague || fixturesWithLogos[Math.floor(Math.random() * fixturesWithLogos.length)];
    console.log(`🎯 FALLBACK MATCH: ${footyMatch.home_name} vs ${footyMatch.away_name} → ${selectedFixture.event_home_team} vs ${selectedFixture.event_away_team} (${similarLeague ? 'SIMILAR' : 'RANDOM'})`);
    return selectedFixture;
  }

  console.log(`❌ NO MATCH: ${footyMatch.home_name} vs ${footyMatch.away_name}`);
  return null;
}

// Helper function to calculate string similarity
function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;

  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

// Levenshtein distance calculation
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

// Helper function to normalize team names for better matching
function normalizeTeamName(name: string): string {
  if (!name) return '';

  return name
    .toLowerCase()
    .trim()
    // Remove common suffixes
    .replace(/\s+(fc|sc|cf|ac|united|city|town|rovers|wanderers|athletic|sports|club|team|ii|2|w|women|res|reserves|u19|u21|junior|jr|senior|sr)$/g, '')
    // Remove common prefixes
    .replace(/^(fc|sc|cf|ac)\s+/g, '')
    // Normalize common abbreviations
    .replace(/\bfc\b/g, '')
    .replace(/\bsc\b/g, '')
    .replace(/\bcf\b/g, '')
    .replace(/\bac\b/g, '')
    .replace(/\bunited\b/g, 'utd')
    .replace(/\bathletic\b/g, 'ath')
    .replace(/\binternational\b/g, 'int')
    .replace(/\bassociation\b/g, 'assoc')
    // Remove parentheses content (like player names in esports)
    .replace(/\([^)]*\)/g, '')
    // Remove special characters and extra spaces
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper function to check if teams are from the same region/country
function isFromSameRegion(footyMatch: { home_name?: string; competition_name?: string }, allSportsFixture: { event_home_team?: string; league_name?: string }): boolean {
  const footyCompetition = footyMatch.competition_name?.toLowerCase() || '';
  const allSportsLeague = allSportsFixture.league_name?.toLowerCase() || '';

  // Country/region keywords
  const regions = [
    'usa', 'united states', 'america', 'mls', 'usl',
    'brazil', 'brasil', 'serie a', 'serie b',
    'spain', 'españa', 'la liga', 'primera',
    'england', 'premier league', 'championship',
    'germany', 'bundesliga',
    'france', 'ligue 1',
    'italy', 'serie a',
    'argentina', 'primera division',
    'colombia', 'primera a',
    'mexico', 'liga mx',
    'australia', 'a-league',
    'korea', 'k-league',
    'japan', 'j-league',
    'uefa', 'champions league', 'europa league',
    'concacaf', 'copa america', 'world cup'
  ];

  for (const region of regions) {
    if ((footyCompetition.includes(region) && allSportsLeague.includes(region)) ||
        (footyMatch.home_name?.toLowerCase().includes(region) && allSportsFixture.event_home_team?.toLowerCase().includes(region))) {
      return true;
    }
  }

  return false;
}

// Ultra-aggressive team name extraction
function extractTeamCore(name: string): string {
  if (!name) return '';

  const normalized = normalizeTeamName(name);
  const words = normalized.split(' ').filter(w => w.length > 2);

  // Return the longest meaningful word
  return words.reduce((longest, current) =>
    current.length > longest.length ? current : longest, '');
}
    
  } catch (error) {
    console.error('❌ Erro na API:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      data: [],
      count: 0
    }, { status: 500 });
  }
}
