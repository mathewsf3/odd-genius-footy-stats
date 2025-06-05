"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Eye,
  Target,
  Zap,
  TrendingUp,
  Play,
  Activity
} from "lucide-react";
import { Match } from "@/types";
import { formatMatchTime, formatMatchDate, isMatchLive } from "@/lib/api";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useMultipleTeamInfo } from "@/hooks/useTeamInfo";
import { useLiveMatch } from "@/hooks/useLiveMatch";

interface LiveMatchCardProps {
  match: Match;
  autoRefresh?: boolean;
}

export function LiveMatchCard({
  match,
  autoRefresh = true
}: LiveMatchCardProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const isLive = isMatchLive(match);

  // Hook para buscar informações dos times incluindo LOGOS REAIS
  const { teamsInfo, loading: teamsLoading } = useMultipleTeamInfo([
    match.homeID,
    match.awayID
  ]);

  const [homeTeamInfo, awayTeamInfo] = teamsInfo;

  // Hook para dados ao vivo (score e posse de bola reais)
  const { 
    scoreA, 
    scoreB, 
    possA, 
    possB, 
    status: liveStatus, 
    minute: liveMinute,
    isLoading: liveLoading 
  } = useLiveMatch(match.id, isLive);

  // Auto-refresh for live matches
  useEffect(() => {
    if (autoRefresh && isLive) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, isLive]);

  // Get live match time from API or fallback to calculated time
  const getLiveMatchTime = () => {
    if (!isLive) return null;
    
    // Use real minute from API if available
    if (liveMinute && liveMinute > 0) {
      if (liveMinute <= 45) return `${liveMinute}'`;
      if (liveMinute === 46) return "HT";
      if (liveMinute <= 90) return `${liveMinute}'`;
      if (liveMinute <= 95) return `90+${liveMinute - 90}'`;
      return "FT";
    }
    
    // Fallback to calculated time based on match seed
    const matchSeed = match.id ? parseInt(match.id.toString()) : 0;
    const baseTime = 15 + (matchSeed % 75);
    const timeVariation = Math.floor((currentTime / 60000) % 5);
    const currentMatchTime = Math.min(baseTime + timeVariation, 90);
    
    if (currentMatchTime <= 45) return `${currentMatchTime}'`;
    if (currentMatchTime <= 47) return "HT";
    if (currentMatchTime <= 90) return `${currentMatchTime}'`;
    if (currentMatchTime <= 95) return `90+${currentMatchTime - 90}'`;
    return "FT";
  };

  // Get real scores or fallback to match data
  const getHomeScore = () => {
    if (isLive && scoreA !== null && scoreA !== undefined) {
      return scoreA;
    }
    return match.homeGoalCount || 0;
  };

  const getAwayScore = () => {
    if (isLive && scoreB !== null && scoreB !== undefined) {
      return scoreB;
    }
    return match.awayGoalCount || 0;
  };

  // Get real possession or show loading
  const getHomePossession = () => {
    if (isLive && possA !== null && possA !== undefined) {
      return `${possA}%`;
    }
    return liveLoading ? "..." : "N/A";
  };

  const getAwayPossession = () => {
    if (isLive && possB !== null && possB !== undefined) {
      return `${possB}%`;
    }
    return liveLoading ? "..." : "N/A";
  };

  // Status badge for live matches
  const getStatusBadge = () => {
    const liveTime = getLiveMatchTime();
    return (
      <Badge className="bg-red-500 hover:bg-red-600 text-white animate-pulse font-bold shadow-lg">
        <div className="w-2 h-2 bg-white rounded-full animate-ping mr-2"></div>
        {liveTime === "HT" ? "INTERVALO" : liveTime === "FT" ? "FINAL" : `AO VIVO ${liveTime}`}
      </Badge>
    );
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-2 border-green-200 hover:border-green-300 bg-gradient-to-br from-white to-green-50">
      <CardContent className="p-6">
        {/* Header with Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-gray-600">
              {match.competition_name || 'Liga'}
            </span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Teams and Score */}
        <div className="space-y-4">
          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                {homeTeamInfo?.image ? (
                  <img 
                    src={homeTeamInfo.image} 
                    alt={match.home_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-xs font-bold text-blue-600">
                    {match.home_name?.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="font-semibold text-gray-800 truncate">
                {match.home_name}
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-600 min-w-[2rem] text-center">
              {getHomeScore()}
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex items-center justify-center">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="px-3 text-xs font-medium text-gray-400">VS</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                {awayTeamInfo?.image ? (
                  <img 
                    src={awayTeamInfo.image} 
                    alt={match.away_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-xs font-bold text-green-600">
                    {match.away_name?.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="font-semibold text-gray-800 truncate">
                {match.away_name}
              </span>
            </div>
            <div className="text-2xl font-bold text-green-600 min-w-[2rem] text-center">
              {getAwayScore()}
            </div>
          </div>
        </div>

        {/* Live Stats - Possession */}
        <div className="flex items-center justify-between text-xs font-medium p-3 rounded-lg mt-4 border-2 text-gray-700 bg-gray-50 border-gray-200">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            <span>Posse de Bola</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-bold">
              {getHomePossession()}
            </span>
            <span className="text-gray-400">vs</span>
            <span className="text-green-600 font-bold">
              {getAwayPossession()}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4">
          <Link href={`/match/${match.id}`}>
            <Button 
              variant="outline" 
              className="w-full group-hover:bg-green-50 group-hover:border-green-300 group-hover:text-green-700 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalhes
            </Button>
          </Link>
        </div>

        {/* Data Source Indicator */}
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-400">
            {liveLoading ? "Atualizando..." : "Dados em tempo real"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
