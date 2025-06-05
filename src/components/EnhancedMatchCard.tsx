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
  Play,
  Trophy,
  Flag,
  Timer,
  Target,
  Zap
} from "lucide-react";
import { Match, Team } from "@/types";
import { formatMatchTime, formatMatchDate, isMatchLive } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FootyStatsAPI } from "@/lib/api";

interface EnhancedMatchCardProps {
  match: Match;
  variant?: 'default' | 'live' | 'upcoming' | 'compact';
  showDetails?: boolean;
}

export function EnhancedMatchCard({ 
  match, 
  variant = 'default', 
  showDetails = true 
}: EnhancedMatchCardProps) {
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  const isLive = isMatchLive(match);
  const matchTime = formatMatchTime(match.date_unix);
  const matchDate = formatMatchDate(match.date_unix);
  const isUpcoming = match.status === 'incomplete' && !isLive;
  const isCompleted = match.status === 'complete';

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const teams = await FootyStatsAPI.getMultipleTeamDetails([match.homeID, match.awayID]);
        setHomeTeam(teams[match.homeID] || null);
        setAwayTeam(teams[match.awayID] || null);
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (match.homeID && match.awayID) {
      fetchTeamData();
    } else {
      setLoading(false);
    }
  }, [match.homeID, match.awayID]);

  // Get card styling based on variant
  const getCardStyling = () => {
    switch (variant) {
      case 'live':
        return "border-red-200 bg-red-50/30 hover:shadow-lg transition-all duration-300";
      case 'upcoming':
        return "border-blue-200 bg-blue-50/30 hover:shadow-lg transition-all duration-300";
      case 'compact':
        return "hover:shadow-md transition-shadow";
      default:
        return "hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20";
    }
  };

  // Get status badge
  const getStatusBadge = () => {
    if (isLive) {
      return (
        <Badge variant="destructive" className="animate-pulse flex items-center gap-1">
          <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
          LIVE
        </Badge>
      );
    }
    if (isCompleted) {
      return <Badge variant="secondary">FT</Badge>;
    }
    if (isUpcoming) {
      return <Badge variant="outline" className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {matchTime}
      </Badge>;
    }
    return <Badge variant="outline">{matchTime}</Badge>;
  };

  // Compact version
  if (variant === 'compact') {
    return (
      <Card className={getCardStyling()}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusBadge()}
              <div className="text-sm">
                <div className="font-medium">
                  {loading ? 'Loading...' : `${homeTeam?.name || 'Home'} vs ${awayTeam?.name || 'Away'}`}
                </div>
                <div className="text-muted-foreground">{matchDate}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-lg font-bold">
                  {match.homeGoalCount >= 0 ? match.homeGoalCount : '-'} - {match.awayGoalCount >= 0 ? match.awayGoalCount : '-'}
                </div>
              </div>
              
              <Button asChild size="sm" variant="ghost">
                <Link href={`/match/${match.id}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={getCardStyling()}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {isLive && (
              <Badge variant="outline" className="text-xs">
                {match.game_week ? `GW ${match.game_week}` : 'Live'}
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            {matchDate}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Teams and Score */}
        <div className="space-y-3">
          {/* Home Team */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              {homeTeam?.logo && (
                <img 
                  src={homeTeam.logo} 
                  alt={`${homeTeam.name} logo`}
                  className="w-8 h-8 object-contain"
                />
              )}
              <div>
                <div className="font-semibold">
                  {loading ? 'Loading team...' : homeTeam?.name || `Home Team (ID: ${match.homeID})`}
                </div>
                <div className="text-xs text-muted-foreground">
                  Home • {homeTeam?.venue || 'Stadium TBD'}
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold">
              {match.homeGoalCount >= 0 ? match.homeGoalCount : '-'}
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex items-center justify-center">
            <div className="text-sm font-medium text-muted-foreground bg-background px-3 py-1 rounded-full border">
              VS
            </div>
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              {awayTeam?.logo && (
                <img 
                  src={awayTeam.logo} 
                  alt={`${awayTeam.name} logo`}
                  className="w-8 h-8 object-contain"
                />
              )}
              <div>
                <div className="font-semibold">
                  {loading ? 'Loading team...' : awayTeam?.name || `Away Team (ID: ${match.awayID})`}
                </div>
                <div className="text-xs text-muted-foreground">
                  Away • {awayTeam?.venue || 'Stadium TBD'}
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold">
              {match.awayGoalCount >= 0 ? match.awayGoalCount : '-'}
            </div>
          </div>
        </div>

        {/* Live Match Stats */}
        {isLive && showDetails && (
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-red-200">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Corners</div>
              <div className="font-bold text-red-600">
                {(match.team_a_corners || 0) + (match.team_b_corners || 0)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Cards</div>
              <div className="font-bold text-yellow-600">
                {(match.team_a_cards_num || 0) + (match.team_b_cards_num || 0)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Goals</div>
              <div className="font-bold text-green-600">
                {match.totalGoalCount || 0}
              </div>
            </div>
          </div>
        )}

        {/* Completed Match Stats */}
        {isCompleted && showDetails && (
          <div className="grid grid-cols-4 gap-3 pt-3 border-t">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Goals</div>
              <div className="font-semibold">{match.totalGoalCount}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Corners</div>
              <div className="font-semibold">{match.totalCornerCount}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Cards</div>
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

        {/* Betting Insights for Upcoming Matches */}
        {isUpcoming && showDetails && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-blue-200">
            <div className="flex items-center gap-2 text-sm bg-green-50 p-2 rounded">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-700">
                O2.5: {((match.o25_potential || 0) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm bg-blue-50 p-2 rounded">
              <Users className="h-3 w-3 text-blue-600" />
              <span className="text-blue-700">
                BTTS: {((match.btts_potential || 0) * 100).toFixed(0)}%
              </span>
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
              Analysis
            </Link>
          </Button>
          {isUpcoming && (
            <Button variant="secondary" size="sm" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Tips
            </Button>
          )}
          {isLive && (
            <Button variant="destructive" size="sm" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Live
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
