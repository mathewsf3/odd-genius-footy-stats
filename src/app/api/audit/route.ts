import { NextRequest, NextResponse } from 'next/server';
import { AuditSystem } from '@/lib/auditSystem';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'stats';
    
    switch (action) {
      case 'full':
        // Executar auditoria completa
        const auditResult = await AuditSystem.performFullAudit();
        
        return NextResponse.json({
          success: true,
          message: 'Auditoria completa executada',
          data: auditResult,
          timestamp: new Date().toISOString()
        });
        
      case 'stats':
        // Obter estatísticas de auditoria
        const stats = await AuditSystem.getAuditStats();
        
        return NextResponse.json({
          success: true,
          message: 'Estatísticas de auditoria',
          data: stats,
          timestamp: new Date().toISOString()
        });
        
      default:
        return NextResponse.json({
          success: false,
          message: 'Ação inválida. Use: full, stats'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Erro na auditoria:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erro na auditoria',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'verify';
    
    const body = await request.json();
    
    switch (action) {
      case 'verify':
        // Marcar entidade como verificada
        const { entityType, entityId, source } = body;
        
        if (!entityType || !entityId) {
          return NextResponse.json({
            success: false,
            message: 'entityType e entityId são obrigatórios'
          }, { status: 400 });
        }
        
        await AuditSystem.markAsVerified(entityType, entityId, source);
        
        return NextResponse.json({
          success: true,
          message: `${entityType} ${entityId} marcado como verificado`,
          timestamp: new Date().toISOString()
        });
        
      case 'cleanup':
        // Limpar logs antigos
        const { daysToKeep } = body;
        const cleanedLogs = await AuditSystem.cleanupOldAuditLogs(daysToKeep || 30);
        
        return NextResponse.json({
          success: true,
          message: 'Limpeza de logs concluída',
          data: { cleanedLogs },
          timestamp: new Date().toISOString()
        });
        
      default:
        return NextResponse.json({
          success: false,
          message: 'Ação inválida. Use: verify, cleanup'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Erro na operação de auditoria:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erro na operação de auditoria',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
