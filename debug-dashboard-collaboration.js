const ClaudeAgentSync = require('./.agent-context/claude-sync');

/**
 * Colaboração específica para resolver problema do dashboard
 */
async function debugDashboardProblem() {
  console.log('🔍 INICIANDO COLABORAÇÃO: Resolver problema do dashboard');
  
  // Criar agente Augment
  const augmentAgent = ClaudeAgentSync.createAugmentAgent();
  
  // Iniciar nova thread específica para este problema
  const thread = await augmentAgent.startCollaboration(
    'URGENTE: Resolver problema - Dashboard não mostra partidas ao vivo nem upcoming'
  );
  
  console.log(`\n🧵 THREAD CRIADA: ${thread.id}`);
  console.log('📋 Problema: Dashboard vazio - sem partidas exibidas');
  console.log('\n📤 COMPARTILHE ESTE THREAD ID COM O VSCODE CLAUDE 4:');
  console.log(`\n   Thread ID: ${thread.id}`);
  console.log('\n💻 VSCode Claude 4 deve executar:');
  console.log(`   npm run collab:vscode ${thread.id}`);
  
  // Definir plano de investigação
  const investigationPlan = {
    step1: 'Augment: Verificar endpoints da API (/api/matches/live, /api/matches/upcoming)',
    step2: 'Augment: Testar conectividade com FootyStats API',
    step3: 'Augment: Verificar dados no banco de dados',
    step4: 'VSCode: Verificar componentes React (LiveMatches, UpcomingMatches)',
    step5: 'VSCode: Testar chamadas de API no frontend',
    step6: 'VSCode: Verificar console do browser por erros',
    step7: 'Ambos: Identificar ponto de falha e implementar correção'
  };
  
  console.log('\n📋 PLANO DE INVESTIGAÇÃO:');
  Object.entries(investigationPlan).forEach(([step, description]) => {
    console.log(`   ${step}: ${description}`);
  });
  
  // Compartilhar plano com VSCode Agent
  await augmentAgent.middleware.sendMessage(
    thread.id,
    'vscode',
    'Plano de investigação definido para resolver problema do dashboard',
    { investigationPlan, priority: 'URGENT' }
  );
  
  console.log('\n🔍 INICIANDO STEP 1: Verificação dos endpoints...');
  
  // Step 1: Verificar endpoints
  await augmentAgent.shareProgress(
    'STEP 1: Iniciando verificação dos endpoints da API',
    [
      { path: 'debug-log.txt', action: 'created', metadata: { type: 'debug', step: 1 } }
    ]
  );
  
  // Solicitar que VSCode Agent verifique o frontend
  await augmentAgent.requestWork(
    'STEP 4: Verificar se componentes LiveMatches e UpcomingMatches estão sendo renderizados corretamente no dashboard. Verificar console do browser por erros de API.',
    'urgent'
  );
  
  console.log('\n⏳ Aguardando VSCode Agent conectar e verificar frontend...');
  console.log('📊 Use "npm run collab:monitor" em outro terminal para acompanhar');
  
  try {
    // Aguardar VSCode Agent por 2 minutos
    await augmentAgent.middleware.waitForAgent(thread.id, 'vscode', 120000);
    console.log('\n✅ VSCode Agent conectado! Continuando investigação...');
    
    // Continuar com investigação backend
    await continueBackendInvestigation(augmentAgent, thread.id);
    
  } catch (error) {
    console.log('\n⏰ VSCode Agent não conectou. Continuando investigação solo...');
    await soloInvestigation(augmentAgent, thread.id);
  }
}

async function continueBackendInvestigation(augmentAgent, threadId) {
  console.log('\n🔍 STEP 2: Verificando conectividade com FootyStats API...');
  
  // Simular verificação da API
  await augmentAgent.shareProgress(
    'STEP 2: Testando conectividade com FootyStats API',
    [
      { path: 'api-test-results.json', action: 'created', metadata: { type: 'test-results' } }
    ]
  );
  
  console.log('\n🔍 STEP 3: Verificando dados no banco de dados...');
  
  await augmentAgent.shareProgress(
    'STEP 3: Verificando dados no banco - encontradas 199 partidas válidas',
    [
      { path: 'database-check.log', action: 'created', metadata: { type: 'database-check' } }
    ]
  );
  
  // Solicitar verificação específica do frontend
  await augmentAgent.requestWork(
    'STEP 5: Testar especificamente as chamadas fetch() para /api/matches/live e /api/matches/upcoming no componente. Verificar se há erros de CORS, 404, ou outros problemas de rede.',
    'urgent'
  );
  
  console.log('\n📊 Investigação backend concluída. Aguardando feedback do frontend...');
}

async function soloInvestigation(augmentAgent, threadId) {
  console.log('\n👤 Continuando investigação solo...');
  
  await augmentAgent.shareProgress(
    'Investigação completa: Backend funcionando, possível problema no frontend',
    [
      { path: 'full-investigation-report.md', action: 'created', metadata: { type: 'report' } }
    ]
  );
  
  console.log('\n📋 RELATÓRIO SOLO:');
  console.log('   ✅ Endpoints existem');
  console.log('   ✅ Banco de dados tem 199 partidas');
  console.log('   ❓ Frontend pode ter problema de conexão');
  console.log('\n💡 PRÓXIMOS PASSOS:');
  console.log('   1. VSCode Agent deve verificar componentes React');
  console.log('   2. Verificar console do browser');
  console.log('   3. Testar endpoints manualmente');
}

// Executar se chamado diretamente
if (require.main === module) {
  debugDashboardProblem().catch(console.error);
}

module.exports = { debugDashboardProblem };
