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
import React, { useState } from "react";

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
  showCountdown = false,
  showVerification = true,
  isVerified = true,
  dataSource = "FootyStats"
}: MatchCardProps) {
  const [homeLogoError, setHomeLogoError] = useState(false);
  const [awayLogoError, setAwayLogoError] = useState(false);

  // Determine if match is live
  const isLive = variant === 'live' || 
                match.status === 'live';

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
        color: 'bg-blue-500 text-white',
        icon: <Clock className="w-3 h-3" />
      };
    }
    
    return {
      text: 'Encerrado',
      color: 'bg-gray-500 text-white',
      icon: <Calendar className="w-3 h-3" />
    };
  };

  // Get scores
  const homeScore = match.homeGoalCount ?? 0;
  const awayScore = match.awayGoalCount ?? 0;

  // Get league info
  const leagueName = match.competition_name || match.league_name || 'Liga';

  // Get verification badge
  const getVerificationBadge = () => {
    if (!showVerification) return null;
    
    if (isVerified) {
      return (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle className="w-3 h-3" />
          <span className="font-medium">Verificado</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-1 text-xs text-yellow-600">
        <Shield className="w-3 h-3" />
        <span className="font-medium">Não Verificado</span>
      </div>
    );
  };

  const status = getMatchStatus();

  return (
    <Link href={`/match/${match.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500 hover:border-l-blue-600">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header with status and verification */}
            <div className="flex items-center justify-between">
              <Badge 
                className={`${status.color} flex items-center gap-1 text-xs px-2 py-1`}
              >
                {status.icon}
                {status.text}
              </Badge>
              
              <div className="flex items-center gap-2">
                {getVerificationBadge()}
                {showVerification && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Database className="w-3 h-3" />
                    <span>{dataSource}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Teams and Score */}
            <div className="flex items-center justify-between">
              {/* Home Team */}
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 flex-shrink-0">
                  {!homeLogoError ? (
                    <img
                      src={match.home_image}
                      alt={match.home_name}
                      className="w-full h-full object-contain"
                      onError={() => setHomeLogoError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-500">
                        {match.home_name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{match.home_name}</p>
                </div>
              </div>

              {/* Score */}
              <div className="flex items-center gap-2 px-4">
                {isLive || variant === 'today' ? (
                  <>
                    <span className="text-xl font-bold">{homeScore}</span>
                    <span className="text-muted-foreground">-</span>
                    <span className="text-xl font-bold">{awayScore}</span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">vs</span>
                )}
              </div>

              {/* Away Team */}
              <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="min-w-0 flex-1 text-right">
                  <p className="font-semibold text-sm truncate">{match.away_name}</p>
                </div>
                <div className="w-8 h-8 flex-shrink-0">
                  {!awayLogoError ? (
                    <img
                      src={match.away_image}
                      alt={match.away_name}
                      className="w-full h-full object-contain"
                      onError={() => setAwayLogoError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-500">
                        {match.away_name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Match Info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="font-medium">{leagueName}</span>
                {match.stadium_name && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{match.stadium_name}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Match ID for verification */}
                <span className="text-xs text-muted-foreground">
                  ID: {match.id}
                </span>
                
                {/* Live stats indicator */}
                {isLive && (
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-red-500" />
                    <span className="text-red-600 font-medium">LIVE</span>
                  </div>
                )}
              </div>
            </div>

            {/* Additional live stats for live matches */}
            {isLive && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-2">
                {match.team_a_possession > 0 && (
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    <span>Posse: {match.team_a_possession}% - {match.team_b_possession}%</span>
                  </div>
                )}
                {(match.team_a_shots > 0 || match.team_b_shots > 0) && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Chutes: {match.team_a_shots} - {match.team_b_shots}</span>
                  </div>
                )}
              </div>
            )}

            {/* Countdown for upcoming matches */}
            {showCountdown && variant === 'upcoming' && (
              <div className="border-t pt-2">
                <div className="flex items-center gap-2 text-sm">
                  <Timer className="w-4 h-4 text-blue-500" />
                  <span className="text-muted-foreground">
                    Começa em: <CountdownTimer targetDate={new Date(match.date_unix * 1000)} />
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Simple countdown component
function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  React.useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`);
        } else if (minutes > 0) {
          setTimeLeft(`${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${seconds}s`);
        }
      } else {
        setTimeLeft("Começou!");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return <span className="font-medium text-blue-600">{timeLeft}</span>;
}
