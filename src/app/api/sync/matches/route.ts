import { NextResponse } from 'next/server';
import { MatchSyncService } from '@/lib/matchSyncService';

export async function POST() {
  try {
    console.log('🔄 Iniciando sincronização manual de partidas...');
    
    // 1. Sincronizar partidas de hoje
    const syncResult = await MatchSyncService.syncTodayMatches();
    
    // 2. Atualizar status de partidas
    const updatedStatuses = await MatchSyncService.updateMatchStatuses();
    
    // 3. Limpar partidas antigas (opcional)
    const cleanedMatches = await MatchSyncService.cleanupOldMatches();
    
    return NextResponse.json({
      success: syncResult.success,
      message: 'Sincronização concluída',
      data: {
        syncedMatches: syncResult.synced,
        updatedStatuses,
        cleanedMatches,
        errors: syncResult.errors
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erro na sincronização',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log('📊 Verificando status da sincronização...');
    
    // Verificar última sincronização (baseado na data de atualização mais recente)
    const { prisma } = await import('@/lib/database');
    
    const lastMatch = await prisma.match.findFirst({
      orderBy: {
        updated_at: 'desc'
      },
      select: {
        updated_at: true,
        status: true,
        date_unix: true
      }
    });

    const totalMatches = await prisma.match.count();
    const liveMatches = await prisma.match.count({
      where: {
        status: {
          in: ['live', 'inprogress', 'playing']
        }
      }
    });

    const upcomingMatches = await prisma.match.count({
      where: {
        status: 'incomplete',
        date_unix: {
          gt: Math.floor(Date.now() / 1000)
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        lastSync: lastMatch?.updated_at || null,
        totalMatches,
        liveMatches,
        upcomingMatches,
        lastMatchStatus: lastMatch?.status || null,
        lastMatchDate: lastMatch?.date_unix || null
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erro ao verificar status',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
