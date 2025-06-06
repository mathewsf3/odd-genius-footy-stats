const { prisma } = require('./src/lib/database.ts');

async function checkDatabase() {
  try {
    console.log('🔍 Verificando banco de dados...');
    
    // Contar total de partidas
    const totalMatches = await prisma.match.count();
    console.log(`📊 Total de partidas no banco: ${totalMatches}`);
    
    if (totalMatches === 0) {
      console.log('❌ PROBLEMA: Banco de dados vazio!');
      return;
    }
    
    // Verificar partidas por status
    const statusCounts = await prisma.match.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });
    
    console.log('\n📋 Partidas por status:');
    statusCounts.forEach(item => {
      console.log(`   ${item.status}: ${item._count.status} partidas`);
    });
    
    // Verificar partidas de hoje
    const now = Math.floor(Date.now() / 1000);
    const todayStart = now - (24 * 60 * 60); // 24 horas atrás
    const todayEnd = now + (24 * 60 * 60);   // 24 horas à frente
    
    const todayMatches = await prisma.match.count({
      where: {
        date_unix: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });
    
    console.log(`\n📅 Partidas de hoje (±24h): ${todayMatches}`);
    
    // Verificar algumas partidas recentes
    const recentMatches = await prisma.match.findMany({
      take: 3,
      orderBy: {
        date_unix: 'desc'
      },
      include: {
        home_team: true,
        away_team: true
      }
    });
    
    console.log('\n🏆 Últimas 3 partidas:');
    recentMatches.forEach(match => {
      const date = new Date(match.date_unix * 1000);
      console.log(`   ${match.home_team.name} vs ${match.away_team.name}`);
      console.log(`   Status: ${match.status} | Data: ${date.toLocaleString('pt-BR')}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
