// Usar fetch nativo do Node.js (v18+) ou implementar com http
const fetch = globalThis.fetch || require('https').get;

// Teste para verificar dados reais de partidas ao vivo
async function testLiveMatchData() {
  console.log('🔴 Testando dados REAIS de partidas ao vivo...\n');

  try {
    // 1. Buscar partidas de hoje
    console.log('📊 1. Buscando partidas de hoje...');
    const todayResponse = await fetch('http://localhost:3000/api/matches');
    const todayData = await todayResponse.json();
    
    if (!todayData.success) {
      console.error('❌ Erro ao buscar partidas de hoje:', todayData.error);
      return;
    }

    const matches = todayData.data || [];
    console.log(`✅ Encontradas ${matches.length} partidas de hoje\n`);

    if (matches.length === 0) {
      console.log('⚠️ Nenhuma partida encontrada para hoje');
      return;
    }

    // 2. Encontrar partidas ao vivo
    const liveMatches = matches.filter(match => 
      match.status === 'live' || 
      match.status === 'incomplete'
    );

    console.log(`🔴 2. Partidas ao vivo encontradas: ${liveMatches.length}`);
    
    if (liveMatches.length === 0) {
      console.log('⚠️ Nenhuma partida ao vivo no momento');
      
      // Testar com uma partida qualquer para verificar a estrutura da API
      const testMatch = matches[0];
      console.log('\n📋 3. Testando estrutura da API com partida:', testMatch.id);
      await testMatchDetails(testMatch.id);
      return;
    }

    // 3. Testar dados detalhados de partidas ao vivo
    for (let i = 0; i < Math.min(liveMatches.length, 3); i++) {
      const match = liveMatches[i];
      console.log(`\n🔍 3.${i+1}. Testando partida ao vivo: ${match.home_name} vs ${match.away_name}`);
      await testMatchDetails(match.id);
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

async function testMatchDetails(matchId) {
  try {
    console.log(`   📡 Buscando dados detalhados da partida ${matchId}...`);
    
    const response = await fetch(`http://localhost:3000/api/fs/match/${matchId}`);
    const data = await response.json();
    
    if (!data.success) {
      console.error(`   ❌ Erro ao buscar dados da partida ${matchId}:`, data.error);
      return;
    }

    const match = data.data;
    
    console.log('   📊 Dados da partida:');
    console.log(`   🏠 Casa: ${match.home_name}`);
    console.log(`   🏃 Visitante: ${match.away_name}`);
    console.log(`   📈 Status: ${match.status}`);
    
    // Verificar dados de score real
    console.log('\n   ⚽ DADOS DE SCORE REAL:');
    console.log(`   🏠 Gols Casa: ${match.homeGoalCount ?? 'N/A'}`);
    console.log(`   🏃 Gols Visitante: ${match.awayGoalCount ?? 'N/A'}`);
    console.log(`   📊 Total de Gols: ${match.totalGoalCount ?? 'N/A'}`);
    
    // Verificar dados de posse de bola real
    console.log('\n   🎯 DADOS DE POSSE DE BOLA REAL:');
    console.log(`   🏠 Posse Casa: ${match.team_a_possession ?? 'N/A'}%`);
    console.log(`   🏃 Posse Visitante: ${match.team_b_possession ?? 'N/A'}%`);
    
    // Verificar dados de tempo real
    console.log('\n   ⏰ DADOS DE TEMPO REAL:');
    console.log(`   ⏱️ Minuto: ${match.minute ?? 'N/A'}`);
    console.log(`   📅 Data Unix: ${match.date_unix ?? 'N/A'}`);
    
    // Verificar dados adicionais
    console.log('\n   📋 DADOS ADICIONAIS:');
    console.log(`   🟨 Cartões Amarelos Casa: ${match.team_a_yellow_cards ?? 'N/A'}`);
    console.log(`   🟨 Cartões Amarelos Visitante: ${match.team_b_yellow_cards ?? 'N/A'}`);
    console.log(`   🟥 Cartões Vermelhos Casa: ${match.team_a_red_cards ?? 'N/A'}`);
    console.log(`   🟥 Cartões Vermelhos Visitante: ${match.team_b_red_cards ?? 'N/A'}`);
    console.log(`   ⛳ Escanteios Casa: ${match.team_a_corners ?? 'N/A'}`);
    console.log(`   ⛳ Escanteios Visitante: ${match.team_b_corners ?? 'N/A'}`);
    
    // Verificar se os dados são reais ou simulados
    const hasRealScore = match.homeGoalCount !== null && match.homeGoalCount !== undefined;
    const hasRealPossession = match.team_a_possession !== null && match.team_a_possession !== undefined;
    const hasRealMinute = match.minute !== null && match.minute !== undefined;
    
    console.log('\n   ✅ VERIFICAÇÃO DE DADOS REAIS:');
    console.log(`   ⚽ Score Real: ${hasRealScore ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   🎯 Posse Real: ${hasRealPossession ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   ⏰ Tempo Real: ${hasRealMinute ? '✅ SIM' : '❌ NÃO'}`);
    
    if (hasRealScore || hasRealPossession || hasRealMinute) {
      console.log('   🎉 DADOS REAIS DETECTADOS!');
    } else {
      console.log('   ⚠️ Nenhum dado real detectado - pode ser partida não iniciada');
    }
    
    console.log(`   🔄 Última atualização: ${match.lastUpdated ?? 'N/A'}`);
    console.log(`   📡 Fonte: ${match.source ?? 'N/A'}`);
    
  } catch (error) {
    console.error(`   ❌ Erro ao testar partida ${matchId}:`, error.message);
  }
}

// Executar teste
testLiveMatchData();
