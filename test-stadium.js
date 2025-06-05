const https = require('https');

const url = 'https://api.football-data-api.com/todays-matches?key=4fd202fbc338fbd450e91761c7b83641606b2a4da37dd1a7d29b4cd1d4de9756&date=2025-06-05';

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.data && response.data.length > 0) {
        const match = response.data[0];
        
        console.log('=== PRIMEIRA PARTIDA ===');
        console.log('Home:', match.home_name);
        console.log('Away:', match.away_name);
        console.log('Stadium Name:', match.stadium_name);
        console.log('Stadium Location:', match.stadium_location);
        console.log('Competition:', match.competition_name);
        console.log('Status:', match.status);
        
        console.log('\n=== CAMPOS STADIUM ===');
        Object.keys(match).filter(key => key.includes('stadium')).forEach(key => {
          console.log(`${key}:`, match[key]);
        });
        
        console.log('\n=== VERIFICANDO MÚLTIPLAS PARTIDAS ===');
        let stadiumCount = 0;
        let totalMatches = Math.min(10, response.data.length);
        
        for (let i = 0; i < totalMatches; i++) {
          const m = response.data[i];
          if (m.stadium_name && m.stadium_name.trim() !== '') {
            stadiumCount++;
            console.log(`${i+1}. ${m.home_name} vs ${m.away_name} - ${m.stadium_name}`);
          }
        }
        
        console.log(`\n=== RESULTADO ===`);
        console.log(`${stadiumCount}/${totalMatches} partidas têm informações de estádio`);
        
      } else {
        console.log('Nenhuma partida encontrada');
      }
    } catch (error) {
      console.error('Erro ao processar resposta:', error);
    }
  });
}).on('error', (error) => {
  console.error('Erro na requisição:', error);
});
