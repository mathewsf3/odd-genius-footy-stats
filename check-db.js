const { PrismaClient } = require('./src/generated/prisma');

async function checkDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando estado do banco de dados...');
    
    // Contar total de partidas
    const totalMatches = await prisma.match.count();
    console.log(`📊 Total de partidas no banco: ${totalMatches}`);
    
    // Contar partidas ao vivo
    const liveMatches = await prisma.match.count({
      where: {
        status: {
          in: ['live', 'inprogress', 'playing']
        }
      }
    });
    console.log(`🔴 Partidas ao vivo no banco: ${liveMatches}`);
    
    // Contar partidas de hoje
    const today = new Date();
    const startOfDay = Math.floor(today.setHours(0, 0, 0, 0) / 1000);
    const endOfDay = Math.floor(today.setHours(23, 59, 59, 999) / 1000);
    
    const todayMatches = await prisma.match.count({
      where: {
        date_unix: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });
    console.log(`📅 Partidas de hoje no banco: ${todayMatches}`);
    
    // Verificar últimas partidas
    const recentMatches = await prisma.match.findMany({
      take: 5,
      orderBy: {
        date_unix: 'desc'
      },
      include: {
        home_team: true,
        away_team: true,
        league: true
      }
    });
    
    console.log('\n🕐 Últimas 5 partidas no banco:');
    recentMatches.forEach(match => {
      const date = new Date(match.date_unix * 1000);
      console.log(`- ${match.home_team?.name || 'Time Casa'} vs ${match.away_team?.name || 'Time Visitante'} (${match.status}) - ${date.toLocaleString()}`);
    });
    
    // Verificar ligas
    const totalLeagues = await prisma.league.count();
    console.log(`\n🏆 Total de ligas no banco: ${totalLeagues}`);
    
    // Verificar times
    const totalTeams = await prisma.team.count();
    console.log(`⚽ Total de times no banco: ${totalTeams}`);
    
  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
