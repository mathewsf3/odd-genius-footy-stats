"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Match } from "@/types";
import { 
  Play, 
  Clock, 
  Calendar, 
  Timer,
  MapPin,
  TrendingUp,
  Target,
  Activity,
  CheckCircle,
  Shield,
  Database
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface MatchCardProps {
  match: Match;
  variant?: 'live' | 'upcoming' | 'today';
  showCountdown?: boolean;
  showVerification?: boolean;
  isVerified?: boolean;
  dataSource?: string;
}

export function MatchCard({
  match,
  variant = 'today',
  showCountdown = false
}: MatchCardProps) {
  const [homeLogoError, setHomeLogoError] = useState(false);
  const [awayLogoError, setAwayLogoError] = useState(false);

  // Determine if match is live
  const isLive = variant === 'live' || 
                match.status === 'live' || 
                match.status === 'inprogress' || 
                match.status === 'playing';

  // Get match status
  const getMatchStatus = () => {
    if (isLive) {
      return {
        text: match.minute && match.minute > 0 ? `${match.minute}'` : 'AO VIVO',
        color: 'bg-red-500 text-white animate-pulse',
        icon: <Play className="w-3 h-3" />
      };
    }
    
    if (variant === 'upcoming') {
      const matchTime = new Date(match.date_unix * 1000);
      return {
        text: matchTime.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        color: 'bg-green-500 text-white',
        icon: <Clock className="w-3 h-3" />
      };
    }
    
    return {
      text: 'PROGRAMADO',
      color: 'bg-blue-500 text-white',
      icon: <Calendar className="w-3 h-3" />
    };
  };

  // Calculate countdown for upcoming matches
  const getCountdown = () => {
    if (!showCountdown || !match.date_unix) return null;
    
    const now = Date.now();
    const matchTime = match.date_unix * 1000;
    const diff = matchTime - now;

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

  const status = getMatchStatus();
  const countdown = getCountdown();

  // Format team names
  const homeTeam = match.home_name || match.home_team?.name || 'Time Casa';
  const awayTeam = match.away_name || match.away_team?.name || 'Time Visitante';

  // Get scores
  const homeScore = match.homeGoalCount ?? match.team_a_score ?? 0;
  const awayScore = match.awayGoalCount ?? match.team_b_score ?? 0;

  // Get league info
  const leagueName = match.competition_name || match.league?.name || 'Liga';

  return (
    <Link href={`/match/${match.id}`}>
      <Card className="hover:shadow-lg transition-all duration-300 border-gray-200 bg-white cursor-pointer group">
        <CardContent className="p-6">
          {/* Header with league and status */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 truncate">{leagueName}</span>
            </div>
            <Badge className={`${status.color} text-xs flex items-center gap-1`}>
              {status.icon}
              {status.text}
            </Badge>
          </div>

          {/* Teams and Score */}
          <div className="space-y-4">
            {/* Home Team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-600">
                    {homeTeam.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <span className="font-semibold text-gray-900 truncate">{homeTeam}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 ml-2">
                {isLive || match.status === 'complete' ? homeScore : '-'}
              </div>
            </div>

            {/* VS Divider */}
            <div className="flex items-center justify-center">
              <div className="w-full h-px bg-gray-200"></div>
              <span className="px-3 text-xs text-gray-500 bg-white">VS</span>
              <div className="w-full h-px bg-gray-200"></div>
            </div>

            {/* Away Team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-600">
                    {awayTeam.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <span className="font-semibold text-gray-900 truncate">{awayTeam}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 ml-2">
                {isLive || match.status === 'complete' ? awayScore : '-'}
              </div>
            </div>
          </div>

          {/* Match Info */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                {/* Date/Time */}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(match.date_unix * 1000).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit'
                    })}
                  </span>
                </div>

                {/* Countdown for upcoming matches */}
                {countdown && (
                  <div className="flex items-center gap-1 text-green-600 font-medium">
                    <Timer className="h-3 w-3" />
                    <span>{countdown}</span>
                  </div>
                )}
              </div>

              {/* Live stats */}
              {isLive && (
                <div className="flex items-center gap-3">
                  {match.team_a_possession && match.team_b_possession && (
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      <span>{match.team_a_possession}% - {match.team_b_possession}%</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Hover effect indicator */}
          <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex items-center justify-center text-xs text-gray-500">
              <Target className="h-3 w-3 mr-1" />
              Clique para ver detalhes
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
