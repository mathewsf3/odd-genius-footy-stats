#!/usr/bin/env node

/**
 * Script para sincronização inicial dos dados do FootyStats
 * 
 * Uso:
 * node scripts/initial-sync.js
 * 
 * Este script irá:
 * 1. Conectar ao banco de dados
 * 2. Sincronizar todas as ligas disponíveis
 * 3. Para cada liga, sincronizar times e partidas
 * 4. Exibir relatório final
 */

const path = require('path');
const { execSync } = require('child_process');

// Carregar variáveis de ambiente
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function runInitialSync() {
  try {
    console.log('🚀 Iniciando sincronização inicial dos dados...\n');
    
    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.FOOTYSTATS_API_KEY) {
      throw new Error('FOOTYSTATS_API_KEY não está configurada no .env.local');
    }
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL não está configurada no .env.local');
    }
    
    console.log('✅ Variáveis de ambiente verificadas');
    console.log(`📡 API Base URL: ${process.env.FOOTYSTATS_BASE_URL}`);
    console.log(`🗄️ Database URL: ${process.env.DATABASE_URL}\n`);
    
    // Importar e executar a sincronização
    const { syncAllData } = require('../src/lib/syncAll.ts');
    
    console.log('⏳ Executando sincronização completa...');
    console.log('⚠️ Este processo pode demorar alguns minutos dependendo do número de ligas...\n');
    
    const startTime = Date.now();
    const result = await syncAllData();
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('\n🎉 Sincronização inicial concluída com sucesso!');
    console.log('📊 Resumo final:');
    console.log(`  ├─ Ligas sincronizadas: ${result.leagues}`);
    console.log(`  ├─ Times sincronizados: ${result.teams}`);
    console.log(`  ├─ Partidas sincronizadas: ${result.matches}`);
    console.log(`  └─ Tempo total: ${duration}s\n`);
    
    console.log('✅ O banco de dados está pronto para uso!');
    console.log('💡 Você pode agora iniciar o servidor Next.js com: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Erro durante a sincronização inicial:');
    console.error(error.message);
    
    if (error.stack) {
      console.error('\n📋 Stack trace:');
      console.error(error.stack);
    }
    
    console.error('\n🔧 Possíveis soluções:');
    console.error('  1. Verifique se a API key do FootyStats está correta');
    console.error('  2. Verifique sua conexão com a internet');
    console.error('  3. Verifique se o banco de dados foi criado corretamente');
    console.error('  4. Execute: npx prisma db push');
    
    process.exit(1);
  }
}

// Verificar se está sendo executado diretamente
if (require.main === module) {
  runInitialSync();
}

module.exports = { runInitialSync };
