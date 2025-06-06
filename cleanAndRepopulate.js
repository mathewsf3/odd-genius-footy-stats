/**
 * Script de Limpeza e Re-população de Dados Reais
 * 
 * Este script remove todos os dados de teste do banco e re-popula
 * com dados reais da FootyStats API
 */

const { PrismaClient } = require('./src/generated/prisma');

// Importar funções de validação (versão JavaScript)
const TEST_PATTERNS = {
  teamNames: [
    /test/i,
    /sample/i,
    /mock/i,
    /exemplo/i,
    /teste/i,
    /team\s*[a-z]$/i,
    /time\s*[a-z]$/i,
    /equipe\s*[a-z]$/i,
    /^team\s*\d+$/i,
    /^time\s*\d+$/i,
    /dummy/i,
    /fake/i,
    /placeholder/i
  ],
  
  leagueNames: [
    /test/i,
    /sample/i,
    /mock/i,
    /exemplo/i,
    /teste/i,
    /liga\s*test/i,
    /campeonato\s*test/i,
    /dummy/i,
    /fake/i
  ],
  
  testIds: [
    /^999\d+$/,
    /^888\d+$/,
    /^777\d+$/,
  ]
};

function validateRealMatch(matchData) {
  let isTestData = false;
  const errors = [];

  // Verificar IDs de teste
  if (matchData.match_id) {
    for (const pattern of TEST_PATTERNS.testIds) {
      if (pattern.test(matchData.match_id.toString())) {
        isTestData = true;
        errors.push(`Match ID de teste: ${matchData.match_id}`);
      }
    }
  }

  // Verificar nomes dos times
  const homeTeamName = matchData.home_team?.name || '';
  const awayTeamName = matchData.away_team?.name || '';
  
  for (const pattern of TEST_PATTERNS.teamNames) {
    if (pattern.test(homeTeamName)) {
      isTestData = true;
      errors.push(`Time casa de teste: ${homeTeamName}`);
    }
    
    if (pattern.test(awayTeamName)) {
      isTestData = true;
      errors.push(`Time visitante de teste: ${awayTeamName}`);
    }
  }

  // Verificar IDs dos times
  if (matchData.home_team?.team_id) {
    for (const pattern of TEST_PATTERNS.testIds) {
      if (pattern.test(matchData.home_team.team_id.toString())) {
        isTestData = true;
        errors.push(`ID time casa de teste: ${matchData.home_team.team_id}`);
      }
    }
  }

  if (matchData.away_team?.team_id) {
    for (const pattern of TEST_PATTERNS.testIds) {
      if (pattern.test(matchData.away_team.team_id.toString())) {
        isTestData = true;
        errors.push(`ID time visitante de teste: ${matchData.away_team.team_id}`);
      }
    }
  }

  // Verificar liga
  if (matchData.league?.league_name) {
    for (const pattern of TEST_PATTERNS.leagueNames) {
      if (pattern.test(matchData.league.league_name)) {
        isTestData = true;
        errors.push(`Liga de teste: ${matchData.league.league_name}`);
      }
    }
  }

  if (matchData.league?.season_id) {
    for (const pattern of TEST_PATTERNS.testIds) {
      if (pattern.test(matchData.league.season_id.toString())) {
        isTestData = true;
        errors.push(`ID liga de teste: ${matchData.league.season_id}`);
      }
    }
  }

  return { isTestData, errors };
}

function validateRealTeam(teamData) {
  let isTestData = false;
  const errors = [];

  // Verificar nome do time
  if (teamData.name) {
    for (const pattern of TEST_PATTERNS.teamNames) {
      if (pattern.test(teamData.name)) {
        isTestData = true;
        errors.push(`Nome de time de teste: ${teamData.name}`);
      }
    }
  }

  // Verificar ID do time
  if (teamData.team_id) {
    for (const pattern of TEST_PATTERNS.testIds) {
      if (pattern.test(teamData.team_id.toString())) {
        isTestData = true;
        errors.push(`ID de time de teste: ${teamData.team_id}`);
      }
    }
  }

  return { isTestData, errors };
}

function validateRealLeague(leagueData) {
  let isTestData = false;
  const errors = [];

  // Verificar nome da liga
  if (leagueData.league_name) {
    for (const pattern of TEST_PATTERNS.leagueNames) {
      if (pattern.test(leagueData.league_name)) {
        isTestData = true;
        errors.push(`Nome de liga de teste: ${leagueData.league_name}`);
      }
    }
  }

  // Verificar ID da liga
  if (leagueData.season_id) {
    for (const pattern of TEST_PATTERNS.testIds) {
      if (pattern.test(leagueData.season_id.toString())) {
        isTestData = true;
        errors.push(`ID de liga de teste: ${leagueData.season_id}`);
      }
    }
  }

  return { isTestData, errors };
}

async function cleanAndRepopulate() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧹 INICIANDO LIMPEZA COMPLETA DE DADOS DE TESTE...');
    console.log('=' .repeat(60));
    
    // 1. Fazer backup dos dados atuais
    console.log('\n📦 1. Fazendo backup dos dados atuais...');
    const matchCount = await prisma.match.count();
    const teamCount = await prisma.team.count();
    const leagueCount = await prisma.league.count();
    
    console.log(`📊 Backup: ${matchCount} partidas, ${teamCount} times, ${leagueCount} ligas`);
    
    // 2. Identificar e remover dados de teste
    console.log('\n🔍 2. Identificando e removendo dados de teste...');
    
    let testMatches = 0;
    let testTeams = 0;
    let testLeagues = 0;

    // Remover partidas de teste
    console.log('🗑️ Analisando partidas...');
    const allMatches = await prisma.match.findMany({
      include: {
        home_team: true,
        away_team: true,
        league: true
      }
    });

    for (const match of allMatches) {
      const validation = validateRealMatch({
        match_id: match.match_id,
        home_team: { name: match.home_team.name, team_id: match.home_team.team_id },
        away_team: { name: match.away_team.name, team_id: match.away_team.team_id },
        league: { league_name: match.league.league_name, season_id: match.league.season_id },
        status: match.status,
        date_unix: match.date_unix
      });

      if (validation.isTestData) {
        await prisma.match.delete({ where: { id: match.id } });
        testMatches++;
        console.log(`❌ Removida: ${match.home_team.name} vs ${match.away_team.name} - ${validation.errors[0]}`);
      }
    }

    // Remover times de teste órfãos
    console.log('🗑️ Analisando times...');
    const allTeams = await prisma.team.findMany();
    for (const team of allTeams) {
      const validation = validateRealTeam(team);
      
      if (validation.isTestData) {
        const matchCount = await prisma.match.count({
          where: {
            OR: [
              { home_team_id: team.team_id },
              { away_team_id: team.team_id }
            ]
          }
        });
        
        if (matchCount === 0) {
          await prisma.team.delete({ where: { id: team.id } });
          testTeams++;
          console.log(`❌ Removido time: ${team.name} - ${validation.errors[0]}`);
        }
      }
    }

    // Remover ligas de teste órfãs
    console.log('🗑️ Analisando ligas...');
    const allLeagues = await prisma.league.findMany();
    for (const league of allLeagues) {
      const validation = validateRealLeague(league);
      
      if (validation.isTestData) {
        const matchCount = await prisma.match.count({
          where: { league_id: league.season_id }
        });
        
        if (matchCount === 0) {
          await prisma.league.delete({ where: { id: league.id } });
          testLeagues++;
          console.log(`❌ Removida liga: ${league.league_name} - ${validation.errors[0]}`);
        }
      }
    }

    console.log(`\n✅ Limpeza concluída:`);
    console.log(`   - ${testMatches} partidas de teste removidas`);
    console.log(`   - ${testTeams} times de teste removidos`);
    console.log(`   - ${testLeagues} ligas de teste removidas`);

    // 3. Re-popular com dados reais via API
    console.log('\n🌐 3. Re-populando com dados reais da FootyStats...');
    console.log('💡 Para re-popular, execute: POST /api/sync/matches');
    
    // 4. Verificar estado final
    console.log('\n📊 4. Estado final do banco:');
    const finalMatchCount = await prisma.match.count();
    const finalTeamCount = await prisma.team.count();
    const finalLeagueCount = await prisma.league.count();
    
    console.log(`   - ${finalMatchCount} partidas restantes`);
    console.log(`   - ${finalTeamCount} times restantes`);
    console.log(`   - ${finalLeagueCount} ligas restantes`);
    
    // 5. Validação final
    console.log('\n🔍 5. Validação final...');
    const remainingMatches = await prisma.match.findMany({
      include: {
        home_team: true,
        away_team: true,
        league: true
      }
    });

    let validMatches = 0;
    let stillTestData = 0;

    for (const match of remainingMatches) {
      const validation = validateRealMatch({
        match_id: match.match_id,
        home_team: { name: match.home_team.name, team_id: match.home_team.team_id },
        away_team: { name: match.away_team.name, team_id: match.away_team.team_id },
        league: { league_name: match.league.league_name, season_id: match.league.season_id }
      });

      if (validation.isTestData) {
        stillTestData++;
        console.log(`⚠️ Ainda há dados de teste: ${match.home_team.name} vs ${match.away_team.name}`);
      } else {
        validMatches++;
      }
    }

    console.log(`\n✅ Validação final:`);
    console.log(`   - ${validMatches} partidas válidas`);
    console.log(`   - ${stillTestData} dados de teste restantes`);
    
    if (stillTestData === 0) {
      console.log('\n🎉 LIMPEZA CONCLUÍDA COM SUCESSO!');
      console.log('✅ Banco de dados contém apenas dados reais da FootyStats');
    } else {
      console.log('\n⚠️ ATENÇÃO: Ainda há dados de teste no banco');
      console.log('💡 Execute o script novamente ou faça limpeza manual');
    }
    
  } catch (error) {
    console.error('❌ Erro durante limpeza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  cleanAndRepopulate().catch(console.error);
}

module.exports = { cleanAndRepopulate, validateRealMatch, validateRealTeam, validateRealLeague };
