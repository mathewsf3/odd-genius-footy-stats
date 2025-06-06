const { PrismaClient } = require('./src/generated/prisma');

async function testSync() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Testando sincronização de ligas...');
    
    // Buscar ligas da API
    const response = await fetch('http://localhost:3000/api/footystats/leagues?chosen_leagues_only=true');
    const leagues = await response.json();
    
    console.log(`📊 Encontradas ${leagues.length} ligas na API`);
    
    if (leagues.length > 0) {
      console.log('Primeira liga:', JSON.stringify(leagues[0], null, 2));
      
      // Tentar sincronizar apenas a primeira liga
      const firstLeague = leagues[0];
      if (firstLeague.season && firstLeague.season.length > 0) {
        const recentSeasons = firstLeague.season.filter(s => s.year >= 2024);
        console.log(`📅 Temporadas recentes (2024+): ${recentSeasons.length}`);
        
        if (recentSeasons.length > 0) {
          const season = recentSeasons[0];
          console.log(`🔄 Sincronizando temporada: ${firstLeague.name} ${season.year} (ID: ${season.id})`);
          
          await prisma.league.upsert({
            where: { season_id: season.id },
            update: {
              league_name: `${firstLeague.name} ${season.year}`,
              country: firstLeague.country,
              is_current: season.year >= 2024,
              updated_at: new Date(),
            },
            create: {
              season_id: season.id,
              league_name: `${firstLeague.name} ${season.year}`,
              country: firstLeague.country,
              is_current: season.year >= 2024,
            },
          });
          
          console.log('✅ Liga sincronizada com sucesso!');
          
          // Agora tentar buscar partidas desta liga
          console.log('🔄 Buscando partidas da liga...');
          const matchesResponse = await fetch(`http://localhost:3000/api/footystats/matches?season_id=${season.id}&page=1&max_per_page=10`);
          const matches = await matchesResponse.json();
          
          console.log(`📊 Encontradas ${matches.length} partidas`);
          if (matches.length > 0) {
            console.log('Primeira partida:', JSON.stringify(matches[0], null, 2));
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSync();
