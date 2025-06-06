'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Calendar, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import StandardMatchCard from '@/components/StandardMatchCard';

interface MatchData {
  id: number;
  homeName: string;
  awayName: string;
  homeGoals?: number;
  awayGoals?: number;
  minute?: number | null;
  status: string;
  kickOff: string;
  homeImage?: string;
  awayImage?: string;
  competition?: string;
  stadium?: string;
  possession?: {
    home: number | null;
    away: number | null;
  };
  expectedGoals?: {
    total: number | null;
    btts: number | null;
    over25: number | null;
  };
}

export default function Home() {
  const [liveMatches, setLiveMatches] = useState<MatchData[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<MatchData[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  // Fetch live matches
  const fetchLiveMatches = async () => {
    try {
      const response = await fetch('/api/live-matches');
      const data = await response.json();
      
      if (data.success) {
        setLiveMatches(data.data || []);
        setIsOnline(true);
      }
    } catch (error) {
      console.error('Error fetching live matches:', error);
      setIsOnline(false);
    }
  };

  // Fetch upcoming matches
  const fetchUpcomingMatches = async () => {
    try {
      const response = await fetch('/api/upcoming-matches');
      const data = await response.json();
      
      if (data.success) {
        setUpcomingMatches(data.data || []);
        setIsOnline(true);
      }
    } catch (error) {
      console.error('Error fetching upcoming matches:', error);
      setIsOnline(false);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchLiveMatches(), fetchUpcomingMatches()]);
      setLastUpdate(new Date());
      setLoading(false);
    };

    loadData();
  }, []);

  // Auto-refresh live matches every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLiveMatches();
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Auto-refresh upcoming matches every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUpcomingMatches();
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([fetchLiveMatches(), fetchUpcomingMatches()]);
    setLastUpdate(new Date());
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard de Futebol</h1>
            <p className="text-gray-600 mt-1">
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center">
              {isOnline ? <Wifi className="w-4 h-4 mr-1" /> : <WifiOff className="w-4 h-4 mr-1" />}
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partidas ao Vivo</CardTitle>
              <Activity className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveMatches.length}</div>
              <p className="text-xs text-muted-foreground">Acontecendo agora</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximas Partidas</CardTitle>
              <Calendar className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingMatches.length}</div>
              <p className="text-xs text-muted-foreground">Próximos 3-14 dias</p>
            </CardContent>
          </Card>
        </div>

        {/* Live Matches Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-red-500" />
              <span>Partidas ao Vivo</span>
              <Badge variant="destructive" className="animate-pulse">
                {liveMatches.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            ) : liveMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {liveMatches.map((match) => (
                  <StandardMatchCard key={match.id} {...match} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhuma partida ao vivo no momento
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Matches Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-green-500" />
              <span>Próximas Partidas</span>
              <Badge variant="outline" className="text-green-600 border-green-600">
                {upcomingMatches.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            ) : upcomingMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingMatches.slice(0, 12).map((match) => (
                  <StandardMatchCard key={match.id} {...match} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhuma partida programada para os próximos dias
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
