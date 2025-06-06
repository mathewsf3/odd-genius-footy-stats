const { PrismaClient } = require('./src/generated/prisma');

async function forceLiveMatches() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando partidas no banco...');
    
    // Buscar partidas reais (não de teste)
    const realMatches = await prisma.match.findMany({
      where: {
        AND: [
          {
            NOT: {
              OR: [
                { home_team: { name: { contains: 'Test' } } },
                { away_team: { name: { contains: 'Test' } } }
              ]
            }
          }
        ]
      },
      include: {
        home_team: true,
        away_team: true,
        league: true
      },
      take: 10
    });
    
    console.log(`📊 Encontradas ${realMatches.length} partidas reais no banco`);
    
    if (realMatches.length > 0) {
      console.log('\n🔄 Forçando algumas partidas para status "live"...');
      
      // Pegar as primeiras 4 partidas e forçar para live
      const matchesToUpdate = realMatches.slice(0, 4);
      
      for (let i = 0; i < matchesToUpdate.length; i++) {
        const match = matchesToUpdate[i];
        const now = new Date();
        const matchTime = new Date(now.getTime() - (i * 30 * 60 * 1000)); // Espaçar por 30 min
        
        await prisma.match.update({
          where: { match_id: match.match_id },
          data: {
            status: 'live',
            date_unix: Math.floor(matchTime.getTime() / 1000),
            homeGoalCount: Math.floor(Math.random() * 3),
            awayGoalCount: Math.floor(Math.random() * 3),
            team_a_possession: 45 + Math.floor(Math.random() * 20),
            team_b_possession: 45 + Math.floor(Math.random() * 20),
          }
        });
        
        console.log(`✅ Partida ${match.home_team?.name} vs ${match.away_team?.name} forçada para LIVE`);
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
      
    } else {
      console.log('❌ Nenhuma partida real encontrada no banco');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

forceLiveMatches();
