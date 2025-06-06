const ThreadManager = require('../.agent-context/thread-manager');

class AgentMonitor {
  constructor() {
    this.threadManager = new ThreadManager();
    this.isRunning = false;
  }

  displayStatus() {
    console.clear();
    console.log('🤖 MONITOR DE AGENTES\n');
    
    const thread = this.threadManager.getActiveThread();
    const stats = this.threadManager.getStats();
    
    // Estatísticas gerais
    console.log('📊 Estatísticas Gerais:');
    console.log(`  Total de threads: ${stats.total}`);
    console.log(`  Threads ativas: ${stats.active}`);
    console.log(`  Threads concluídas: ${stats.completed}`);
    console.log('');
    
    if (!thread) {
      console.log('⚠️  Nenhuma thread ativa');
      console.log('');
      console.log('💡 Para iniciar uma nova thread:');
      console.log('   npm run agent:backend   # Iniciar agente backend');
      console.log('   npm run agent:frontend  # Iniciar agente frontend');
      return;
    }
    
    // Informações da thread ativa
    console.log(`🧵 Thread Ativa: ${thread.id}`);
    console.log(`📋 Tarefa: ${thread.task}`);
    console.log(`👤 Criada por: ${thread.createdBy}`);
    console.log(`⏰ Criada em: ${new Date(thread.createdAt).toLocaleString('pt-BR')}`);
    console.log(`📊 Status: ${this.getStatusIcon(thread.status)} ${thread.status.toUpperCase()}`);
    console.log('');
    
    // Status dos agentes
    console.log('🤖 Status dos Agentes:');
    Object.entries(thread.agents).forEach(([agent, info]) => {
      const status = info.joined ? '✅ Ativo' : '❌ Inativo';
      const lastSeen = info.lastSeen ? 
        `(última atividade: ${new Date(info.lastSeen).toLocaleTimeString('pt-BR')})` : 
        '';
      console.log(`  ${agent.padEnd(10)}: ${status} ${lastSeen}`);
    });
    console.log('');
    
    // Recursos criados
    this.displayResources(thread);
    
    // Últimas mensagens
    this.displayRecentMessages(thread);
    
    // Comandos disponíveis
    console.log('⌨️  Comandos disponíveis:');
    console.log('   Ctrl+C          # Parar monitor');
    console.log('   npm run agent:clean    # Limpar threads');
    console.log('   npm run agent:status   # Status detalhado');
  }

  displayResources(thread) {
    const { files, endpoints, dependencies } = thread.sharedContext;
    
    // Arquivos
    if (Object.keys(files).length > 0) {
      console.log('📁 Arquivos:');
      Object.entries(files).forEach(([file, info]) => {
        const icon = this.getFileIcon(info.action);
        const agent = info.agent.padEnd(8);
        console.log(`  ${icon} ${file} (${agent}) - ${info.action}`);
      });
      console.log('');
    }
    
    // Endpoints
    if (Object.keys(endpoints).length > 0) {
      console.log('🔌 Endpoints:');
      Object.entries(endpoints).forEach(([endpoint, info]) => {
        const method = info.method.padEnd(4);
        const agent = info.agent.padEnd(8);
        const status = info.status === 'created' ? '🆕' : '✅';
        console.log(`  ${status} ${method} ${endpoint} (${agent})`);
        if (info.description) {
          console.log(`      📝 ${info.description}`);
        }
      });
      console.log('');
    }
    
    // Dependências
    if (Object.keys(dependencies).length > 0) {
      console.log('📦 Dependências:');
      Object.entries(dependencies).forEach(([dep, info]) => {
        const version = info.version.padEnd(10);
        const agent = info.agent.padEnd(8);
        const icon = info.action === 'installed' ? '📥' : '📤';
        console.log(`  ${icon} ${dep}@${version} (${agent}) - ${info.action}`);
      });
      console.log('');
    }
  }

  displayRecentMessages(thread) {
    const recentMessages = thread.sharedContext.messages.slice(-8);
    
    if (recentMessages.length > 0) {
      console.log('💬 Últimas Mensagens:');
      recentMessages.forEach(msg => {
        const time = new Date(msg.timestamp).toLocaleTimeString('pt-BR');
        const agent = msg.agent.padEnd(8);
        const action = this.getActionIcon(msg.action);
        
        if (msg.action === 'message' && msg.details.message) {
          const from = msg.details.from;
          const to = msg.details.to;
          console.log(`  ${time} 💬 ${from} → ${to}: ${msg.details.message}`);
        } else {
          console.log(`  ${time} ${action} ${agent}: ${msg.action}`);
          if (msg.details && Object.keys(msg.details).length > 0) {
            const details = JSON.stringify(msg.details, null, 0);
            if (details.length < 60) {
              console.log(`           ${details}`);
            }
          }
        }
      });
      console.log('');
    }
  }

  getStatusIcon(status) {
    switch (status) {
      case 'active': return '🟢';
      case 'completed': return '✅';
      case 'failed': return '❌';
      default: return '⚪';
    }
  }

  getFileIcon(action) {
    switch (action) {
      case 'created': return '🆕';
      case 'updated': return '📝';
      case 'verified': return '✅';
      case 'deleted': return '🗑️';
      default: return '📄';
    }
  }

  getActionIcon(action) {
    switch (action) {
      case 'agent-joined': return '🚀';
      case 'message': return '💬';
      case 'file-created': return '📁';
      case 'file-updated': return '📝';
      case 'endpoint-created': return '🔌';
      case 'dependency-installed': return '📦';
      case 'thread-completed': return '✅';
      default: return '📋';
    }
  }

  start() {
    console.log('🚀 Monitor de Agentes iniciado');
    console.log('   Pressione Ctrl+C para parar\n');
    
    this.isRunning = true;
    
    // Exibir status inicial
    this.displayStatus();
    
    // Atualizar a cada 3 segundos
    const interval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(interval);
        return;
      }
      this.displayStatus();
    }, 3000);
    
    // Capturar Ctrl+C para parar graciosamente
    process.on('SIGINT', () => {
      console.log('\n\n👋 Monitor de Agentes parado');
      this.isRunning = false;
      clearInterval(interval);
      process.exit(0);
    });
  }

  // Método para exibir status detalhado
  static showDetailedStatus() {
    const threadManager = new ThreadManager();
    const thread = threadManager.getActiveThread();
    const stats = threadManager.getStats();
    
    console.log('📊 STATUS DETALHADO DOS AGENTES\n');
    
    console.log('Estatísticas:');
    console.log(`  Total de threads: ${stats.total}`);
    console.log(`  Threads ativas: ${stats.active}`);
    console.log(`  Threads concluídas: ${stats.completed}`);
    
    if (stats.oldestActive) {
      console.log(`  Thread ativa mais antiga: ${stats.oldestActive}`);
    }
    
    if (stats.newestCompleted) {
      console.log(`  Última thread concluída: ${stats.newestCompleted}`);
    }
    
    console.log('');
    
    if (thread) {
      console.log('Thread Ativa:');
      console.log(JSON.stringify(thread, null, 2));
    } else {
      console.log('Nenhuma thread ativa');
    }
  }

  // Método para limpar threads antigas
  static cleanup() {
    const threadManager = new ThreadManager();
    const cleaned = threadManager.cleanupOldThreads(7);
    console.log(`🧹 Limpeza concluída: ${cleaned} threads removidas`);
  }
}

// Executar monitor se chamado diretamente
if (require.main === module) {
  const monitor = new AgentMonitor();
  monitor.start();
}

module.exports = AgentMonitor;
