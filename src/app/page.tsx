"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LiveMatches } from "@/components/LiveMatches";
import { UpcomingMatches } from "@/components/UpcomingMatches";
import { DataStatus } from "@/components/DataStatus";
import { DataIntegrityDashboard } from "@/components/DataIntegrityDashboard";
import { DataQualityFilters, QualityFilters } from "@/components/DataQualityFilters";
import { DataAlerts } from "@/components/DataAlerts";
import { ValidationSummary } from "@/components/ValidationSummary";
import { Match } from "@/types";
import { Play, Clock, Target, Loader2, Calendar, Eye, RefreshCw, Wifi } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [dashboardStats, setDashboardStats] = useState({
    liveCount: 0,
    todayCount: 0,
    upcomingCount: 0,
    systemStatus: 'online'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [qualityFilters, setQualityFilters] = useState<QualityFilters>({
    onlyVerified: true,
    hideUnverified: false,
    dataSource: 'all',
    minQualityScore: 80,
    showTestData: false
  });

  const fetchDashboardStats = async () => {
    try {
      setError(null);
      
      // Fetch dashboard statistics
      const [liveResponse, upcomingResponse] = await Promise.all([
        fetch('/api/matches/live'),
        fetch('/api/matches/upcoming')
      ]);

      const [liveData, upcomingData] = await Promise.all([
        liveResponse.json(),
        upcomingResponse.json()
      ]);

      setDashboardStats({
        liveCount: liveData.success ? liveData.count || 0 : 0,
        todayCount: upcomingData.success ? upcomingData.todayMatches?.length || 0 : 0,
        upcomingCount: upcomingData.success ? upcomingData.count || 0 : 0,
        systemStatus: 'online'
      });

      setLastUpdate(new Date());
      console.log('📊 Dashboard stats updated:', {
        live: liveData.count,
        today: upcomingData.todayMatches?.length,
        upcoming: upcomingData.count
      });

    } catch (err) {
      console.error('❌ Erro ao buscar estatísticas do dashboard:', err);
      setError('Falha ao carregar estatísticas do dashboard');
      setDashboardStats(prev => ({ ...prev, systemStatus: 'offline' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    
    // Update stats every 2 minutes
    const interval = setInterval(fetchDashboardStats, 120000);
    return () => clearInterval(interval);
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
            <CardTitle className="text-destructive">Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
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
        <Card className="border-0 bg-gradient-to-br from-white to-red-50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 mb-1">Ao Vivo</p>
                <div className="text-3xl font-bold text-gray-900">{dashboardStats.liveCount}</div>
                <p className="text-xs text-gray-500 mt-1">Acontecendo agora</p>
              </div>
              <div className="p-3 bg-red-500 rounded-full">
                <Play className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-white to-blue-50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Hoje</p>
                <div className="text-3xl font-bold text-gray-900">{dashboardStats.todayCount}</div>
                <p className="text-xs text-gray-500 mt-1">Programadas</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
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
                <div className="text-3xl font-bold text-gray-900">{dashboardStats.upcomingCount}</div>
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
                <div className={`text-3xl font-bold ${dashboardStats.systemStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                  {dashboardStats.systemStatus === 'online' ? '●' : '●'}
                </div>
                <p className="text-xs text-gray-500 mt-1 capitalize">{dashboardStats.systemStatus}</p>
              </div>
              <div className="p-3 bg-gray-600 rounded-full">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Status and Integrity Dashboard */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DataStatus
            lastUpdate={lastUpdate}
            source="FootyStats API"
            isLive={dashboardStats.liveCount > 0}
            systemStatus={dashboardStats.systemStatus as 'online' | 'offline' | 'degraded'}
            onRefresh={fetchDashboardStats}
          />
        </div>
        <div>
          <DataIntegrityDashboard
            onRefresh={fetchDashboardStats}
          />
        </div>
      </div>

      {/* Validation Summary and Alerts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ValidationSummary />
        <DataAlerts maxAlerts={3} />
      </div>

      {/* System Status */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
        <div className="flex items-center gap-3">
          <Wifi className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-gray-900">Sistema Online</p>
            <p className="text-sm text-gray-600">
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              })}
            </p>
          </div>
        </div>
        <Button 
          onClick={fetchDashboardStats} 
          variant="outline" 
          size="sm"
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

      {/* Main Dashboard Content */}
      <div className="space-y-10">
        {/* Quality Filters */}
        <DataQualityFilters
          onFiltersChange={setQualityFilters}
          className="lg:col-span-2"
        />

        {/* Live Matches Section */}
        <LiveMatches 
          maxMatches={6}
          autoRefresh={true}
          refreshInterval={30000} // 30 seconds
        />

        {/* Upcoming Matches Section */}
        <UpcomingMatches 
          maxMatches={6}
          showTodayOnly={true}
          autoRefresh={true}
          refreshInterval={60000} // 1 minute
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button asChild variant="outline" className="h-16 border-red-200 hover:bg-red-50 text-red-700">
          <Link href="/live" className="flex flex-col items-center gap-2">
            <Play className="h-5 w-5" />
            <span className="text-sm font-medium">Ver Todas ao Vivo</span>
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="h-16 border-green-200 hover:bg-green-50 text-green-700">
          <Link href="/upcoming" className="flex flex-col items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span className="text-sm font-medium">Próximas Partidas</span>
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="h-16 border-blue-200 hover:bg-blue-50 text-blue-700">
          <Link href="/leagues" className="flex flex-col items-center gap-2">
            <Target className="h-5 w-5" />
            <span className="text-sm font-medium">Ligas</span>
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="h-16 border-gray-200 hover:bg-gray-50 text-gray-700">
          <Link href="/statistics" className="flex flex-col items-center gap-2">
            <Eye className="h-5 w-5" />
            <span className="text-sm font-medium">Estatísticas</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
