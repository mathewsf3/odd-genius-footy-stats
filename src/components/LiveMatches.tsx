"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EnhancedLiveMatchCard } from "@/components/EnhancedLiveMatchCard";
import { MatchCard } from "@/components/MatchCard";
import { Match } from "@/types";
import { Play, RefreshCw, Loader2, Clock, Wifi } from "lucide-react";

interface LiveMatchesProps {
  maxMatches?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function LiveMatches({
  maxMatches = 6,
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}: LiveMatchesProps) {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchLiveMatches = async () => {
    try {
      setError(null);
      
      const response = await fetch('/api/matches/live', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setLiveMatches(data.data || []);
        setLastUpdate(new Date());
        console.log(`🔴 ${data.data?.length || 0} partidas ao vivo carregadas`);
      } else {
        throw new Error(data.error || 'Failed to fetch live matches');
      }
    } catch (err) {
      console.error('❌ Erro ao buscar partidas ao vivo:', err);
      setError('Erro ao carregar partidas ao vivo');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchLiveMatches();
  }, []);
  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Only refresh if not currently loading
      if (!loading) {
        console.log('🔄 Auto-refreshing live matches...');
        fetchLiveMatches();
      }
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loading]);

  const handleManualRefresh = () => {
    setLoading(true);
    fetchLiveMatches();
  };

  if (loading && liveMatches.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-red-500 rounded-xl shadow-lg">
                <Play className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Partidas ao Vivo</h2>
                <p className="text-sm text-gray-600">Carregando partidas em tempo real...</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-gray-500">Carregando...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-red-500 rounded-xl shadow-lg">
                <Play className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Partidas ao Vivo</h2>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
            <Button onClick={handleManualRefresh} variant="outline" className="border-red-200 hover:bg-red-50 text-red-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-red-500 rounded-xl shadow-lg">
              <Play className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Partidas ao Vivo</h2>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">Acompanhe os jogos em tempo real</p>
                {autoRefresh && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Wifi className="h-3 w-3" />
                    <span>Auto-refresh ativo</span>
                  </div>
                )}
              </div>
            </div>
            {liveMatches.length > 0 && (
              <Badge className="bg-red-500 hover:bg-red-600 text-white animate-pulse ml-4">
                <div className="w-2 h-2 bg-white rounded-full animate-ping mr-2"></div>
                {liveMatches.length} AO VIVO
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-500">Última atualização</p>
              <p className="text-sm font-medium text-gray-700">
                {lastUpdate.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                })}
              </p>
            </div>
            <Button 
              onClick={handleManualRefresh} 
              variant="outline" 
              className="border-red-200 hover:bg-red-50 text-red-700"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Matches Content */}
      {liveMatches.length === 0 ? (
        <Card className="border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-lg">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                <Clock className="h-12 w-12 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma Partida ao Vivo</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Não há partidas sendo jogadas no momento. Verifique as próximas partidas ou tente atualizar.
              </p>
              <Button 
                onClick={handleManualRefresh} 
                variant="outline" 
                className="border-red-300 hover:bg-red-50 text-red-700"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Atualizar Partidas ao Vivo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {liveMatches.slice(0, maxMatches).map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              variant="live"
              showVerification={true}
              isVerified={true}
              dataSource="FootyStats API"
            />
          ))}
        </div>
      )}
    </div>
  );
}
