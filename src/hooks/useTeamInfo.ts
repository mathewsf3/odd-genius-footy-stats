import { useState, useEffect } from 'react';

export interface TeamInfo {
  id: number;
  name: string;
  fullName: string;
  englishName: string;
  logo: string;
  image?: string; // Campo image da FootyStats API
  country: string;
  founded: string;
  url: string;
  source: string;
}

interface UseTeamInfoResult {
  teamInfo: TeamInfo | null;
  loading: boolean;
  error: string | null;
}

// Cache simples para evitar re-fetches desnecessários
const teamInfoCache = new Map<number, { data: TeamInfo; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora

export function useTeamInfo(teamId?: number): UseTeamInfoResult {
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) {
      setTeamInfo(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchTeamInfo = async () => {
      // Verifica cache primeiro
      const cached = teamInfoCache.get(teamId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setTeamInfo(cached.data);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/team-info?teamId=${teamId}`);
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          const data = result.data;
          
          // Salva no cache
          teamInfoCache.set(teamId, { data, timestamp: Date.now() });
          
          setTeamInfo(data);
        } else {
          throw new Error('Dados inválidos recebidos da API');
        }
      } catch (err) {
        console.error(`❌ Erro ao buscar team info para ID ${teamId}:`, err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setTeamInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamInfo();
  }, [teamId]);

  return { teamInfo, loading, error };
}

// Hook para buscar múltiplos times de uma vez
export function useMultipleTeamInfo(teamIds: (number | undefined)[]): {
  teamsInfo: (TeamInfo | null)[];
  loading: boolean;
  errors: (string | null)[];
} {
  const [teamsInfo, setTeamsInfo] = useState<(TeamInfo | null)[]>(() =>
    new Array(teamIds.length).fill(null)
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<(string | null)[]>(() =>
    new Array(teamIds.length).fill(null)
  );

  useEffect(() => {
    const validTeamIds = teamIds.filter((id): id is number => id !== undefined);

    if (validTeamIds.length === 0) {
      setTeamsInfo(new Array(teamIds.length).fill(null));
      setLoading(false);
      setErrors(new Array(teamIds.length).fill(null));
      return;
    }

    const fetchMultipleTeamInfo = async () => {
      setLoading(true);
      setErrors(new Array(teamIds.length).fill(null));

      const results: (TeamInfo | null)[] = new Array(teamIds.length).fill(null);
      const errorResults: (string | null)[] = new Array(teamIds.length).fill(null);

      for (let i = 0; i < teamIds.length; i++) {
        const teamId = teamIds[i];

        if (!teamId) {
          continue;
        }

        try {
          // Verifica cache primeiro
          const cached = teamInfoCache.get(teamId);
          if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            results[i] = cached.data;
            errorResults[i] = null;
            continue;
          }

          const response = await fetch(`/api/team-info?teamId=${teamId}`);
          
          if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();
          
          if (result.success && result.data) {
            const data = result.data;

            // Salva no cache
            teamInfoCache.set(teamId, { data, timestamp: Date.now() });

            results[i] = data;
            errorResults[i] = null;
          } else {
            throw new Error('Dados inválidos recebidos da API');
          }
        } catch (err) {
          console.error(`❌ Erro ao buscar team info para ID ${teamId}:`, err);
          results[i] = null;
          errorResults[i] = err instanceof Error ? err.message : 'Erro desconhecido';
        }
      }

      setTeamsInfo(results);
      setErrors(errorResults);
      setLoading(false);
    };

    fetchMultipleTeamInfo();
  }, [teamIds.filter(id => id !== undefined).join(',')]); // Dependência baseada nos IDs válidos

  return { teamsInfo, loading, errors };
}
