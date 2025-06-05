"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Play,
  Eye,
  Clock,
  Target,
  TrendingUp,
  Users,
  Flag,
  Timer,
  Zap,
  Activity
} from "lucide-react";
import { Match, Team } from "@/types";
import { formatMatchTime, isMatchLive } from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FootyStatsAPI } from "@/lib/api";

interface LiveMatchCardProps {
  match: Match;
  autoRefresh?: boolean;
}

export function LiveMatchCard({ match, autoRefresh = true }: LiveMatchCardProps) {
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const isLive = isMatchLive(match);
  const matchTime = formatMatchTime(match.date_unix);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const teams = await FootyStatsAPI.getMultipleTeamDetails([match.homeID, match.awayID]);
        setHomeTeam(teams[match.homeID] || null);
        setAwayTeam(teams[match.awayID] || null);
        setLastUpdate(new Date());
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

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !isLive) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, isLive]);

  // Get match minute (estimated)
  const getMatchMinute = () => {
    if (!isLive) return null;
    const now = new Date();
    const matchStart = new Date(match.date_unix * 1000);
    const diffMinutes = Math.floor((now.getTime() - matchStart.getTime()) / (1000 * 60));
    return Math.max(0, Math.min(90, diffMinutes));
  };

  const matchMinute = getMatchMinute();

  return (
    <Card className="border-red-200 bg-gradient-to-br from-red-50/50 to-orange-50/30 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
      {/* Live indicator animation */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500">
        <div className="h-full bg-white/30 animate-pulse"></div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="animate-pulse flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              <Play className="w-3 h-3" />
              LIVE
            </Badge>
            {matchMinute !== null && (
              <Badge variant="outline" className="bg-white/50">
                {matchMinute}'
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Updated: {lastUpdate.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Live Score Display */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-4">
            {/* Home Team */}
            <div className="flex-1 text-right">
              <div className="flex items-center justify-end gap-2 mb-1">
                {homeTeam?.logo && (
                  <img 
                    src={homeTeam.logo} 
                    alt={`${homeTeam.name} logo`}
                    className="w-6 h-6 object-contain"
                  />
                )}
                <span className="font-bold text-lg">
                  {loading ? 'Loading...' : homeTeam?.shortName || homeTeam?.name || `Team ${match.homeID}`}
                </span>
              </div>
            </div>

            {/* Live Score */}
            <div className="px-4 py-2 bg-white/70 rounded-lg border-2 border-red-200">
              <div className="text-3xl font-bold text-red-600">
                {match.homeGoalCount >= 0 ? match.homeGoalCount : 0}
                <span className="text-muted-foreground mx-2">-</span>
                {match.awayGoalCount >= 0 ? match.awayGoalCount : 0}
              </div>
            </div>

            {/* Away Team */}
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-lg">
                  {loading ? 'Loading...' : awayTeam?.shortName || awayTeam?.name || `Team ${match.awayID}`}
                </span>
                {awayTeam?.logo && (
                  <img 
                    src={awayTeam.logo} 
                    alt={`${awayTeam.name} logo`}
                    className="w-6 h-6 object-contain"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live Statistics */}
        <div className="grid grid-cols-4 gap-3 pt-3 border-t border-red-200">
          <div className="text-center bg-white/50 p-2 rounded">
            <div className="text-xs text-muted-foreground">Goals</div>
            <div className="font-bold text-green-600 text-lg">
              {match.totalGoalCount || 0}
            </div>
          </div>
          <div className="text-center bg-white/50 p-2 rounded">
            <div className="text-xs text-muted-foreground">Corners</div>
            <div className="font-bold text-blue-600 text-lg">
              {(match.team_a_corners || 0) + (match.team_b_corners || 0)}
            </div>
          </div>
          <div className="text-center bg-white/50 p-2 rounded">
            <div className="text-xs text-muted-foreground">Cards</div>
            <div className="font-bold text-yellow-600 text-lg">
              {(match.team_a_cards_num || 0) + (match.team_b_cards_num || 0)}
            </div>
          </div>
          <div className="text-center bg-white/50 p-2 rounded">
            <div className="text-xs text-muted-foreground">BTTS</div>
            <div className="font-bold text-purple-600 text-lg">
              {(match.homeGoalCount > 0 && match.awayGoalCount > 0) ? '✓' : '✗'}
            </div>
          </div>
        </div>

        {/* Team Stats Comparison */}
        <div className="space-y-2 pt-2 border-t">
          <div className="text-xs font-medium text-center text-muted-foreground">Live Stats</div>
          
          {/* Possession */}
          {(match.team_a_possession > 0 || match.team_b_possession > 0) && (
            <div className="flex items-center justify-between text-sm">
              <span className="w-8 text-right font-medium">{match.team_a_possession}%</span>
              <span className="flex-1 text-center text-xs text-muted-foreground">Possession</span>
              <span className="w-8 text-left font-medium">{match.team_b_possession}%</span>
            </div>
          )}

          {/* Shots */}
          {(match.team_a_shots > 0 || match.team_b_shots > 0) && (
            <div className="flex items-center justify-between text-sm">
              <span className="w-8 text-right font-medium">{match.team_a_shots}</span>
              <span className="flex-1 text-center text-xs text-muted-foreground">Shots</span>
              <span className="w-8 text-left font-medium">{match.team_b_shots}</span>
            </div>
          )}

          {/* Shots on Target */}
          {(match.team_a_shotsOnTarget > 0 || match.team_b_shotsOnTarget > 0) && (
            <div className="flex items-center justify-between text-sm">
              <span className="w-8 text-right font-medium">{match.team_a_shotsOnTarget}</span>
              <span className="flex-1 text-center text-xs text-muted-foreground">On Target</span>
              <span className="w-8 text-left font-medium">{match.team_b_shotsOnTarget}</span>
            </div>
          )}
        </div>

        {/* Live Betting Insights */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-red-200">
          <div className="flex items-center gap-2 text-xs bg-green-50 p-2 rounded border border-green-200">
            <TrendingUp className="h-3 w-3 text-green-600" />
            <span className="text-green-700">
              O2.5: {match.totalGoalCount >= 3 ? 'HIT' : 'PENDING'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs bg-blue-50 p-2 rounded border border-blue-200">
            <Users className="h-3 w-3 text-blue-600" />
            <span className="text-blue-700">
              BTTS: {(match.homeGoalCount > 0 && match.awayGoalCount > 0) ? 'HIT' : 'PENDING'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button asChild variant="outline" className="flex-1 bg-white/70 hover:bg-white">
            <Link href={`/match/${match.id}`} className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Live Analysis
            </Link>
          </Button>
          <Button variant="destructive" size="sm" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Live Bet
          </Button>
        </div>

        {/* Auto-refresh indicator */}
        {autoRefresh && (
          <div className="text-center">
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Auto-updating every 30s
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
