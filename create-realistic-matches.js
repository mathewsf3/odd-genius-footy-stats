const { PrismaClient } = require('./src/generated/prisma');

async function createRealisticMatches() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Criando partidas realistas...');
    
    // Times brasileiros realistas
    const teams = [
      { id: 1001, name: 'Flamengo', logo: 'https://logoeps.com/wp-content/uploads/2013/03/flamengo-vector-logo.png' },
      { id: 1002, name: 'Palmeiras', logo: 'https://logoeps.com/wp-content/uploads/2013/03/palmeiras-vector-logo.png' },
      { id: 1003, name: 'São Paulo', logo: 'https://logoeps.com/wp-content/uploads/2013/03/sao-paulo-vector-logo.png' },
      { id: 1004, name: 'Corinthians', logo: 'https://logoeps.com/wp-content/uploads/2013/03/corinthians-vector-logo.png' },
      { id: 1005, name: 'Santos', logo: 'https://logoeps.com/wp-content/uploads/2013/03/santos-vector-logo.png' },
      { id: 1006, name: 'Vasco', logo: 'https://logoeps.com/wp-content/uploads/2013/03/vasco-vector-logo.png' },
      { id: 1007, name: 'Botafogo', logo: 'https://logoeps.com/wp-content/uploads/2013/03/botafogo-vector-logo.png' },
      { id: 1008, name: 'Grêmio', logo: 'https://logoeps.com/wp-content/uploads/2013/03/gremio-vector-logo.png' },
      { id: 1009, name: 'Internacional', logo: 'https://logoeps.com/wp-content/uploads/2013/03/internacional-vector-logo.png' },
      { id: 1010, name: 'Atlético-MG', logo: 'https://logoeps.com/wp-content/uploads/2013/03/atletico-mg-vector-logo.png' }
    ];
    
    // Buscar uma liga existente
    let league = await prisma.league.findFirst();
    
    if (!league) {
      // Criar liga brasileira se não existir
      league = await prisma.league.create({
        data: {
          season_id: 99999,
          league_name: 'Campeonato Brasileiro Série A',
          country: 'Brazil',
          league_logo: 'https://logoeps.com/wp-content/uploads/2013/03/brasileirao-vector-logo.png',
          flag: 'https://flagcdn.com/w320/br.png'
        }
      });
      console.log('✅ Liga brasileira criada');
    }
    
    // Criar times
    for (const teamData of teams) {
      await prisma.team.upsert({
        where: { team_id: teamData.id },
        update: {},
        create: {
          team_id: teamData.id,
          name: teamData.name,
          logo_url: teamData.logo,
          country: 'Brazil'
        }
      });
    }
    console.log('✅ Times criados');
    
    // Criar partidas realistas
    const matches = [
      { home: 1001, away: 1002, homeGoals: 2, awayGoals: 1, homePoss: 58, awayPoss: 42, status: 'live' },
      { home: 1003, away: 1004, homeGoals: 1, awayGoals: 1, homePoss: 52, awayPoss: 48, status: 'live' },
      { home: 1005, away: 1006, homeGoals: 0, awayGoals: 2, homePoss: 45, awayPoss: 55, status: 'live' },
      { home: 1007, away: 1008, homeGoals: 3, awayGoals: 0, homePoss: 65, awayPoss: 35, status: 'live' },
      { home: 1009, away: 1010, homeGoals: 0, awayGoals: 0, homePoss: -1, awayPoss: -1, status: 'upcoming' },
      { home: 1002, away: 1005, homeGoals: 0, awayGoals: 0, homePoss: -1, awayPoss: -1, status: 'upcoming' }
    ];
    
    const now = new Date();
    
    for (let i = 0; i < matches.length; i++) {
      const matchData = matches[i];
      const matchTime = new Date(now.getTime() - (i * 30 * 60 * 1000)); // Espaçar por 30 min

      await prisma.match.create({
        data: {
          match_id: 9000 + i,
          home_team_id: matchData.home,
          away_team_id: matchData.away,
          league_id: league.season_id,
          status: matchData.status,
          date_unix: Math.floor(matchTime.getTime() / 1000),
          homeGoalCount: matchData.homeGoals,
          awayGoalCount: matchData.awayGoals,
          team_a_possession: matchData.homePoss,
          team_b_possession: matchData.awayPoss,
          stadium_name: matchData.status === 'live' ? 'Maracanã' : 'Arena Corinthians',
          stadium_location: 'Rio de Janeiro, RJ',
          odds_ft_1: 2.1 + Math.random() * 0.5,
          odds_ft_X: 3.2 + Math.random() * 0.3,
          odds_ft_2: 2.8 + Math.random() * 0.4,
          btts_potential: 45 + Math.floor(Math.random() * 30),
          o25_potential: 35 + Math.floor(Math.random() * 40),
          avg_potential: 2.1 + Math.random() * 1.5,
          home_ppg: 1.5 + Math.random() * 1.0,
          away_ppg: 1.2 + Math.random() * 1.0
        }
      });
      
      const homeTeam = teams.find(t => t.id === matchData.home);
      const awayTeam = teams.find(t => t.id === matchData.away);
      console.log(`✅ Partida criada: ${homeTeam.name} vs ${awayTeam.name} (${matchData.status})`);
    }
    
    console.log('\n🎉 Partidas realistas criadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRealisticMatches();
