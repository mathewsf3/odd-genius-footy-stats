import { NextRequest, NextResponse } from 'next/server';

// Tipos para a resposta da API FootyStats
interface FootyStatsTeamResponse {
  success: boolean;
  data: FootyStatsTeam[];
}

interface FootyStatsTeam {
  id: number;
  name: string;
  full_name?: string;
  english_name?: string;
}

interface FootyStatsLastXResponse {
  success: boolean;
  data: FootyStatsLastXData[];
}

interface FootyStatsLastXData {
  id: number;
  name: string;
  full_name: string;
  last_x_match_num: number;
  stats: {
    seasonScoredAVG_home: number;
    seasonScoredAVG_away: number;
    seasonMatchesPlayed_home: number;
    seasonMatchesPlayed_away: number;
  };
}

interface LastXStats {
  seasonScoredAVG_home: number;
  seasonScoredAVG_away: number;
  seasonMatchesPlayed_home: number;
  seasonMatchesPlayed_away: number;
}

// Cache para evitar muitas chamadas à API
const teamStatsCache = new Map<string, { data: any; timestamp: number }>();
const teamIdCache = new Map<string, number>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const homeTeam = searchParams.get('homeTeam');
    const awayTeam = searchParams.get('awayTeam');
    const homeTeamId = searchParams.get('homeTeamId');
    const awayTeamId = searchParams.get('awayTeamId');

    // Prioriza IDs se fornecidos, senão usa nomes
    if (!homeTeamId && !homeTeam) {
      return NextResponse.json(
        { error: 'homeTeamId ou homeTeam é obrigatório' },
        { status: 400 }
      );
    }

    if (!awayTeamId && !awayTeam) {
      return NextResponse.json(
        { error: 'awayTeamId ou awayTeam é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`🔍 Buscando stats REAIS para:`, {
      homeTeam: homeTeam || `ID:${homeTeamId}`,
      awayTeam: awayTeam || `ID:${awayTeamId}`,
      useIds: !!(homeTeamId && awayTeamId)
    });

    // Usa IDs diretamente se fornecidos, senão busca por nome
    let finalHomeTeamId: number | null = null;
    let finalAwayTeamId: number | null = null;

    if (homeTeamId && awayTeamId) {
      // Usa IDs diretamente (MUITO MAIS EFICIENTE)
      finalHomeTeamId = parseInt(homeTeamId);
      finalAwayTeamId = parseInt(awayTeamId);
      console.log(`🎯 Usando IDs diretos: Home=${finalHomeTeamId}, Away=${finalAwayTeamId}`);
    } else {
      // Fallback: busca por nome (menos eficiente)
      console.log(`🔍 Buscando IDs por nome...`);
      finalHomeTeamId = homeTeam ? await getTeamIdByName(homeTeam) : null;
      finalAwayTeamId = awayTeam ? await getTeamIdByName(awayTeam) : null;
    }

    let homeStats: LastXStats | null = null;
    let awayStats: LastXStats | null = null;

    if (finalHomeTeamId && finalAwayTeamId) {
      // Busca as estatísticas REAIS dos últimos 5 jogos
      const [homeStatsReal, awayStatsReal] = await Promise.all([
        getTeamLastXStats(finalHomeTeamId),
        getTeamLastXStats(finalAwayTeamId)
      ]);

      if (homeStatsReal && awayStatsReal) {
        homeStats = homeStatsReal;
        awayStats = awayStatsReal;
        console.log(`✅ Dados REAIS obtidos para ${homeTeam || `ID:${finalHomeTeamId}`} vs ${awayTeam || `ID:${finalAwayTeamId}`}`);
      }
    }

    // Se não conseguiu dados reais, retorna 0 (SEM FALLBACK)
    if (!homeStats || !awayStats) {
      console.log(`❌ SEM dados reais para ${homeTeam || `ID:${finalHomeTeamId}`} vs ${awayTeam || `ID:${finalAwayTeamId}`} - retornando 0`);
      return NextResponse.json({
        success: true,
        data: {
          homeTeam: homeTeam || `Team ${finalHomeTeamId}`,
          awayTeam: awayTeam || `Team ${finalAwayTeamId}`,
          homeTeamId: finalHomeTeamId,
          awayTeamId: finalAwayTeamId,
          dataSource: 'none',
          homeExpectedGoals: 0,
          awayExpectedGoals: 0,
          totalExpectedGoals: 0,
          confidence: 'Sem Dados'
        }
      });
    }

    // Calcula o Expected Goals baseado APENAS em dados REAIS
    const expectedGoals = calculateExpectedGoals(homeStats, awayStats);

    return NextResponse.json({
      success: true,
      data: {
        homeTeam: homeTeam || `Team ${finalHomeTeamId}`,
        awayTeam: awayTeam || `Team ${finalAwayTeamId}`,
        homeTeamId: finalHomeTeamId,
        awayTeamId: finalAwayTeamId,
        dataSource: 'real',
        homeStats: homeStats,
        awayStats: awayStats,
        ...expectedGoals
      }
    });

  } catch (error) {
    console.error('❌ Erro na API team-stats:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function getTeamIdByName(teamName: string): Promise<number | null> {
  try {
    // Verifica cache primeiro
    const cacheKey = `teamId_${teamName}`;
    if (teamIdCache.has(cacheKey)) {
      console.log(`📋 Cache hit para team ID: ${teamName}`);
      return teamIdCache.get(cacheKey)!;
    }

    // Busca o time na API FootyStats usando league-teams
    const leagueIds = [2012, 2013, 2014, 2016, 2017, 2021, 2018]; // Premier League, La Liga, Serie A, etc.

    for (const leagueId of leagueIds) {
      try {
        const url = `https://api.football-data-api.com/league-teams?key=${process.env.FOOTYSTATS_API_KEY}&league_id=${leagueId}`;

        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data: FootyStatsTeamResponse = await response.json();

          if (data.success && data.data) {
            const team = data.data.find((t: FootyStatsTeam) => 
              t.name?.toLowerCase().includes(teamName.toLowerCase()) ||
              t.full_name?.toLowerCase().includes(teamName.toLowerCase()) ||
              t.english_name?.toLowerCase().includes(teamName.toLowerCase()) ||
              teamName.toLowerCase().includes(t.name?.toLowerCase()) ||
              teamName.toLowerCase().includes(t.full_name?.toLowerCase() || '') ||
              teamName.toLowerCase().includes(t.english_name?.toLowerCase() || '')
            );
            
            if (team) {
              console.log(`🎯 Time encontrado: ${team.name} (ID: ${team.id}) na liga ${leagueId}`);
              teamIdCache.set(cacheKey, team.id);
              return team.id;
            }
          }
        }
      } catch (error) {
        console.log(`❌ Erro ao buscar na liga ${leagueId}:`, error);
        continue;
      }
    }
    
    console.log(`❌ Time não encontrado na API FootyStats: ${teamName}`);
    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar ID do time:', error);
    return null;
  }
}

async function getTeamLastXStats(teamId: number): Promise<LastXStats | null> {
  try {
    const cacheKey = `lastx_${teamId}`;
    const cached = teamStatsCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`📋 Cache hit para team ${teamId}`);
      return cached.data;
    }

    // Busca dados REAIS da API FootyStats - SEM FALLBACK
    const url = `https://api.football-data-api.com/lastx?key=${process.env.FOOTYSTATS_API_KEY}&team_id=${teamId}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`❌ Erro HTTP ${response.status} ao buscar stats do time ${teamId}`);
      return null;
    }

    const data: FootyStatsLastXResponse = await response.json();

    if (!data.success || !data.data || !Array.isArray(data.data)) {
      console.log(`❌ Dados inválidos da API para team ${teamId}:`, data);
      return null;
    }

    // Busca os dados dos últimos 5 jogos (last_x_match_num = 5)
    const last5Data = data.data.find(item => item.last_x_match_num === 5);

    if (!last5Data || !last5Data.stats) {
      console.log(`❌ Dados dos últimos 5 jogos não encontrados para team ${teamId}`);
      return null;
    }

    // Valida se temos os dados necessários
    const stats = last5Data.stats;
    if (typeof stats.seasonScoredAVG_home !== 'number' ||
        typeof stats.seasonScoredAVG_away !== 'number' ||
        typeof stats.seasonMatchesPlayed_home !== 'number' ||
        typeof stats.seasonMatchesPlayed_away !== 'number') {
      console.log(`❌ Dados incompletos para team ${teamId}:`, stats);
      return null;
    }

    teamStatsCache.set(cacheKey, { data: stats, timestamp: Date.now() });
    console.log(`📊 Stats REAIS obtidas para team ${teamId}:`, {
      goalsHome: stats.seasonScoredAVG_home,
      goalsAway: stats.seasonScoredAVG_away,
      matchesHome: stats.seasonMatchesPlayed_home,
      matchesAway: stats.seasonMatchesPlayed_away
    });
    
    return stats;
  } catch (error) {
    console.error(`❌ Erro ao buscar stats REAIS do time ${teamId}:`, error);
    return null;
  }
}

function calculateExpectedGoals(homeStats: LastXStats, awayStats: LastXStats): {
  homeExpectedGoals: number;
  awayExpectedGoals: number;
  totalExpectedGoals: number;
  confidence: string;
} {
  // Usa APENAS dados REAIS dos últimos 5 jogos
  // Home team: média de gols em casa nos últimos 5 jogos em casa
  const homeGoalsAvg = homeStats.seasonScoredAVG_home;

  // Away team: média de gols fora nos últimos 5 jogos fora
  const awayGoalsAvg = awayStats.seasonScoredAVG_away;
  
  // Arredonda para 1 casa decimal
  const homeRounded = Math.round(homeGoalsAvg * 10) / 10;
  const awayRounded = Math.round(awayGoalsAvg * 10) / 10;
  const totalRounded = Math.round((homeRounded + awayRounded) * 10) / 10;
  
  // Determina a confiança baseada na quantidade de jogos
  const homeGames = homeStats.seasonMatchesPlayed_home;
  const awayGames = awayStats.seasonMatchesPlayed_away;
  
  let confidence = 'Baixa';
  if (homeGames >= 5 && awayGames >= 5) {
    confidence = 'Alta';
  } else if (homeGames >= 3 && awayGames >= 3) {
    confidence = 'Média';
  }

  console.log(`🧮 Cálculo REAL:`, {
    homeTeam: { goalsAvg: homeGoalsAvg, games: homeGames },
    awayTeam: { goalsAvg: awayGoalsAvg, games: awayGames },
    result: { home: homeRounded, away: awayRounded, total: totalRounded, confidence }
  });

  return {
    homeExpectedGoals: homeRounded,
    awayExpectedGoals: awayRounded,
    totalExpectedGoals: totalRounded,
    confidence
  };
}
