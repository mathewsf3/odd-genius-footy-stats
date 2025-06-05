// Verificar informações de competição na API FootyStats
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
        console.log('=== ANÁLISE DE INFORMAÇÕES DE LIGA ===\n');
        
        // Verificar campos relacionados a liga/competição
        const firstMatch = response.data[0];
        console.log('=== PRIMEIRA PARTIDA - CAMPOS DE LIGA ===');
        console.log('competition_id:', firstMatch.competition_id);
        console.log('competition_name:', firstMatch.competition_name);
        console.log('league_name:', firstMatch.league_name);
        console.log('country:', firstMatch.country);
        console.log('season:', firstMatch.season);
        console.log('roundID:', firstMatch.roundID);
        
        // Verificar homeTeam e awayTeam objects
        console.log('\n=== OBJETOS DE TIME ===');
        console.log('homeTeam:', JSON.stringify(firstMatch.homeTeam, null, 2));
        console.log('awayTeam:', JSON.stringify(firstMatch.awayTeam, null, 2));
        
        // Verificar campos 100% disponíveis que podem ser úteis
        console.log('\n=== CAMPOS 100% DISPONÍVEIS ÚTEIS ===');
        console.log('season:', firstMatch.season);
        console.log('roundID:', firstMatch.roundID);
        console.log('game_week:', firstMatch.game_week);
        console.log('total_xg:', firstMatch.total_xg);
        console.log('totalCornerCount:', firstMatch.totalCornerCount);
        console.log('totalGoalCount:', firstMatch.totalGoalCount);
        console.log('team_a_possession:', firstMatch.team_a_possession);
        console.log('team_b_possession:', firstMatch.team_b_possession);
        
        // Verificar se há informações de árbitro
        console.log('\n=== INFORMAÇÕES DE ÁRBITRO ===');
        console.log('refereeID:', firstMatch.refereeID);
        console.log('coach_a_ID:', firstMatch.coach_a_ID);
        console.log('coach_b_ID:', firstMatch.coach_b_ID);
        
        // Estatísticas de diferentes competition_ids
        console.log('\n=== DIFERENTES COMPETITION IDS ===');
        const competitionIds = {};
        response.data.forEach(match => {
          const id = match.competition_id;
          if (!competitionIds[id]) {
            competitionIds[id] = {
              count: 0,
              examples: []
            };
          }
          competitionIds[id].count++;
          if (competitionIds[id].examples.length < 2) {
            competitionIds[id].examples.push({
              home: match.home_name,
              away: match.away_name,
              competition_name: match.competition_name,
              country: match.country,
              league_name: match.league_name
            });
          }
        });
        
        Object.keys(competitionIds).forEach(id => {
          const comp = competitionIds[id];
          console.log(`Competition ID ${id}: ${comp.count} partidas`);
          comp.examples.forEach((ex, i) => {
            console.log(`  ${i+1}. ${ex.home} vs ${ex.away}`);
            console.log(`     competition_name: ${ex.competition_name}`);
            console.log(`     league_name: ${ex.league_name}`);
            console.log(`     country: ${ex.country}`);
          });
          console.log('');
        });
        
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
