# 🤖 Sistema de Sincronização de Agentes

Sistema avançado de sincronização baseado em Thread IDs e contexto compartilhado para coordenação eficiente entre agentes de desenvolvimento.

## 🏗️ Arquitetura

### Componentes Principais

1. **ThreadManager** - Gerencia threads de trabalho e contexto compartilhado
2. **AgentMiddleware** - Middleware de comunicação entre agentes
3. **BackendAgent** - Agente especializado em desenvolvimento backend
4. **FrontendAgent** - Agente especializado em desenvolvimento frontend
5. **AgentMonitor** - Monitor em tempo real do status dos agentes

### Fluxo de Trabalho

```
1. Agente cria/entra em thread
2. Registra recursos (arquivos, endpoints, dependências)
3. Comunica com outros agentes via mensagens
4. Aguarda recursos necessários de outros agentes
5. Finaliza trabalho e atualiza status
```

## 🚀 Comandos Disponíveis

### Executar Agentes
```bash
# Iniciar agente backend
npm run agent:backend

# Iniciar agente frontend  
npm run agent:frontend

# Monitorar agentes em tempo real
npm run agent:monitor
```

### Gerenciamento
```bash
# Ver status detalhado
npm run agent:status

# Limpar threads antigas
npm run agent:clean
```

## 📋 Estrutura de Thread

```json
{
  "id": "thread_1234567890_abcd1234",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "createdBy": "backend",
  "task": "Implementar sistema de partidas ao vivo",
  "status": "active",
  "agents": {
    "backend": {
      "joined": true,
      "lastSeen": "2024-01-01T12:05:00.000Z"
    },
    "frontend": {
      "joined": true, 
      "lastSeen": "2024-01-01T12:04:30.000Z"
    }
  },
  "sharedContext": {
    "files": {
      "src/api/matches/live/route.ts": {
        "action": "created",
        "agent": "backend",
        "timestamp": "2024-01-01T12:01:00.000Z"
      }
    },
    "endpoints": {
      "/api/matches/live": {
        "method": "GET",
        "description": "Retorna partidas ao vivo",
        "agent": "backend",
        "timestamp": "2024-01-01T12:01:30.000Z"
      }
    },
    "dependencies": {},
    "messages": [
      {
        "timestamp": "2024-01-01T12:02:00.000Z",
        "agent": "backend",
        "action": "message",
        "details": {
          "from": "backend",
          "to": "frontend", 
          "message": "Endpoint /api/matches/live criado!"
        }
      }
    ]
  }
}
```

## 🔄 Tipos de Recursos

### Arquivos
- **created** - Arquivo criado
- **updated** - Arquivo modificado
- **verified** - Arquivo verificado/validado
- **deleted** - Arquivo removido

### Endpoints
- **method** - Método HTTP (GET, POST, etc.)
- **description** - Descrição do endpoint
- **responseFormat** - Formato da resposta
- **features** - Funcionalidades (cache, validation, etc.)

### Dependências
- **installed** - Dependência instalada
- **updated** - Dependência atualizada
- **removed** - Dependência removida

## 💬 Sistema de Mensagens

### Tipos de Mensagem
- **message** - Mensagem direta entre agentes
- **agent-joined** - Agente entrou na thread
- **file-created** - Arquivo criado
- **endpoint-created** - Endpoint criado
- **thread-completed** - Thread finalizada

### Comunicação
```javascript
// Enviar mensagem
middleware.sendMessage(threadId, 'frontend', 'Endpoint criado!');

// Aguardar agente
await middleware.waitForAgent(threadId, 'backend', 30000);

// Aguardar recurso
await middleware.waitForResource(threadId, 'endpoint', '/api/matches/live');
```

## 🎯 Casos de Uso

### 1. Desenvolvimento Coordenado
- Backend cria endpoints
- Frontend aguarda endpoints e implementa componentes
- Sincronização automática via thread compartilhada

### 2. Validação de Dependências
- Verificar se recursos necessários estão disponíveis
- Aguardar criação de dependências por outros agentes
- Validação automática de integridade

### 3. Monitoramento em Tempo Real
- Acompanhar progresso de múltiplos agentes
- Visualizar recursos criados
- Histórico de comunicação

## 🛠️ Configuração

### Variáveis de Ambiente
```bash
AGENT_TYPE=backend|frontend  # Tipo do agente
```

### Estrutura de Diretórios
```
.agent-context/
├── thread-manager.js       # Gerenciador de threads
├── middleware.js          # Middleware de comunicação
├── thread_*.json         # Arquivos de thread
└── README.md            # Esta documentação
```

## 🔍 Monitoramento

O monitor exibe em tempo real:
- Status das threads ativas
- Agentes conectados e última atividade
- Recursos criados (arquivos, endpoints, dependências)
- Histórico de mensagens
- Estatísticas gerais

### Interface do Monitor
```
🤖 MONITOR DE AGENTES

📊 Estatísticas Gerais:
  Total de threads: 3
  Threads ativas: 1
  Threads concluídas: 2

🧵 Thread Ativa: thread_1234567890_abcd1234
📋 Tarefa: Implementar sistema de partidas ao vivo
👤 Criada por: backend
⏰ Criada em: 01/01/2024 12:00:00
📊 Status: 🟢 ACTIVE

🤖 Status dos Agentes:
  backend   : ✅ Ativo (última atividade: 12:05:00)
  frontend  : ✅ Ativo (última atividade: 12:04:30)

📁 Arquivos:
  🆕 src/api/matches/live/route.ts (backend ) - created
  🆕 src/components/LiveMatches.tsx (frontend) - created

🔌 Endpoints:
  ✅ GET  /api/matches/live (backend )
      📝 Retorna partidas ao vivo

💬 Últimas Mensagens:
  12:02:00 💬 backend → frontend: Endpoint /api/matches/live criado!
  12:03:00 💬 frontend → backend: Componente LiveMatches implementado!
```

## 🚨 Troubleshooting

### Thread não encontrada
- Verificar se thread foi criada corretamente
- Usar `npm run agent:status` para ver threads disponíveis

### Timeout aguardando agente
- Verificar se agente alvo está executando
- Aumentar timeout se necessário
- Verificar logs de erro do agente

### Recursos não encontrados
- Verificar se recurso foi registrado corretamente
- Usar monitor para ver recursos disponíveis
- Verificar ortografia do nome do recurso

## 📈 Benefícios

1. **Sincronização Eficiente** - Coordenação automática entre agentes
2. **Contexto Compartilhado** - Estado global acessível por todos
3. **Comunicação Assíncrona** - Mensagens não-bloqueantes
4. **Monitoramento Real-time** - Visibilidade completa do progresso
5. **Recuperação de Falhas** - Threads persistentes em disco
6. **Escalabilidade** - Suporte a múltiplos agentes e threads
