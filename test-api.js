/**
 * Script para testar a FootyStats API diretamente
 */

const API_KEY = '4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756';

async function testAPI() {
  try {
    console.log('🔍 Testando FootyStats API...');
    
    // Teste 1: League List
    console.log('\n1. Testando League List...');
    const leagueUrl = `https://api.football-data-api.com/league-list?key=${API_KEY}&chosen_leagues_only=true`;
    console.log('URL:', leagueUrl);
    
    const leagueResponse = await fetch(leagueUrl);
    console.log('Status:', leagueResponse.status);
    console.log('Headers:', Object.fromEntries(leagueResponse.headers.entries()));
    
    const leagueData = await leagueResponse.json();
    console.log('Tipo de resposta:', typeof leagueData);
    console.log('É array:', Array.isArray(leagueData));
    console.log('Tamanho:', leagueData?.length || 'N/A');
    
    if (Array.isArray(leagueData) && leagueData.length > 0) {
      console.log('Primeira liga:', JSON.stringify(leagueData[0], null, 2));
    } else {
      console.log('Resposta completa:', JSON.stringify(leagueData, null, 2));
    }
    
    // Teste 2: Today's Matches
    console.log('\n2. Testando Today\'s Matches...');
    const today = new Date().toISOString().split('T')[0];
    const matchUrl = `https://api.football-data-api.com/todays-matches?key=${API_KEY}&date=${today}`;
    console.log('URL:', matchUrl);
    
    const matchResponse = await fetch(matchUrl);
    console.log('Status:', matchResponse.status);
    
    const matchData = await matchResponse.json();
    console.log('Tipo de resposta:', typeof matchData);
    console.log('É array:', Array.isArray(matchData));
    console.log('Tamanho:', matchData?.length || 'N/A');
    
    if (Array.isArray(matchData) && matchData.length > 0) {
      console.log('Primeira partida:', JSON.stringify(matchData[0], null, 2));
    } else {
      console.log('Resposta completa (primeiros 500 chars):', JSON.stringify(matchData, null, 2).substring(0, 500));
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testAPI();
