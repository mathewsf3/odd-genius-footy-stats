/**
 * Sistema de Cache Inteligente para FootyStats API
 * Múltiplas camadas: Memória + Banco + Redis (futuro)
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

interface CacheConfig {
  // TTL em milissegundos
  leagues: number;        // 24h - dados estáticos
  teams: number;          // 6h - dados semi-estáticos
  matches: number;        // 5min - dados dinâmicos
  liveMatches: number;    // 30s - dados em tempo real
  players: number;        // 12h - dados semi-estáticos
  referees: number;       // 12h - dados semi-estáticos
  standings: number;      // 1h - dados que mudam por rodada
  matchDetails: number;   // 2min - dados detalhados
  rankings: number;       // 6h - rankings BTTS/Over
}

class IntelligentCache {
  private memoryCache = new Map<string, CacheItem<any>>();
  private config: CacheConfig;
  
  constructor() {
    this.config = {
      leagues: 24 * 60 * 60 * 1000,      // 24 horas
      teams: 6 * 60 * 60 * 1000,         // 6 horas
      matches: 5 * 60 * 1000,            // 5 minutos
      liveMatches: 30 * 1000,            // 30 segundos
      players: 12 * 60 * 60 * 1000,      // 12 horas
      referees: 12 * 60 * 60 * 1000,     // 12 horas
      standings: 60 * 60 * 1000,         // 1 hora
      matchDetails: 2 * 60 * 1000,       // 2 minutos
      rankings: 6 * 60 * 60 * 1000,      // 6 horas
    };
    
    // Limpeza automática a cada 10 minutos
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  /**
   * Gera chave de cache baseada no tipo e parâmetros
   */
  private generateKey(type: keyof CacheConfig, params: Record<string, any> = {}): string {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return `${type}:${paramString}`;
  }

  /**
   * Verifica se item está válido no cache
   */
  private isValid<T>(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp < item.ttl;
  }

  /**
   * Busca item no cache
   */
  get<T>(type: keyof CacheConfig, params: Record<string, any> = {}): T | null {
    const key = this.generateKey(type, params);
    const item = this.memoryCache.get(key);
    
    if (!item) {
      console.log(`🔍 Cache MISS: ${key}`);
      return null;
    }
    
    if (!this.isValid(item)) {
      console.log(`⏰ Cache EXPIRED: ${key}`);
      this.memoryCache.delete(key);
      return null;
    }
    
    console.log(`✅ Cache HIT: ${key}`);
    return item.data;
  }

  /**
   * Armazena item no cache
   */
  set<T>(type: keyof CacheConfig, data: T, params: Record<string, any> = {}): void {
    const key = this.generateKey(type, params);
    const ttl = this.config[type];
    
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key
    };
    
    this.memoryCache.set(key, item);
    console.log(`💾 Cache SET: ${key} (TTL: ${ttl}ms)`);
  }

  /**
   * Invalida cache por padrão
   */
  invalidate(pattern: string): number {
    let count = 0;
    
    for (const [key, item] of this.memoryCache.entries()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
        count++;
      }
    }
    
    console.log(`🗑️ Cache INVALIDATED: ${count} items matching "${pattern}"`);
    return count;
  }

  /**
   * Invalida cache por tipo
   */
  invalidateType(type: keyof CacheConfig): number {
    return this.invalidate(`${type}:`);
  }

  /**
   * Limpeza automática de itens expirados
   */
  private cleanup(): void {
    let cleaned = 0;
    
    for (const [key, item] of this.memoryCache.entries()) {
      if (!this.isValid(item)) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cache CLEANUP: ${cleaned} expired items removed`);
    }
  }

  /**
   * Estatísticas do cache
   */
  getStats() {
    const total = this.memoryCache.size;
    let valid = 0;
    let expired = 0;
    
    for (const item of this.memoryCache.values()) {
      if (this.isValid(item)) {
        valid++;
      } else {
        expired++;
      }
    }
    
    return {
      total,
      valid,
      expired,
      hitRate: valid / total || 0
    };
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    const size = this.memoryCache.size;
    this.memoryCache.clear();
    console.log(`🗑️ Cache CLEARED: ${size} items removed`);
  }

  /**
   * Lista todas as chaves do cache
   */
  getKeys(): string[] {
    return Array.from(this.memoryCache.keys());
  }

  /**
   * Força atualização de um item específico
   */
  refresh(type: keyof CacheConfig, params: Record<string, any> = {}): void {
    const key = this.generateKey(type, params);
    this.memoryCache.delete(key);
    console.log(`🔄 Cache REFRESH: ${key}`);
  }
}

// Instância singleton do cache
export const cache = new IntelligentCache();

// Tipos para facilitar uso
export type CacheType = keyof CacheConfig;

// Utilitários
export const CacheUtils = {
  /**
   * Wrapper para funções que usam cache
   */
  async withCache<T>(
    type: CacheType,
    params: Record<string, any>,
    fetcher: () => Promise<T>
  ): Promise<T> {
    // Tenta buscar no cache primeiro
    const cached = cache.get<T>(type, params);
    if (cached !== null) {
      return cached;
    }

    // Se não encontrou, busca dados e armazena no cache
    const data = await fetcher();
    cache.set(type, data, params);
    return data;
  },

  /**
   * Invalida cache relacionado a uma partida
   */
  invalidateMatch(matchId: string | number): void {
    cache.invalidate(`matches:.*match_id:${matchId}`);
    cache.invalidate(`matchDetails:.*match_id:${matchId}`);
  },

  /**
   * Invalida cache relacionado a um time
   */
  invalidateTeam(teamId: string | number): void {
    cache.invalidate(`teams:.*team_id:${teamId}`);
    cache.invalidate(`matches:.*homeID:${teamId}`);
    cache.invalidate(`matches:.*awayID:${teamId}`);
  },

  /**
   * Invalida cache relacionado a uma liga
   */
  invalidateLeague(seasonId: string | number): void {
    cache.invalidate(`season_id:${seasonId}`);
  }
};

export default cache;
