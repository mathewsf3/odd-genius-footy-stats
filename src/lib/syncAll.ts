import { syncLeagues, syncLeagueTeams, syncLeagueMatches } from './footyStatsSync';
import { connectDatabase, disconnectDatabase } from './database';

// Função para sincronizar todos os dados
export async function syncAllData() {
  try {
    console.log('🚀 Iniciando sincronização completa dos dados...');
    
    // Conectar ao banco
    await connectDatabase();
    
    // 1. Sincronizar ligas
    console.log('\n📋 Etapa 1: Sincronizando ligas...');
    const leagueCount = await syncLeagues();
    console.log(`✅ ${leagueCount} ligas sincronizadas`);
    
    // 2. Para cada liga, sincronizar times e partidas
    console.log('\n👥 Etapa 2: Sincronizando times e partidas...');
    
    // Buscar ligas do banco
    const { prisma } = await import('./database');
    const leagues = await prisma.league.findMany({
      where: { is_current: true }, // Apenas ligas atuais
    });
    
    let totalTeams = 0;
    let totalMatches = 0;
    
    for (const league of leagues) {
      try {
        console.log(`\n🔄 Processando liga: ${league.league_name} (ID: ${league.season_id})`);
        
        // Sincronizar times da liga
        const teamCount = await syncLeagueTeams(league.season_id);
        totalTeams += teamCount;
        console.log(`  ✅ ${teamCount} times sincronizados`);
        
        // Sincronizar partidas da liga (com paginação)
        let page = 1;
        let matchCount = 0;
        let pageMatches = 0;
        
        do {
          pageMatches = await syncLeagueMatches(league.season_id, page);
          matchCount += pageMatches;
          page++;
          
          // Pequena pausa para não sobrecarregar a API
          if (pageMatches > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } while (pageMatches === 500); // Continua se a página está cheia
        
        totalMatches += matchCount;
        console.log(`  ✅ ${matchCount} partidas sincronizadas`);
        
        // Pausa entre ligas
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Erro ao processar liga ${league.league_name}:`, error);
        // Continua com a próxima liga
      }
    }
    
    console.log('\n🎉 Sincronização completa finalizada!');
    console.log(`📊 Resumo:`);
    console.log(`  - ${leagueCount} ligas sincronizadas`);
    console.log(`  - ${totalTeams} times sincronizados`);
    console.log(`  - ${totalMatches} partidas sincronizadas`);
    
    return {
      leagues: leagueCount,
      teams: totalTeams,
      matches: totalMatches,
    };
    
  } catch (error) {
    console.error('❌ Erro na sincronização completa:', error);
    throw error;
  } finally {
    await disconnectDatabase();
  }
}

// Função para sincronizar apenas dados do dia atual
export async function syncTodayData() {
  try {
    console.log('🔄 Sincronizando dados do dia atual...');
    
    await connectDatabase();
    
    // Buscar partidas de hoje via API FootyStats
    const today = new Date().toISOString().split('T')[0];
    const FOOTYSTATS_API_KEY = process.env.FOOTYSTATS_API_KEY;
    const FOOTYSTATS_BASE_URL = process.env.FOOTYSTATS_BASE_URL || 'https://api.football-data-api.com';
    
    const url = `${FOOTYSTATS_BASE_URL}/todays-matches?key=${FOOTYSTATS_API_KEY}&date=${today}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'OddGeniusFootyStats/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !data.data) {
      console.log('⚠️ Nenhuma partida encontrada para hoje');
      return 0;
    }
    
    const matches = data.data;
    console.log(`📊 Encontradas ${matches.length} partidas para hoje`);
    
    const { prisma } = await import('./database');
    let updatedMatches = 0;
    
    for (const match of matches) {
      try {
        await prisma.match.upsert({
          where: { match_id: match.id },
          update: {
            status: match.status,
            homeGoalCount: match.homeGoalCount || 0,
            awayGoalCount: match.awayGoalCount || 0,
            team_a_possession: match.team_a_possession,
            team_b_possession: match.team_b_possession,
            updated_at: new Date(),
          },
          create: {
            match_id: match.id,
            home_team_id: match.homeID,
            away_team_id: match.awayID,
            league_id: match.season_id || 0, // Fallback se não tiver season_id
            date_unix: match.date_unix,
            status: match.status,
            homeGoalCount: match.homeGoalCount || 0,
            awayGoalCount: match.awayGoalCount || 0,
            stadium_name: match.stadium_name,
            stadium_location: match.stadium_location,
            team_a_possession: match.team_a_possession,
            team_b_possession: match.team_b_possession,
          },
        });
        updatedMatches++;
      } catch (error) {
        console.error(`❌ Erro ao atualizar partida ${match.id}:`, error);
      }
    }
    
    console.log(`✅ ${updatedMatches} partidas de hoje sincronizadas`);
    return updatedMatches;
    
  } catch (error) {
    console.error('❌ Erro ao sincronizar dados de hoje:', error);
    throw error;
  } finally {
    await disconnectDatabase();
  }
}

// Função para verificar status da sincronização
export async function getSyncStatus() {
  try {
    await connectDatabase();
    const { prisma } = await import('./database');
    
    const [leagueCount, teamCount, matchCount] = await Promise.all([
      prisma.league.count(),
      prisma.team.count(),
      prisma.match.count(),
    ]);
    
    const lastMatch = await prisma.match.findFirst({
      orderBy: { updated_at: 'desc' },
      select: { updated_at: true },
    });
    
    return {
      leagues: leagueCount,
      teams: teamCount,
      matches: matchCount,
      lastUpdate: lastMatch?.updated_at,
    };
    
  } catch (error) {
    console.error('❌ Erro ao verificar status da sincronização:', error);
    throw error;
  } finally {
    await disconnectDatabase();
  }
}
