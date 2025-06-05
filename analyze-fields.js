// Análise de todos os campos disponíveis na API FootyStats
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
        console.log('=== ANÁLISE DE CAMPOS DISPONÍVEIS ===\n');
        
        const totalMatches = response.data.length;
        const fieldStats = {};
        
        // Analisar todos os campos
        response.data.forEach(match => {
          Object.keys(match).forEach(field => {
            if (!fieldStats[field]) {
              fieldStats[field] = {
                total: 0,
                withData: 0,
                examples: []
              };
            }
            fieldStats[field].total++;
            
            if (match[field] !== null && match[field] !== undefined && match[field] !== '') {
              fieldStats[field].withData++;
              if (fieldStats[field].examples.length < 3) {
                fieldStats[field].examples.push(match[field]);
              }
            }
          });
        });
        
        // Campos com 100% de disponibilidade
        console.log('=== CAMPOS COM 100% DE DISPONIBILIDADE ===');
        Object.keys(fieldStats)
          .filter(field => fieldStats[field].withData === totalMatches)
          .sort()
          .forEach(field => {
            const stat = fieldStats[field];
            console.log(`${field}: ${stat.examples.slice(0, 2).join(', ')}`);
          });
        
        // Campos relacionados a liga/competição
        console.log('\n=== CAMPOS DE LIGA/COMPETIÇÃO ===');
        Object.keys(fieldStats)
          .filter(field => field.toLowerCase().includes('league') || 
                          field.toLowerCase().includes('competition') || 
                          field.toLowerCase().includes('country'))
          .sort()
          .forEach(field => {
            const stat = fieldStats[field];
            const percentage = (stat.withData / stat.total * 100).toFixed(1);
            console.log(`${field}: ${percentage}% - Exemplos: ${stat.examples.slice(0, 3).join(', ')}`);
          });
        
        // Campos relacionados a árbitro
        console.log('\n=== CAMPOS DE ÁRBITRO ===');
        Object.keys(fieldStats)
          .filter(field => field.toLowerCase().includes('referee') || 
                          field.toLowerCase().includes('ref'))
          .sort()
          .forEach(field => {
            const stat = fieldStats[field];
            const percentage = (stat.withData / stat.total * 100).toFixed(1);
            console.log(`${field}: ${percentage}% - Exemplos: ${stat.examples.slice(0, 3).join(', ')}`);
          });
        
        // Outros campos interessantes
        console.log('\n=== OUTROS CAMPOS INTERESSANTES ===');
        Object.keys(fieldStats)
          .filter(field => field.toLowerCase().includes('venue') || 
                          field.toLowerCase().includes('location') || 
                          field.toLowerCase().includes('city') ||
                          field.toLowerCase().includes('round') ||
                          field.toLowerCase().includes('season'))
          .sort()
          .forEach(field => {
            const stat = fieldStats[field];
            const percentage = (stat.withData / stat.total * 100).toFixed(1);
            console.log(`${field}: ${percentage}% - Exemplos: ${stat.examples.slice(0, 3).join(', ')}`);
          });
        
        // Primeira partida completa para análise
        console.log('\n=== PRIMEIRA PARTIDA COMPLETA ===');
        const firstMatch = response.data[0];
        Object.keys(firstMatch).sort().forEach(key => {
          console.log(`${key}: ${firstMatch[key]}`);
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
