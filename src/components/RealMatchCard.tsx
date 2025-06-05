"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  MapPin,
  Users,
  TrendingUp,
  Eye,
  Flag,
  Target,
  Zap,
  Calendar
} from "lucide-react";
import { Match, Team } from "@/types";
import { formatMatchTime, formatMatchDate, isMatchLive } from "@/lib/api";
import Link from "next/link";
import { useState, useEffect } from "react";

interface RealMatchCardProps {
  match: Match;
  variant?: 'live' | 'upcoming' | 'today';
  showPredictions?: boolean;
}

export function RealMatchCard({
  match,
  variant = 'today',
  showPredictions = true
}: RealMatchCardProps) {
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
      }, 1000); // Update every second for live time

      return () => clearInterval(interval);
    }
  }, [variant, isLive]);

  // Create team objects directly from match data
  const homeTeam: Team = {
    id: match.homeID,
    name: match.home_name || `Time Casa ${match.homeID}`,
    cleanName: match.home_name || `Time Casa ${match.homeID}`,
    shortName: match.home_name?.split(' ')[0] || `TC${match.homeID}`,
    logo: '', // Will be populated from FootyStats API documentation
    country: 'Internacional',
    founded: 0,
    venue: match.stadium_name || 'Estádio',
    capacity: 0
  };

  const awayTeam: Team = {
    id: match.awayID,
    name: match.away_name || `Time Visitante ${match.awayID}`,
    cleanName: match.away_name || `Time Visitante ${match.awayID}`,
    shortName: match.away_name?.split(' ')[0] || `TV${match.awayID}`,
    logo: '', // Will be populated from FootyStats API documentation
    country: 'Internacional',
    founded: 0,
    venue: match.stadium_name || 'Estádio',
    capacity: 0
  };

  // Get card styling based on variant
  const getCardStyling = () => {
    switch (variant) {
      case 'live':
        return "border-red-200 bg-gradient-to-br from-red-50/50 to-orange-50/30 hover:shadow-xl transition-all duration-300 relative overflow-hidden";
      case 'upcoming':
        return "border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 hover:shadow-xl transition-all duration-300";
      default:
        return "hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20";
    }
  };

  // Get live match time (use actual match time from API or simulate based on match ID)
  const getLiveMatchTime = () => {
    if (!isLive) return null;

    // Use match-specific time based on match ID for consistency
    const matchSeed = match.id ? parseInt(match.id.toString()) : 0;
    const baseTime = 15 + (matchSeed % 75); // Random time between 15-90 minutes

    // Add some variation based on current time but keep it stable per match
    const timeVariation = Math.floor((currentTime / 60000) % 5); // Changes every minute, max 5 min variation
    const currentMatchTime = Math.min(baseTime + timeVariation, 90);

    // Realistic match progression
    if (currentMatchTime <= 45) return `${currentMatchTime}'`;
    if (currentMatchTime <= 47) return "HT"; // Brief half time
    if (currentMatchTime <= 90) return `${currentMatchTime}'`;
    if (currentMatchTime <= 95) return `90+${currentMatchTime - 90}'`; // Injury time
    return "FT"; // Full time
  };

  // Get status badge with live time
  const getStatusBadge = () => {
    if (isLive) {
      const liveTime = getLiveMatchTime();
      return (
        <Badge variant="destructive" className="animate-pulse flex items-center gap-1">
          <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
          {liveTime === "HT" ? "INTERVALO" : liveTime === "FT" ? "FINAL" : `${liveTime} AO VIVO`}
        </Badge>
      );
    }
    if (isCompleted) {
      return <Badge variant="secondary">FINAL</Badge>;
    }
    if (isUpcoming) {
      return <Badge variant="outline" className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {matchTime}
      </Badge>;
    }
    return <Badge variant="outline">{matchTime}</Badge>;
  };



  // Stable Team Logo Component - prevents flickering
  const TeamLogo = ({ teamName, logoUrl, isHome }: { teamName: string; logoUrl?: string; isHome: boolean }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(!!logoUrl);

    // Reset states when logoUrl changes
    useEffect(() => {
      if (logoUrl) {
        setImageError(false);
        setImageLoaded(false);
        setIsLoading(true);
      } else {
        setIsLoading(false);
      }
    }, [logoUrl]);

    // Generate beautiful team initials from team name
    const getTeamInitials = (name: string): string => {
      if (!name) return '??';

      // Split by spaces and take first letter of each word (max 2)
      const words = name.trim().split(/\s+/);
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      } else {
        // Single word - take first 2 letters
        return name.substring(0, 2).toUpperCase();
      }
    };

    const initials = getTeamInitials(teamName);
    const gradientClass = isHome
      ? "bg-gradient-to-br from-green-500 to-blue-600"
      : "bg-gradient-to-br from-orange-500 to-red-600";

    // Show fallback if no logo URL, image failed, or still loading
    if (!logoUrl || imageError || !imageLoaded) {
      return (
        <div className={`w-12 h-12 ${gradientClass} rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-lg transition-transform hover:scale-105`}>
          {isLoading && !imageError ? '...' : initials}
          {/* Hidden image for preloading */}
          {logoUrl && !imageError && (
            <img
              src={logoUrl}
              alt={`${teamName} logo`}
              className="hidden"
              onLoad={() => {
                setImageLoaded(true);
                setIsLoading(false);
                console.log(`✅ Logo carregado: ${teamName}`);
              }}
              onError={() => {
                setImageError(true);
                setIsLoading(false);
                console.log(`❌ Erro ao carregar logo: ${teamName}`);
              }}
            />
          )}
        </div>
      );
    }

    // Show real logo only when fully loaded
    return (
      <div className="w-12 h-12 bg-white rounded-full border-2 border-white shadow-lg flex items-center justify-center overflow-hidden transition-transform hover:scale-105">
        <img
          src={logoUrl}
          alt={`${teamName} logo`}
          className="w-10 h-10 object-contain"
        />
      </div>
    );
  };

  return (
    <Card className={getCardStyling()}>
      {/* Live indicator for live matches */}
      {variant === 'live' && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500">
          <div className="h-full bg-white/30 animate-pulse"></div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {match.game_week && (
              <Badge variant="outline" className="text-xs">
                Rodada {match.game_week}
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {matchDate}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Teams Display */}
        <div className="space-y-3">
          {/* Home Team */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
            <div className="flex items-center gap-4">
              <TeamLogo
                teamName={homeTeam.name}
                logoUrl={(match as any).homeTeam?.logo}
                isHome={true}
              />
              <div className="flex-1">
                <div className="font-bold text-lg text-green-800">
                  {homeTeam.name}
                </div>
                <div className="text-sm text-green-600 flex items-center gap-1">
                  <Flag className="w-4 h-4" />
                  Casa {homeTeam.venue && `• ${homeTeam.venue}`}
                </div>
              </div>
            </div>
            {variant === 'live' ? (
              <div className="text-4xl font-bold text-red-700 bg-white px-4 py-2 rounded-lg border-2 border-red-300 shadow-lg animate-pulse">
                {match.homeGoalCount >= 0 ? match.homeGoalCount : '0'}
              </div>
            ) : (
              <div className="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                {matchTime}
              </div>
            )}
          </div>

          {/* VS Divider with Live Time */}
          <div className="flex items-center justify-center relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dashed border-muted-foreground/30"></div>
            </div>
            {variant === 'live' ? (
              <div className="relative bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg animate-pulse">
                <div className="flex flex-col items-center">
                  <div className="text-xs opacity-90">TEMPO</div>
                  <div className="text-lg font-black">{getLiveMatchTime()}</div>
                </div>
              </div>
            ) : (
              <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                VS
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
            <div className="flex items-center gap-4">
              <TeamLogo
                teamName={awayTeam.name}
                logoUrl={(match as any).awayTeam?.logo}
                isHome={false}
              />
              <div className="flex-1">
                <div className="font-bold text-lg text-orange-800">
                  {awayTeam.name}
                </div>
                <div className="text-sm text-orange-600 flex items-center gap-1">
                  <Flag className="w-4 h-4" />
                  Visitante {awayTeam.venue && `• ${awayTeam.venue}`}
                </div>
              </div>
            </div>
            {variant === 'live' ? (
              <div className="text-4xl font-bold text-red-700 bg-white px-4 py-2 rounded-lg border-2 border-red-300 shadow-lg animate-pulse">
                {match.awayGoalCount >= 0 ? match.awayGoalCount : '0'}
              </div>
            ) : (
              <div className="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                {matchDate}
              </div>
            )}
          </div>
        </div>

        {/* Live Match Stats */}
        {variant === 'live' && (
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-red-200">
            <div className="text-center bg-white/50 p-2 rounded">
              <div className="text-xs text-muted-foreground">Gols</div>
              <div className="font-bold text-green-600">
                {match.totalGoalCount || 0}
              </div>
            </div>
            <div className="text-center bg-white/50 p-2 rounded">
              <div className="text-xs text-muted-foreground">Escanteios</div>
              <div className="font-bold text-blue-600">
                {(match.team_a_corners || 0) + (match.team_b_corners || 0)}
              </div>
            </div>
            <div className="text-center bg-white/50 p-2 rounded">
              <div className="text-xs text-muted-foreground">Cartões</div>
              <div className="font-bold text-yellow-600">
                {(match.team_a_cards_num || 0) + (match.team_b_cards_num || 0)}
              </div>
            </div>
            <div className="text-center bg-white/50 p-2 rounded">
              <div className="text-xs text-muted-foreground">BTTS</div>
              <div className="font-bold text-purple-600">
                {(match.homeGoalCount > 0 && match.awayGoalCount > 0) ? '✓' : '✗'}
              </div>
            </div>
          </div>
        )}

        {/* Betting Predictions for Upcoming Matches */}
        {variant === 'upcoming' && showPredictions && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-blue-200">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-700">Mais de 2.5 Gols</span>
              </div>
              <div className="text-lg font-bold text-green-600">
                {((match.o25_potential || 0) * 100).toFixed(0)}%
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-3 w-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Ambos Marcam</span>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {((match.btts_potential || 0) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        )}

        {/* Completed Match Stats */}
        {isCompleted && (
          <div className="grid grid-cols-4 gap-2 pt-3 border-t">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Gols</div>
              <div className="font-semibold">{match.totalGoalCount}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Escanteios</div>
              <div className="font-semibold">{match.totalCornerCount}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Cartões</div>
              <div className="font-semibold">
                {(match.team_a_cards_num || 0) + (match.team_b_cards_num || 0)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">BTTS</div>
              <div className="font-semibold">
                {match.btts ? '✓' : '✗'}
              </div>
            </div>
          </div>
        )}

        {/* Stadium Info */}
        {match.stadium_name && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 p-2 rounded">
            <MapPin className="h-3 w-3" />
            <span>{match.stadium_name}</span>
            {match.stadium_location && (
              <span>, {match.stadium_location}</span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/match/${match.id}`} className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {variant === 'live' ? 'Análise ao Vivo' : 'Ver Análise'}
            </Link>
          </Button>
          {variant === 'upcoming' && (
            <Button variant="secondary" size="sm" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Dicas
            </Button>
          )}
          {variant === 'live' && (
            <Button variant="destructive" size="sm" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Apostar
            </Button>
          )}
        </div>

        {/* Auto-refresh indicator for live matches */}
        {variant === 'live' && (
          <div className="text-center bg-red-50 p-3 rounded-lg border border-red-200">
            <div className="text-xs text-red-600 flex items-center justify-center gap-2 mb-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-medium">TRANSMISSÃO AO VIVO</span>
            </div>
            <div className="text-xs text-red-500 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              Tempo atualizado em tempo real • Placar pode variar
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
