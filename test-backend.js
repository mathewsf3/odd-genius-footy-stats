#!/usr/bin/env node

/**
 * Script de teste para verificar se o backend está funcionando
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

async function testBackend() {
  console.log('🧪 Testando backend do Odd Genius Footy Stats...\n');

  // Teste 1: Verificar variáveis de ambiente
  console.log('1️⃣ Verificando configuração...');
  
  if (!process.env.FOOTYSTATS_API_KEY) {
    console.error('❌ FOOTYSTATS_API_KEY não configurada');
    return false;
  }
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não configurada');
    return false;
  }
  
  console.log('✅ Variáveis de ambiente OK');
  console.log(`   API Key: ${process.env.FOOTYSTATS_API_KEY.substring(0, 10)}...`);
  console.log(`   Database: ${process.env.DATABASE_URL}\n`);

  // Teste 2: Verificar se arquivo do banco existe
  console.log('2️⃣ Verificando banco de dados...');

  try {
    const fs = require('fs');
    const dbPaths = ['./dev.db', './prisma/dev.db'];
    let dbExists = false;

    for (const dbPath of dbPaths) {
      if (fs.existsSync(dbPath)) {
        console.log(`✅ Arquivo do banco existe: ${dbPath}\n`);
        dbExists = true;
        break;
      }
    }

    if (!dbExists) {
      console.log('⚠️ Arquivo do banco não existe');
      console.log('   Execute: npm run db:push\n');
    }
  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error.message, '\n');
  }

  // Teste 3: Verificar se Prisma está configurado
  console.log('3️⃣ Verificando Prisma...');

  try {
    const fs = require('fs');
    const prismaPath = './src/generated/prisma';

    if (fs.existsSync(prismaPath)) {
      console.log('✅ Cliente Prisma gerado\n');
    } else {
      console.log('⚠️ Cliente Prisma não gerado');
      console.log('   Execute: npm run db:generate\n');
    }
  } catch (error) {
    console.error('❌ Erro ao verificar Prisma:', error.message, '\n');
  }

  // Teste 4: Testar API FootyStats (uma chamada simples)
  console.log('4️⃣ Testando API FootyStats...');
  
  try {
    const url = `${process.env.FOOTYSTATS_BASE_URL}/league-list?key=${process.env.FOOTYSTATS_API_KEY}&chosen_leagues_only=true`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'OddGeniusFootyStats/1.0',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API FootyStats OK');
      console.log(`   Ligas disponíveis: ${data.data?.length || 0}\n`);
    } else {
      console.error(`❌ API FootyStats retornou: ${response.status} ${response.statusText}\n`);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao testar API FootyStats:', error.message, '\n');
    return false;
  }

  // Teste 5: Verificar se servidor Next.js está rodando
  console.log('5️⃣ Verificando servidor Next.js...');
  
  try {
    const response = await fetch('http://localhost:3000/api/sync?action=status');
    
    if (response.ok) {
      console.log('✅ Servidor Next.js OK');
      console.log('   Endpoints da API funcionando\n');
    } else {
      console.log('⚠️ Servidor Next.js não está rodando');
      console.log('   Execute: npm run dev\n');
    }
  } catch (error) {
    console.log('⚠️ Servidor Next.js não está rodando');
    console.log('   Execute: npm run dev\n');
  }

  console.log('🎉 Teste do backend concluído!');
  console.log('\n📋 Próximos passos:');
  console.log('   1. Se não há dados: npm run sync:initial');
  console.log('   2. Iniciar servidor: npm run dev');
  console.log('   3. Acessar admin: http://localhost:3000/admin');
  console.log('   4. Acessar app: http://localhost:3000');
  
  return true;
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testBackend().catch(error => {
    console.error('\n💥 Erro durante teste:', error);
    process.exit(1);
  });
}

module.exports = { testBackend };
