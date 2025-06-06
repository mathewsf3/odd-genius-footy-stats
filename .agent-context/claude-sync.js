const AgentMiddleware = require('./middleware');
const fs = require('fs');
const path = require('path');

/**
 * Sistema de Sincronização para Agentes Claude
 * Coordena Augment Agent e VSCode Claude 4
 */
class ClaudeAgentSync {
  constructor(agentName) {
    this.middleware = new AgentMiddleware();
    this.agentName = agentName; // 'augment' ou 'vscode'
    this.middleware.agentType = agentName;
    this.currentThreadId = null;
  }

  /**
   * Iniciar sessão de trabalho colaborativo
   */
  async startCollaboration(task, threadId = null) {
    console.log(`🤝 ${this.agentName} iniciando colaboração`);
    
    const thread = await this.middleware.startWork(task, threadId);
    if (!thread) {
      throw new Error('Falha ao iniciar thread de colaboração');
    }

    this.currentThreadId = thread.id;
    
    // Notificar início da colaboração
    const otherAgent = this.agentName === 'augment' ? 'vscode' : 'augment';
    this.middleware.sendMessage(
      thread.id,
      otherAgent,
      `${this.agentName} entrou na sessão de colaboração`,
      { 
        capabilities: this.getCapabilities(),
        timestamp: new Date().toISOString()
      }
    );

    console.log(`✅ Colaboração iniciada na thread: ${thread.id}`);
    return thread;
  }

  /**
   * Definir capacidades de cada agente
   */
  getCapabilities() {
    if (this.agentName === 'augment') {
      return {
        strengths: [
          'Análise de codebase completa',
          'Implementação de sistemas complexos',
          'Debugging e correção de erros',
          'Otimização de performance',
          'Integração de APIs'
        ],
        tools: [
          'codebase-retrieval',
          'web-search',
          'github-api',
          'diagnostics',
          'file-editing'
        ],
        focus: 'Implementação técnica e arquitetura'
      };
    } else {
      return {
        strengths: [
          'Desenvolvimento iterativo',
          'UI/UX implementation',
          'Testes e validação',
          'Refatoração de código',
          'Documentação'
        ],
        tools: [
          'vscode-integration',
          'live-preview',
          'debugging',
          'git-integration',
          'terminal-access'
        ],
        focus: 'Desenvolvimento e testes locais'
      };
    }
  }

  /**
   * Solicitar trabalho específico do outro agente
   */
  async requestWork(task, priority = 'normal', timeout = 300000) {
    if (!this.currentThreadId) {
      throw new Error('Nenhuma thread ativa para solicitar trabalho');
    }

    const otherAgent = this.agentName === 'augment' ? 'vscode' : 'augment';
    
    console.log(`📋 ${this.agentName} solicitando trabalho para ${otherAgent}: ${task}`);
    
    // Enviar solicitação
    this.middleware.sendMessage(
      this.currentThreadId,
      otherAgent,
      `SOLICITAÇÃO DE TRABALHO: ${task}`,
      {
        type: 'work-request',
        task: task,
        priority: priority,
        requestedBy: this.agentName,
        deadline: new Date(Date.now() + timeout).toISOString()
      }
    );

    // Aguardar resposta
    try {
      const response = await this.middleware.waitForAgent(
        this.currentThreadId,
        otherAgent,
        timeout
      );
      
      console.log(`✅ ${otherAgent} respondeu à solicitação`);
      return response;
    } catch (error) {
      console.log(`⏰ Timeout aguardando resposta de ${otherAgent}`);
      throw error;
    }
  }

  /**
   * Responder a uma solicitação de trabalho
   */
  async respondToWorkRequest(response, metadata = {}) {
    if (!this.currentThreadId) {
      throw new Error('Nenhuma thread ativa para responder');
    }

    const otherAgent = this.agentName === 'augment' ? 'vscode' : 'augment';
    
    this.middleware.sendMessage(
      this.currentThreadId,
      otherAgent,
      `RESPOSTA: ${response}`,
      {
        type: 'work-response',
        response: response,
        respondedBy: this.agentName,
        metadata: metadata,
        timestamp: new Date().toISOString()
      }
    );

    console.log(`📤 ${this.agentName} respondeu à solicitação`);
  }

  /**
   * Compartilhar progresso atual
   */
  async shareProgress(description, files = [], endpoints = []) {
    if (!this.currentThreadId) {
      throw new Error('Nenhuma thread ativa para compartilhar progresso');
    }

    // Registrar arquivos
    files.forEach(file => {
      this.middleware.registerFile(this.currentThreadId, file.path, file.action, file.metadata);
    });

    // Registrar endpoints
    endpoints.forEach(endpoint => {
      this.middleware.registerEndpoint(this.currentThreadId, endpoint.path, endpoint.details);
    });

    // Enviar atualização de progresso
    const otherAgent = this.agentName === 'augment' ? 'vscode' : 'augment';
    this.middleware.sendMessage(
      this.currentThreadId,
      otherAgent,
      `PROGRESSO: ${description}`,
      {
        type: 'progress-update',
        description: description,
        files: files,
        endpoints: endpoints,
        updatedBy: this.agentName
      }
    );

    console.log(`📊 ${this.agentName} compartilhou progresso: ${description}`);
  }

  /**
   * Aguardar recurso específico do outro agente
   */
  async waitForResource(resourceType, resourceName, timeout = 180000) {
    if (!this.currentThreadId) {
      throw new Error('Nenhuma thread ativa para aguardar recurso');
    }

    console.log(`⏳ ${this.agentName} aguardando ${resourceType}: ${resourceName}`);
    
    try {
      const resource = await this.middleware.waitForResource(
        this.currentThreadId,
        resourceType,
        resourceName,
        timeout
      );
      
      console.log(`✅ ${this.agentName} recebeu ${resourceType}: ${resourceName}`);
      return resource;
    } catch (error) {
      console.log(`⏰ Timeout aguardando ${resourceType}: ${resourceName}`);
      throw error;
    }
  }

  /**
   * Obter mensagens pendentes
   */
  getPendingMessages() {
    if (!this.currentThreadId) return [];
    
    const messages = this.middleware.getMessagesForMe(this.currentThreadId);
    return messages.filter(msg => 
      msg.details.type === 'work-request' || 
      msg.details.type === 'progress-update'
    );
  }

  /**
   * Obter status da colaboração
   */
  getCollaborationStatus() {
    if (!this.currentThreadId) return null;
    
    const status = this.middleware.getThreadStatus(this.currentThreadId);
    const otherAgent = this.agentName === 'augment' ? 'vscode' : 'augment';
    
    return {
      ...status,
      myRole: this.agentName,
      partnerRole: otherAgent,
      partnerActive: status.agents[otherAgent]?.joined || false,
      partnerLastSeen: status.agents[otherAgent]?.lastSeen,
      pendingRequests: this.getPendingMessages().length
    };
  }

  /**
   * Finalizar colaboração
   */
  async endCollaboration(summary = '') {
    if (!this.currentThreadId) {
      console.log('Nenhuma colaboração ativa para finalizar');
      return;
    }

    const otherAgent = this.agentName === 'augment' ? 'vscode' : 'augment';
    
    // Notificar finalização
    this.middleware.sendMessage(
      this.currentThreadId,
      otherAgent,
      `${this.agentName} finalizando colaboração: ${summary}`,
      {
        type: 'collaboration-end',
        summary: summary,
        endedBy: this.agentName
      }
    );

    // Finalizar thread
    this.middleware.completeWork(this.currentThreadId, summary);
    
    console.log(`✅ ${this.agentName} finalizou colaboração`);
    this.currentThreadId = null;
  }

  /**
   * Método de conveniência para Augment Agent
   */
  static createAugmentAgent() {
    return new ClaudeAgentSync('augment');
  }

  /**
   * Método de conveniência para VSCode Agent
   */
  static createVSCodeAgent() {
    return new ClaudeAgentSync('vscode');
  }
}

module.exports = ClaudeAgentSync;
