const ThreadManager = require('./thread-manager');
const EventEmitter = require('events');

class AgentMiddleware extends EventEmitter {
  constructor() {
    super();
    this.threadManager = new ThreadManager();
    this.agentType = process.env.AGENT_TYPE || 'unknown';
    this.currentThreadId = null;
  }

  // Iniciar trabalho em uma thread
  async startWork(task, threadId = null) {
    let thread;
    
    if (threadId) {
      thread = this.threadManager.loadThread(threadId);
      if (!thread) {
        console.error(`❌ Thread ${threadId} não encontrada`);
        return null;
      }
    } else {
      // Procurar thread ativa ou criar nova
      thread = this.threadManager.getActiveThread();
      if (!thread) {
        threadId = this.threadManager.createThread(this.agentType, task);
        thread = this.threadManager.loadThread(threadId);
      } else {
        threadId = thread.id;
      }
    }

    this.currentThreadId = threadId;
    console.log(`🔄 ${this.agentType} trabalhando na thread: ${thread.id}`);
    console.log(`📋 Tarefa: ${thread.task}`);
    
    // Marcar agente como ativo na thread
    this.threadManager.updateContext(threadId, this.agentType, {
      action: 'agent-joined',
      details: { agentType: this.agentType, task }
    });

    return thread;
  }

  // Enviar mensagem para outro agente
  sendMessage(threadId, targetAgent, message, metadata = {}) {
    const update = {
      action: 'message',
      details: {
        from: this.agentType,
        to: targetAgent,
        message: message,
        metadata: metadata,
        timestamp: new Date().toISOString()
      }
    };

    const success = this.threadManager.updateContext(threadId, this.agentType, update);
    if (success) {
      console.log(`💬 ${this.agentType} → ${targetAgent}: ${message}`);
      this.emit('message-sent', { threadId, targetAgent, message });
    }
    return success;
  }

  // Registrar arquivo criado/modificado
  registerFile(threadId, filePath, action = 'created', metadata = {}) {
    const update = {
      action: `file-${action}`,
      files: {
        [filePath]: {
          action: action,
          agent: this.agentType,
          timestamp: new Date().toISOString(),
          metadata: metadata
        }
      },
      details: { filePath, action, metadata }
    };

    const success = this.threadManager.updateContext(threadId, this.agentType, update);
    if (success) {
      console.log(`📁 ${this.agentType}: ${action} ${filePath}`);
      this.emit('file-registered', { threadId, filePath, action });
    }
    return success;
  }

  // Registrar endpoint criado
  registerEndpoint(threadId, endpoint, details) {
    const update = {
      action: 'endpoint-created',
      endpoints: {
        [endpoint]: {
          ...details,
          agent: this.agentType,
          timestamp: new Date().toISOString()
        }
      },
      details: { endpoint, ...details }
    };

    const success = this.threadManager.updateContext(threadId, this.agentType, update);
    if (success) {
      console.log(`🔌 ${this.agentType}: endpoint ${endpoint} criado`);
      this.emit('endpoint-registered', { threadId, endpoint, details });
    }
    return success;
  }

  // Registrar dependência
  registerDependency(threadId, dependency, version, action = 'installed') {
    const update = {
      action: `dependency-${action}`,
      dependencies: {
        [dependency]: {
          version: version,
          action: action,
          agent: this.agentType,
          timestamp: new Date().toISOString()
        }
      },
      details: { dependency, version, action }
    };

    const success = this.threadManager.updateContext(threadId, this.agentType, update);
    if (success) {
      console.log(`📦 ${this.agentType}: ${action} ${dependency}@${version}`);
      this.emit('dependency-registered', { threadId, dependency, version, action });
    }
    return success;
  }

  // Aguardar por outro agente
  async waitForAgent(threadId, targetAgent, timeout = 30000) {
    const startTime = Date.now();
    console.log(`⏳ ${this.agentType}: Aguardando ${targetAgent}...`);
    
    while (Date.now() - startTime < timeout) {
      const thread = this.threadManager.loadThread(threadId);
      
      if (thread && thread.agents[targetAgent] && thread.agents[targetAgent].joined) {
        const lastMessage = thread.sharedContext.messages
          .filter(m => m.agent === targetAgent)
          .pop();
          
        if (lastMessage) {
          console.log(`✅ ${this.agentType}: ${targetAgent} respondeu!`);
          return lastMessage;
        }
      }
      
      // Aguardar 2 segundos antes de verificar novamente
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error(`⏰ Timeout esperando por ${targetAgent} (${timeout}ms)`);
  }

  // Aguardar por recurso específico
  async waitForResource(threadId, resourceType, resourceName, timeout = 30000) {
    const startTime = Date.now();
    console.log(`⏳ ${this.agentType}: Aguardando ${resourceType} ${resourceName}...`);
    
    while (Date.now() - startTime < timeout) {
      const resource = this.checkResource(threadId, resourceType, resourceName);
      
      if (resource) {
        console.log(`✅ ${this.agentType}: ${resourceType} ${resourceName} disponível!`);
        return resource;
      }
      
      // Aguardar 2 segundos antes de verificar novamente
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error(`⏰ Timeout esperando por ${resourceType} ${resourceName} (${timeout}ms)`);
  }

  // Verificar se recurso está disponível
  checkResource(threadId, resourceType, resourceName) {
    const thread = this.threadManager.loadThread(threadId);
    if (!thread) return null;
    
    if (resourceType === 'file') {
      return thread.sharedContext.files[resourceName] || null;
    } else if (resourceType === 'endpoint') {
      return thread.sharedContext.endpoints[resourceName] || null;
    } else if (resourceType === 'dependency') {
      return thread.sharedContext.dependencies[resourceName] || null;
    }
    
    return null;
  }

  // Obter mensagens direcionadas para este agente
  getMessagesForMe(threadId) {
    const thread = this.threadManager.loadThread(threadId);
    if (!thread) return [];
    
    return thread.sharedContext.messages.filter(msg => 
      msg.details.to === this.agentType || 
      msg.details.to === 'all'
    );
  }

  // Finalizar trabalho na thread
  completeWork(threadId, summary = '') {
    const success = this.threadManager.completeThread(threadId, this.agentType);
    
    if (success && summary) {
      this.sendMessage(threadId, 'all', `Trabalho finalizado: ${summary}`);
    }
    
    this.currentThreadId = null;
    return success;
  }

  // Obter status da thread atual
  getThreadStatus(threadId = null) {
    const id = threadId || this.currentThreadId;
    if (!id) return null;
    
    const thread = this.threadManager.loadThread(id);
    if (!thread) return null;
    
    return {
      id: thread.id,
      status: thread.status,
      task: thread.task,
      createdAt: thread.createdAt,
      agents: thread.agents,
      filesCount: Object.keys(thread.sharedContext.files).length,
      endpointsCount: Object.keys(thread.sharedContext.endpoints).length,
      messagesCount: thread.sharedContext.messages.length
    };
  }
}

module.exports = AgentMiddleware;
