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
  Users,
  MapPin
} from "lucide-react";
import { Match, Team } from "@/types";
import { formatMatchTime, formatMatchDate, isMatchLive } from "@/lib/api";
import Link from "next/link";
import { useState, useEffect } from "react";

interface CleanMatchCardProps {
  match: Match;
  variant?: 'live' | 'upcoming' | 'today';
  showPredictions?: boolean;
}

export function CleanMatchCard({ 
  match, 
  variant = 'today',
  showPredictions = true 
}: CleanMatchCardProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const isLive = isMatchLive(match);
  const matchTime = formatMatchTime(match.date_unix);
  const matchDate = formatMatchDate(match.date_unix);
  const isUpcoming = match.status === 'incomplete' && !isLive;
  const isCompleted = match.status === 'complete';

  // Auto-refresh for live matches
  useEffect(() => {
    if (variant === 'live' && isLive) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [variant, isLive]);

  // Get live match time
  const getLiveMatchTime = () => {
    if (!isLive) return null;
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

  const homeTeam: Team = {
    id: match.homeID,
    name: match.home_name,
    venue: match.stadium_name
  };

  const awayTeam: Team = {
    id: match.awayID,
    name: match.away_name,
    venue: match.stadium_name
  };

  // Status badge - White & Green Theme
  const getStatusBadge = () => {
    if (variant === 'live' && isLive) {
      const liveTime = getLiveMatchTime();
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white animate-pulse font-bold shadow-lg">
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
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] shadow-lg ${
      variant === 'live' ? 'bg-gradient-to-br from-green-50 to-white border-2 border-green-200' :
      variant === 'upcoming' ? 'bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200' :
      'bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200'
    }`}>
      <CardContent className="p-5">
        {/* Header with League and Status */}
        <div className="flex items-center justify-between mb-4">
          <div className={`text-xs font-semibold truncate px-3 py-1 rounded-full ${
            variant === 'live' ? 'text-green-700 bg-green-100 border border-green-200' :
            variant === 'upcoming' ? 'text-blue-700 bg-blue-100 border border-blue-200' :
            'text-gray-700 bg-gray-100 border border-gray-200'
          }`}>
            {match.competition_name || 'Liga Desconhecida'}
          </div>
          {getStatusBadge()}
        </div>

        {/* Teams and Score */}
        <div className="space-y-3">
          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <TeamLogo
                teamName={homeTeam.name}
                logoUrl={(match as any).homeTeam?.logo}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{homeTeam.name}</div>
                <div className="text-xs text-muted-foreground">Casa</div>
              </div>
            </div>
            
            {variant === 'live' ? (
              <div className="text-2xl font-bold text-white bg-green-600 px-3 py-2 rounded-lg border-2 border-green-700 min-w-[50px] text-center shadow-lg">
                {match.homeGoalCount >= 0 ? match.homeGoalCount : '0'}
              </div>
            ) : variant === 'upcoming' ? (
              <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                {matchTime}
              </div>
            ) : (
              <div className="text-xl font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded min-w-[40px] text-center border border-gray-300">
                {match.homeGoalCount >= 0 ? match.homeGoalCount : '-'}
              </div>
            )}
          </div>

          {/* VS Divider - Enhanced with Better Contrast */}
          <div className="flex items-center justify-center">
            <div className={`w-full border-t-2 border-dashed ${
              variant === 'live' ? 'border-green-300' :
              variant === 'upcoming' ? 'border-blue-300' :
              'border-gray-300'
            }`}></div>
            <div className={`mx-3 px-3 py-2 rounded-full text-xs font-bold shadow-lg ${
              variant === 'live' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' :
              variant === 'upcoming' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
              'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
            }`}>
              VS
            </div>
            <div className={`w-full border-t-2 border-dashed ${
              variant === 'live' ? 'border-green-300' :
              variant === 'upcoming' ? 'border-blue-300' :
              'border-gray-300'
            }`}></div>
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <TeamLogo
                teamName={awayTeam.name}
                logoUrl={(match as any).awayTeam?.logo}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{awayTeam.name}</div>
                <div className="text-xs text-muted-foreground">Visitante</div>
              </div>
            </div>
            
            {variant === 'live' ? (
              <div className="text-2xl font-bold text-white bg-green-600 px-3 py-2 rounded-lg border-2 border-green-700 min-w-[50px] text-center shadow-lg">
                {match.awayGoalCount >= 0 ? match.awayGoalCount : '0'}
              </div>
            ) : variant === 'upcoming' ? (
              <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                {matchDate}
              </div>
            ) : (
              <div className="text-xl font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded min-w-[40px] text-center border border-gray-300">
                {match.awayGoalCount >= 0 ? match.awayGoalCount : '-'}
              </div>
            )}
          </div>
        </div>



        {/* Predictions for Upcoming - Enhanced Design */}
        {variant === 'upcoming' && showPredictions && (
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t-2 border-blue-200">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border-2 border-green-200 shadow-sm">
              <div className="flex items-center gap-1 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-xs font-semibold text-green-700">+2.5 Gols</span>
              </div>
              <div className="text-lg font-bold text-green-700">
                {((match.o25_potential || 0) * 100).toFixed(0)}%
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border-2 border-blue-200 shadow-sm">
              <div className="flex items-center gap-1 mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700">Ambos Marcam</span>
              </div>
              <div className="text-lg font-bold text-blue-700">
                {((match.btts_potential || 0) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        )}

        {/* Stadium Info - Enhanced */}
        {match.stadium_name && (
          <div className={`flex items-center gap-2 text-xs font-medium p-3 rounded-lg mt-4 border-2 ${
            variant === 'live' ? 'text-green-700 bg-green-50 border-green-200' :
            variant === 'upcoming' ? 'text-blue-700 bg-blue-50 border-blue-200' :
            'text-gray-700 bg-gray-50 border-gray-200'
          }`}>
            <MapPin className="h-4 w-4" />
            <span className="truncate">{match.stadium_name}</span>
          </div>
        )}

        {/* Action Buttons - Unified Design */}
        <div className="flex gap-3 mt-5">
          <Button asChild size="sm" className="flex-1 bg-gradient-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900 text-white shadow-lg font-semibold transition-all duration-200">
            <Link href={`/match/${match.id}`} className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="text-sm">Analisar</span>
            </Link>
          </Button>
          {variant === 'upcoming' && (
            <Button size="sm" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg font-semibold">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Dicas</span>
            </Button>
          )}
        </div>


      </CardContent>
    </Card>
  );
}
