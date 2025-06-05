"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock,
  Eye,
  Target,
  TrendingUp,
  Users,
  MapPin,
  Trophy,
  Star,
  BarChart3,
  Calendar
} from "lucide-react";
import { Match, Team } from "@/types";
import { formatMatchTime, formatMatchDate } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FootyStatsAPI } from "@/lib/api";

interface UpcomingMatchCardProps {
  match: Match;
  showPredictions?: boolean;
}

export function UpcomingMatchCard({ match, showPredictions = true }: UpcomingMatchCardProps) {
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  const matchTime = formatMatchTime(match.date_unix);
  const matchDate = formatMatchDate(match.date_unix);

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

  // Calculate time until match
  const getTimeUntilMatch = () => {
    const now = new Date();
    const matchStart = new Date(match.date_unix * 1000);
    const diffMs = matchStart.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours % 24}h`;
    } else if (diffHours > 0) {
      return `${diffHours}h`;
    } else {
      return 'Starting soon';
    }
  };

  // Get prediction confidence level
  const getPredictionConfidence = () => {
    const o25Confidence = (match.o25_potential || 0) * 100;
    const bttsConfidence = (match.btts_potential || 0) * 100;
    const avgConfidence = (o25Confidence + bttsConfidence) / 2;

    if (avgConfidence >= 75) return { level: 'High', color: 'text-green-600', bg: 'bg-green-50' };
    if (avgConfidence >= 60) return { level: 'Medium', color: 'text-blue-600', bg: 'bg-blue-50' };
    return { level: 'Low', color: 'text-orange-600', bg: 'bg-orange-50' };
  };

  const confidence = getPredictionConfidence();

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
      {/* Upcoming indicator */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white/70 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {matchTime}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {getTimeUntilMatch()}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {matchDate}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Teams Display */}
        <div className="space-y-3">
          {/* Home Team */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/60 border border-blue-100">
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
                  {loading ? 'Loading...' : homeTeam?.name || `Team ${match.homeID}`}
                </div>
                <div className="text-xs text-muted-foreground">
                  Home • {homeTeam?.venue && `${homeTeam.venue}`}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-muted-foreground">PPG</div>
              <div className="font-bold">{match.home_ppg?.toFixed(1) || 'N/A'}</div>
            </div>
          </div>

          {/* VS Divider with prediction */}
          <div className="flex items-center justify-center relative">
            <div className="text-sm font-medium text-muted-foreground bg-white px-4 py-2 rounded-full border border-blue-200 shadow-sm">
              VS
            </div>
            {showPredictions && (
              <div className={`absolute -right-2 top-0 text-xs px-2 py-1 rounded-full ${confidence.bg} ${confidence.color} border`}>
                {confidence.level}
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/60 border border-blue-100">
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
                  {loading ? 'Loading...' : awayTeam?.name || `Team ${match.awayID}`}
                </div>
                <div className="text-xs text-muted-foreground">
                  Away • {awayTeam?.venue && `${awayTeam.venue}`}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-muted-foreground">PPG</div>
              <div className="font-bold">{match.away_ppg?.toFixed(1) || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Betting Predictions */}
        {showPredictions && (
          <div className="space-y-3 pt-3 border-t border-blue-200">
            <div className="text-sm font-medium text-center text-muted-foreground flex items-center justify-center gap-1">
              <Target className="w-3 h-3" />
              Pre-Match Analysis
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-medium text-green-700">Over 2.5 Goals</span>
                </div>
                <div className="text-lg font-bold text-green-600">
                  {((match.o25_potential || 0) * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-green-600">
                  Avg: {match.avg_potential?.toFixed(1) || 'N/A'} goals
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-3 w-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">Both Teams Score</span>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {((match.btts_potential || 0) * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-blue-600">
                  Historical trend
                </div>
              </div>
            </div>

            {/* Additional Predictions */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center bg-white/70 p-2 rounded border">
                <div className="text-xs text-muted-foreground">Corners</div>
                <div className="font-bold text-purple-600">
                  {match.corners_potential?.toFixed(1) || 'N/A'}
                </div>
              </div>
              <div className="text-center bg-white/70 p-2 rounded border">
                <div className="text-xs text-muted-foreground">O1.5</div>
                <div className="font-bold text-orange-600">
                  {((match.o15_potential || 0) * 100).toFixed(0)}%
                </div>
              </div>
              <div className="text-center bg-white/70 p-2 rounded border">
                <div className="text-xs text-muted-foreground">O3.5</div>
                <div className="font-bold text-red-600">
                  {((match.o35_potential || 0) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stadium Info */}
        {match.stadium_name && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/50 p-2 rounded border">
            <MapPin className="h-3 w-3" />
            <span>{match.stadium_name}</span>
            {match.stadium_location && (
              <span>, {match.stadium_location}</span>
            )}
          </div>
        )}

        {/* Odds Display */}
        {(match.odds_ft_1 || match.odds_ft_X || match.odds_ft_2) && (
          <div className="grid grid-cols-3 gap-2 pt-2 border-t">
            <div className="text-center bg-white/70 p-2 rounded border">
              <div className="text-xs text-muted-foreground">Home Win</div>
              <div className="font-bold">{match.odds_ft_1 || 'N/A'}</div>
            </div>
            <div className="text-center bg-white/70 p-2 rounded border">
              <div className="text-xs text-muted-foreground">Draw</div>
              <div className="font-bold">{match.odds_ft_X || 'N/A'}</div>
            </div>
            <div className="text-center bg-white/70 p-2 rounded border">
              <div className="text-xs text-muted-foreground">Away Win</div>
              <div className="font-bold">{match.odds_ft_2 || 'N/A'}</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button asChild variant="outline" className="flex-1 bg-white/70 hover:bg-white">
            <Link href={`/match/${match.id}`} className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Pre-Match Analysis
            </Link>
          </Button>
          <Button variant="default" size="sm" className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            Tips
          </Button>
        </div>

        {/* Match Importance Indicator */}
        {match.game_week && (
          <div className="text-center">
            <Badge variant="outline" className="text-xs bg-white/70">
              <Trophy className="w-3 h-3 mr-1" />
              Gameweek {match.game_week}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
