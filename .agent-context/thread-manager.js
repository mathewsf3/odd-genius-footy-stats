const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ThreadManager {
  constructor() {
    this.contextDir = path.join(process.cwd(), '.agent-context');
    this.ensureContextDir();
  }

  ensureContextDir() {
    if (!fs.existsSync(this.contextDir)) {
      fs.mkdirSync(this.contextDir, { recursive: true });
    }
  }

  // Criar nova thread de trabalho
  createThread(agentType, task) {
    const threadId = `thread_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const thread = {
      id: threadId,
      createdAt: new Date().toISOString(),
      createdBy: agentType,
      task: task,
      status: 'active',
      agents: {
        backend: { joined: false, lastSeen: null },
        frontend: { joined: false, lastSeen: null }
      },
      sharedContext: {
        files: {},
        endpoints: {},
        dependencies: {},
        messages: []
      }
    };

    this.saveThread(thread);
    console.log(`🧵 Nova thread criada: ${threadId} por ${agentType}`);
    return threadId;
  }

  // Salvar thread
  saveThread(thread) {
    const threadPath = path.join(this.contextDir, `${thread.id}.json`);
    fs.writeFileSync(threadPath, JSON.stringify(thread, null, 2));
  }

  // Carregar thread
  loadThread(threadId) {
    const threadPath = path.join(this.contextDir, `${threadId}.json`);
    if (fs.existsSync(threadPath)) {
      return JSON.parse(fs.readFileSync(threadPath, 'utf8'));
    }
    return null;
  }

  // Atualizar contexto compartilhado
  updateContext(threadId, agentType, updates) {
    const thread = this.loadThread(threadId);
    if (!thread) {
      console.error(`❌ Thread ${threadId} não encontrada`);
      return false;
    }

    // Marcar agente como ativo (criar se não existir)
    if (!thread.agents[agentType]) {
      thread.agents[agentType] = { joined: false, lastSeen: null };
    }
    thread.agents[agentType].joined = true;
    thread.agents[agentType].lastSeen = new Date().toISOString();

    // Atualizar contexto
    Object.keys(updates).forEach(key => {
      if (key === 'action' || key === 'details') return; // Skip metadata
      
      if (thread.sharedContext[key]) {
        Object.assign(thread.sharedContext[key], updates[key]);
      }
    });

    // Adicionar mensagem ao histórico
    thread.sharedContext.messages.push({
      timestamp: new Date().toISOString(),
      agent: agentType,
      action: updates.action || 'update',
      details: updates.details || {}
    });

    this.saveThread(thread);
    return true;
  }

  // Obter thread ativa atual
  getActiveThread() {
    try {
      const files = fs.readdirSync(this.contextDir);
      const threads = files
        .filter(f => f.endsWith('.json'))
        .map(f => {
          try {
            return this.loadThread(f.replace('.json', ''));
          } catch (e) {
            return null;
          }
        })
        .filter(t => t && t.status === 'active')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return threads[0] || null;
    } catch (e) {
      return null;
    }
  }

  // Listar todas as threads
  listThreads() {
    try {
      const files = fs.readdirSync(this.contextDir);
      return files
        .filter(f => f.endsWith('.json'))
        .map(f => {
          try {
            return this.loadThread(f.replace('.json', ''));
          } catch (e) {
            return null;
          }
        })
        .filter(t => t)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (e) {
      return [];
    }
  }

  // Finalizar thread
  completeThread(threadId, agentType) {
    const thread = this.loadThread(threadId);
    if (!thread) return false;

    thread.status = 'completed';
    thread.completedAt = new Date().toISOString();
    thread.completedBy = agentType;

    // Adicionar mensagem de conclusão
    thread.sharedContext.messages.push({
      timestamp: new Date().toISOString(),
      agent: agentType,
      action: 'thread-completed',
      details: { threadId }
    });

    this.saveThread(thread);
    console.log(`✅ Thread ${threadId} finalizada por ${agentType}`);
    return true;
  }

  // Limpar threads antigas
  cleanupOldThreads(daysOld = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const threads = this.listThreads();
    let cleaned = 0;

    threads.forEach(thread => {
      const threadDate = new Date(thread.createdAt);
      if (threadDate < cutoffDate && thread.status === 'completed') {
        const threadPath = path.join(this.contextDir, `${thread.id}.json`);
        try {
          fs.unlinkSync(threadPath);
          cleaned++;
        } catch (e) {
          console.error(`Erro ao remover thread ${thread.id}:`, e.message);
        }
      }
    });

    console.log(`🧹 ${cleaned} threads antigas removidas`);
    return cleaned;
  }

  // Obter estatísticas
  getStats() {
    const threads = this.listThreads();
    const active = threads.filter(t => t.status === 'active').length;
    const completed = threads.filter(t => t.status === 'completed').length;
    
    return {
      total: threads.length,
      active,
      completed,
      oldestActive: threads.find(t => t.status === 'active')?.createdAt || null,
      newestCompleted: threads.find(t => t.status === 'completed')?.completedAt || null
    };
  }
}

module.exports = ThreadManager;
