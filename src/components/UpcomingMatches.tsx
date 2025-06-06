"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CleanMatchCard } from "@/components/CleanMatchCard";
import { Match } from "@/types";
import { Calendar, RefreshCw, Loader2, Clock, Timer } from "lucide-react";

interface UpcomingMatchesProps {
  maxMatches?: number;
  showTodayOnly?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function UpcomingMatches({
  maxMatches = 6,
  showTodayOnly = true,
  autoRefresh = true,
  refreshInterval = 60000 // 1 minute
}: UpcomingMatchesProps) {  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [todayMatches, setTodayMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Update current time every minute for countdown
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(timeInterval);
  }, []);

  const fetchUpcomingMatches = async () => {
    try {
      setError(null);
      
      const response = await fetch('/api/matches/upcoming', {
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
        setUpcomingMatches(data.data || []);
        setTodayMatches(data.todayMatches || []);
        setLastUpdate(new Date());
        console.log(`📅 ${data.todayMatches?.length || 0} partidas hoje, ${data.data?.length || 0} total`);
      } else {
        throw new Error(data.error || 'Failed to fetch upcoming matches');
      }
    } catch (err) {
      console.error('❌ Erro ao buscar próximas partidas:', err);
      setError('Erro ao carregar próximas partidas');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUpcomingMatches();
  }, []);
  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Only refresh if not currently loading
      if (!loading) {
        console.log('🔄 Auto-refreshing upcoming matches...');
        fetchUpcomingMatches();
      }
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loading]);

  const handleManualRefresh = () => {
    setLoading(true);
    fetchUpcomingMatches();
  };

  // Get matches to display based on showTodayOnly prop
  const matchesToShow = showTodayOnly ? todayMatches : upcomingMatches;
  // Function to calculate countdown
  const getCountdown = (dateUnix: number) => {
    const matchTime = dateUnix * 1000;
    const diff = matchTime - currentTime;

    if (diff <= 0) return "Iniciando";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  };

  if (loading && matchesToShow.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-green-600 rounded-xl shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {showTodayOnly ? "Próximas Partidas Hoje" : "Próximas Partidas"}
                </h2>
                <p className="text-sm text-gray-600">Carregando partidas programadas...</p>
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
              <div className="p-4 bg-green-600 rounded-xl shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {showTodayOnly ? "Próximas Partidas Hoje" : "Próximas Partidas"}
                </h2>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
            <Button onClick={handleManualRefresh} variant="outline" className="border-green-200 hover:bg-green-50 text-green-700">
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
            <div className="p-4 bg-green-600 rounded-xl shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {showTodayOnly ? "Próximas Partidas Hoje" : "Próximas Partidas"}
              </h2>
              <p className="text-sm text-gray-600">
                {showTodayOnly ? "Partidas agendadas para hoje" : "Planeje suas apostas e previsões"}
              </p>
            </div>
            {matchesToShow.length > 0 && (
              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 ml-4">
                <Calendar className="w-3 h-3 mr-1" />
                {matchesToShow.length} PRÓXIMAS
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-500">Última atualização</p>
              <p className="text-sm font-medium text-gray-700">
                {lastUpdate.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
            <Button 
              onClick={handleManualRefresh} 
              variant="outline" 
              className="border-green-200 hover:bg-green-50 text-green-700"
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
      {matchesToShow.length === 0 ? (
        <Card className="border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-lg">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                <Calendar className="h-12 w-12 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {showTodayOnly ? "Nenhuma Partida Hoje" : "Nenhuma Próxima Partida"}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                {showTodayOnly 
                  ? "Não há partidas programadas para hoje. Verifique as partidas dos próximos dias."
                  : "Nenhuma próxima partida encontrada nos próximos 7 dias."
                }
              </p>
              <Button 
                onClick={handleManualRefresh} 
                variant="outline" 
                className="border-green-300 hover:bg-green-50 text-green-700"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Atualizar Próximas Partidas
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Today's matches with countdown */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {matchesToShow.slice(0, maxMatches).map((match) => (
              <div key={match.id} className="relative">
                <CleanMatchCard
                  match={match}
                  variant="upcoming"
                />
                {/* Countdown overlay */}
                <div className="absolute top-3 right-3">
                  <Badge className="bg-green-500 text-white text-xs">
                    <Timer className="w-3 h-3 mr-1" />
                    {getCountdown(match.date_unix)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Show more button if there are more matches */}
          {matchesToShow.length > maxMatches && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" className="border-green-200 hover:bg-green-50 text-green-700">
                <Calendar className="h-4 w-4 mr-2" />
                Ver Mais {matchesToShow.length - maxMatches} Partidas
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
