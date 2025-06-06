const http = require('http');

async function testUpcomingMatches() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/upcoming-matches',
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
            console.log('✅ Upcoming OK');
            console.log(`📊 ${response.count} partidas upcoming encontradas`);
            
            // Show sample data
            if (response.data && response.data.length > 0) {
              const sample = response.data[0];
              console.log(`📋 Exemplo: ${sample.homeName} vs ${sample.awayName}`);
              console.log(`📅 Data: ${new Date(sample.kickOff).toLocaleString('pt-BR')}`);
              if (sample.expectedGoals && sample.expectedGoals.total) {
                console.log(`⚽ Expected Goals: ${sample.expectedGoals.total}`);
              }
            }
            
            resolve(response);
          } else {
            console.log('❌ Upcoming FAIL');
            console.log(`Status: ${res.statusCode}`);
            console.log(`Response: ${data}`);
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        } catch (error) {
          console.log('❌ Upcoming FAIL - Invalid JSON');
          console.log(`Response: ${data}`);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Upcoming FAIL - Connection Error');
      console.log(`Error: ${error.message}`);
      reject(error);
    });

    req.setTimeout(10000, () => {
      console.log('❌ Upcoming FAIL - Timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Execute test
if (require.main === module) {
  testUpcomingMatches()
    .then(() => {
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}

module.exports = { testUpcomingMatches };
