// Análise de dados disponíveis para partidas ao vivo vs upcoming
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/matches?date=2025-06-05',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.data && response.data.length > 0) {
        console.log('=== ANÁLISE LIVE VS UPCOMING ===\n');
        
        const liveMatches = response.data.filter(match => 
          match.status === 'inprogress' || match.status === 'live'
        );
        
        const upcomingMatches = response.data.filter(match => 
          match.status === 'notstarted' || match.status === 'upcoming'
        );
        
        const completedMatches = response.data.filter(match => 
          match.status === 'complete' || match.status === 'finished'
        );
        
        console.log(`Total de partidas: ${response.data.length}`);
        console.log(`Partidas ao vivo: ${liveMatches.length}`);
        console.log(`Partidas upcoming: ${upcomingMatches.length}`);
        console.log(`Partidas finalizadas: ${completedMatches.length}`);
        
        // Analisar dados de posse para partidas ao vivo
        console.log('\n=== DADOS DE POSSE - PARTIDAS AO VIVO ===');
        if (liveMatches.length > 0) {
          liveMatches.slice(0, 5).forEach((match, i) => {
            console.log(`${i+1}. ${match.home_name} vs ${match.away_name}`);
            console.log(`   Status: ${match.status}`);
            console.log(`   Posse A: ${match.team_a_possession}%`);
            console.log(`   Posse B: ${match.team_b_possession}%`);
            console.log(`   Total XG: ${match.total_xg}`);
            console.log(`   Corners: ${match.totalCornerCount}`);
            console.log(`   Goals: ${match.totalGoalCount}`);
            console.log('');
          });
        } else {
          console.log('Nenhuma partida ao vivo encontrada');
        }
        
        // Analisar dados para partidas upcoming
        console.log('\n=== DADOS DISPONÍVEIS - PARTIDAS UPCOMING ===');
        if (upcomingMatches.length > 0) {
          const firstUpcoming = upcomingMatches[0];
          console.log(`Primeira upcoming: ${firstUpcoming.home_name} vs ${firstUpcoming.away_name}`);
          console.log(`Status: ${firstUpcoming.status}`);
          console.log(`Posse A: ${firstUpcoming.team_a_possession}%`);
          console.log(`Posse B: ${firstUpcoming.team_b_possession}%`);
          
          // Campos interessantes para upcoming
          console.log('\n=== CAMPOS ÚTEIS PARA UPCOMING ===');
          console.log(`Season: ${firstUpcoming.season}`);
          console.log(`Total XG Prematch: ${firstUpcoming.total_xg_prematch}`);
          console.log(`O25 Potential: ${firstUpcoming.o25_potential}%`);
          console.log(`BTTS Potential: ${firstUpcoming.btts_potential}%`);
          console.log(`Corners Potential: ${firstUpcoming.corners_potential}`);
          console.log(`Cards Potential: ${firstUpcoming.cards_potential}`);
          console.log(`Home PPG: ${firstUpcoming.home_ppg}`);
          console.log(`Away PPG: ${firstUpcoming.away_ppg}`);
          console.log(`Avg Potential: ${firstUpcoming.avg_potential}`);
          
          // Verificar odds disponíveis
          console.log('\n=== ODDS DISPONÍVEIS ===');
          console.log(`Odds FT 1: ${firstUpcoming.odds_ft_1}`);
          console.log(`Odds FT X: ${firstUpcoming.odds_ft_x}`);
          console.log(`Odds FT 2: ${firstUpcoming.odds_ft_2}`);
          console.log(`Odds BTTS Yes: ${firstUpcoming.odds_btts_yes}`);
          console.log(`Odds Over 2.5: ${firstUpcoming.odds_ft_over25}`);
          
        } else {
          console.log('Nenhuma partida upcoming encontrada');
        }
        
        // Analisar dados para partidas finalizadas
        console.log('\n=== DADOS DE POSSE - PARTIDAS FINALIZADAS ===');
        if (completedMatches.length > 0) {
          completedMatches.slice(0, 3).forEach((match, i) => {
            console.log(`${i+1}. ${match.home_name} vs ${match.away_name}`);
            console.log(`   Status: ${match.status}`);
            console.log(`   Posse A: ${match.team_a_possession}%`);
            console.log(`   Posse B: ${match.team_b_possession}%`);
            console.log(`   Placar: ${match.homeGoalCount}-${match.awayGoalCount}`);
            console.log('');
          });
        }
        
      } else {
        console.log('Nenhuma partida encontrada na resposta');
      }
    } catch (error) {
      console.error('Erro ao processar resposta:', error);
    }
  });
});

req.on('error', (error) => {
  console.error('Erro na requisição:', error);
});

req.end();
