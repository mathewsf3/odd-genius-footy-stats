import { useState, useEffect } from 'react';
import useSWR from 'swr';

const api = (url: string) => fetch(url).then(r => r.json());

interface ExpectedGoalsData {
  homeExpectedGoals: number;
  awayExpectedGoals: number;
  totalExpectedGoals: number;
  confidence: string;
  source: string;
  homeTeamId?: number | null;
  awayTeamId?: number | null;
  homeStats?: any;
  awayStats?: any;
}

interface UseTeamStatsResult {
  expectedGoals: ExpectedGoalsData | null;
  loading: boolean;
  error: string | null;
}

// Cache para evitar chamadas desnecessárias
const statsCache = new Map<string, { data: ExpectedGoalsData; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

export function useTeamStats(
  homeTeam: string,
  awayTeam: string,
  homeTeamId?: number,
  awayTeamId?: number
): UseTeamStatsResult {
  const [expectedGoals, setExpectedGoals] = useState<ExpectedGoalsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ((!homeTeam || !awayTeam) && (!homeTeamId || !awayTeamId)) {
      return;
    }

    const fetchTeamStats = async () => {
      // Cria cache key baseado em IDs se disponíveis, senão usa nomes
      const cacheKey = homeTeamId && awayTeamId
        ? `${homeTeamId}_vs_${awayTeamId}`
        : `${homeTeam}_vs_${awayTeam}`;

      const cached = statsCache.get(cacheKey);

      // Verifica cache primeiro
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setExpectedGoals(cached.data);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Constrói parâmetros da API priorizando IDs
        const params = new URLSearchParams();

        if (homeTeamId && awayTeamId) {
          // Usa IDs (MUITO MAIS EFICIENTE)
          params.append('homeTeamId', homeTeamId.toString());
          params.append('awayTeamId', awayTeamId.toString());
          console.log(`🎯 Buscando stats por ID: ${homeTeamId} vs ${awayTeamId}`);
        } else {
          // Fallback para nomes
          params.append('homeTeam', homeTeam.trim());
          params.append('awayTeam', awayTeam.trim());
          console.log(`🔍 Buscando stats por nome: ${homeTeam} vs ${awayTeam}`);
        }

        const response = await fetch(`/api/team-stats?${params}`);

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          const data = result.data;

          // Salva no cache
          statsCache.set(cacheKey, { data, timestamp: Date.now() });

          setExpectedGoals(data);
        } else {
          throw new Error('Dados inválidos recebidos da API');
        }
      } catch (err) {
        console.error('❌ Erro ao buscar team stats:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');

        // Em caso de erro, usa 0 (SEM FALLBACK)
        const defaultData: ExpectedGoalsData = {
          homeExpectedGoals: 0,
          awayExpectedGoals: 0,
          totalExpectedGoals: 0,
          confidence: 'Sem Dados',
          source: 'error'
        };

        setExpectedGoals(defaultData);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamStats();
  }, [homeTeam, awayTeam, homeTeamId, awayTeamId]);

  return { expectedGoals, loading, error };
}

// Hook simplificado para usar apenas o total de gols esperados
export function useExpectedGoals(
  homeTeam: string,
  awayTeam: string,
  homeTeamId?: number,
  awayTeamId?: number,
  matchId?: number
): {
  totalGoals: number;
  homeGoals: number;
  awayGoals: number;
  confidence: string;
  loading: boolean;
} {
  // Se temos matchId, usa o novo sistema com dados reais da FootyStats
  if (matchId && homeTeamId && awayTeamId) {
    return useRealExpectedGoals(homeTeam, awayTeam, homeTeamId, awayTeamId, matchId);
  }

  // Fallback para o sistema antigo
  const { expectedGoals, loading } = useTeamStats(homeTeam, awayTeam, homeTeamId, awayTeamId);

  return {
    totalGoals: expectedGoals?.totalExpectedGoals || 0,
    homeGoals: expectedGoals?.homeExpectedGoals || 0,
    awayGoals: expectedGoals?.awayExpectedGoals || 0,
    confidence: expectedGoals?.confidence || 'Sem Dados',
    loading
  };
}

// Hook que usa dados REAIS da FootyStats API
function useRealExpectedGoals(
  homeName: string,
  awayName: string,
  homeID: number,
  awayID: number,
  matchID: number
): {
  totalGoals: number;
  homeGoals: number;
  awayGoals: number;
  confidence: string;
  loading: boolean;
} {
  /* 1. Match Details → pega avg_potential (total) */
  const { data: matchData, error: matchErr } = useSWR(
    matchID ? `/api/fs/match/${matchID}` : null,
    api,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 1800000, // 30 minutos
    }
  );

  /* 2. Stats dos times (para split) */
  const { data: homeStats } = useSWR(
    homeID ? `/api/fs/team/${homeID}` : null,
    api,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 1800000, // 30 minutos
    }
  );

  const { data: awayStats } = useSWR(
    awayID ? `/api/fs/team/${awayID}` : null,
    api,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 1800000, // 30 minutos
    }
  );

  /* Loading / erro */
  const loading = !matchData || !homeStats || !awayStats;

  if (loading) {
    return {
      totalGoals: 0,
      homeGoals: 0,
      awayGoals: 0,
      confidence: "Sem Dados",
      loading: true
    };
  }

  if (matchErr || !matchData?.success || !homeStats?.success || !awayStats?.success) {
    return {
      totalGoals: 0,
      homeGoals: 0,
      awayGoals: 0,
      confidence: "Sem Dados",
      loading: false
    };
  }

  /* --- 3. Cálculo --- */
  const totalGoals = +matchData.data?.avg_potential || 0;     // campo real
  const hAtk = +homeStats.data?.seasonAVG_home || 0;
  const aDef = +awayStats.data?.seasonConcededAVG_away || 0;
  const aAtk = +awayStats.data?.seasonAVG_away || 0;
  const hDef = +homeStats.data?.seasonConcededAVG_home || 0;

  // split simples: média do ataque do time com a defesa do adversário
  const homeGoals = ((hAtk + aDef) / 2);
  const awayGoals = ((aAtk + hDef) / 2);

  /* --- 4. Confiança --- */
  const sampleSize = Math.min(
    homeStats.data?.stats?.matchesPlayed_overall || 0,
    awayStats.data?.stats?.matchesPlayed_overall || 0
  );
  const riskIndex = Math.max(
    homeStats.data?.risk || 5,
    awayStats.data?.risk || 5
  ); // 1 (ausência) → 5 (alto)

  let confidence: 'Alta' | 'Média' | 'Baixa' | 'Sem Dados' = "Alta";
  if (sampleSize < 10 || riskIndex >= 4) confidence = "Baixa";
  else if (sampleSize < 20 || riskIndex === 3) confidence = "Média";

  // Se não temos dados suficientes, retorna sem dados
  if (totalGoals === 0 && homeGoals === 0 && awayGoals === 0) {
    confidence = "Sem Dados";
  }

  console.log(`🎯 Expected Goals REAIS (FootyStats API) para ${homeName} vs ${awayName}:`, {
    totalGoals: +totalGoals.toFixed(2),
    homeGoals: +homeGoals.toFixed(2),
    awayGoals: +awayGoals.toFixed(2),
    confidence,
    matchId: matchID,
    source: 'FootyStats Real Data'
  });

  return {
    totalGoals: +totalGoals.toFixed(2),
    homeGoals: +homeGoals.toFixed(2),
    awayGoals: +awayGoals.toFixed(2),
    confidence,
    loading: false
  };
}

// Função utilitária para limpar o cache (útil para desenvolvimento)
export function clearTeamStatsCache(): void {
  statsCache.clear();
  console.log('🧹 Cache de team stats limpo');
}

// Função para obter estatísticas de forma síncrona (se já estiver em cache)
export function getCachedTeamStats(homeTeam: string, awayTeam: string): ExpectedGoalsData | null {
  const cacheKey = `${homeTeam}_vs_${awayTeam}`;
  const cached = statsCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  return null;
}
