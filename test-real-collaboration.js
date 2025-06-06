const ClaudeAgentSync = require('./.agent-context/claude-sync');

async function testRealCollaboration() {
  console.log('🔧 AUGMENT AGENT: Testando colaboração real...');
  
  const augmentAgent = ClaudeAgentSync.createAugmentAgent();
  
  // Conectar na thread existente
  await augmentAgent.startCollaboration(
    'TESTE: Colaboração automática funcionando',
    'thread_1749213686295_7894096c'
  );
  
  console.log('✅ Conectado na thread');
  
  // Enviar solicitação real
  console.log('📤 Enviando solicitação para VSCode Agent...');
  
  await augmentAgent.requestWork(
    'TESTE URGENTE: Verificar se o servidor está rodando na porta 3000 e se o dashboard em http://localhost:3000 está acessível. Reportar status detalhado.',
    'urgent'
  );
  
  console.log('⏳ Aguardando resposta automática do VSCode Agent...');
  
  try {
    const response = await augmentAgent.middleware.waitForAgent(
      'thread_1749213686295_7894096c',
      'vscode',
      30000
    );
    
    console.log('✅ VSCode Agent respondeu automaticamente!');
    console.log(`📨 Resposta: ${response.details.message}`);
    
    // Enviar segunda solicitação
    console.log('\n📤 Enviando segunda solicitação...');
    
    await augmentAgent.requestWork(
      'Agora verifique se os componentes LiveMatches e UpcomingMatches estão renderizando dados ou se estão vazios.',
      'high'
    );
    
    const response2 = await augmentAgent.middleware.waitForAgent(
      'thread_1749213686295_7894096c',
      'vscode',
      30000
    );
    
    console.log('✅ Segunda resposta recebida!');
    console.log(`📨 Resposta: ${response2.details.message}`);
    
    console.log('\n🎉 COLABORAÇÃO AUTOMÁTICA FUNCIONANDO PERFEITAMENTE!');
    
  } catch (error) {
    console.log('❌ Timeout ou erro na comunicação:', error.message);
  }
}

testRealCollaboration().catch(console.error);
