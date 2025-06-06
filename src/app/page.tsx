"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CleanMatchCard } from "@/components/CleanMatchCard";
import { EnhancedLiveMatchCard } from "@/components/EnhancedLiveMatchCard";
import { NewFootyStatsAPI } from "@/lib/newAPI";
import { Match } from "@/types";
import { Play, Clock, Target, Loader2, Calendar, Eye, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [todayMatches, setTodayMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Buscando dados REAIS da API FootyStats...');

        // Buscar partidas ao vivo diretamente - DADOS REAIS
        const live = await NewFootyStatsAPI.getLiveMatches();
        console.log('🔴 Partidas ao vivo encontradas:', live?.length || 0, 'partidas');
        if (live && live.length > 0) {
          setLiveMatches(live.slice(0, 6));
        }

        // Buscar partidas de hoje - DADOS REAIS
        const today = await NewFootyStatsAPI.getTodaysMatches();
        console.log('📊 Partidas de hoje encontradas:', today?.length || 0, 'partidas');

        if (today && today.length > 0) {
          setTodayMatches(today);

          // Para partidas futuras, usar as partidas de hoje que são futuras E NÃO estão ao vivo
          const liveMatchIds = live.map((m: Match) => m.id);
          const todayFuture = today.filter((match: Match) =>
            match.status === 'incomplete' &&
            match.date_unix * 1000 > Date.now() &&
            !liveMatchIds.includes(match.id) // Excluir partidas que já estão na lista de ao vivo
          );

          // Se não há partidas futuras hoje, buscar próximas partidas
          if (todayFuture.length === 0) {
            console.log('⏰ Nenhuma partida futura hoje, buscando próximas partidas...');
            const upcoming = await NewFootyStatsAPI.getUpcomingMatches(7);
            if (upcoming && upcoming.length > 0) {
              setUpcomingMatches(upcoming.slice(0, 6));
              console.log('⏰ Próximas partidas encontradas:', upcoming.length, 'partidas');
            }
          } else {
            setUpcomingMatches(todayFuture.slice(0, 6));
            console.log('⏰ Partidas futuras de hoje (excluindo ao vivo):', todayFuture.length, 'partidas');
          }
        } else {
          // Se não conseguir dados de hoje, buscar próximas partidas
          const upcoming = await NewFootyStatsAPI.getUpcomingMatches(3);
          console.log('⏰ Próximas partidas encontradas:', upcoming?.length || 0, 'partidas');

          if (upcoming && upcoming.length > 0) {
            setUpcomingMatches(upcoming.slice(0, 6));
            setTodayMatches(upcoming.slice(0, 12)); // Usar algumas como "hoje"
          }
        }

      } catch (err) {
        console.error('❌ Erro ao buscar dados REAIS:', err);
        setError('Falha ao carregar dados reais de partidas da API FootyStats. Verifique a conexão.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando painel...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">


      {/* Modern Stats Cards - White & Green Theme */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-white to-green-50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Ao Vivo</p>
                <div className="text-3xl font-bold text-gray-900">{liveMatches.length}</div>
                <p className="text-xs text-gray-500 mt-1">Acontecendo agora</p>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <Play className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Hoje</p>
                <div className="text-3xl font-bold text-gray-900">{todayMatches.length}</div>
                <p className="text-xs text-gray-500 mt-1">Programadas</p>
              </div>
              <div className="p-3 bg-gray-500 rounded-full">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-white to-green-50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Próximas</p>
                <div className="text-3xl font-bold text-gray-900">{upcomingMatches.length}</div>
                <p className="text-xs text-gray-500 mt-1">Esta semana</p>
              </div>
              <div className="p-3 bg-green-600 rounded-full">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                <div className="text-3xl font-bold text-green-600">●</div>
                <p className="text-xs text-gray-500 mt-1">Online</p>
              </div>
              <div className="p-3 bg-gray-600 rounded-full">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Main Dashboard Content */}
      <div className="space-y-10">
        {/* Live Matches Section - Modern White & Green */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-green-500 rounded-xl shadow-lg">
                  <Play className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Partidas ao Vivo</h2>
                  <p className="text-sm text-gray-600">Acompanhe os jogos em tempo real</p>
                </div>
                {liveMatches.length > 0 && (
                  <Badge className="bg-green-500 hover:bg-green-600 text-white animate-pulse ml-4">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping mr-2"></div>
                    {liveMatches.length} AO VIVO
                  </Badge>
                )}
              </div>
              <Button asChild variant="outline" className="border-green-200 hover:bg-green-50 text-green-700">
                <Link href="/live" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Ver Todas
                </Link>
              </Button>
            </div>
          </div>

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
                  <Button onClick={() => window.location.reload()} variant="outline" className="border-green-300 hover:bg-green-50 text-green-700">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar Partidas ao Vivo
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {liveMatches.slice(0, 6).map((match) => (
                <EnhancedLiveMatchCard
                  key={match.id}
                  match={match}
                />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Matches Section - Modern White & Green */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-green-600 rounded-xl shadow-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Próximas Partidas</h2>
                  <p className="text-sm text-gray-600">Planeje suas apostas e previsões</p>
                </div>
                {upcomingMatches.length > 0 && (
                  <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 ml-4">
                    <Calendar className="w-3 h-3 mr-1" />
                    {upcomingMatches.length} PRÓXIMAS
                  </Badge>
                )}
              </div>
              <Button asChild variant="outline" className="border-green-200 hover:bg-green-50 text-green-700">
                <Link href="/upcoming" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Ver Todas
                </Link>
              </Button>
            </div>
          </div>

          {upcomingMatches.length === 0 ? (
            <Card className="border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-lg">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                    <Calendar className="h-12 w-12 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma Próxima Partida Encontrada</h3>
                  <p className="text-gray-600 mb-6 max-w-md">
                    Nenhuma próxima partida encontrada nos próximos 14 dias. Isso pode ser devido a limites da API ou jogos não programados.
                  </p>
                  <Button onClick={() => window.location.reload()} variant="outline" className="border-green-300 hover:bg-green-50 text-green-700">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar Próximas Partidas
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingMatches.slice(0, 6).map((match) => (
                <CleanMatchCard
                  key={match.id}
                  match={match}
                  variant="upcoming"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
