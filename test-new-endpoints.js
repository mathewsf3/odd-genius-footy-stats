/**
 * Script para testar os novos endpoints corrigidos
 */

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(url, description) {
  console.log(`\n🔍 Testando: ${description}`);
  console.log(`📡 URL: ${url}`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Success: ${data.success}`);
    console.log(`📈 Count: ${data.count || 0}`);
    console.log(`🔗 Source: ${data.source || 'N/A'}`);
    
    if (data.data && data.data.length > 0) {
      console.log(`📋 Primeira partida:`, {
        id: data.data[0].id,
        home: data.data[0].home_team?.name,
        away: data.data[0].away_team?.name,
        status: data.data[0].status,
        date: new Date(data.data[0].date_unix * 1000).toLocaleString('pt-BR')
      });
    }
    
    if (data.errors && data.errors.length > 0) {
      console.log(`❌ Erros:`, data.errors);
    }
    
    return data;
    
  } catch (error) {
    console.error(`❌ Erro ao testar ${description}:`, error.message);
    return null;
  }
}

async function testSyncEndpoint() {
  console.log(`\n🔄 Testando sincronização...`);
  
  try {
    // Primeiro verificar status
    const statusResponse = await fetch(`${BASE_URL}/api/sync/matches`);
    const statusData = await statusResponse.json();
    
    console.log(`📊 Status atual:`, {
      totalMatches: statusData.data?.totalMatches,
      liveMatches: statusData.data?.liveMatches,
      upcomingMatches: statusData.data?.upcomingMatches,
      lastSync: statusData.data?.lastSync
    });
    
    // Executar sincronização
    console.log(`\n🔄 Executando sincronização...`);
    const syncResponse = await fetch(`${BASE_URL}/api/sync/matches`, {
      method: 'POST'
    });
    const syncData = await syncResponse.json();
    
    console.log(`✅ Sincronização concluída:`, {
      success: syncData.success,
      syncedMatches: syncData.data?.syncedMatches,
      updatedStatuses: syncData.data?.updatedStatuses,
      cleanedMatches: syncData.data?.cleanedMatches,
      errors: syncData.data?.errors?.length || 0
    });
    
    if (syncData.data?.errors && syncData.data.errors.length > 0) {
      console.log(`❌ Erros na sincronização:`, syncData.data.errors.slice(0, 3));
    }
    
    return syncData;
    
  } catch (error) {
    console.error(`❌ Erro na sincronização:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log('🧪 INICIANDO TESTES DOS NOVOS ENDPOINTS');
  console.log('=' .repeat(50));
  
  // 1. Testar endpoint de partidas ao vivo
  await testEndpoint(
    `${BASE_URL}/api/matches/live`,
    'Partidas ao vivo (novo endpoint)'
  );
  
  // 2. Testar endpoint de próximas partidas
  await testEndpoint(
    `${BASE_URL}/api/matches/upcoming`,
    'Próximas partidas (novo endpoint)'
  );
  
  // 3. Testar sincronização
  await testSyncEndpoint();
  
  // 4. Testar novamente após sincronização
  console.log('\n🔄 TESTANDO APÓS SINCRONIZAÇÃO');
  console.log('=' .repeat(30));
  
  await testEndpoint(
    `${BASE_URL}/api/matches/live`,
    'Partidas ao vivo (após sync)'
  );
  
  await testEndpoint(
    `${BASE_URL}/api/matches/upcoming`,
    'Próximas partidas (após sync)'
  );
  
  // 5. Comparar com endpoints antigos
  console.log('\n📊 COMPARANDO COM ENDPOINTS ANTIGOS');
  console.log('=' .repeat(35));
  
  await testEndpoint(
    `${BASE_URL}/api/db/live-matches`,
    'Endpoint antigo - live matches'
  );
  
  await testEndpoint(
    `${BASE_URL}/api/matches/upcoming`,
    'Endpoint antigo - upcoming matches'
  );
  
  console.log('\n✅ TESTES CONCLUÍDOS!');
}

// Executar testes
runTests().catch(console.error);
