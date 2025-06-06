/**
 * API para Sincronização de Dados Reais da FootyStats
 * Endpoint para popular o banco com dados completos e atualizados
 */

import { NextRequest, NextResponse } from 'next/server';
import { dataSynchronizer, syncData } from '@/lib/dataSync';
import { cache } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'quick';
    const forceRefresh = searchParams.get('force') === 'true';
    
    console.log(`🚀 Iniciando sincronização: ${action}`);
    
    // Limpar cache se forçado
    if (forceRefresh) {
      cache.clear();
      console.log('🗑️ Cache limpo por solicitação');
    }
    
    let result;
    
    switch (action) {
      case 'quick':
        result = await syncData.quick();
        break;
        
      case 'full':
        result = await syncData.full();
        break;
        
      case 'today':
        result = await syncData.today();
        break;
        
      case 'custom':
        const maxPages = parseInt(searchParams.get('maxPages') || '10');
        const includeHistorical = searchParams.get('historical') === 'true';
        
        result = await dataSynchronizer.syncAll({
          maxPages,
          includeHistorical,
          forceRefresh
        });
        break;
        
      default:
        return NextResponse.json({
          success: false,
          message: 'Ação inválida. Use: quick, full, today, ou custom'
        }, { status: 400 });
    }
    
    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: result.data,
      errors: result.errors,
      duration: result.duration,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erro interno na sincronização',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, options = {} } = body;
    
    console.log(`🚀 Sincronização POST: ${action}`, options);
    
    let result;
    
    switch (action) {
      case 'leagues':
        // Sincronizar apenas ligas
        result = await dataSynchronizer.syncAll({ maxPages: 1 });
        break;
        
      case 'teams':
        // Sincronizar apenas times
        result = await dataSynchronizer.syncAll({ maxPages: 5 });
        break;
        
      case 'matches':
        // Sincronizar apenas partidas
        result = await dataSynchronizer.syncAll({ 
          maxPages: 1,
          includeHistorical: options.includeHistorical || false
        });
        break;
        
      case 'all':
        // Sincronização completa
        result = await dataSynchronizer.syncAll(options);
        break;
        
      default:
        return NextResponse.json({
          success: false,
          message: 'Ação inválida para POST'
        }, { status: 400 });
    }
    
    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: result.data,
      errors: result.errors,
      duration: result.duration,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erro na sincronização POST:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erro interno na sincronização POST',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Endpoint para status da sincronização
export async function HEAD(request: NextRequest) {
  try {
    const stats = cache.getStats();
    
    return new NextResponse(null, {
      status: 200,
      headers: {
        'X-Cache-Total': stats.total.toString(),
        'X-Cache-Valid': stats.valid.toString(),
        'X-Cache-Expired': stats.expired.toString(),
        'X-Cache-Hit-Rate': (stats.hitRate * 100).toFixed(2),
        'X-Sync-Status': 'ready'
      }
    });
    
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}
