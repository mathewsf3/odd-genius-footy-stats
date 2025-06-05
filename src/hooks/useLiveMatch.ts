import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface LiveMatchData {
  homeGoalCount: number;
  awayGoalCount: number;
  team_a_possession: number | null;
  team_b_possession: number | null;
  status: string;
  minute: number | null;
  home_name: string;
  away_name: string;
}

interface UseLiveMatchReturn {
  scoreA: number;
  scoreB: number;
  possA: number | null;
  possB: number | null;
  status: string | null;
  minute: number | null;
  isLoading: boolean;
  error: any;
}

export function useLiveMatch(matchId?: number, active = false): UseLiveMatchReturn {
  const { data, error, isLoading } = useSWR(
    active && matchId ? `/api/fs/match/${matchId}` : null,
    fetcher,
    {
      refreshInterval: 20_000, // 20 segundos - atualização frequente para dados ao vivo
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5_000, // Reduzido para 5s para dados mais frescos
      errorRetryCount: 3,
      errorRetryInterval: 5_000,
      revalidateIfStale: true,
      revalidateOnMount: true,
    }
  );

  console.log(`🔴 Live Match Hook para match ${matchId}:`, {
    active,
    hasData: !!data,
    success: data?.success,
    scoreA: data?.data?.homeGoalCount,
    scoreB: data?.data?.awayGoalCount,
    possA: data?.data?.team_a_possession,
    possB: data?.data?.team_b_possession,
    status: data?.data?.status,
    minute: data?.data?.minute,
    isLoading,
    error: error?.message
  });

  // Garantir que retornamos dados válidos mesmo se a API falhar
  const matchData = data?.data || {};

  return {
    scoreA: matchData.homeGoalCount ?? 0,
    scoreB: matchData.awayGoalCount ?? 0,
    possA: matchData.team_a_possession ?? null,
    possB: matchData.team_b_possession ?? null,
    status: matchData.status ?? null,
    minute: matchData.minute ?? null,
    isLoading,
    error
  };
}
