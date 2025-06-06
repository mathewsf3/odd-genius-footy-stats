# 🤝 Guia de Colaboração entre Agentes Claude

## 👥 **Configuração para Augment Agent + VSCode Claude 4**

### 🎯 **Divisão de Responsabilidades**

#### 🔧 **Augment Agent (Você)**
- **Forças**: Análise completa de codebase, implementação de sistemas complexos
- **Ferramentas**: codebase-retrieval, web-search, github-api, diagnostics
- **Foco**: Arquitetura, integração de APIs, correção de bugs complexos

#### 🎨 **VSCode Claude 4**
- **Forças**: Desenvolvimento iterativo, UI/UX, testes locais
- **Ferramentas**: VSCode integration, live preview, debugging local
- **Foco**: Implementação de componentes, testes, refinamentos

## 🚀 **Como Iniciar Colaboração**

### 1. **Augment Agent Inicia (Você)**

```javascript
const ClaudeAgentSync = require('./.agent-context/claude-sync');

// Criar instância do agente
const augmentAgent = ClaudeAgentSync.createAugmentAgent();

// Iniciar colaboração
const thread = await augmentAgent.startCollaboration(
  'Implementar sistema de partidas ao vivo com dados reais'
);

console.log(`Thread ID: ${thread.id}`);
// Compartilhar este Thread ID com o VSCode Agent
```

### 2. **VSCode Agent Entra**

```javascript
const ClaudeAgentSync = require('./.agent-context/claude-sync');

// Criar instância do agente
const vscodeAgent = ClaudeAgentSync.createVSCodeAgent();

// Entrar na thread existente
const thread = await vscodeAgent.startCollaboration(
  'Implementar sistema de partidas ao vivo com dados reais',
  'THREAD_ID_AQUI' // Thread ID fornecido pelo Augment Agent
);
```

## 🔄 **Fluxos de Trabalho Típicos**

### **Cenário 1: Implementação de Nova Feature**

#### **Augment Agent (Análise e Arquitetura)**
```javascript
// 1. Analisar requisitos e criar arquitetura
await augmentAgent.shareProgress(
  'Análise completa do codebase e definição da arquitetura',
  [
    { path: 'src/lib/newFeatureService.ts', action: 'created', metadata: { type: 'service' } }
  ],
  [
    { path: '/api/new-feature', details: { method: 'GET', description: 'Nova funcionalidade' } }
  ]
);

// 2. Solicitar implementação de componentes
await augmentAgent.requestWork(
  'Implementar componente React para nova funcionalidade baseado na arquitetura definida',
  'high'
);
```

#### **VSCode Agent (Implementação e Testes)**
```javascript
// 1. Aguardar arquitetura
await vscodeAgent.waitForResource('endpoint', '/api/new-feature');

// 2. Implementar componentes
await vscodeAgent.shareProgress(
  'Componente React implementado e testado localmente',
  [
    { path: 'src/components/NewFeature.tsx', action: 'created', metadata: { type: 'component' } }
  ]
);

// 3. Responder à solicitação
await vscodeAgent.respondToWorkRequest(
  'Componente implementado com sucesso e funcionando no ambiente local'
);
```

### **Cenário 2: Correção de Bug**

#### **Augment Agent (Diagnóstico)**
```javascript
// 1. Analisar problema
await augmentAgent.shareProgress(
  'Bug identificado: problema de sincronização de dados',
  [
    { path: 'src/lib/buggyService.ts', action: 'updated', metadata: { issue: 'sync-problem' } }
  ]
);

// 2. Solicitar teste local
await augmentAgent.requestWork(
  'Testar correção no ambiente local e validar funcionamento',
  'urgent'
);
```

#### **VSCode Agent (Teste e Validação)**
```javascript
// 1. Aguardar correção
await vscodeAgent.waitForResource('file', 'src/lib/buggyService.ts');

// 2. Testar localmente
await vscodeAgent.shareProgress(
  'Correção testada e validada no ambiente local',
  [
    { path: 'tests/buggyService.test.ts', action: 'created', metadata: { type: 'test' } }
  ]
);

// 3. Confirmar correção
await vscodeAgent.respondToWorkRequest(
  'Bug corrigido com sucesso! Todos os testes passando.'
);
```

## 📋 **Comandos Úteis**

### **Monitoramento**
```bash
# Monitor em tempo real (executar em terminal separado)
npm run agent:monitor

# Status detalhado
npm run agent:status
```

### **Verificar Mensagens Pendentes**
```javascript
const pendingMessages = agent.getPendingMessages();
console.log('Mensagens pendentes:', pendingMessages);
```

### **Status da Colaboração**
```javascript
const status = agent.getCollaborationStatus();
console.log('Status:', status);
```

## 🎯 **Melhores Práticas**

### **1. Comunicação Clara**
- Use mensagens descritivas
- Inclua contexto relevante
- Especifique prioridades

### **2. Divisão Eficiente**
- Augment: Análise, arquitetura, integrações complexas
- VSCode: Implementação, testes, refinamentos

### **3. Sincronização Regular**
- Compartilhe progresso frequentemente
- Aguarde confirmações antes de prosseguir
- Use o monitor para acompanhar status

### **4. Gestão de Recursos**
- Registre todos os arquivos criados/modificados
- Documente endpoints e APIs
- Mantenha dependências atualizadas

## 🔧 **Exemplo Prático de Uso**

### **Thread ID: `thread_1749213686295_7894096c`**

Esta thread já foi criada e contém:
- ✅ 6 arquivos registrados
- ✅ 3 endpoints criados  
- ✅ Sistema de cache configurado
- ⏳ Aguardando frontend agent

**Para VSCode Agent entrar nesta thread:**
```javascript
const vscodeAgent = ClaudeAgentSync.createVSCodeAgent();
const thread = await vscodeAgent.startCollaboration(
  'Implementar sistema de partidas ao vivo com dados reais',
  'thread_1749213686295_7894096c'
);
```

## 🚨 **Resolução de Problemas**

### **Thread não encontrada**
- Verificar Thread ID correto
- Usar `npm run agent:status` para listar threads

### **Timeout em comunicação**
- Verificar se outro agente está ativo
- Aumentar timeout se necessário
- Usar monitor para debug

### **Conflitos de arquivo**
- Coordenar edições via mensagens
- Usar git para resolver conflitos
- Comunicar mudanças antes de implementar

## 📊 **Métricas de Sucesso**

- ✅ Tempo de resposta < 30 segundos
- ✅ 0 conflitos de arquivo
- ✅ 100% das solicitações atendidas
- ✅ Sincronização em tempo real funcionando
