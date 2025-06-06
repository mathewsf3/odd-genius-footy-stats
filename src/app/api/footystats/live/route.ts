/**
 * 🔴 LIVE MATCHES ENDPOINT - DADOS REAIS
 * Endpoint dedicado para partidas ao vivo com múltiplas estratégias
 */

import { NextRequest, NextResponse } from 'next/server';

const FOOTYSTATS_API_KEY = process.env.FOOTYSTATS_API_KEY;
const FOOTYSTATS_BASE_URL = 'https://api.football-data-api.com';

// Cache simples para otimizar
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 20000; // 20 segundos para partidas ao vivo

export async function GET(request: NextRequest) {
  try {
    console.log('🔴 ENDPOINT LIVE MATCHES - BUSCANDO DADOS REAIS...');

    // Verificar cache
    const cacheKey = 'live-matches-endpoint';
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📋 Cache hit para live matches endpoint');
      return NextResponse.json({
        success: true,
        data: cached.data,
        count: cached.data.length,
        source: 'cache',
        timestamp: new Date().toISOString()
      });
    }

    if (!FOOTYSTATS_API_KEY) {
      throw new Error('FootyStats API key não configurada');
    }

    const liveMatches: any[] = [];
    const today = new Date().toISOString().split('T')[0];

    // Estratégia 1: Buscar partidas ao vivo diretas
    try {
      const liveUrl = new URL(`${FOOTYSTATS_BASE_URL}/todays-matches`);
      liveUrl.searchParams.append('key', FOOTYSTATS_API_KEY);
      liveUrl.searchParams.append('date', today);

      console.log(`🔍 Buscando partidas ao vivo: ${liveUrl.toString()}`);

      const liveResponse = await fetch(liveUrl.toString(), {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'OddGeniusFootyStats/1.0',
        },
      });

      if (liveResponse.ok) {
        const liveData = await liveResponse.json();
        
        if (liveData.success && liveData.data) {
          // Filtrar apenas partidas que estão realmente ao vivo
          const realLiveMatches = liveData.data.filter((match: any) => {
            const isLive = match.status === 'live' || 
                          match.status === 'inprogress' || 
                          match.status === 'playing' ||
                          (match.homeGoalCount !== undefined && 
                           match.awayGoalCount !== undefined && 
                           match.status !== 'complete' && 
                           match.status !== 'finished' &&
                           match.status !== 'incomplete');
            
            if (isLive) {
              console.log(`🔴 Partida ao vivo encontrada: ${match.home_name} vs ${match.away_name} (${match.status})`);
            }
            
            return isLive;
          });

          liveMatches.push(...realLiveMatches);
          console.log(`🔴 Estratégia 1: ${realLiveMatches.length} partidas ao vivo encontradas`);
        }
      }
    } catch (error) {
      console.warn('❌ Erro na estratégia 1 (live diretas):', error);
    }

    // Estratégia 2: Se não encontrou, buscar todas as partidas de hoje e filtrar
    if (liveMatches.length === 0) {
      try {
        const allUrl = new URL(`${FOOTYSTATS_BASE_URL}/todays-matches`);
        allUrl.searchParams.append('key', FOOTYSTATS_API_KEY);
        allUrl.searchParams.append('date', today);

        console.log(`🔍 Estratégia 2 - Buscando todas as partidas de hoje: ${allUrl.toString()}`);

        const allResponse = await fetch(allUrl.toString(), {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'OddGeniusFootyStats/1.0',
          },
        });

        if (allResponse.ok) {
          const allData = await allResponse.json();
          
          if (allData.success && allData.data) {
            const now = Date.now();
            
            // Filtrar partidas que podem estar ao vivo
            const potentialLiveMatches = allData.data.filter((match: any) => {
              const matchTime = match.date_unix * 1000;
              const timeDiff = now - matchTime;
              
              // Partida começou há menos de 2 horas e não está completa
              const couldBeLive = timeDiff > 0 && 
                                 timeDiff < (2 * 60 * 60 * 1000) && 
                                 match.status !== 'complete' && 
                                 match.status !== 'finished';
              
              if (couldBeLive) {
                console.log(`🟡 Partida potencialmente ao vivo: ${match.home_name} vs ${match.away_name} (${match.status})`);
              }
              
              return couldBeLive;
            });

            liveMatches.push(...potentialLiveMatches);
            console.log(`🔴 Estratégia 2: ${potentialLiveMatches.length} partidas potencialmente ao vivo encontradas`);
          }
        }
      } catch (error) {
        console.warn('❌ Erro na estratégia 2 (filtrar de hoje):', error);
      }
    }

    // Estratégia 3: Buscar partidas de ontem que podem ainda estar rolando
    if (liveMatches.length === 0) {
      try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const yesterdayUrl = new URL(`${FOOTYSTATS_BASE_URL}/todays-matches`);
        yesterdayUrl.searchParams.append('key', FOOTYSTATS_API_KEY);
        yesterdayUrl.searchParams.append('date', yesterdayStr);

        console.log(`🔍 Estratégia 3 - Buscando partidas de ontem: ${yesterdayUrl.toString()}`);

        const yesterdayResponse = await fetch(yesterdayUrl.toString(), {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'OddGeniusFootyStats/1.0',
          },
        });

        if (yesterdayResponse.ok) {
          const yesterdayData = await yesterdayResponse.json();
          
          if (yesterdayData.success && yesterdayData.data) {
            const lateMatches = yesterdayData.data.filter((match: any) => 
              match.status === 'live' || 
              match.status === 'inprogress' || 
              match.status === 'playing'
            );

            liveMatches.push(...lateMatches);
            console.log(`🔴 Estratégia 3: ${lateMatches.length} partidas tardias encontradas`);
          }
        }
      } catch (error) {
        console.warn('❌ Erro na estratégia 3 (ontem):', error);
      }
    }

    // Transformar dados para formato esperado
    const transformedMatches = liveMatches.map((match: any) => ({
      id: match.id,
      home_name: match.home_name,
      away_name: match.away_name,
      homeGoalCount: match.homeGoalCount || 0,
      awayGoalCount: match.awayGoalCount || 0,
      status: match.status,
      date_unix: match.date_unix,
      competition_name: match.competition_name,
      country: match.country,
      home_image: match.home_image,
      away_image: match.away_image,
      team_a_possession: match.team_a_possession || 0,
      team_b_possession: match.team_b_possession || 0,
      minute: match.minute || 0,
      stadium: match.stadium || 'Estádio não informado',
      referee: match.referee || 'Árbitro não informado'
    }));

    // Cache result
    cache.set(cacheKey, { data: transformedMatches, timestamp: Date.now() });

    console.log(`🔴 TOTAL FINAL DE PARTIDAS AO VIVO: ${transformedMatches.length}`);

    return NextResponse.json({
      success: true,
      data: transformedMatches,
      count: transformedMatches.length,
      source: 'footystats-api',
      strategies_used: ['direct_live', 'filter_today', 'yesterday_late'],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro no endpoint de partidas ao vivo:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erro ao buscar partidas ao vivo',
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [],
      count: 0,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
