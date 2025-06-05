// Análise dos dados de estádio da API FootyStats
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
        console.log('=== ANÁLISE DOS DADOS DE ESTÁDIO ===\n');
        
        let totalMatches = response.data.length;
        let withStadiumName = 0;
        let withStadiumLocation = 0;
        let withBothFields = 0;
        let emptyStadiumName = 0;
        let emptyStadiumLocation = 0;
        
        console.log('=== PRIMEIRAS 10 PARTIDAS ===');
        for (let i = 0; i < Math.min(10, totalMatches); i++) {
          const match = response.data[i];
          console.log(`${i+1}. ${match.home_name} vs ${match.away_name}`);
          console.log(`   Stadium Name: "${match.stadium_name || 'VAZIO'}"`);
          console.log(`   Stadium Location: "${match.stadium_location || 'VAZIO'}"`);
          console.log(`   Competition: ${match.competition_name || 'N/A'}`);
          console.log('');
        }
        
        // Análise estatística
        response.data.forEach(match => {
          if (match.stadium_name && match.stadium_name.trim() !== '') {
            withStadiumName++;
          } else {
            emptyStadiumName++;
          }
          
          if (match.stadium_location && match.stadium_location.trim() !== '') {
            withStadiumLocation++;
          } else {
            emptyStadiumLocation++;
          }
          
          if (match.stadium_name && match.stadium_name.trim() !== '' && 
              match.stadium_location && match.stadium_location.trim() !== '') {
            withBothFields++;
          }
        });
        
        console.log('=== ESTATÍSTICAS ===');
        console.log(`Total de partidas: ${totalMatches}`);
        console.log(`Com stadium_name: ${withStadiumName} (${(withStadiumName/totalMatches*100).toFixed(1)}%)`);
        console.log(`Com stadium_location: ${withStadiumLocation} (${(withStadiumLocation/totalMatches*100).toFixed(1)}%)`);
        console.log(`Com ambos os campos: ${withBothFields} (${(withBothFields/totalMatches*100).toFixed(1)}%)`);
        console.log(`Sem stadium_name: ${emptyStadiumName} (${(emptyStadiumName/totalMatches*100).toFixed(1)}%)`);
        console.log(`Sem stadium_location: ${emptyStadiumLocation} (${(emptyStadiumLocation/totalMatches*100).toFixed(1)}%)`);
        
        // Exemplos de partidas COM dados de estádio
        console.log('\n=== EXEMPLOS COM DADOS DE ESTÁDIO ===');
        let examplesFound = 0;
        for (let i = 0; i < totalMatches && examplesFound < 5; i++) {
          const match = response.data[i];
          if (match.stadium_name && match.stadium_name.trim() !== '') {
            console.log(`${examplesFound+1}. ${match.home_name} vs ${match.away_name}`);
            console.log(`   Estádio: ${match.stadium_name}`);
            console.log(`   Localização: ${match.stadium_location || 'N/A'}`);
            console.log(`   Liga: ${match.competition_name || 'N/A'}`);
            console.log('');
            examplesFound++;
          }
        }
        
      } else {
        console.log('Nenhuma partida encontrada na resposta');
      }
    } catch (error) {
      console.error('Erro ao processar resposta:', error);
      console.log('Dados recebidos:', data.substring(0, 500));
    }
  });
});

req.on('error', (error) => {
  console.error('Erro na requisição:', error);
});

req.end();
