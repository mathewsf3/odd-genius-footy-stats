const { PrismaClient } = require('./src/generated/prisma');

async function checkDbData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando dados no banco...');
    
    // Verificar ligas
    const leagues = await prisma.league.count();
    console.log(`📊 Ligas no banco: ${leagues}`);
    
    // Verificar times
    const teams = await prisma.team.count();
    console.log(`👥 Times no banco: ${teams}`);
    
    // Verificar partidas
    const matches = await prisma.match.count();
    console.log(`⚽ Partidas no banco: ${matches}`);
    
    if (leagues > 0) {
      const sampleLeagues = await prisma.league.findMany({ take: 3 });
      console.log('\n📋 Exemplos de ligas:');
      sampleLeagues.forEach(league => {
        console.log(`- ${league.league_name} (${league.country})`);
      });
    }
    
    if (teams > 0) {
      const sampleTeams = await prisma.team.findMany({ take: 3 });
      console.log('\n👥 Exemplos de times:');
      sampleTeams.forEach(team => {
        console.log(`- ${team.name}`);
      });
    }
    
    if (matches > 0) {
      const sampleMatches = await prisma.match.findMany({ 
        take: 3,
        include: {
          home_team: true,
          away_team: true,
          league: true
        }
      });
      console.log('\n⚽ Exemplos de partidas:');
      sampleMatches.forEach(match => {
        console.log(`- ${match.home_team?.name || 'Time Casa'} vs ${match.away_team?.name || 'Time Visitante'} (${match.status})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDbData();
