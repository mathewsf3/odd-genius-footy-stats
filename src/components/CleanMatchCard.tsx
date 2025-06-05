"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Eye,
  Target,
  Zap,
  TrendingUp
} from "lucide-react";
import { Match, Team } from "@/types";
import { formatMatchTime, formatMatchDate, isMatchLive } from "@/lib/api";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useExpectedGoals } from "@/hooks/useTeamStats";
import { useMultipleTeamInfo } from "@/hooks/useTeamInfo";
import { useLiveMatch } from "@/hooks/useLiveMatch";

interface CleanMatchCardProps {
  match: Match;
  variant?: 'live' | 'upcoming' | 'today';
}

export function CleanMatchCard({
  match,
  variant = 'today'
}: CleanMatchCardProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const isLive = isMatchLive(match);
  const matchTime = formatMatchTime(match.date_unix);
  const matchDate = formatMatchDate(match.date_unix);
  const isUpcoming = match.status === 'incomplete' && !isLive;
  const isCompleted = match.status === 'complete';

  // Hook para buscar Expected Goals para partidas upcoming
  // Prioriza IDs se disponíveis (MUITO MAIS EFICIENTE)
  // Agora usa dados REAIS da FootyStats API quando matchId está disponível
  const { totalGoals, homeGoals, awayGoals, confidence, loading } = useExpectedGoals(
    match.home_name || '',
    match.away_name || '',
    match.homeID,
    match.awayID,
    match.id // Passa o matchId para usar dados reais da FootyStats
  );

  // Hook para buscar informações dos times incluindo LOGOS REAIS
  const { teamsInfo, loading: teamsLoading } = useMultipleTeamInfo([
    match.homeID,
    match.awayID
  ]);

  const [homeTeamInfo, awayTeamInfo] = teamsInfo;

  // Hook para dados ao vivo (score e posse de bola reais)
  const live = variant === 'live' && isLive;
  const {
    scoreA,
    scoreB,
    possA,
    possB,
    status: liveStatus,
    minute: liveMinute,
    isLoading: liveLoading
  } = useLiveMatch(match.id, live);







  // Auto-refresh for live matches
  useEffect(() => {
    if (variant === 'live' && isLive) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [variant, isLive]);

  // Get live match time from API or fallback to calculated time
  const getLiveMatchTime = () => {
    if (!isLive) return null;

    // Use real minute from API if available
    if (live && liveMinute && liveMinute > 0) {
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

  // Team Logo Component - Static and Stable (no flickering)
  const TeamLogo = ({ teamName, logoUrl, size = "md" }: { teamName: string; logoUrl?: string; size?: "sm" | "md" | "lg" }) => {

    const sizeClasses = {
      sm: "w-8 h-8 text-xs",
      md: "w-12 h-12 text-sm",
      lg: "w-16 h-16 text-base"
    };

    const getInitials = (name: string): string => {
      if (!name) return '??';
      const words = name.trim().split(/\s+/);
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    };

    const initials = getInitials(teamName);

    // If we have a logo URL, show it directly without state management
    if (logoUrl) {
      return (
        <div className={`${sizeClasses[size]} bg-white rounded-full border-2 border-gray-200 shadow-md flex items-center justify-center overflow-hidden`}>
          <img
            src={logoUrl}
            alt={`${teamName} logo`}
            className="w-full h-full object-contain"
            onError={(e) => {
              // On error, replace with initials fallback
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center text-white font-bold">${initials}</div>`;
              }
            }}
          />
        </div>
      );
    }

    // Fallback to initials if no logo URL
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-md`}>
        {initials}
      </div>
    );
  };

  const homeTeam: Partial<Team> = {
    id: match.homeID,
    name: match.home_name
  };

  const awayTeam: Partial<Team> = {
    id: match.awayID,
    name: match.away_name
  };

  // Status badge - White & Green Theme
  const getStatusBadge = () => {
    if (variant === 'live' && isLive) {
      const liveTime = getLiveMatchTime();
      return (
        <Badge className="bg-red-500 hover:bg-red-600 text-white animate-pulse font-bold shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full animate-ping mr-2"></div>
          {liveTime === "HT" ? "INTERVALO" : liveTime === "FT" ? "FINAL" : `${liveTime}`}
        </Badge>
      );
    }
    if (isCompleted) {
      return <Badge variant="secondary" className="font-bold shadow-sm bg-gray-100 text-gray-700">FINAL</Badge>;
    }
    if (isUpcoming) {
      return <Badge variant="outline" className="font-bold bg-green-50 border-green-200 text-green-700">{matchTime}</Badge>;
    }
    return <Badge variant="outline" className="font-bold bg-gray-50 border-gray-200 text-gray-700">{matchTime}</Badge>;
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] shadow-lg bg-gradient-to-br from-white to-gray-50 border-2 border-green-300 hover:border-green-400 h-full flex flex-col">
      <CardContent className="p-5 flex flex-col h-full">
        {/* Header with League and Status */}
        {variant === 'upcoming' ? (
          <div className="text-center mb-4 space-y-2">
            <div className="text-xs font-semibold px-3 py-1 rounded-full text-green-700 bg-green-50 border border-green-200 inline-block">
              {match.competition_name || match.league_name || match.country || `Temporada ${match.season}`}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <span>{matchDate}</span>
              <span>•</span>
              <span className="font-semibold">{matchTime}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold truncate px-3 py-1 rounded-full text-green-700 bg-green-50 border border-green-200">
              {match.competition_name || match.league_name || match.country || `Temporada ${match.season}`}
            </div>
            {getStatusBadge()}
          </div>
        )}

        {/* Teams and Score */}
        <div className="space-y-3">
          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <TeamLogo
                teamName={homeTeam.name || match.home_name}
                logoUrl={homeTeamInfo?.image || homeTeamInfo?.logo}
                size="sm"
              />

              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{homeTeam.name}</div>
                <div className="text-xs text-muted-foreground">Casa</div>
              </div>
            </div>
            
            {variant === 'live' ? (
              <div className="text-2xl font-bold text-white bg-green-600 px-3 py-2 rounded-lg border-2 border-green-700 min-w-[50px] text-center shadow-lg">
                {live ? scoreA : '0'}
              </div>
            ) : variant === 'upcoming' ? null : (
              <div className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                {matchTime}
              </div>
            )}
          </div>

          {/* VS Divider - Unified Design */}
          <div className="flex items-center justify-center">
            <div className="w-full border-t-2 border-dashed border-gray-300"></div>
            <div className="mx-3 px-3 py-2 rounded-full text-xs font-bold shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
              VS
            </div>
            <div className="w-full border-t-2 border-dashed border-gray-300"></div>
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <TeamLogo
                teamName={awayTeam.name || match.away_name}
                logoUrl={awayTeamInfo?.image || awayTeamInfo?.logo}
                size="sm"
              />

              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{awayTeam.name}</div>
                <div className="text-xs text-muted-foreground">Visitante</div>
              </div>
            </div>
            
            {variant === 'live' ? (
              <div className="text-2xl font-bold text-white bg-green-600 px-3 py-2 rounded-lg border-2 border-green-700 min-w-[50px] text-center shadow-lg">
                {live ? scoreB : '0'}
              </div>
            ) : variant === 'upcoming' ? null : (
              <div className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                {matchDate}
              </div>
            )}
          </div>
        </div>





        {/* Match Stats Info - Different for Live vs Upcoming */}
        {variant === 'live' || match.status === 'complete' ? (
          <div className="flex items-center justify-between text-xs font-medium p-3 rounded-lg mt-4 border-2 text-gray-700 bg-gray-50 border-gray-200">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span>Posse de Bola</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-bold">
                {live && possA !== null ? `${possA}%` : (liveLoading ? '...' : 'N/A')}
              </span>
              <span className="text-gray-400">vs</span>
              <span className="text-green-600 font-bold">
                {live && possB !== null ? `${possB}%` : (liveLoading ? '...' : 'N/A')}
              </span>
              {liveLoading && (
                <div className="w-3 h-3 border border-gray-300 border-t-blue-600 rounded-full animate-spin ml-1"></div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2 mt-4">
            {/* Expected Goals - Formato Compacto */}
            <div className={`flex items-center justify-between text-xs font-medium p-3 rounded-lg border-2 text-gray-700 ${
              totalGoals === 0
                ? 'bg-red-50 border-red-200'
                : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
            }`}>
              <div className="flex items-center gap-2">
                <TrendingUp className={`h-4 w-4 ${totalGoals === 0 ? 'text-red-500' : 'text-purple-500'}`} />
                <span>Gols Esperados</span>
                {loading && <div className="w-3 h-3 border border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>}
              </div>
              <div className="flex items-center gap-2">
                {totalGoals === 0 ? (
                  <span className="text-red-600 font-bold text-xs">SEM DADOS REAIS</span>
                ) : (
                  <>
                    <span className="text-blue-600 font-bold">{homeGoals.toFixed(1)}</span>
                    <span className="text-gray-400">vs</span>
                    <span className="text-green-600 font-bold">{awayGoals.toFixed(1)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Total Expected Goals */}
            {totalGoals > 0 && (
              <div className="flex items-center justify-between text-xs font-medium p-2 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2">
                  <Target className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-600">Total Esperado</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-bold">{totalGoals.toFixed(1)} gols</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    confidence === 'Alta' ? 'bg-green-100 text-green-700' :
                    confidence === 'Média' ? 'bg-yellow-100 text-yellow-700' :
                    confidence === 'Sem Dados' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {confidence}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Button - Unified */}
        <div className="mt-auto pt-4">
          <Button asChild size="sm" className="w-full bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white shadow-lg font-semibold transition-all duration-200">
            <Link href={`/match/${match.id}`} className="flex items-center justify-center gap-2 w-full">
              <Target className="h-4 w-4" />
              <span className="text-sm">Analisar</span>
            </Link>
          </Button>
        </div>


      </CardContent>
    </Card>
  );
}
