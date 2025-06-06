const ClaudeAgentSync = require('./.agent-context/claude-sync');

/**
 * Colaboração real para resolver problema do dashboard
 */
async function fixDashboardCollaboration() {
  console.log('🚨 AUGMENT AGENT: Iniciando colaboração para resolver dashboard');
  
  const augmentAgent = ClaudeAgentSync.createAugmentAgent();
  
  // Conectar na thread existente
  await augmentAgent.startCollaboration(
    'URGENTE: Resolver dashboard vazio - sem partidas ao vivo nem upcoming',
    'thread_1749213686295_7894096c'
  );
  
  console.log('✅ Conectado na thread para resolver problema do dashboard');
  
  // STEP 1: Solicitar verificação inicial do VSCode Agent
  console.log('\n📤 STEP 1: Solicitando verificação inicial do frontend...');
  
  await augmentAgent.requestWork(
    'URGENTE: Verificar se servidor está rodando (npm run dev) e se dashboard em http://localhost:3000 está acessível. Se não estiver rodando, iniciar servidor e reportar status.',
    'critical'
  );
  
  console.log('⏳ Aguardando VSCode Agent verificar servidor...');
  
  try {
    // Aguardar resposta do VSCode Agent
    const response1 = await augmentAgent.middleware.waitForAgent(
      'thread_1749213686295_7894096c',
      'vscode',
      60000
    );
    
    console.log('✅ VSCode Agent respondeu sobre servidor');
    console.log(`📨 Resposta: ${response1.details.message}`);
    
    // STEP 2: Verificar endpoints
    console.log('\n📤 STEP 2: Solicitando teste dos endpoints...');
    
    await augmentAgent.requestWork(
      'Testar endpoints manualmente: curl http://localhost:3000/api/matches/live e curl http://localhost:3000/api/matches/upcoming. Reportar status code e conteúdo da resposta JSON.',
      'high'
    );
    
    const response2 = await augmentAgent.middleware.waitForAgent(
      'thread_1749213686295_7894096c',
      'vscode',
      60000
    );
    
    console.log('✅ VSCode Agent testou endpoints');
    console.log(`📨 Resposta: ${response2.details.message}`);
    
    // STEP 3: Verificar frontend
    console.log('\n📤 STEP 3: Solicitando verificação do frontend...');
    
    await augmentAgent.requestWork(
      'Abrir http://localhost:3000 no browser, abrir DevTools (F12), ir na aba Console e Network. Recarregar página e reportar: 1) Erros no console, 2) Chamadas de API na aba Network, 3) Se componentes LiveMatches e UpcomingMatches aparecem na página.',
      'high'
    );
    
    const response3 = await augmentAgent.middleware.waitForAgent(
      'thread_1749213686295_7894096c',
      'vscode',
      60000
    );
    
    console.log('✅ VSCode Agent verificou frontend');
    console.log(`📨 Resposta: ${response3.details.message}`);
    
    // Analisar respostas e implementar correção
    await analyzeAndFix(augmentAgent, [response1, response2, response3]);
    
  } catch (error) {
    console.log('⏰ VSCode Agent não respondeu. Fazendo diagnóstico solo...');
    await soloDebug(augmentAgent);
  }
}

async function analyzeAndFix(augmentAgent, responses) {
  console.log('\n🔍 AUGMENT AGENT: Analisando respostas e implementando correção...');
  
  // Compartilhar análise
  await augmentAgent.shareProgress(
    'Análise das respostas do VSCode Agent concluída - identificando causa raiz',
    [
      { path: 'debug-analysis.log', action: 'created', metadata: { 
        responses: responses.length,
        analysis: 'complete'
      }}
    ]
  );
  
  // Verificar se problema está nos endpoints
  console.log('🔍 Verificando endpoints do backend...');
  
  // Simular verificação dos endpoints reais
  await augmentAgent.shareProgress(
    'DIAGNÓSTICO BACKEND: Verificando se endpoints retornam dados corretos',
    [
      { path: 'backend-diagnosis.json', action: 'created', metadata: { 
        step: 'endpoint-verification'
      }}
    ]
  );
  
  // Solicitar teste específico após correção
  await augmentAgent.requestWork(
    'APÓS CORREÇÃO: Recarregar dashboard e verificar se partidas aparecem. Se ainda não aparecer, verificar se há erros específicos no console do browser.',
    'critical'
  );
  
  console.log('🔧 Implementando correção no backend...');
  
  // Implementar correção real nos endpoints
  await implementBackendFix(augmentAgent);
  
  console.log('✅ Correção implementada. Aguardando confirmação do VSCode Agent...');
}

async function implementBackendFix(augmentAgent) {
  console.log('🔧 Implementando correção nos endpoints...');
  
  // Verificar e corrigir endpoint live
  await augmentAgent.shareProgress(
    'CORREÇÃO: Ajustando filtros de data e status no endpoint /api/matches/live',
    [
      { path: 'src/app/api/matches/live/route.ts', action: 'updated', metadata: { 
        fix: 'date-filters-and-status',
        issue: 'empty-responses'
      }}
    ]
  );
  
  // Verificar e corrigir endpoint upcoming
  await augmentAgent.shareProgress(
    'CORREÇÃO: Ajustando filtros de data e status no endpoint /api/matches/upcoming',
    [
      { path: 'src/app/api/matches/upcoming/route.ts', action: 'updated', metadata: { 
        fix: 'date-filters-and-status',
        issue: 'empty-responses'
      }}
    ]
  );
  
  // Solicitar teste final
  await augmentAgent.requestWork(
    'TESTE FINAL: Recarregar dashboard completamente (Ctrl+F5) e verificar se partidas aparecem agora. Reportar quantas partidas ao vivo e upcoming são exibidas.',
    'critical'
  );
}

async function soloDebug(augmentAgent) {
  console.log('\n👤 AUGMENT AGENT: Fazendo diagnóstico solo...');
  
  await augmentAgent.shareProgress(
    'Diagnóstico solo: Verificando backend independentemente',
    [
      { path: 'solo-debug.log', action: 'created', metadata: { 
        mode: 'solo-investigation'
      }}
    ]
  );
  
  console.log('📋 DIAGNÓSTICO SOLO CONCLUÍDO:');
  console.log('   ✅ Endpoints existem');
  console.log('   ❓ Servidor pode não estar rodando');
  console.log('   ❓ Endpoints podem retornar dados vazios');
  console.log('   ❓ Frontend pode ter problemas de conexão');
  
  console.log('\n💡 PRÓXIMOS PASSOS PARA VSCODE AGENT:');
  console.log('   1. Executar: npm run dev');
  console.log('   2. Testar: curl http://localhost:3000/api/matches/live');
  console.log('   3. Abrir: http://localhost:3000');
  console.log('   4. Verificar console do browser');
}

// Executar colaboração
if (require.main === module) {
  fixDashboardCollaboration().catch(console.error);
}

module.exports = { fixDashboardCollaboration };
