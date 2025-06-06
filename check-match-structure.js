const { PrismaClient } = require('./src/generated/prisma');

async function checkMatchStructure() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando estrutura das partidas...');
    
    // Buscar uma partida ao vivo com todas as relações
    const match = await prisma.match.findFirst({
      where: {
        status: {
          in: ['live', 'inprogress', 'playing']
        }
      },
      include: {
        home_team: true,
        away_team: true,
        league: true
      }
    });
    
    if (match) {
      console.log('\n📊 Estrutura da partida:');
      console.log('ID:', match.id);
      console.log('Status:', match.status);
      console.log('home_name (campo direto):', match.home_name);
      console.log('away_name (campo direto):', match.away_name);
      console.log('home_image (campo direto):', match.home_image);
      console.log('away_image (campo direto):', match.away_image);
      
      console.log('\n🏠 Home Team (relação):');
      console.log('home_team:', match.home_team);
      
      console.log('\n✈️ Away Team (relação):');
      console.log('away_team:', match.away_team);
      
      console.log('\n🏆 League (relação):');
      console.log('league:', match.league);
      
      console.log('\n📋 Campos disponíveis na partida:');
      console.log(Object.keys(match));
      
    } else {
      console.log('❌ Nenhuma partida ao vivo encontrada');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMatchStructure();
