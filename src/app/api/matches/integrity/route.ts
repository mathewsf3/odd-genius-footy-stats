import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { getTodayRange } from '@/lib/dateUtils';

export async function GET() {
  try {
    console.log('🔍 Verificando integridade dos dados...');

    const todayRange = getTodayRange();
    const now = Math.floor(Date.now() / 1000);

    // Count verified matches (all matches from our database are considered verified)
    const [totalMatches, liveMatches, upcomingMatches, competitions] = await Promise.all([
      // Total matches in the system
      prisma.match.count(),
      
      // Live matches count
      prisma.match.count({
        where: {
          OR: [
            { status: 'live' },
            {
              AND: [
                { date_unix: { lte: now } },
                { date_unix: { gte: now - (2 * 60 * 60) } }, // Started within last 2 hours
                { status: { not: 'complete' } }
              ]
            }
          ]
        }
      }),
      
      // Upcoming matches count
      prisma.match.count({
        where: {
          date_unix: { gt: now }
        }
      }),
      
      // Count distinct competitions
      prisma.match.findMany({
        select: {
          competition_id: true,
          competition_name: true
        },
        distinct: ['competition_id']
      })
    ]);

    // Calculate data quality score based on various factors
    let qualityScore = 100;
    
    // Reduce quality if no live matches during expected hours (15:00-23:00 UTC)
    const currentHour = new Date().getUTCHours();
    if (currentHour >= 15 && currentHour <= 23 && liveMatches === 0) {
      qualityScore -= 10;
    }
    
    // Reduce quality if very few upcoming matches
    if (upcomingMatches < 10) {
      qualityScore -= 20;
    }
    
    // Reduce quality if very few total matches
    if (totalMatches < 100) {
      qualityScore -= 30;
    }

    // Determine API status
    let apiStatus: 'healthy' | 'degraded' | 'down' = 'healthy';
    
    if (qualityScore < 50) {
      apiStatus = 'down';
    } else if (qualityScore < 80) {
      apiStatus = 'degraded';
    }

    const integrityStats = {
      verifiedMatches: totalMatches,
      totalMatches: totalMatches,
      lastSync: new Date(),
      apiStatus,
      competitions: competitions.length,
      coverage: competitions.length > 10 ? 'Europa + Brasil + Mundo' : 'Europa + Brasil',
      dataQuality: Math.max(0, qualityScore),
      liveMatches,
      upcomingMatches,
      details: {
        totalInDatabase: totalMatches,
        currentlyLive: liveMatches,
        scheduledUpcoming: upcomingMatches,
        activeCompetitions: competitions.length,
        lastUpdateTime: new Date().toISOString()
      }
    };

    console.log('✅ Estatísticas de integridade calculadas:', {
      total: totalMatches,
      live: liveMatches,
      upcoming: upcomingMatches,
      competitions: competitions.length,
      quality: qualityScore
    });

    return NextResponse.json(integrityStats);

  } catch (error) {
    console.error('❌ Erro ao verificar integridade dos dados:', error);
    
    return NextResponse.json({
      error: 'Falha ao verificar integridade dos dados',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
