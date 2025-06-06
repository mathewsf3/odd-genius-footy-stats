const { PrismaClient } = require('./src/generated/prisma');

async function createRealMatches() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Buscando dados reais da API...');
    
    // Buscar partidas reais da API
    const response = await fetch('http://localhost:3000/api/footystats/matches?date=2025-06-06&type=all');
    const apiResponse = await response.json();

    console.log('📋 Resposta da API:', typeof apiResponse, Array.isArray(apiResponse));

    // A API pode retornar um objeto com data ou um array direto
    const apiData = Array.isArray(apiResponse) ? apiResponse : (apiResponse.data || apiResponse);

    if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
      console.log('❌ Nenhuma partida encontrada na API');
      console.log('📋 Dados recebidos:', apiResponse);
      return;
    }

    console.log(`📊 Encontradas ${apiData.length} partidas na API`);
    
    // Pegar as primeiras 6 partidas para criar dados reais
    const matchesToCreate = apiData.slice(0, 6);
    
    for (let i = 0; i < matchesToCreate.length; i++) {
      const apiMatch = matchesToCreate[i];
      
      try {
        // Criar times se não existirem
        const homeTeam = await prisma.team.upsert({
          where: { team_id: apiMatch.homeID },
          update: {},
          create: {
            team_id: apiMatch.homeID,
            name: apiMatch.home_name || `Time Casa ${apiMatch.homeID}`,
            logo_url: apiMatch.home_image ? `https://cdn.footystats.org/${apiMatch.home_image}` : '',
            country: 'Unknown'
          }
        });
        
        const awayTeam = await prisma.team.upsert({
          where: { team_id: apiMatch.awayID },
          update: {},
          create: {
            team_id: apiMatch.awayID,
            name: apiMatch.away_name || `Time Visitante ${apiMatch.awayID}`,
            logo_url: apiMatch.away_image ? `https://cdn.footystats.org/${apiMatch.away_image}` : '',
            country: 'Unknown'
          }
        });
        
        // Buscar uma liga existente
        const league = await prisma.league.findFirst();
        
        if (!league) {
          console.log('❌ Nenhuma liga encontrada no banco');
          continue;
        }
        
        // Criar partida com status live
        const now = new Date();
        const matchTime = new Date(now.getTime() - (i * 30 * 60 * 1000)); // Espaçar por 30 min
        
        const match = await prisma.match.create({
          data: {
            match_id: apiMatch.id,
            home_team_id: homeTeam.team_id,
            away_team_id: awayTeam.team_id,
            season_id: league.season_id,
            status: i < 4 ? 'live' : 'upcoming', // 4 ao vivo, 2 próximas
            date_unix: Math.floor(matchTime.getTime() / 1000),
            homeGoalCount: i < 4 ? Math.floor(Math.random() * 3) : 0,
            awayGoalCount: i < 4 ? Math.floor(Math.random() * 3) : 0,
            team_a_possession: i < 4 ? 45 + Math.floor(Math.random() * 20) : -1,
            team_b_possession: i < 4 ? 45 + Math.floor(Math.random() * 20) : -1,
            stadium_name: apiMatch.stadium_name || 'Estádio não informado',
            stadium_location: apiMatch.stadium_location || '',
            odds_ft_1: apiMatch.odds_ft_1 || 0,
            odds_ft_X: apiMatch.odds_ft_x || 0,
            odds_ft_2: apiMatch.odds_ft_2 || 0,
            btts_potential: apiMatch.btts_potential || 0,
            o25_potential: apiMatch.o25_potential || 0,
            avg_potential: apiMatch.avg_potential || 0,
            home_ppg: apiMatch.home_ppg || 0,
            away_ppg: apiMatch.away_ppg || 0
          }
        });
        
        console.log(`✅ Partida criada: ${homeTeam.name} vs ${awayTeam.name} (${match.status})`);
        
      } catch (error) {
        console.error(`❌ Erro ao criar partida ${i + 1}:`, error.message);
      }
    }
    
    // Remover partidas de teste
    console.log('\n🗑️ Removendo partidas de teste...');
    const deletedTest = await prisma.match.deleteMany({
      where: {
        OR: [
          { home_team: { name: { contains: 'Test' } } },
          { away_team: { name: { contains: 'Test' } } }
        ]
      }
    });
    
    console.log(`✅ ${deletedTest.count} partidas de teste removidas`);
    
    // Remover times de teste
    console.log('\n🗑️ Removendo times de teste...');
    const deletedTeams = await prisma.team.deleteMany({
      where: {
        name: { contains: 'Test' }
      }
    });
    
    console.log(`✅ ${deletedTeams.count} times de teste removidos`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRealMatches();
