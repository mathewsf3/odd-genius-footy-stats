const { PrismaClient } = require('@prisma/client');

async function checkMatches() {
  const prisma = new PrismaClient();
  
  try {
    // Verificar partidas ao vivo
    const liveMatches = await prisma.match.findMany({
      where: { status: 'live' }
    });
    
    // Verificar partidas futuras
    const upcomingMatches = await prisma.match.findMany({
      where: {
        utcDate: { gte: new Date() }
      },
      take: 5,
      orderBy: { utcDate: 'asc' }
    });
    
    // Verificar todas as partidas por status
    const allStatuses = await prisma.match.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });
    
    console.log('📊 DIAGNÓSTICO DE PARTIDAS:');
    console.log('==========================');
    console.log(`🔴 Partidas ao vivo: ${liveMatches.length}`);
    console.log(`🔜 Partidas futuras: ${upcomingMatches.length}`);
    console.log('\n📋 Status das partidas:');
    allStatuses.forEach(status => {
      console.log(`  - ${status.status}: ${status._count.status}`);
    });
    
    if (upcomingMatches.length > 0) {
      console.log('\n🎯 Exemplo de partida futura:');
      console.log(JSON.stringify(upcomingMatches[0], null, 2));
    }
    
    // Verificar datas das partidas
    const dateRange = await prisma.match.aggregate({
      _min: { utcDate: true },
      _max: { utcDate: true }
    });
    
    console.log('\n📅 Range de datas:');
    console.log(`  - Mais antiga: ${dateRange._min.utcDate}`);
    console.log(`  - Mais recente: ${dateRange._max.utcDate}`);
    console.log(`  - Data atual: ${new Date()}`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMatches();
