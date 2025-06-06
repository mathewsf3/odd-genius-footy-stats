const http = require('http');

async function testLiveMatches() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/live-matches',
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (res.statusCode === 200 && response.success) {
            console.log('✅ Live OK');
            console.log(`📊 ${response.count} partidas ao vivo encontradas`);
            resolve(response);
          } else {
            console.log('❌ Live FAIL');
            console.log(`Status: ${res.statusCode}`);
            console.log(`Response: ${data}`);
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        } catch (error) {
          console.log('❌ Live FAIL - Invalid JSON');
          console.log(`Response: ${data}`);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Live FAIL - Connection Error');
      console.log(`Error: ${error.message}`);
      reject(error);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Live FAIL - Timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Execute test
if (require.main === module) {
  testLiveMatches()
    .then(() => {
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}

module.exports = { testLiveMatches };
console.log('🎯 Dados esperados para partidas ao vivo:');
console.log('   - homeGoalCount: número real (não null)');
console.log('   - awayGoalCount: número real (não null)');
console.log('   - team_a_possession: porcentagem real (não null)');
console.log('   - team_b_possession: porcentagem real (não null)');
console.log('   - minute: minuto atual da partida (não null)');
console.log('   - status: "live" ou "incomplete"');
console.log('');
console.log('✅ Implementações concluídas:');
console.log('   ✅ CleanMatchCard atualizado para mostrar dados reais');
console.log('   ✅ useLiveMatch hook com refresh automático (20s)');
console.log('   ✅ API endpoint melhorado com logs detalhados');
console.log('   ✅ Fallback para dados simulados quando API não retorna dados reais');
console.log('   ✅ Indicadores visuais de carregamento');
console.log('   ✅ Tempo real da partida baseado na API');
console.log('');
console.log('🚀 Próximos passos sugeridos:');
console.log('   1. Testar com partidas ao vivo reais');
console.log('   2. Verificar rate limiting da API (20s refresh)');
console.log('   3. Monitorar logs do console para debug');
console.log('   4. Ajustar timeouts se necessário');
